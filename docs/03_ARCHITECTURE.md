# Architecture

Статус: `Active / pre-production implementation`.

## Профиль

```text
AMS_PROFILE=REALTY_BASE
DELIVERY_PROFILE=COMMERCIAL
Mode=BUILD
Git platform=SOURCECRAFT_PRIMARY_GITHUB_MIRROR
Secrets source=Secret Master / self-hosted Infisical
```

Перед merge в `main` нужен один ручной exact-head SourceCraft Gate. Plan №7 v2
APPROVED выполняется после CLEAN reconciliation через `MERGE_AFTER_GATE` в
SourceCraft; GitHub получает только fast-forward mirror canonical `main`.
Production и freeze tag в Plan №7 не входят.

## CI, mirror и release inventory — 2026-09-22

- Canonical SourceCraft `main`: `ca1b884d43e808d17e1eb18b05bad70ea358dd1c`.
  GitHub mirror `main` равен этому SHA; active `.github/workflows` отсутствуют,
  но repository Actions setting остаётся включённым и выключается отдельной
  mirror-governance задачей.
- Portfolio `PROJECT_CLASS=STANDARD` не меняет project
  `DELIVERY_PROFILE=COMMERCIAL`: template/demo требует review и один ручной
  exact-head SourceCraft Gate перед merge.
- `.sourcecraft/ci.yaml` содержит только manual exact-SHA `merge-standard` и
  `merge-risky`; explicit `paths: []` sentinel блокирует auto push/PR CI. За период с 2026-08-23
  зафиксировано 145 runs, все `manual`: 48 STANDARD / 107.16 мин (avg 2.23) и
  94 RISKY / 270.04 мин (avg 2.87). Поэтому задача оптимизации — убрать
  неоднозначность trigger contract и сделать RISKY targeted; общий CI image и
  cache transport без benchmark не добавляются.
- STANDARD сохраняет template-specific contracts/architecture/clone-readiness
  baseline. RISKY принимает ровно один `risk_scope`: `schema-data`,
  `auth-pii-leads`, `ingest-jobs`, `dependency-runtime` или `ci-governance`.
  PostgreSQL запускается только для первых трёх scope, build — только для
  `dependency-runtime`; каждый RISKY сначала выполняет STANDARD и затем только
  доказательство выбранного риска.
- Demo release contract уже требует clean exact `main`, immutable Docker image,
  migrations из того же image, один jobs owner, live health/smoke и сохранённый
  previous image/env rollback point. Текущий Dockerfile копирует весь `/app` и
  не использует standalone allowlist; release hardening остаётся отдельной
  RISKY-задачей до первого client production и не выполняется этим inventory.
- Canonical freeze contract ожидает tag `starter-freeze-v2`, которого нет.
  Наблюдаемый SourceCraft tag `starter-freeze` указывает на тот же `ca1b884d...`,
  но имеет другое имя; до отдельного owner reconciliation состояние остаётся
  `READY_FOR_OWNER_FREEZE_DECISION / NOT_FROZEN`.

## Stack и ownership

- Next.js App Router, React, TypeScript strict;
- Payload CMS — единственный владелец application schema;
- PostgreSQL через `@payloadcms/db-postgres`; второй ORM запрещён;
- Zod, pnpm, Tailwind CSS 4, shadcn/ui, Lucide;
- Payload Jobs, streaming SAX parser, **local persistent media** (S3 plugin not used by starter), Nginx, SourceCraft.

Текущий lock snapshot: Next.js `16.3.5`, React `19.2.8`, Payload `3.90.1`.
Фактические версии всегда определяют `package.json`, lockfile и runtime files.
Major upgrade требует отдельного решения и targeted proof.

## Version-sensitive framework boundaries

- Next.js `16.3.5` intentionally uses `src/proxy.ts` with the named
  `export function proxy`. The former `src/middleware.ts` convention is
  deprecated in this Next line and is forbidden in this project. Pinned
  reference: [Next.js 16 Proxy](https://nextjs.org/docs/16/app/api-reference/file-conventions/proxy).
- `src/app/(site)/obekty/[slug]/page.tsx` owns the visual public property page.
  `src/app/http/property-lifecycle/[slug]/route.ts` is a separate public HTTP
  status boundary: it returns the real `410`, `404`, `204` or permanent redirect
  semantics required by crawlers and integrations. It is intentionally not an
  internal API. Reference: [Next.js 16 Route Handlers](https://nextjs.org/docs/16/app/api-reference/file-conventions/route).
- Payload `jobs.autoRun` cron `* * * * *` is only the queue polling/execution
  ticker. It is not a business schedule. Business cadence is owned by the task
  registry: `dispatchDueFeeds` = `*/5 * * * *`; `jobsJanitor`,
  `leadRetentionCleanup`, `catalogLifecycle` and `recoverLeadDeliveries` =
  `*/15 * * * *`. Static queues keep `disableScheduling=false`; programmatic
  queues keep `disableScheduling=true`. `enableConcurrencyControl=true` remains
  mandatory. Changing the ticker requires exact Payload-version evidence.

## Модули, ownership и dependency direction

| Область | Владелец / путь | Разрешённая граница |
|---|---|---|
| Presentation contracts | `packages/contracts` | storage-neutral DTO; без Payload/DB imports |
| Reusable UI | `packages/ui` | contracts/view models; без persistence и Next app imports |
| Public reads | `src/core/data-access/public` | только Public Gateway policy и DTO output |
| Privileged operations | `src/core/data-access/system` | именованные system operations; `overrideAccess: true` только здесь |
| Feed mutation | `src/core/data-access/ingest` | ingest gateway и утверждённые atomic SQL operations |
| Project schema/config | `src/project/collections`, `src/project/env.ts`, `src/project/jobs` | Payload остаётся единственным backend/schema owner |
| Generic access helpers | `src/core/access` | переиспользуемые роли без project-specific schema |
| Payload migration history | `migrations` | канонический корневой каталог, заданный в `payload.config.ts` |
| Cache invalidation | `src/core/cache` | `invalidatePublicCache` — единственный live facade и всегда выполняет authenticated HTTP self-call; `invalidateInProcessCacheTargets` вызывается только Route Handler после auth, rate limit и allowlist |

```text
public UI
  -> presentation contracts / DTO
  -> Public Gateway
  -> Payload Local API with explicit access mode
  -> Payload-owned schema
```

Reusable UI не импортирует Payload, DB clients или persistence types. Configurable outbound HTTP проходит через Safe Outbound Client; raw anonymous business REST закрывается на edge и Payload boundary. Public Gateway: `src/core/data-access/public`. System Gateway: `src/core/data-access/system`.

Indexing имеет один semantic source `src/project/indexing-policy.ts`. Starter
fail-closed возвращает `noindex`; client использует явное owner decision
`public | noindex` из client-readiness config. Эта политика определяет root
metadata robots и `/robots.txt`; starter Nginx фиксирует matching
`X-Robots-Tag: noindex, nofollow`, а client blueprint требует явной подстановки
соответствующего header/его отсутствия.

## Env и runtime config

`src/project/env.ts` — единственный владелец typed schema, определения режима и списка обязательных runtime-полей. `src/core/operations/runtime-env.ts` является только compatibility re-export и не содержит второй матрицы. Режимы: `build`, `development`, `migrate`, `runtime`, `test`; build не требует production secrets, а runtime fail-fast выполняется через instrumentation до обслуживания трафика.

Прямое чтение `process.env` в runtime-коде допускается только для framework mode (`NODE_ENV`) и изолированных test-only переключателей (`AMS_ALLOW_TEST_DESTINATIONS`, `AMS_TEST_APPROVED_ORIGINS`). Остальные project runtime knobs читаются через `runtimeEnv`.

## Access modes

| Режим | Контракт |
|---|---|
| Public Gateway | `overrideAccess: false`, `user: null`, context marker `public-read`, collection access filters published/public rows, output только DTO |
| User/Admin | Payload request user и collection access; Local API вызов обязан явно указывать access mode |
| System Gateway | `systemOverrideAccess(<named operation>)`; whitelist операций находится в `src/core/data-access/system/overrides.ts` |

Lead access следует Core 5.5 и `docs/adr/ADR-LEAD-ACCESS-MODEL.md`: generic
lead create и delivery create/update доступны только именованным System Gateway;
lead/PII read-update-delete, delivery read/delete и manual retry доступны только
owner. Роль admin не наследует эти capability. Manual retry после owner auth
выполняет state transition через `owner-lead-delivery-retry`, а не generic Admin
mutation.
| Ingest Gateway | feed-owned mutation через ingest repository; manual field overrides и published slug не перезаписываются |

Anonymous generic Payload REST для deny-list/system-only collections возвращает
404; публичный приём лида существует только как `POST /api/public/leads`.
Architecture guard и Dependency Cruiser запрещают обход этих границ.

## Approved SQL и numeric invariants

Runtime raw SQL разрешён только в двух manifest-backed слоях:

- `src/core/data-access/ingest/sql/index.ts` — atomic feed claims, heartbeat,
  bounded bulk touch/deactivation, one-time approval и terminal import transition;
- `src/core/data-access/system/sql/index.ts` — atomic claim строки lead delivery.

Остальной runtime SQL запрещён `scripts/quality/sql-governance.mjs`; migrations
остаются разрешённым schema path. Денежные значения — неотрицательные integer
minor units до `Number.MAX_SAFE_INTEGER`. Площади — `0..99_999_999.99` м² с
точностью не более двух знаков. Эти правила проверяются на write boundary и
PostgreSQL constraints из migration `20260919_120900`.

## Data, jobs и cache

- schema любого deployed contour меняется только migrations;
- деньги хранятся integer minor units, площади — в квадратных метрах;
- один mutating import на feed source;
- queue registry: `system`, `imports`, `maintenance`, `lead-deliveries`;
- static tasks: `dispatchDueFeeds`, `jobsJanitor`, `leadRetentionCleanup`,
  `catalogLifecycle`, `recoverLeadDeliveries`; programmatic tasks:
  `importFeed`, `deliverLead`;
- imports queue имеет `limit: 1`; один application runtime является jobs owner;
- `REALTY_BASE`: один application runtime с `JOBS_AUTORUN=true`;
- jobs `autoRun` every-minute cron is an execution ticker; task registry cron is
  the business schedule described in the version-sensitive boundary above;
- cache mode — `http`: jobs отправляют bounded authenticated requests на
  `/api/internal/revalidate`; маршрут валидирует secret, allowlisted paths/tags и
  только затем вызывает Next in-process invalidator;
- отсутствие HTTP cache config или rejected request возвращает warning и
  фиксируется для stale-data SLA; silent in-process claim запрещён.
- consent UI и server authority используют `src/project/legal.config.ts`;
  browser version является только consistency signal, accepted version и
  timestamp принадлежат серверу;
- retry identity лида — `lead:<requestAttemptId>` с browser UUID одной попытки:
  exact retry переиспользует lead, новая осознанная отправка создаёт новый lead;
- property relation и canonical `/obekty/<slug>` source Public Gateway получает
  из published property, а не из client title/slug;
- `clientReadinessConfig.leadRetentionDays` — versioned owner decision,
  `projectConfig` только проецирует его в runtime; второго retention env knob нет.

## Verification surfaces

- `pnpm verify:merge-standard` — docs/UI/обычная логика без PostgreSQL suite;
- `RISK_SCOPE=<scope> pnpm verify:merge-risky` — STANDARD плюс один targeted
  proof; safe isolated `DATABASE_URI_TEST` обязателен только для DB-bound scope,
  а build выполняется только для `dependency-runtime`;
- `pnpm verify:integration:required` — fail-closed DB prerequisite и обязательные
  Payload/PostgreSQL suites;
- `pnpm verify:ui-core` — design literals, token integrity, primitive/font/client
  ownership, a11y и SEO contracts;
- `pnpm quality:architecture` + `pnpm quality:guards` — dependency direction,
  access/SQL/cache boundaries и negative fixtures.

## Starter vs client clone

Starter (этот репозиторий, `start-baza.ams24.ru`):

```text
hosting: AMS Server
database: local PostgreSQL, migrations only, PAYLOAD_DB_PUSH=false
storage: persistent MEDIA_DIR, no S3 runtime
jobs: exactly one JOBS_AUTORUN=true
cache: http
indexing: noindex
```

ADR: `docs/adr/ADR-LOCAL-STARTER-STORAGE.md`.

Этот репозиторий остаётся демо на local PostgreSQL + MEDIA_DIR. Отдельный клиентский контур, если появится, принимает собственное topology decision вне этого репозитория. S3 и Managed PostgreSQL сюда не возвращаются.

Production starter release использует immutable artifact из clean `main`. Процедуры — `OPERATIONS.md`.

Историческая спецификация: `legacy/architecture/AMS_PROJECT_ARCHITECTURE_v1.0.md`. Текущее
project-specific состояние определяют этот документ, `PROJECT.md`, ADR и код;
исторический файл не переписывается и не заменяет runtime truth.

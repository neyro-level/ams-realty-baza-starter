# Architecture

Статус: `ACTIVE / PRE-PRODUCTION STARTER`.

## Профиль

```text
AMS_PROFILE=REALTY_BASE
DELIVERY_PROFILE=COMMERCIAL
Mode=BUILD
Git platform=SOURCECRAFT_PRIMARY_GITHUB_MIRROR
Secrets source=Secret Master / self-hosted Infisical
```

Перед merge в `main` нужен один ручной exact-head SourceCraft Gate. Plan №8 v6
исполнен полностью; итоговый implementation принят на `bd570ee4`, а docs-only
reconciliation — на `c5803cf`. GitHub получает только отдельный явный
fast-forward mirror canonical `main`. Production и target tag
`starter-v2.0.0` остаются отдельными owner actions.

## Delivery baseline

- Canonical repository — SourceCraft; GitHub — mirror-only. Точное равенство
  SHA подтверждается после каждого явно запрошенного mirror.
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
- Наблюдаемый SourceCraft tag `starter-freeze` остаётся историческим. Новый
  target tag `starter-v2.0.0` требует отдельной команды владельца.

## Stack и ownership

- Next.js App Router, React, TypeScript strict;
- Payload CMS — единственный владелец application schema;
- PostgreSQL через `@payloadcms/db-postgres`; второй ORM запрещён;
- Zod, pnpm, Tailwind CSS 4, shadcn/ui, Lucide;
- Payload Jobs, streaming SAX parser, **local persistent media** (S3 plugin not used by starter), Nginx, SourceCraft.

Текущий lock snapshot: Next.js `16.3.5`, React `19.2.8`, Payload `3.90.1`.
Фактические версии всегда определяют `package.json`, lockfile и runtime files.
Major upgrade требует отдельного решения и targeted proof.

## Geo-catalog platform: current and target

Нормативный reusable target-контракт:
`docs/platform/GEO_CATALOG_CONTRACT.md`. Он фиксирует vocabulary, PageKey,
URL/status/profile semantics и cutover invariants. `02_PRODUCT_STRUCTURE.md`
показывает current runtime рядом с target grammar.

После P8-23A canonical PageKey routes обслуживаются одним catch-all dispatcher;
explicit static routes, Payload Admin/API и security proxy остаются отдельными
framework boundaries. HTML и metadata используют один cached resolution result.
Переход выполнен expand-first:

```text
profile/grammar contracts
  -> additive Payload schema and normalized data
  -> frozen DTO + Public Gateway
  -> resolver + Content Gate + reusable UI
  -> discovery/lifecycle proof
  -> atomic route cutover (P8-23A)
  -> evidence-based cleanup (P8-23B)
```

Target dependency direction:

```text
project profile/data -> core pure functions
app composition -> project + core + UI
core/packages -X-> project
```

Profile передаётся в reusable core явно. Project-owned static routes, brand,
domain, city literals и будущий literal denylist не переходят в core/packages.
Payload остаётся единственным schema/auth/Admin owner; public reads продолжают
идти через explicit Public Gateway и storage-neutral DTO. После P8-23B
`/nedvizhimost` и `/obekty/[slug]` остались только bounded redirect adapters для
исторических публичных ссылок. Отдельная proof-only lifecycle HTTP boundary и
старые catalog/property/sitemap presentation owners удалены; rollback — revert
cleanup PR, без удаления raw geo/source данных.

## Client clone boundary

`clone:prepare` принимает только утверждённый preset и exact source tag
`starter-v2.0.0`; обычный запуск требует clean checkout и совпадение tag с
`HEAD`. Preset определяет project identity, catalog-first режим,
`SINGLE_GEO | MULTI_GEO`, проверенную морфологию, NAP, indexing, brand/feed и
development Excel readiness. Генерируемые владельцы —
`src/project/site-profile.config.ts` и `docs/CLIENT_BOOTSTRAP.json`.

Clone preparation удаляет только starter-specific evidence/demo deploy assets;
Core 5.5, `packages/**`, migrations, guards и общие security/data contracts
сохраняются byte-for-byte. Storage topology не скрыта внутри preparation:
`clone:activate-timeweb-storage` остаётся отдельным idempotent шагом после
client topology decision. Runtime с `projectKind=client` и отсутствующими
Payload records возвращает пустой результат и никогда не подмешивает starter
fixtures.

## Version-sensitive framework boundaries

- Next.js `16.3.5` intentionally uses `src/proxy.ts` with the named
  `export function proxy`. The former `src/middleware.ts` convention is
  deprecated in this Next line and is forbidden in this project. Pinned
  reference: [Next.js 16 Proxy](https://nextjs.org/docs/16/app/api-reference/file-conventions/proxy).
- Canonical entity pages belong to the catch-all resolver. `src/proxy.ts`
  returns real `301/410` lifecycle responses before rendering. The legacy
  `/obekty/[slug]` page is redirect-only and never owns metadata or a visual
  gone state; the former `/http/property-lifecycle/[slug]` proof route is
  forbidden by guards after P8-23B.
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
| Public reads composition | `src/project/data-access/public` | Payload/project adapters compose reusable core rules and emit DTO output |
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

Reusable UI не импортирует Payload, DB clients или persistence types. Configurable outbound HTTP проходит через Safe Outbound Client; raw anonymous business REST закрывается на edge и Payload boundary. Project-aware Public Gateway composition: `src/project/data-access/public`. Reusable rules stay in `src/core`; System Gateway: `src/core/data-access/system`. Dependency direction is `project -> core`, while `core/packages -> project` is forbidden by architecture and Dependency Cruiser guards.

Indexing имеет один semantic source `src/project/indexing-policy.ts`. Starter
fail-closed возвращает `noindex`; client использует явное owner decision
`public | noindex` из client-readiness config. Эта политика определяет root
metadata robots и `/robots.txt`; starter Nginx фиксирует matching
`X-Robots-Tag: noindex, nofollow`, а client blueprint требует явной подстановки
соответствующего header/его отсутствия.

## Env и runtime config

`src/project/env.ts` — единственный владелец typed schema, определения режима и списка обязательных runtime-полей. Второго compatibility re-export в `src/core` нет. Режимы: `build`, `development`, `migrate`, `runtime`, `test`; build не требует production secrets, а runtime fail-fast выполняется через instrumentation до обслуживания трафика.

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
- queue registry: `system`, `imports`, `maintenance`, `lead-deliveries`, `index-now`;
- static tasks: `dispatchDueFeeds`, `jobsJanitor`, `leadRetentionCleanup`,
  `catalogLifecycle`, `recoverLeadDeliveries`; programmatic tasks:
  `importFeed`, `deliverLead`, `submitIndexNow`;
- `index-now` is programmatic and event-driven after the P8-23A cutover. Its jobs
  contain only event ID, same-origin URLs and attempt number; the runtime key is
  read only from environment and never enters a job payload or diagnostic output;
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
- property relation и canonical PageKey source Public Gateway получает из
  published property, а не из client title/slug;
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

# Architecture

Статус: `Active / pre-production implementation`.

## Профиль

```text
AMS_PROFILE=REALTY_BASE
DELIVERY_PROFILE=COMMERCIAL
Mode=BUILD
Git platform=SOURCECRAFT_PRIMARY
Secrets source=Secret Master / self-hosted Infisical
```

Перед merge в `main` нужен один ручной exact-head SourceCraft Gate. APPROVED программа `AMS-REALTBASE-RESIDUAL-ALIGN` использует `MERGE_AFTER_GATE` в `main` по эпикам. Production в этот план не входит. GitHub не является delivery surface.

## Stack и ownership

- Next.js App Router, React, TypeScript strict;
- Payload CMS — единственный владелец application schema;
- PostgreSQL через `@payloadcms/db-postgres`; второй ORM запрещён;
- Zod, pnpm, Tailwind CSS 4, shadcn/ui, Lucide;
- Payload Jobs, streaming SAX parser, **local persistent media** (S3 plugin not used by starter), Nginx, SourceCraft.

Текущий lock snapshot: Next.js `16.3.5`, React `19.2.8`, Payload `3.89.0`.
Фактические версии всегда определяют `package.json`, lockfile и runtime files.
Major upgrade требует отдельного решения и targeted proof.

## Модули, ownership и dependency direction

| Область | Владелец / путь | Разрешённая граница |
|---|---|---|
| Presentation contracts | `packages/contracts` | storage-neutral DTO; без Payload/DB imports |
| Reusable UI | `packages/ui` | contracts/view models; без persistence и Next app imports |
| Public reads | `src/core/data-access/public` | только Public Gateway policy и DTO output |
| Privileged operations | `src/core/data-access/system` | именованные system operations; `overrideAccess: true` только здесь |
| Feed mutation | `src/core/data-access/ingest` | ingest gateway и утверждённые atomic SQL operations |
| Schema/auth/migrations/jobs | `src/payload` | единственный backend/schema owner |
| Cache invalidation | `src/core/cache` | internal HTTP revalidation contract; in-process executor только внутри Next runtime |

```text
public UI
  -> presentation contracts / DTO
  -> Public Gateway
  -> Payload Local API with explicit access mode
  -> Payload-owned schema
```

Reusable UI не импортирует Payload, DB clients или persistence types. Configurable outbound HTTP проходит через Safe Outbound Client; raw anonymous business REST закрывается на edge и Payload boundary. Public Gateway: `src/core/data-access/public`. System Gateway: `src/core/data-access/system`.

## Access modes

| Режим | Контракт |
|---|---|
| Public Gateway | `overrideAccess: false`, `user: null`, context marker `public-read`, collection access filters published/public rows, output только DTO |
| User/Admin | Payload request user и collection access; Local API вызов обязан явно указывать access mode |
| System Gateway | `systemOverrideAccess(<named operation>)`; whitelist операций находится в `src/core/data-access/system/overrides.ts` |
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
- cache mode — `http`: jobs отправляют bounded authenticated requests на
  `/api/internal/revalidate`; маршрут валидирует secret, allowlisted paths/tags и
  только затем вызывает Next in-process invalidator;
- отсутствие HTTP cache config или rejected request возвращает warning и
  фиксируется для stale-data SLA; silent in-process claim запрещён.

## Verification surfaces

- `pnpm verify:merge-standard` — docs/UI/обычная логика без PostgreSQL suite;
- `pnpm verify:merge-risky` — safe isolated `DATABASE_URI_TEST`, migrations,
  required integration with zero skipped suites и build;
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

Историческая спецификация: `../AMS_PROJECT_ARCHITECTURE_v1.0.md`. Текущее
project-specific состояние определяют этот документ, `PROJECT.md`, ADR и код;
исторический файл не переписывается и не заменяет runtime truth.

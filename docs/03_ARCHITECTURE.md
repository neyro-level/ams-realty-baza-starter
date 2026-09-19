# Architecture

Статус: `Active / Foundation`.

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

Фактические версии определяют `package.json`, lockfile и runtime files. Major upgrade требует отдельного решения и targeted proof.

## Dependency direction

```text
public UI
  -> presentation contracts / DTO
  -> Public Gateway
  -> Payload Local API with explicit access mode
  -> Payload-owned schema
```

Reusable UI не импортирует Payload, DB clients или persistence types. Configurable outbound HTTP проходит через Safe Outbound Client; raw anonymous business REST закрывается на edge и Payload boundary. Public Gateway: `src/core/data-access/public`. System Gateway: `src/core/data-access/system`.

## Data, jobs и cache

- production schema меняется только migrations;
- деньги хранятся integer minor units, площади — в квадратных метрах;
- один mutating import на feed source;
- одна queue имеет ровно одного jobs owner;
- `REALTY_BASE`: один application runtime с `JOBS_AUTORUN=true`;
- cache default — HTTP invalidation; in-process разрешён только после proof.

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

Полная архитектурная спецификация: `../AMS_PROJECT_ARCHITECTURE_v1.0.md`. Не дублировать её детализацию в этом файле.

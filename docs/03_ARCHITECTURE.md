# Architecture

Статус: `Active / Foundation`.

## Профиль

```text
AMS_PROFILE=REALTY_BASE
DELIVERY_PROFILE=COMMERCIAL
Mode=BUILD
Git platform=SOURCECRAFT_PRIMARY_GITHUB_MIRROR
```

Перед merge требуется один ручной exact-head SourceCraft Gate по риску изменения. Push и Pull Request не запускают CI автоматически. В активной оркестрации команда владельца `продолжай` или `продолжай дальше` разрешает автономно проводить review, Gate и merge каждого готового потока без повторных вопросов. Production всегда требует отдельной явной команды владельца.

## Stack и ownership

- Next.js App Router, React, TypeScript strict;
- Payload CMS — единственный владелец application schema;
- PostgreSQL через `@payloadcms/db-postgres`; второй ORM запрещён;
- Zod, pnpm, Tailwind CSS 4, shadcn/ui, Lucide;
- Payload Jobs, streaming SAX parser, Timeweb S3, Nginx, SourceCraft.

Фактические версии определяют `package.json`, lockfile и runtime files. Major upgrade требует отдельного решения и targeted proof.

## Dependency direction

```text
public UI
  -> presentation contracts / DTO
  -> Public Gateway
  -> Payload Local API with explicit access mode
  -> Payload-owned schema
```

Reusable UI не импортирует Payload, DB clients или persistence types. Configurable outbound HTTP проходит через Safe Outbound Client; raw anonymous business REST закрывается на edge и Payload boundary.

## Data, jobs и cache

- production schema меняется только migrations;
- деньги хранятся integer minor units, площади — в квадратных метрах;
- один mutating import на feed source;
- одна queue имеет ровно одного jobs owner;
- `REALTY_BASE`: один application runtime с `JOBS_AUTORUN=true`;
- cache default — HTTP invalidation; in-process разрешён только после proof.

## Production contract

Один клиент получает отдельные application VPS, Managed PostgreSQL, S3 bucket, домен и secrets scope. Production использует immutable artifact, не собирается на сервере и выпускается только из clean canonical `main` на известном SHA. Процедуры принадлежат `OPERATIONS.md`.

Полная архитектурная спецификация: `../AMS_PROJECT_ARCHITECTURE_v1.0.md`. Не дублировать её детализацию в этом файле.

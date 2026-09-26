# Release Checklist

Статус: `ACTIVE RELEASE CONTRACT / PLAN 9 S0-S14 COMPLETE / NO CURRENT RELEASE
AUTHORIZATION`. Принятый Plan №9 implementation baseline
`5ff1e4ec7b572bab72ebc8cfa5a9af7597009188` входит в текущий SourceCraft
`main`, но S15, release tag и production не запускались. Репозиторное GitHub-
зеркало синхронизируется отдельно и не является release proof. Owner-operated
demo contour существует. PII
retention days остаются `NEEDS_OWNER`; implementation proof не заменяет
отдельный release, rollout и live smoke.

## Перед Pull Request

- scope соответствует одному claimed delivery stream и одному worktree; Plan
  №9 v6 допускает несколько constituent tasks только внутри одного approved
  batch с общей delivery boundary;
- source documents и runtime не имеют известного незафиксированного drift;
- релевантные локальные проверки завершены;
- секреты, PII и generated artifacts не попали в diff;
- новые или изменённые секреты заведены в Secret Master, а не в Doppler, git, markdown или logs;
- rollback impact описан, если изменение затрагивает runtime/data.

## Перед merge

- независимый review exact head SHA выполнен только если владелец явно запросил review/audit или scope заранее помечен как high-risk/high-complexity;
- PR основан на актуальном `main` и не содержит чужого scope;
- риск классифицирован как `STANDARD` или `RISKY`;
- `STANDARD` запускает `pnpm verify:merge-standard`; `RISKY` выбирает ровно один
  `risk_scope` и запускает STANDARD плюс соответствующий targeted proof;
- safe isolated test DB и zero skipped required suites обязательны только для
  `schema-data`, `auth-pii-leads` и `ingest-jobs`; build — только для
  `dependency-runtime`;
- один ручной SourceCraft Merge Gate зелёный на exact head SHA;
- constituent delivery tasks одного approved batch переиспользуют одно exact
  PR/Gate/merge evidence и не запускают повторный внешний delivery cycle;
- все блокеры исправлены, evidence сохранён.

## Перед production

- есть отдельная команда владельца на release;
- SourceCraft canonical `main` чистый, итоговый SHA известен, а GitHub не
  используется как release source;
- target domain для internal production: `start-baza.ams24.ru`, режим `noindex`;
- server identity, owner-approved local PostgreSQL on AMS Server and runtime env file permissions are confirmed without moving secrets into git/logs;
- S3 не требуется для starter; media = `MEDIA_DIR`.
- staging обязателен для migration, parser/source identity, auth/access и major upgrade;
- migration, backup/restore, jobs ownership и rollback проверены по риску;
- готов immutable Docker artifact из exact `main`; build на production host запрещён;
- production secrets берутся из Secret Master; Doppler допустим только как временный legacy/import source для ещё не перенесённых значений;
- после rollout выполнен live smoke изменённого сценария;
- production URL, health и rollback point зафиксированы.

Live demo infrastructure on AMS Server exists (`start-baza.ams24.ru`). Checklist PASS for a given SHA requires immutable image + live smoke on that SHA, not only the existence of the contour.

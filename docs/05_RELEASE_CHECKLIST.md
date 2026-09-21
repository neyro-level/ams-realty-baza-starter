# Release Checklist

Статус: `Plan №6 ACTIVE / production OUT OF SCOPE`. Plan №5 pre-production proof остаётся historical evidence; owner-operated demo contour существует, но Plan №6 его не выпускает. PII retention days остаются `NEEDS_OWNER`; merge proof не заменяет отдельный release, rollout и live smoke.

## Перед Pull Request

- scope соответствует одной claimed-задаче и одному worktree;
- source documents и runtime не расходятся;
- релевантные локальные проверки завершены;
- секреты, PII и generated artifacts не попали в diff;
- новые или изменённые секреты заведены в Secret Master, а не в Doppler, git, markdown или logs;
- rollback impact описан, если изменение затрагивает runtime/data.

## Перед merge

- независимый review exact head SHA выполнен только если владелец явно запросил review/audit или scope заранее помечен как high-risk/high-complexity;
- PR основан на актуальном `main` и не содержит чужого scope;
- риск классифицирован как `STANDARD` или `RISKY`;
- `STANDARD` запускает `pnpm verify:merge-standard`; `RISKY` запускает один
  `pnpm verify:merge-risky` с safe isolated test DB и zero skipped required suites;
- один ручной GitHub Actions Merge Gate зелёный на exact head SHA;
- все блокеры исправлены, evidence сохранён.

## Перед production

- есть отдельная команда владельца на release;
- canonical `main` чистый, итоговый SHA известен;
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

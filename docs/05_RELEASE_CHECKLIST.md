# Release Checklist

Статус: `Foundation / release not ready`.

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
- один ручной SourceCraft Merge Gate зелёный на exact head SHA;
- все блокеры исправлены, evidence сохранён.

## Перед production

- есть отдельная команда владельца на release;
- canonical `main` чистый, итоговый SHA известен;
- target domain для internal production: `start-baza.ams24.ru`, режим `noindex`;
- server identity, owner-approved local PostgreSQL on AMS Server and runtime env file permissions are confirmed without moving secrets into git/logs;
- staging обязателен для migration, parser/source identity, auth/access и major upgrade;
- migration, backup/restore, jobs ownership и rollback проверены по риску;
- готов immutable Docker artifact из exact `main`; build на production host запрещён;
- production secrets берутся из Secret Master; Doppler допустим только как временный legacy/import source для ещё не перенесённых значений;
- после rollout выполнен live smoke изменённого сценария;
- production URL, health и rollback point зафиксированы.

Пока production infrastructure и данные не созданы, этот checklist не может иметь статус PASS.

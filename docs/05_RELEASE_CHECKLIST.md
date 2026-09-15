# Release Checklist

Статус: `Foundation / release not ready`.

## Перед Pull Request

- scope соответствует одной claimed-задаче и одному worktree;
- source documents и runtime не расходятся;
- релевантные локальные проверки завершены;
- секреты, PII и generated artifacts не попали в diff;
- rollback impact описан, если изменение затрагивает runtime/data.

## Перед merge

- выполнен независимый review exact head SHA;
- PR основан на актуальном `main` и не содержит чужого scope;
- риск классифицирован как `STANDARD` или `RISKY`;
- один ручной SourceCraft Merge Gate зелёный на exact head SHA;
- все блокеры исправлены, evidence сохранён.

## Перед production

- есть отдельная команда владельца на release;
- canonical `main` чистый, итоговый SHA известен;
- staging обязателен для migration, parser/source identity, auth/access и major upgrade;
- migration, backup/restore, jobs ownership и rollback проверены по риску;
- готов immutable artifact; build на production host запрещён;
- после rollout выполнен live smoke изменённого сценария;
- production URL, health и rollback point зафиксированы.

Пока production infrastructure и данные не созданы, этот checklist не может иметь статус PASS.

# Upstream Candidates

Статус: `ACTIVE / EMPTY REGISTER`.

Этот реестр хранит только наблюдения о потенциально reusable улучшениях,
обнаруженных в проекте. Он не является backlog, вторым task store или
разрешением изменять другой repository.

## Lifecycle

1. Добавить candidate только с локальным evidence, затронутой reusable surface
   (`src/core/**` или `packages/**`) и причиной, почему решение не должно
   оставаться project-specific.
2. Указать статус `CANDIDATE | REJECTED | PROMOTED`, source task/PR и проверяемые
   acceptance criteria. Секреты, PII и machine-specific paths запрещены.
3. До отдельного owner decision candidate остаётся локальной записью и не
   меняет dependency direction, package API или другой repository.
4. `PROMOTED` допустим только после отдельного утверждённого workstream с
   собственными branch/PR/Gate. После принятия записать итоговый canonical SHA
   или удалить запись как перенесённую в профильный backlog.
5. `REJECTED` сохраняет краткую причину, чтобы предложение не возвращалось без
   новых данных.

## Register

Активных candidates нет.

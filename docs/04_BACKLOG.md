# Backlog

Статус: `ACTIVE / NO APPROVED EXECUTION PLAN`.

Планы №6–8 исполнены. Локальный Task Manager по Plan №8 закрыт: `28/28`, без
READY или in-progress задач. Завершённые планы и inventories находятся в
`legacy/`; они не являются очередью к повторному исполнению.

## NOW

- Поддерживать канонические документы и runtime без скрытого расширения scope.
- Любая новая реализация начинается отдельным task contract и рабочим потоком
  от актуального SourceCraft `main`.
- Production не выпускался; demo-контур не считается подтверждением актуального
  release SHA.

## NEXT — только по команде владельца

- Создать immutable tag `starter-v2.0.0` после отдельной финальной проверки
  текущего canonical `main`.
- Выполнить release starter demo на `start-baza.ams24.ru`, включая immutable
  artifact, rollout, live smoke и rollback point.
- Начать client clone только из exact `starter-v2.0.0` и утверждённого preset.
- Для client production определить реальные `leadRetentionDays`,
  `archiveRetentionDays`, legal/indexing и topology decisions.

## LATER / trigger-based

- Личный кабинет, Redis, broker, PostGIS, отдельный search engine, второй jobs
  runner и multi-currency — только по новому продуктовому trigger.
- Live provider proof Timeweb Managed PostgreSQL/S3 выполняется в client clone,
  а не в starter demo.
- Performance/RUM и реальные delivery-channel проверки принадлежат конкретному
  release/client scope; исторические proofs их не заменяют.

## Завершённое evidence

- Plan №8: implementation `bd570ee40db9e25f73a24013be836dd3876282ac`,
  docs-only reconciliation `c5803cfbac5d2c1817451fdee6aa96e3b975934e`,
  итоговый отчёт `plan8/S8_25_FINAL_EXECUTION_REPORT.md`.
- Plan №7: завершённый исторический execution record.
- Plans №2–6: закрытая история; не исполнять повторно без нового approved scope.

## Политика доставки

- Один независимый stream = одна branch/worktree = один Pull Request.
- `DELIVERY_PROFILE=COMMERCIAL`: перед merge обязателен review и один ручной
  exact-head SourceCraft Gate выбранного риска.
- SourceCraft — primary; GitHub получает только явный fast-forward mirror
  canonical `main`.
- Production и tag требуют отдельных команд владельца.

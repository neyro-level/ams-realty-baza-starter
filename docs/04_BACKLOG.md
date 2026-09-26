# Backlog

Статус: `ACTIVE / PLAN 10 V4 APPROVED HANDOFF / PLAN 9 EXECUTION COMPLETE`.

Планы №6–8 исполнены. Локальный Task Manager по Plan №8 закрыт: `28/28`, без
READY или in-progress задач. Завершённые планы и inventories находятся в
`legacy/`; они не являются очередью к повторному исполнению.

Plan №9 v6 S0-S14 исполнен через approved delivery batches. Принятый
implementation baseline `5ff1e4ec7b572bab72ebc8cfa5a9af7597009188` входит в
текущий SourceCraft `main`; Task Manager закрыт
`48/48`, без READY/open/in-progress задач внутри execution graph. S15, release
tag и production не входили в Developer graph и не разрешены без отдельной
команды владельца. Репозиторное зеркало выполняется отдельно и не разрешает
release.

Plan №10 «Clone-Ready 2.1» собран как
`docs/AMS_MASTER_PLAN_10_CLONE_READY_2_1.md`, `v4 APPROVED`.
Финальный четырёхпроходный аудит завершён: 22/22 узла, циклов 0, открытых
blocker/major 0, readiness `READY_WITH_LIMITS`. Owner approval exact v4
получен; разрешены clean Task Manager import и Developer handoff по трём
`MERGE_AFTER_GATE` batch. Production, tag, mirror и live target execution не
разрешены.

## NOW

- Выполнить readiness revalidation, clean import exact Plan №10 v4 в Task
  Manager и handoff Developer через одну goal на весь approved graph.
- Поддерживать канонические документы и runtime без скрытого расширения scope.
- Любая новая реализация начинается approved task contract и batch-owned
  рабочим потоком от актуального SourceCraft `main`.
- Production не выпускался; demo-контур не считается подтверждением актуального
  release SHA.

## NEXT — только по команде владельца

- Выполнить S15 preflight и создать immutable tag `starter-v2.1.0` только по
  отдельной release-команде владельца.
- Выполнить release starter demo на `start-baza.ams24.ru`, включая immutable
  artifact, rollout, live smoke и rollback point.
- Начать client clone только из exact `starter-v2.1.0` и утверждённого preset.
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
- Plan №9: S0-S14 `EXECUTION_COMPLETE`; 12 SourceCraft PR/Gate/merge cycles;
  accepted implementation baseline
  `5ff1e4ec7b572bab72ebc8cfa5a9af7597009188` входит в текущий SourceCraft
  `main`; S15 excluded.
- Plan №7: завершённый исторический execution record.
- Plans №2–6: закрытая история; не исполнять повторно без нового approved scope.

## Политика доставки

- Один approved delivery batch = один stream = одна branch/worktree = один Pull
  Request. Constituent epics сохраняют отдельные commit/push/evidence checkpoints.
- `DELIVERY_PROFILE=COMMERCIAL`: перед merge обязателен review и один ручной
  exact-head SourceCraft Gate выбранного риска.
- SourceCraft — primary; GitHub получает только явный fast-forward mirror
  canonical `main`.
- Production и tag требуют отдельных команд владельца.

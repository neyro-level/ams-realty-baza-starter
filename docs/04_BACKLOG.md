# Backlog

Статус: `ACTIVE / PLAN 11 v4 APPROVED / TASK MANAGER CLEAN / DEVELOPER ACTIVE`.

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

Plan №10 «Clone-Ready 2.1» (`docs/AMS_MASTER_PLAN_10_CLONE_READY_2_1.md`, v4
APPROVED) исполнен полностью: Task Manager `22/22` closed, три approved
`MERGE_AFTER_GATE` batch приняты PR 174/175/176, итоговый implementation merge
— SourceCraft `main@c08ea05721d434670885ad45b0f473f2642a155c`.
Production, tag и live target execution планом не разрешались.

## NOW

- Plan №11 «Clone Factory 2.2» находится в стадии `APPROVAL_HANDOFF`:
  `docs/AMS_MASTER_PLAN_11_CLONE_FACTORY_2_2.md`,
  `v4 APPROVED`. Владелец утвердил exact v4; Task Manager import завершён,
  reconciliation `CLEAN`, Developer goal активен.
- `DECIDED P11-OD-01`: `komnaty=OUT`; отдельная route/schema/readiness-модель
  не заявляется.
- `DECIDED P11-OD-02`: `garazhi=OUT`; отдельная route/schema/readiness-модель
  не заявляется.
- `DECIDED P11-OD-03`: только 20–30 brand primitives живут в
  `src/project/brand.css`, semantic/component map остаётся в
  `src/app/globals.css`; Core, DESIGN и guards обновляются в B3-T1. До
  реализации B3 текущий runtime canon не изменён.
- `DECIDED P11-OD-04`: точные формы Souz baseline для Ростова-на-Дону,
  Ленинского и Ворошиловского районов, Северного и Центра утверждены владельцем
  и зафиксированы в Plan №11.
- Повторный финальный аудит exact v4 выполнен: blockers `0`, cycles `0`, owner
  decisions `0`, Night Run `READY_WITH_LIMITS`. Task Manager содержит
  `4 epic + 26 task`; inventory drift `0`, graph cycles `0`.
- Текущая READY implementation-задача — `ams11-b1-t1`; остальные узлы
  открываются только по утверждённым зависимостям.
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
- Plan №10: `EXECUTION_COMPLETE`; 22/22 tasks, PR 174/175/176, canonical
  implementation merge `c08ea05721d434670885ad45b0f473f2642a155c`; итоговый
  отчёт `evidence/plan10/FINAL_REPORT.md`.
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

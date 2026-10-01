# Backlog

Статус: `ACTIVE / PLAN 12 EXECUTION_COMPLETE / TASK MANAGER CLEAN / NO ACTIVE IMPLEMENTATION PLAN`.

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

Планы №10–12 исполнены и остаются `EXECUTION_COMPLETE / EVIDENCE`.
Текущие accepted SHA/tag/Gate/proof status принадлежат
`STARTER_RELEASE_STATE.md`, а не этим историческим планам.

## NOW

- Активной implementation queue нет. Plan №12 v4 закрыт: `103/103` Task Manager
  records имеют статус `closed`; `open=0`, `READY=0`, `in_progress=0`.
- Approved Plan №12 и inventory неизменны и используются только как contract /
  evidence. Итоговый отчёт: `evidence/plan12/FINAL_REPORT.md`.
- Approved ownership: brand primitives, semantic и component tokens —
  `src/app/globals.css`; `src/project/brand.css` is deprecated compatibility
  only; starter update boundary — `starter-owned.json` schema v2; clone input —
  preset schema v3.
- Souz reference ограничен source-backed subset; universal geo coverage
  доказывается отдельной synthetic non-production fixture.
- Поддерживать канонические документы и runtime без скрытого расширения scope.
- Любая новая реализация начинается approved task contract и batch-owned
  рабочим потоком от актуального SourceCraft `main`.
- Production не выпускался; demo-контур не считается подтверждением актуального
  release SHA.
- Active blocker registry: `P0=0`; `P1=0`; `P2=0`. Это единственная активная
  severity-сводка для `STARTER_RELEASE_STATE.md`; исторические plans/evidence
  не являются текущим blocker registry.

## NEXT — только по команде владельца

- После отдельной release-команды выбрать и создать следующий immutable
  `starter-v2.MINOR.PATCH` только по отдельной release-команде владельца.
- Выполнить release starter demo на `start-baza.ams24.ru`, включая immutable
  artifact, rollout, live smoke и rollback point.
- Начать client clone только из exact released tag + SourceCraft SHA и
  утверждённого preset schema v3.
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

- Plan №12: `EXECUTION_COMPLETE`; 10 epic delivery PR `!182–!191`, все exact-head
  Gate PASS; финальный implementation checkpoint
  `47afbde798c77d10725681e9401dee78e471d7d5`; отчёт
  `evidence/plan12/FINAL_REPORT.md`.
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

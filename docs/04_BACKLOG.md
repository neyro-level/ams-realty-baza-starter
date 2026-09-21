# Backlog

Статус: `Plan №6 / APPROVED` — `AMS-REALTBASE-STARTER-FINAL-FREEZE` v4.
SourceCraft возвращён как primary, GitHub остаётся one-way mirror. v3 execution
приостановлен; production исключён.

Требования, зависимости и acceptance находятся в `AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md`. Exact v4 утверждён; revised inventory должен пройти Validate → Import → Reconcile до Developer execution.

## NOW

- Reconcile revised v4 graph и выполнить уникальный SourceCraft restoration EPIC-10.
- После SourceCraft recovery продолжить незакрытую часть EPIC-05 и независимые ready epics.
- Production release остаётся отдельным lifecycle и этим планом запрещён.

## PRESERVED EXECUTION EVIDENCE

- EPIC-01…04 v3 доставлены в interim GitHub history и не переоткрываются.
- TASK-05-01 имеет отдельный commit/checkpoint; TASK-05-02 не claimed и не доставлен.
- Локальные незакоммиченные изменения TASK-05-02 сохраняются как checkpoint, но не считаются выполнением.

## DONE IN PLAN №5

- `EPIC-01…12` — mandatory gates, access/cache/numeric/data/job boundaries,
  architecture/UI guards, UI cleanup и canonical docs доставлены в SourceCraft
  `main`;
- `EPIC-13` — exact-head Core 5.5 / UI Core 5.0 proof закрыт на PR 101,
  RISKY Gate №118 и merge `089b0fb7`; повторно не исполнять без нового SHA;
- exact PR/SHA/run evidence хранится в Task Manager ledgers, а не дублируется в
  backlog.

## LATER / OUTSIDE PLAN

- production release — только отдельная команда владельца;
- client clone topology, PII retention values и promotion from demo требуют
  отдельных owner decisions.

## Политика доставки

- Новый независимый stream: отдельная ветка/worktree от актуального `main`,
  SourceCraft PR и профильный Gate перед merge.
- Production требует отдельной команды. GitHub используется только как зеркало
  канонического SourceCraft `main`.

## Закрытый CORE-ALIGN v1

Закрыт на `main@f8344de` (Plan №4, EPIC-01…08). Не исполнять заново.

## Исторический CORRECTIONS v3

Закрыт на `main@14e9bf53` (EPIC 11–21). Не исполнять заново.

## Исторический HARDENING v2

Закрыт на `main@f39826c` (EPIC 0–10).

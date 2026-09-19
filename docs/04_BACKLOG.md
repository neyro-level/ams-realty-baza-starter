# Backlog

Статус: `Plan №5 / EXECUTION` — EPIC-01…11 доставлены; EPIC-12 является этим
source-of-truth sync, EPIC-13 — следующий и последний pre-production proof.

Требования, зависимости и acceptance находятся в `AMS_MASTER_PLAN №5.md`. Статус exact snapshot: `AMS-REALTBASE-RESIDUAL-ALIGN` v1 `APPROVED`. Beads graph создаётся и reconciles из этого snapshot.

## NOW

- `EPIC-13` — final Core 5.5 / UI Core 5.0 exact-SHA proof на чистом `main` после
  merge EPIC-12. Требует isolated test DB, previous-schema fixture, zero skipped
  required integration suites и RISKY SourceCraft Gate.

## DONE IN PLAN №5

- `EPIC-01…11` — mandatory gates, access/cache/numeric/data/job boundaries,
  architecture/UI guards и UI cleanup доставлены в SourceCraft `main`;
- `EPIC-12` — canonical docs синхронизируются этим PR; после merge не исполнять
  повторно;
- exact PR/SHA/run evidence хранится в Task Manager ledgers, а не дублируется в
  backlog.

## LATER / OUTSIDE PLAN

- production release — только отдельная команда владельца;
- client clone topology, PII retention values и promotion from demo требуют
  отдельных owner decisions.

## Политика доставки

- Каждый EPIC: новая ветка от `main`, SourceCraft PR, `MERGE_AFTER_GATE`, удаление ветки.
- Production и GitHub не входят в этот план.

## Закрытый CORE-ALIGN v1

Закрыт на `main@f8344de` (Plan №4, EPIC-01…08). Не исполнять заново.

## Исторический CORRECTIONS v3

Закрыт на `main@14e9bf53` (EPIC 11–21). Не исполнять заново.

## Исторический HARDENING v2

Закрыт на `main@f39826c` (EPIC 0–10).

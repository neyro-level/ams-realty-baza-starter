# Backlog

Статус: `Plan №6 / ACTIVE` — `AMS-REALTBASE-STARTER-FINAL-FREEZE` v3
APPROVED, импортирован в локальный stealth Task Manager. Canonical delivery —
GitHub; SourceCraft не получает новых записей; production исключён.

Требования, зависимости и acceptance находятся в `AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md`. Exact snapshot: `AMS-REALTBASE-STARTER-FINAL-FREEZE` v3 `APPROVED`; inventory — `docs/orchestration/master-plan-6.inventory.json`.

## NOW

- Выполнять следующую READY implementation-задачу reconciled Plan №6 graph.
- Production release остаётся отдельным lifecycle и этим графом запрещён.

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

- Новый независимый stream: отдельная ветка/worktree от актуального GitHub
  `main`, GitHub PR и один ручной exact-head STANDARD/RISKY Gate перед merge.
- Обычный push/PR не запускает CI. SourceCraft не используется как fallback.
- Production требует отдельной команды и не входит в Plan №6.

## Закрытый CORE-ALIGN v1

Закрыт на `main@f8344de` (Plan №4, EPIC-01…08). Не исполнять заново.

## Исторический CORRECTIONS v3

Закрыт на `main@14e9bf53` (EPIC 11–21). Не исполнять заново.

## Исторический HARDENING v2

Закрыт на `main@f39826c` (EPIC 0–10).

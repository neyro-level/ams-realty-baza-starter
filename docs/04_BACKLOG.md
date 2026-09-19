# Backlog

Статус: `Plan №5 / COMPLETED` — EPIC-01…13 доставлены в SourceCraft
`main@089b0fb7a259b88fd1abd01683886d21ca34c2d1`. Финальный RISKY Gate №118 и
post-merge `verify:daily` прошли; production не выпускался.

Требования, зависимости и acceptance находятся в `AMS_MASTER_PLAN №5.md`. Статус exact snapshot: `AMS-REALTBASE-RESIDUAL-ALIGN` v1 `APPROVED`. Beads graph создаётся и reconciles из этого snapshot.

## NOW

- Активной implementation-программы нет. Следующий scope начинается только по
  новой команде владельца; production release остаётся отдельным lifecycle.

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

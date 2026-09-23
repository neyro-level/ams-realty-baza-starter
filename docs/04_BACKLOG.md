# Backlog

Статус: `Plan №7 v2 EXECUTION COMPLETE / READY_FOR_OWNER_FREEZE_DECISION / NOT_FROZEN` — `AMS-REALTY-BAZA-STARTER-AUDIT-CORRECTIONS-7`.
SourceCraft — primary, GitHub — one-way mirror. Production исключён.

Требования, зависимости и acceptance находятся в `AMS_MASTER_PLAN_7_STARTER_FINAL_AUDIT_CORRECTIONS.md`.

## NOW

- Выполненных READY-задач Plan №7 не осталось; итоговый `main@ca1b884d43e808d17e1eb18b05bad70ea358dd1c` и final decision proof сохранены как evidence.
- Не считать SourceCraft tag `starter-freeze` каноническим `starter-freeze-v2`: имя расходится с утверждённым freeze contract и требует отдельного owner reconciliation.
- Production release остаётся отдельным lifecycle и этим планом запрещён.

## PRESERVED EXECUTION EVIDENCE

- Plan №6 ниже — историческое evidence, не текущая инструкция.
- EPIC-01…10 доставлены; implementation graph Task Manager закрыт, точные execution ledgers сохранены как историческое evidence.
- EPIC-09 прошёл SourceCraft RISKY Gate №126 на exact head `2f09592343e681a97f43745530d6bae012865ddf` и был слит PR №109.
- SourceCraft `main@a2a03d50b6a4db2cfff537d2d476ad14e82f198a` — итоговый merge Plan №6 до текущего статусного уточнения.
- GitHub `main` синхронизирован с SourceCraft как зеркало.
- Созданный после исполнения tag `starter-freeze-v1` удалён по последующему явному решению владельца; текущее состояние не является freeze.
- EPIC-14 слит в SourceCraft `main@ca1b884d43e808d17e1eb18b05bad70ea358dd1c`; ручной `merge-risky` run №145 завершён успешно.

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

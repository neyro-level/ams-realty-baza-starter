# AMS Realty Baza Starter — карта документации

Статус: `ACTIVE / PLAN 9 V5 READY FOR OWNER APPROVAL`. SourceCraft — primary,
GitHub — одностороннее зеркало. Plan №9 находится в
`v5 READY_FOR_OWNER_APPROVAL`; v4 graph paused перед S0 PR из-за whitespace-only
source drift. Текущие приоритеты принадлежат
`04_BACKLOG.md`.

## Source of Truth

| Вопрос | Канонический документ |
|---|---|
| Цель, пользователи и границы продукта | `01_PRD.md` |
| Публичные URL, поверхности и content ownership | `02_PRODUCT_STRUCTURE.md` |
| Архитектура, stack, безопасность и delivery profile | `03_ARCHITECTURE.md` |
| Текущие приоритеты и owner gates | `04_BACKLOG.md` |
| Условия PR, merge и release | `05_RELEASE_CHECKLIST.md` |
| Решения конкретного starter instance и module state | `PROJECT.md` |
| Дизайн-система и UI-правила | `DESIGN.md` |
| Эксплуатация starter demo | `OPERATIONS.md` |
| Подготовка коммерческого client clone | `CLONE_ONBOARDING.md` |
| Geo/catalog URL, status, resolution и lifecycle | `platform/GEO_CATALOG_CONTRACT.md` |
| Граница reusable platform и project composition | `adr/ADR-PLATFORM-LAYOUT.md` |
| Кандидаты на отдельный future upstream workstream | `UPSTREAM_CANDIDATES.md` |

## Активное планирование

- `AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md` — единственная текущая
  основа master plan, `v5 READY_FOR_OWNER_APPROVAL / FINAL_AUDIT`.
- Exact v5 нельзя применять через Task Manager Upgrade до повторного owner
  approval; production и S15 не разрешены.

`package.json`, код, migrations и конфигурация остаются runtime truth. Если они
расходятся с документами, drift фиксируется и исправляется отдельной задачей;
документы не используются для маскировки фактического поведения.

## Порядок чтения

1. `../AGENTS.md` и этот файл.
2. Релевантная часть `../AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`.
3. Один или несколько документов Source of Truth из таблицы по scope.
4. Профильный ADR, module manifest или research только по прямой необходимости.
5. Evidence и history — только когда нужно подтвердить прошлое решение.

## Evidence и история

- `plan8/S8_25_FINAL_EXECUTION_REPORT.md` — итоговый отчёт Plan №8. Принятый
  implementation: `bd570ee40db9e25f73a24013be836dd3876282ac`; docs-only
  reconciliation: SourceCraft `main@c5803cfbac5d2c1817451fdee6aa96e3b975934e`.
- `plan8/` — evidence задач Plan №8; не очередь к повторному исполнению.
- `proofs/` — проверки и аудиты на конкретных исторических SHA. Они не
  доказывают текущее production-состояние без нового запуска.
- `legacy/plans/` и `legacy/orchestration/` — завершённые планы №6–8 и их
  импортные inventories.
- `legacy/` — более ранние планы, архитектура и материалы; не нормативный слой.
- `research/ATLAS_BASELINE.md` — provenance визуального donor.

Production, target tag `starter-v2.1.0` и client clone остаются отдельными owner
actions после исполнения и приёмки Plan №9. Наличие demo-контура не равно
актуальному release proof.

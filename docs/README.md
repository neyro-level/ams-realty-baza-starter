# AMS Realty Baza Starter — карта документации

Статус: `ACTIVE / PLAN 9 V6 S0-S14 EXECUTION COMPLETE / PRE-S15 OWNER GATE`.
SourceCraft — primary, GitHub — одностороннее зеркало. Exact v6 исполнен через
пять approved delivery batches; принятый implementation baseline —
`5ff1e4ec7b572bab72ebc8cfa5a9af7597009188`, входящий в текущий SourceCraft
`main`. Task Manager закрыт `48/48`,
без READY/open/in-progress задач. Текущие owner gates принадлежат
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

- `AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md` — exact approved source
  исполненного scope S0-S14, `v6 APPROVED / EXECUTION_COMPLETE`.
- S15, tag, mirror и production не входят в завершённый Developer graph и
  требуют отдельной явной команды владельца.

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
- `evidence/plan9/` и локальные Task Manager ledger — evidence Plan №9;
  принятый implementation baseline —
  `5ff1e4ec7b572bab72ebc8cfa5a9af7597009188`, входящий в текущий SourceCraft
  `main`.
- `proofs/` — проверки и аудиты на конкретных исторических SHA. Они не
  доказывают текущее production-состояние без нового запуска.
- `legacy/plans/` и `legacy/orchestration/` — завершённые планы №6–8 и их
  импортные inventories.
- `legacy/` — более ранние планы, архитектура и материалы; не нормативный слой.
- `research/ATLAS_BASELINE.md` — provenance визуального donor.

Production, target tag `starter-v2.1.0`, mirror и client clone остаются
отдельными owner actions S15. Наличие завершённого implementation scope или
demo-контура не равно актуальному release proof.

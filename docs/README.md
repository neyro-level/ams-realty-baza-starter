# AMS Realty Baza Starter — карта документации

Статус: `ACTIVE / PLAN 12 v4 APPROVED / TASK MANAGER CLEAN / DEVELOPER ACTIVE`.
SourceCraft — primary, GitHub — одностороннее зеркало. Текущая release identity
и proof state принадлежат `STARTER_RELEASE_STATE.md`; текущая execution queue —
только approved Plan №12 v4 и его reconciled Beads graph. Plan №11 завершён и
остаётся evidence, а не активной очередью.

## Source of Truth

| Вопрос | Канонический документ |
|---|---|
| Цель, пользователи и границы продукта | `01_PRD.md` |
| Публичные URL, поверхности и content ownership | `02_PRODUCT_STRUCTURE.md` |
| Архитектура, stack, безопасность и delivery profile | `03_ARCHITECTURE.md` |
| Текущие приоритеты и owner gates | `04_BACKLOG.md` |
| Условия PR, merge и release | `05_RELEASE_CHECKLIST.md` |
| Текущие SHA, tag, Gate и proof state | `STARTER_RELEASE_STATE.md` |
| Статусы исторических plans/evidence | `HISTORICAL_DOCUMENT_POLICY.md` |
| Решения конкретного starter instance и module state | `PROJECT.md` |
| Дизайн-система и UI-правила | `DESIGN.md` |
| Эксплуатация starter demo | `OPERATIONS.md` |
| Подготовка коммерческого client clone | `CLONE_ONBOARDING.md` |
| Короткий вход и его проверяемая схема | `CLONE_INTAKE.souz.json`, `CLONE_INTAKE.schema.json` |
| Текущий approved execution source | `AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md` |
| Geo/catalog URL, status, resolution и lifecycle | `platform/GEO_CATALOG_CONTRACT.md` |
| Граница reusable platform и project composition | `adr/ADR-PLATFORM-LAYOUT.md` |
| Кандидаты на отдельный future upstream workstream | `UPSTREAM_CANDIDATES.md` |

## Execution state

- `AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md` —
  текущий approved Plan №12 v4; validated graph: `10 epic + 89 task`,
  reconciliation `CLEAN`, Developer execution активен. Production, release tag
  и GitHub mirror этим планом не разрешены.
- `AMS_MASTER_PLAN_11_CLONE_FACTORY_2_2.md` —
  `EXECUTION_COMPLETE / EVIDENCE`; post-merge delivery подтверждён в
  `evidence/plan11/POST_MERGE_DELIVERY.md`.
- `AMS_MASTER_PLAN_10_CLONE_READY_2_1.md` — exact approved contract исполненного
  Plan №10, `v4 APPROVED / EXECUTION_COMPLETE`. Все 22/22 узла и три
  `MERGE_AFTER_GATE` batch закрыты; итоговый отчёт —
  `evidence/plan10/FINAL_REPORT.md`. Production, tag и live target execution в
  Plan №10 не входили.
- `AMS_MASTER_PLAN_9_STARTER_V2_1_CLONE_READINESS.md` — exact approved source
  исполненного scope S0-S14, `v6 APPROVED / EXECUTION_COMPLETE`.
- Новый release tag и production не входят в Plan №12 Developer graph и
  требуют отдельной явной команды владельца. GitHub остаётся только
  односторонним зеркалом canonical SourceCraft `main`; синхронизация зеркала —
  отдельная операционная команда, а не release gate.

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

Все пути ниже маршрутизируются через `HISTORICAL_DOCUMENT_POLICY.md` и имеют
статус `HISTORICAL`, `SUPERSEDED` либо `EVIDENCE ONLY`; они не являются
execution queue и не задают current release state.

- `plan8/S8_25_FINAL_EXECUTION_REPORT.md` — итоговый отчёт Plan №8. Принятый
  implementation: `bd570ee40db9e25f73a24013be836dd3876282ac`; docs-only
  reconciliation: SourceCraft `main@c5803cfbac5d2c1817451fdee6aa96e3b975934e`.
- `plan8/` — evidence задач Plan №8; не очередь к повторному исполнению.
- `evidence/plan9/` и локальные Task Manager ledger — evidence Plan №9;
  принятый implementation baseline —
  `5ff1e4ec7b572bab72ebc8cfa5a9af7597009188`, входящий в текущий SourceCraft
  `main`.
- `evidence/plan10/FINAL_REPORT.md` — итоговый implementation и delivery report
  Plan №10; canonical merge `c08ea05721d434670885ad45b0f473f2642a155c`.
- `proofs/` — проверки и аудиты на конкретных исторических SHA. Они не
  доказывают текущее production-состояние без нового запуска.
- `legacy/plans/` и `legacy/orchestration/` — завершённые планы №6–8 и их
  импортные inventories.
- `legacy/` — более ранние планы, архитектура и материалы; не нормативный слой.
- `research/ATLAS_BASELINE.md` — provenance визуального donor.

Production, следующий `starter-v2.MINOR.PATCH` и client clone остаются отдельными
owner actions S15. Репозиторное зеркало не разрешает S15 и production. Наличие завершённого implementation scope или
demo-контура не равно актуальному release proof.

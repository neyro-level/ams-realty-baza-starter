# AMS Realty Baza Starter — карта проекта

Статус: `Plan №7 v2 EXECUTION COMPLETE / READY FOR OWNER FREEZE DECISION / NOT FROZEN`. SourceCraft — primary, GitHub — mirror-only. Production в Plan №7 не входил. Канонический `starter-freeze-v2` отсутствует; отдельный SourceCraft tag `starter-freeze` требует owner reconciliation и сам по себе не меняет статус.

## Канонические документы

| Вопрос | Source of Truth |
|---|---|
| Зачем существует продукт и что входит в базовый релиз | `01_PRD.md` |
| Публичные URL, модули и границы продукта | `02_PRODUCT_STRUCTURE.md` |
| Архитектурные границы, stack и delivery profile | `03_ARCHITECTURE.md` |
| Текущий приоритет и backlog-статусы | `04_BACKLOG.md` |
| Условия готовности к merge и release | `05_RELEASE_CHECKLIST.md` |
| Решения конкретного экземпляра проекта | `PROJECT.md` |
| Эксплуатационные процедуры | `OPERATIONS.md` |
| Starter vs коммерческий clone | `CLONE_ONBOARDING.md` |
| Source of truth для секретов и доступов | `PROJECT.md` + `03_ARCHITECTURE.md` |
| Визуальная система и UI-правила | `DESIGN.md` |
| Реализуемость presentation contracts | `CONTRACT_FEASIBILITY.md` |
| Fixture acceptance перед freeze contracts | `research/FIXTURE_ACCEPTANCE.md` |

## Рабочий порядок чтения

1. `../AGENTS.md` — project router и invariants.
2. Этот файл — карта Source of Truth.
3. Релевантный раздел `../AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`.
4. `PROJECT.md`.
5. `03_ARCHITECTURE.md`.
6. `DESIGN.md` или `OPERATIONS.md` по scope.
7. `AMS_MASTER_PLAN_7_STARTER_FINAL_AUDIT_CORRECTIONS.md` — текущий approved plan.
8. `04_BACKLOG.md`.
9. ADR/module/research только когда на них ссылается текущий scope.
10. `legacy/` только для исторического evidence.

Исторические планы и proofs не являются инструкцией к повторному исполнению.
Команды проверки берутся из `package.json`; их смысл и risk split описаны в
`03_ARCHITECTURE.md` и `PROJECT.md`.

## Нормативные источники

- `AMS_MASTER_PLAN_7_STARTER_FINAL_AUDIT_CORRECTIONS.md` — APPROVED v2 и завершённый execution source; теперь используется как evidence. Production и создание канонического freeze tag были исключены из Developer execution.
- `AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md` — исторический выполненный v4 execution record; не является текущей инструкцией.
- `legacy/` — закрытые планы №2–5, их inventories и архитектура v1.0; не нормативный источник.
- `../AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` — платформенные инварианты Core 5.5.
- `research/ATLAS_BASELINE.md` — reference provenance точного Atlas donor; не нормативный источник и не clone onboarding.
- локальный stealth Beads после import — производный dependency graph; Beads не заменяет `04_BACKLOG.md`.

При расхождении конкретное решение ищется в профильном документе из таблицы, а общий инвариант — в Core 5.5.

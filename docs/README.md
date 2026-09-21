# AMS Realty Baza Starter — карта проекта

Статус: `Plan №6 / APPROVED` — `AMS-REALTBASE-STARTER-FINAL-FREEZE` v4 возвращает SourceCraft primary и GitHub mirror-only. v3 execution остановлен после EPIC-01…04 и TASK-05-01; дальнейшая работа разрешена после CLEAN reconciliation revised graph. Production не входит в Plan №6.

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
3. Один профильный документ из таблицы выше.
4. Релевантный раздел закрытого `AMS_MASTER_PLAN №5.md` только для acceptance/evidence завершённой программы.
5. ADR/module/research только когда на них ссылается текущий scope.

Исторические планы и proofs не являются инструкцией к повторному исполнению.
Команды проверки берутся из `package.json`; их смысл и risk split описаны в
`03_ARCHITECTURE.md` и `PROJECT.md`.

## Нормативные источники

- `docs/AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md` — текущий v4 APPROVED: SourceCraft primary, GitHub one-way mirror, без production.
- `docs/AMS_MASTER_PLAN №5.md` — закрытый APPROVED план остаточного выравнивания (`AMS-REALTBASE-RESIDUAL-ALIGN` v1), полностью доставленный на `main@089b0fb7`. Демо: local PostgreSQL + MEDIA_DIR; production не входил в граф.
- `docs/AMS_MASTER_PLAN №4.md` — закрытый APPROVED Core Align (`AMS-REALTBASE-CORE-ALIGN` v1, `main@f8344de`).
- `docs/AMS_MASTER_PLAN №3.md` — закрытый APPROVED corrections EPIC 11–21 (`AMS-REALTBASE-CORRECTIONS` v3, `main@14e9bf53`).
- `docs/AMS_MASTER_PLAN №2.md` — закрытый утверждённый hardening (`AMS-REALTBASE-HARDENING` v2, `main@f39826c`).
- `../AMS_PROJECT_ARCHITECTURE_v1.0.md` — историческая спецификация demo/template контура v1.0.
- `../AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` — платформенные инварианты Core 5.5.
- `research/ATLAS_BASELINE.md` — evidence точного Atlas donor, UI inventory и обязательных visual scenarios.
- локальный stealth Beads после import — производный dependency graph; Beads не заменяет `04_BACKLOG.md`.

При расхождении конкретное решение ищется в профильном документе из таблицы, а общий инвариант — в Core 5.5.

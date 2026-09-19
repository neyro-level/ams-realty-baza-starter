# AMS Realty Baza Starter — карта проекта

Статус: `Plan №5 / APPROVED` — `AMS-REALTBASE-CORE-ALIGN` v1 закрыт на `main@f8344de`; новый `AMS-REALTBASE-RESIDUAL-ALIGN` v1 прошёл финальный аудит и утверждён владельцем (`docs/AMS_MASTER_PLAN №5.md`). Разрешены Beads import и Developer handoff; production остаётся вне графа.

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

## Нормативные источники

- `docs/AMS_MASTER_PLAN №5.md` — текущий APPROVED план остаточного выравнивания (`AMS-REALTBASE-RESIDUAL-ALIGN` v1). Демо: local PostgreSQL + MEDIA_DIR; production и GitHub вне графа.
- `docs/AMS_MASTER_PLAN №4.md` — закрытый APPROVED Core Align (`AMS-REALTBASE-CORE-ALIGN` v1, `main@f8344de`).
- `docs/AMS_MASTER_PLAN №3.md` — закрытый APPROVED corrections EPIC 11–21 (`AMS-REALTBASE-CORRECTIONS` v3, `main@14e9bf53`).
- `docs/AMS_MASTER_PLAN №2.md` — закрытый утверждённый hardening (`AMS-REALTBASE-HARDENING` v2, `main@f39826c`).
- `../AMS_PROJECT_ARCHITECTURE_v1.0.md` — историческая спецификация demo/template контура v1.0.
- `../AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` — платформенные инварианты Core 5.5.
- `research/ATLAS_BASELINE.md` — evidence точного Atlas donor, UI inventory и обязательных visual scenarios.
- локальный stealth Beads после import — производный dependency graph; Beads не заменяет `04_BACKLOG.md`.

При расхождении конкретное решение ищется в профильном документе из таблицы, а общий инвариант — в Core 5.5.

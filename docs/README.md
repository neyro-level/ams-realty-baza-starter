# AMS Realty Baza Starter — карта проекта

Статус: `Active / Foundation`.

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
| Визуальная система и UI-правила | `DESIGN.md` |
| Реализуемость presentation contracts | `CONTRACT_FEASIBILITY.md` |

## Нормативные источники

- `../AMS_PROJECT_ARCHITECTURE_v1.0.md` — полный утверждённый мастер-план, требования эпиков и acceptance.
- `../AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` — платформенные инварианты Core 5.5.
- `research/ATLAS_BASELINE.md` — evidence точного Atlas donor, UI inventory и обязательных visual scenarios для EPIC 1; файлы и integrity manifest находятся в `research/atlas-visual-baseline/`.
- локальный stealth Beads — производный dependency graph; не заменяет `04_BACKLOG.md`.

При расхождении конкретное решение ищется в профильном документе из таблицы, а общий инвариант — в Core 5.5. Не создавать второй документ для той же области без ADR.

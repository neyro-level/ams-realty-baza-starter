# ADR-CANONICAL-BOUNDARIES

Статус: Accepted  
Дата: 2026-09-18  
Контекст: EPIC 1 / Core 5.5 canonical structure

## Решение

Оставляем существующие Payload-owned пути и не делаем косметический rename:

- collections/access/jobs/env остаются в `src/payload/**` (Payload CMS owns Admin, Local API, schema, migrations);
- public/system/ingest logic живёт в `src/core/**` и `src/server/**`;
- presentation DTO freeze: `packages/contracts` (`contractState=frozen` 1.0.0);
- UI package: `packages/ui`.

View-only модели карточек/каталога/shell, которых нет в frozen DTO, живут в `packages/ui/src/view-models/**`, не в `packages/ui/src/contracts/**`.

## Почему

Массовый перенос `src/payload` → `src/project/collections` сломает Payload generate/importMap и не меняет dependency boundaries. Расширение frozen `packages/contracts` требует отдельного owner `CONTRACT_CHANGE_APPROVED` + version bump; presentation view models не являются public Gateway DTO.

## Guards

- `packages/ui` не импортирует Payload/DB/`src/payload`/`src/project`.
- `packages/contracts` не импортирует Next/Payload/DB.
- `src/core` не импортирует `packages/ui`.
- Каталог `packages/ui/src/contracts` запрещён.

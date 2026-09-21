# ADR-CANONICAL-BOUNDARIES

Статус: Superseded by AMS Master Plan 6 v3, EPIC-02

Исходная дата: 2026-09-18

Дата пересмотра: 2026-09-21

## Актуальное решение

- project-owned collections, env и jobs живут в `src/project/**`;
- общие role/access helpers живут в `src/core/access/**`;
- история Payload migrations живёт в корневом `migrations/**`;
- сгенерированные Payload types живут в `src/project/payload-types.ts`;
- Public/System Gateway и остальные platform services остаются в `src/core/**`;
- presentation DTO freeze остаётся в `packages/contracts`, UI — в `packages/ui`.

`payload.config.ts` задаёт абсолютные пути, вычисленные относительно самого config-файла, поэтому генерация типов и поиск миграций не зависят от текущего рабочего каталога.

## Почему прежнее решение отменено

Ранее `src/payload/**` сохранялся как минимально рискованный layout. Утверждённый `AMS-REALTBASE-STARTER-FINAL-FREEZE v3` зафиксировал единый clone-friendly folder contract и потребовал переноса с регенерацией артефактов и проверкой неизменности схемы.

## Next.js 16 edge file

Anonymous Payload REST ограничивается в `src/proxy.ts` (`export function proxy`). В Next.js 16 `middleware.ts` устарел; файл не переименовывать обратно.

## Guards

- `packages/ui` не импортирует Payload, DB или `src/project`;
- `packages/contracts` не импортирует Next.js, Payload или DB;
- `src/core` не импортирует `packages/ui`;
- каталог `packages/ui/src/contracts` запрещён.

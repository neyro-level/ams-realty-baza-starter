# Design

Статус: `Foundation / visual baseline pending`.

## Характер

Цель — visual parity with Atlas при архитектурной очистке. Это не редизайн. Изменение визуального решения требует явного owner approval.

## Source of truth

`src/app/globals.css` — единственный источник значений design system: semantic colors, surfaces, typography scale/weights, radii, containers, section rhythm, easing, shadcn mappings и fonts.

Другой CSS может описывать grid, flex, positioning, sizing relationships и responsive composition, но получает design values через `var(--*)`. Component-specific literals не образуют второй набор токенов.

## Компоненты и композиция

- порядок: `REUSE -> VARIANT -> CREATE`;
- shadcn/ui — единственная primitive foundation;
- `Container`: `narrow | site | wide`;
- `Section`: `sm | md | lg | hero`;
- Server Component по умолчанию, client component — интерактивный leaf;
- одна логическая `h1`, видимый focus, keyboard navigation, labels/errors, alt и reduced motion обязательны.

## Media и motion

UI использует storage-neutral `MediaDTO`. Для изображений задаются stable aspect ratio, `sizes`, lazy loading ниже critical area и fallback. Target: mobile LCP не хуже 2.5 s, CLS не выше 0.1. Motion по умолчанию — CSS/Tailwind transform/opacity с `prefers-reduced-motion`; icons — Lucide.

## Visual baseline

`TODO: EPIC 1.` Нужны зафиксированный Atlas release/SHA, источник local/live, deterministic data и screenshots для `/`, каталога, карточки объекта, коммерческой страницы, контактов и lead UI на mobile/tablet/desktop/wide desktop.

Одобренных визуальных исключений пока нет.

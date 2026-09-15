# Design

Статус: `Foundation / visual baseline source fixed`.

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

Выбран local Atlas donor: SourceCraft `integrator-p/atlas-realty-starter`, exact `main@4fc5d8a2cfcd29b1431ce9541db72ba0280a4cbe`, deterministic `SITE_ENGINE=fixture`. Канонические viewport: `390×844`, `768×1024`, `1280×900`, `1440×1000`.

Identity, обязательные сценарии и reproduction contract: `research/ATLAS_BASELINE.md`. Фактический capture остаётся задачей EPIC 1.

Одобренных визуальных исключений пока нет.

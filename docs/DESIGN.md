# Design

Статус: `Hardening / REALTY_BASE / EPIC 9`.

## Theme

Dark theme: DISABLED.

`--surface-dark` and `--surface-dark-strong` are lightbox, overlay and inverse-footer tokens inside the light theme. Root `html` has no `dark` class. Tailwind `@custom-variant dark` remains unused by starter public routes.

## Характер

Цель — visual parity with Atlas при архитектурной очистке. Это не редизайн. Изменение визуального решения требует явного owner approval.

Anti-goals: новый visual language без owner approval; вторая primitive foundation; raw hex/rgb в компонентах; wildcard image hosts; хранение десятков мегабайт скриншотов в каждом clone.

## Source of truth

`src/app/globals.css` — единственный источник значений design system: semantic colors, surfaces, typography scale/weights, radii, containers, section rhythm, easing, shadcn mappings и fonts.

Другой CSS может описывать grid, flex, positioning, sizing relationships и responsive composition, но получает design values через `var(--*)`. Component-specific literals не образуют второй набор токенов.

## Token taxonomy

| Class | Meaning |
|---|---|
| CORE | Required semantic tokens enforced by `scripts/quality/design-tokens.mjs` (`--background`, section rhythm, radii, motion, fonts). |
| SHADCN | `@theme inline` mappings that expose CORE/PROJECT values to Tailwind utilities. |
| PROJECT | Starter/Atlas page tokens with live `var(--*)` usage in `packages/ui` or `src`, including live corporate prefixes `about-company`, `sale`, `new-building`. |
| MODULE-RESERVED | None in this starter. Unused future-module prefixes without a `docs/modules/` contract were removed in EPIC-19. Journal DTO remains contract-only in `packages/contracts` without unused CSS tokens. |
| DEAD | No `var(--token)` and not a `@theme` key and not MODULE-RESERVED. Guard requires count = 0. |

ACTIVE = CORE ∪ SHADCN ∪ PROJECT. Documented RESERVED is not dead.

## Page-level CSS policy

Reusable visual rhythm goes through tokens and `Section` / `Container` variants. Page CSS may keep geometry (grid, flex, positioning, responsive relationships, intrinsic sizing). Forbidden: a second control pattern (`.home-btn-primary`); journal tokens outside journal module files.

## Geometry vs design-values

Numeric colors, type sizes, weights, radii, shadows and durations live in `globals.css`. Component CSS consumes them. Repeated section spacing uses `--section-space-*` / `--site-section-space-desktop`.

## Approved exceptions

- Feed images Variant B (unoptimized + allowlist), see Media.
- Atlas `home-page.css` is a donor dump, not a live design-system export; starter public home composes Tailwind/shadcn sections.
- Visual deviations vs Atlas donor: simpler starter shell/cards (REPORT ONLY after EPIC 8.3). Not a silent redesign.

## Representative pages and viewports

Pages: `/`, `/nedvizhimost`, `/obekty/[slug]`, `/uslugi`.  
Viewports: `390×844`, `768×1024`, `1280×900`, `1440×1000`.  
Proof artifacts: `docs/proofs/epic-9/` (manifest + provenance, no bulk PNG in clone).

## Visual baseline provenance

Local Atlas donor: SourceCraft `integrator-p/atlas-realty-starter`, exact `main@4fc5d8a2cfcd29b1431ce9541db72ba0280a4cbe`, `SITE_ENGINE=fixture`. Inventory: `docs/research/ATLAS_BASELINE.md`. Capture PNGs live in donor/external storage, not in this starter clone.

## Allowed specialized UI dependencies

`embla-carousel-react`, `yet-another-react-lightbox`, Lucide, Radix/shadcn primitives already in `packages/ui`. New specialized UI deps need a project trigger.

## Компоненты и композиция

- порядок: `REUSE -> VARIANT -> CREATE`;
- shadcn/ui — единственная primitive foundation;
- `Container`: `narrow | site | wide`;
- `Section`: `sm | md | lg | hero`;
- Server Component по умолчанию, client component — интерактивный leaf;
- одна логическая `h1`, видимый focus, keyboard navigation, labels/errors, alt и reduced motion обязательны.

## Media и motion

UI использует storage-neutral `MediaDTO`. Для изображений задаются stable aspect ratio, `sizes`, lazy loading ниже critical area и fallback. Target: mobile LCP не хуже 2.5 s, CLS не выше 0.1. Motion по умолчанию — CSS/Tailwind transform/opacity с `prefers-reduced-motion`; icons — Lucide.

Feed image rendering (EPIC 8.7, measured for one-server starter): **Variant B**. External feed photos stay `unoptimized` with exact `EXTERNAL_IMAGE_HOSTS` allowlist, `sizes`, explicit aspect ratio, lazy below fold and `fetchPriority=high` on the LCP candidate. Local `/media` CMS files may use Next optimizer. Next `images.remotePatterns` are generated from the same `parseAllowedImageHosts` source as ingest validation; wildcards are forbidden. Safe outbound image fetch, if added, must use `getApprovedImageOutboundHosts()`.

# S8-17 — UI extension evidence

Статус: `IMPLEMENTED_LOCAL`; delivery evidence заполняется после SourceCraft Gate.

Дата: 2026-09-24

Authority: Plan 8 v6 `APPROVED`, P8-17.

## Scope

- contract-driven `Listing`, `GeoHub`, `DevelopmentCard/Details`,
  `DevelopersList`, `Developer`, `Nearby`, `GeoSwitcher` views;
- category-aware property details and neutral legal-check CTA when evidence is
  absent;
- development price request through the existing `/api/public/leads` flow;
- stale development prices hidden after 45 days;
- optional layouts, progress and FAQ supplied as a UI-safe presentation
  contract without changing frozen base DTO `2.0.0`;
- no App Router target route activation. The local proof route was temporary and
  removed after capture.

## Acceptance mapping

| Plan requirement | Evidence | Result |
|---|---|---|
| Reuse current composition and Design System | Project primitives, semantic tokens and existing property/lead components; `pnpm verify:ui-core` | PASS |
| Listing, GeoHub, development/developer, Nearby, GeoSwitcher | Project-owned exports in `@ams/realtbase-ui`; fixture composition in `src/fixture/p8-17-ui.tsx` | PASS |
| Category-aware property | Category heading derives from frozen `PropertyDetailsDTO.category` | PASS |
| Neutral legal CTA without evidence | Default copy is `Уточнить юридическую проверку`; no legal result is claimed | PASS |
| Prices, layouts, progress, FAQ | Development proof fixture renders every section | PASS |
| Stale prices hidden | 45-day guard plus `verify:p8-17-ui` | PASS |
| SINGLE_GEO hides switcher | Explicit null branch plus `verify:p8-17-ui` | PASS |
| Existing lead flow | `PriceRequestFormView` reuses `LeadFormView` and submits `development_price` to the existing endpoint | PASS |
| No public cutover | No committed page/route imports the P8-17 fixture or new views | PASS |
| Clone audit without escape-hatch growth | `plain_policy actual=46`, `limit=46`, zero dead tokens | PASS |

## Browser matrix

Playwright inspected five representative views at each required viewport.
Every cell passed: exactly one `h1`, zero horizontal overflow, zero unlabeled
visible form controls, zero duplicate IDs, zero empty interactive names, zero
missing image `alt`, and zero heading-level jumps.

| View | 390×844 | 768×1024 | 1280×900 | 1440×1000 |
|---|---:|---:|---:|---:|
| Listing + GeoSwitcher + mixed cards | PASS | PASS | PASS | PASS |
| GeoHub + districts + Nearby | PASS | PASS | PASS | PASS |
| Development + price form | PASS | PASS | PASS | PASS |
| Developer + projects | PASS | PASS | PASS | PASS |
| Category-aware property + neutral legal CTA | PASS | PASS | PASS | PASS |

Twenty full-page screenshots are stored in `docs/proofs/p8-17/` using the
`<view>-<width>.png` convention. Representative screenshots were visually
inspected after the automated checks. The browser pass found and verified the
fix for an unconstrained empty-gallery fallback that initially covered the
development hero.

## Local checks

| Check | Result |
|---|---|
| `pnpm verify:ui-core` | PASS |
| `pnpm ui:clone-audit` | PASS |
| `pnpm quality:architecture` | PASS, zero dependency violations |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS with 19 unchanged baseline warnings |
| Browser/a11y/visual matrix | PASS, 20 viewport/view combinations |

## Recovery

Revert the unwired UI views, fixture and verifier. Frozen contracts, Public
Gateway, resolver and current public routes remain untouched.

## Delivery

SourceCraft PR, exact-head STANDARD run, merge SHA and final `main`
reconciliation are intentionally left for the delivery stage.

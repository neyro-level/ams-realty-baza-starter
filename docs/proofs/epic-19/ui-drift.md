# EPIC-19 UI Core 5.0 drift pass

Representative routes: `/`, `/nedvizhimost`, `/obekty/[slug]`, `/uslugi`.  
Viewports: 390×844, 768×1024, 1280×900, 1440×1000.  
Specialized deps kept: `embla-carousel-react`, `yet-another-react-lightbox`.

## Inventory (19.1)

| Layer | Owner | Notes |
|---|---|---|
| Primitive | `packages/ui/src/components/ui/*` | Single shadcn foundation: button, card, dialog/sheet, input, field |
| Layout | `layout.tsx` Container/Section | Page rhythm |
| Domain | `views/property`, `views/starter`, `views/home` | Catalog/property/home |
| Shell | `views/site-shell` | Header/footer/menu |
| Composition | `src/app/(site)/*/page.tsx` | Thin pages + gateway DTO |

No second primitive foundation. Duplicate fixture lead form now reuses `LeadFormView`.

## Findings table

| Severity | File | Finding | Rule | Resolution |
|---|---|---|---|---|
| P1 | `packages/ui/components.json` | Stale `hooks` alias | 19.6 | Removed; no hooks export |
| P1 | `src/app/globals.css` | MODULE-RESERVED tokens without module contract | 19.4 | Removed unused prefixes; live `about-company`/`sale`/`new-building` stay PROJECT |
| P1 | `src/components/fixture/FixturePages.tsx` | Second lead form | 19.8 | Fixture path uses `LeadFormView` |
| P2 | `LeadFormView.tsx`, `SiteHeaderView.tsx` | Client boundary undocumented | 19.2 | Browser-reason comments |
| P2 | `docs/DESIGN.md` | Reserved list contradicted live usage | 19.3 | Taxonomy updated |

## Checks

- `pnpm quality:design-tokens`
- `pnpm verify:a11y-starter`
- `pnpm verify:seo-contracts`

LCP/CLS remain local fixture targets (≤2.5s / ≤0.1), not live production. Visual matrix: `docs/proofs/epic-9/visual-proof.md`.

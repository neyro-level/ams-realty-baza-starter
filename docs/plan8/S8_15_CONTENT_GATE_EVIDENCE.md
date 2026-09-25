# S8-15 — Content Gate evidence

Статус: `IMPLEMENTED_LOCAL`; delivery evidence заполняется после SourceCraft
Gate.

Дата: 2026-09-24

Authority: Plan 8 v6 `APPROVED`, P8-15.

## Scope

- один чистый `evaluateContentGate` для HTTP state, robots, canonical, sitemap
  eligibility и объяснимых reason codes;
- полный matrix для listing, secondary, newbuild lot, development,
  developer geo и developer;
- profile status и entity lifecycle проверяются до content quality;
- owner override валидируется и возвращается как audit result;
- публичные маршруты, sitemap, Payload schema и production не изменены.

## Acceptance mapping

| Plan requirement | Evidence | Result |
|---|---|---|
| Listing | Registry approval, tier inventory, 600-character profile threshold and SSR links | PASS |
| Secondary | Price, area, apartment rooms, district or raw fallback, owned photos and description | PASS |
| Newbuild lot | Forced `noindex,follow`, self-canonical and outside sitemap | PASS |
| Development A/B/C | Profile thresholds, C noindex and unchanged data tier in decision | PASS |
| Price freshness | Rows older than 45 days hidden; all rows older than 120 days fail Gate | PASS |
| Developer geo | Profile minimum counts only developers with a Gate-passing development | PASS |
| Developer | Passing development plus sourced, checked description of profile length | PASS |
| Owner override | Actor/reason/date audit; cannot bypass `OUT`, `PREPARED_OFF`, `NOINDEX_AUTO`, lifecycle or hard noindex | PASS |
| Weak ACTIVE page | Returns `200 noindex,follow`, not a false 404 | PASS |
| Four profiles | The full positive matrix runs against all four project SiteProfile fixtures | PASS |

## Local checks

| Check | Result |
|---|---|
| `pnpm verify:content-gate` | PASS |
| `pnpm quality:architecture` | PASS, zero dependency violations |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS with 19 unchanged baseline warnings |
| `git diff --check` | PASS |

Negative fixtures cover weak ACTIVE content, `NOINDEX_AUTO`, `OUT`,
`PREPARED_OFF`, missing/archived/redirect/gone lifecycle, stale and expired
prices, tier C, invalid override audit and future checked dates.

## Recovery

Revert the pure Content Gate module, verifier, evidence and package scripts.
Registry, frozen DTO contracts, persistence and current public routes remain
untouched.

## Delivery

SourceCraft PR, exact-head STANDARD run, merge SHA and final `main`
reconciliation are intentionally left for the delivery stage.

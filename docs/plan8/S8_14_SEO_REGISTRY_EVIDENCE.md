# S8-14 — SEO Registry evidence

Статус: `IMPLEMENTED_LOCAL`; delivery evidence заполняется после SourceCraft
Gate.

Дата: 2026-09-24

Authority: Plan 8 v6 `APPROVED`, P8-14.

## Scope

- чистая схема SEO Registry поверх существующего `PageKey`;
- project-owned seed для всех 11 template keys;
- morphology-aware metadata templates с атомарными optional fragments;
- guard для evidence source/date/value, URL/canonical/intent duplicates и
  точного равенства `buildUrl(PageKey)`;
- synthetic fixture rows остаются `draft`, `fallback_no_data` и
  `noindex,follow`;
- публичные маршруты, sitemap и индексация не включены.

## Acceptance mapping

| Plan requirement | Evidence | Result |
|---|---|---|
| Registry columns | `SeoRegistryRow` включает PageKey, URL, entity ref, phrases, metric/value/source/date, tier/minimum, robots, metadata и status | PASS |
| Empty value is not zero | `fallback_no_data` принимает только `null`; measured sources требуют конечное неотрицательное число | PASS |
| Allowed sources | Runtime allowlist: `wordstat`, `broad39`, `webmaster`, `fallback_no_data` | PASS |
| Synthetic rows are explicit | Все seed rows имеют `synthetic: true`, `draft`, `noindex,follow`; guard запрещает approval/index | PASS |
| Template coverage | 11 ключей: home, geo hub, four catalog levels, geo developers, two development modes, developer, property | PASS |
| Morphology safety | City/region/district forms carry approval; unapproved morphology cannot be indexable | PASS |
| Optional fragments | Inventory and price fragments disappear atomically; stale price is omitted | PASS |
| URL/canonical/intent safety | Guard checks duplicates and exact `buildUrl(PageKey)` equality | PASS |
| No cutover | Registry is not imported by App Router, sitemap or current metadata owners | PASS |

## Local checks

| Check | Result |
|---|---|
| `pnpm verify:seo-registry` | PASS |
| `pnpm quality:architecture` | PASS, zero dependency violations |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS with 19 unchanged baseline warnings |
| `git diff --check` | PASS |

The fixture verifier includes negative cases for invalid/future dates, missing
measured values, non-null fallback values, unsupported sources, URL/canonical/
intent conflicts, synthetic approval and indexable unapproved morphology.

## Evidence boundary

Seed phrases and counts are synthetic fixtures, not search-demand evidence.
They must be replaced by sourced snapshots before any row can become approved or
indexable. P8-15 remains the owner of Content Gate decisions.

## Recovery

Revert the registry schema/templates, project seed, verifier and package script.
Frozen contracts, Payload schema, resolver and current public routes remain
untouched.

## Delivery

SourceCraft PR, exact-head STANDARD run, merge SHA and final `main`
reconciliation are intentionally left for the delivery stage.

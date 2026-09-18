# EPIC 10.18 Full Drift Audit — REPORT ONLY

Checked: 2026-09-18  
Branch: `epic/10-checkpoint-4`  
HEAD at write: `0d57e4c9d90f96234a0908e8f4524dce8131401d`  
Mode: **REPORT ONLY**. No P0/P1 findings were confirmed for in-stream fix.

Prior report: `docs/proofs/epic-8/drift-report-only.md`.

## Method

Compared public `src/app/(site)` routes, starter views, architecture-guard rules, 18A matrix claims, and Core §19 drift classes (token bypass, architecture, copy, primitive duplication, silent failure).

## Findings

| Sev | Class | Finding | Action in this task |
|---|---|---|---|
| — | Token | Starter cards use `Card elevation="raised"` (CVA). EPIC 8.3 P2 `shadow-[var(--shadow-card)]` on starter surfaces is cleared. | none |
| P2 | Token | Atlas clone views still inline `shadow-[var(--shadow-card)]` / domain shadow tokens (`PropertyRelatedView`, catalog mortgage/new-building cards) instead of `Card` CVA. | report only |
| P2 | CSS | `!important` remains in `packages/ui/src/styles/shell.css` (container padding) and `home-page.css` (media query hide). | report only |
| P2 | Schema | `feed_sources.next_due_at` exists but stays nullable in committed migrations (`docs/proofs/epic-10/integration-infra.md`). | report only |
| info | Architecture | Atlas `HomeHeroView` / `SiteHeaderView` unused by starter routes. Not a fixture import. | none |
| info | Perf / E2E | Live LCP/CLS/p95 and six-path browser E2E are documented FAIL (`docs/proofs/epic-10/freeze-proofs.md`). Not UI token drift. | none |

## Cleared vs 8.3

- No `fetch(` under `src/` (Safe Outbound only).
- No `next/image` under `src/`.
- No fixture provider import in `src/app`.
- No public copy mentioning fixture/DTO/XML.
- Architecture `knownExceptions` length 0.

## 18A close

A/B2/C/D/E/F/G = PASS. B1 = NOT-CLAIMED, `CACHE_INVALIDATION_MODE=http`.

No P0 Hard Contract / security / silent-failure finding in this audit.

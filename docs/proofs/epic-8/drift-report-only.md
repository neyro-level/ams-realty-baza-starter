# EPIC 8.3 Drift audit — REPORT ONLY

Checked: 2026-09-18  
Scope: first representative production pages after semantic section split (home, catalog, property, marketing set).  
Mode: **REPORT ONLY**. Findings are not fixed in TASK-08-02 unless they were P0 for this task.

## Method

Compared public routes in `src/app/(site)` and starter compositions in `packages/ui/src/views/starter` against Project Design System tokens, shadcn primitives in `packages/ui`, and Core §19 drift classes (token bypass, architecture, copy, primitive duplication).

## Findings

1. **Token / primitive bypass (P2)** — starter cards still use `shadow-[var(--shadow-card)]` instead of a CVA card variant. Deferred to TASK-08-03 / EPIC 9.
2. **Architecture (info)** — Atlas-grade `HomeHeroView` / `SiteHeaderView` remain in `packages/ui` for the richer clone; starter routes compose a simpler DTO-driven path. Not a production fixture import.
3. **Copy (cleared)** — public starter views no longer mention fixture, DTO, XML or «подключится позже».
4. **Favorites / comparison (out of scope)** — not implemented; recorded in `docs/PROJECT.md`.

No P0 blocker for TASK-08-02.

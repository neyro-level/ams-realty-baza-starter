# P8-03 — SiteProfile evidence

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Requirement map

| Plan 8 requirement | Implementation evidence | Verification |
|---|---|---|
| validated SiteProfile | strict Zod schema and `defineSiteProfile` in reusable core | four valid fixtures + negative matrix |
| status and availability semantics | `ProfileStatus`, `isConfiguredRouteAvailable`, `isGeoHubAvailable` | NOINDEX threshold, unpublished and OUT cases |
| catalog surface/market vocabulary | canonical surface and market enums plus matrix | strict record validation + typecheck |
| profile matrices | platform and per-geo category/market/developer statuses | parent-disabled/child-active rejection |
| SEO tiers and Gate defaults | exact Plan 8 bands, inventory and content thresholds | fixture assertions + strict schema |
| entity prefixes | literal `zhk-` and `kp-` contract | strict schema |
| three presets | `MIXED`, `NEWBUILD_FIRST`, `SECONDARY_FIRST` | fixture validation |
| four fixture profiles | single, multi, newbuild-first and secondary-first | `verify:site-profile` |
| starter selection | project-owned `siteProfile` is `MIXED + SINGLE_GEO` | exact identity assertion |
| geo fixture relation | `primorsk` primary; `zarechnyy.agglomerationOf=primorsk` | exact fixture assertion |
| dependency direction | project fixtures import reusable core; core has no project import/literals | architecture guards |

## Status invariants

- A geo category/market/developer surface cannot be routable when its platform
  parent is `PREPARED_OFF` or `OUT`.
- `NOINDEX_AUTO` creates an effective route only at its configured minimum
  inventory; below it the route is unavailable.
- A geo hub requires both published geo data and an available configured status;
  unpublished and `OUT` geo remain unavailable.

## Recovery

Revert the P8-03 commit. No schema, persisted data, route cutover, production or
existing component behavior is changed by this epic.

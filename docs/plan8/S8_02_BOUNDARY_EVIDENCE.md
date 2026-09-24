# P8-02 — Platform/project boundary evidence

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Requirement map

| Plan 8 requirement | Implementation evidence | Verification |
|---|---|---|
| `src/project/static-routes.ts` owns static routes | `src/project/static-routes.ts`; project SEO adapter consumes it | typecheck + SEO contract suite |
| project owns city/brand/domain denylist | `src/project/project-literals.json` | architecture guard positive/negative fixtures |
| reusable core/packages contain no project literals | `findForbiddenProjectLiteralViolations` scans `src/core`, contracts and UI | architecture guard |
| core/packages may not import project | Dependency Cruiser rule plus AST guard | Dependency Cruiser + positive/negative fixtures |
| project composes core explicitly | project-owned public gateway, SEO, storage and ingest adapters | typecheck + targeted regression suites |
| href literals are report-only before cutover | `hrefLiteralMode: report`; deterministic count emitted by guard | architecture guard self-test |
| existing quality tooling remains owner | Biome, architecture guard and Dependency Cruiser only | quality commands |

## Contract decision

The starter-specific contracts fixture export was removed from the reusable package.
The breaking contract version is `2.0.0`; rationale and recovery are recorded in
`docs/adr/ADR-PLAN8-PROJECT-BOUNDARY.md`.

## Recovery

Revert the P8-02 commit. No schema, data, secret, deployment or production action is
part of this epic.

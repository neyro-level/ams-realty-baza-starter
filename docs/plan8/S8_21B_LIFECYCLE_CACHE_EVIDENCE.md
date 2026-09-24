# P8-21B — Entity lifecycle, redirects and cache evidence

Status: implementation evidence for Plan №8 v6. Public route cutover remains in P8-23A.

## Requirement map

| Requirement | Implementation / evidence |
|---|---|
| Property, development and developer lifecycle | `src/core/lifecycle/entity-lifecycle.ts`; narrow Payload lookup in `src/project/data-access/public/entity-lifecycle.ts` |
| 404 / 200 / archived noindex / 301 / 410 | `pnpm verify:entity-lifecycle` state matrix |
| Direct redirects; no self-loop, chain or loop | application guard `redirect-graph.ts` plus database trigger `redirects_direct_only` |
| Persisted lifecycle history | append-only `lifecycle-events` collection, transition hooks and database trigger `lifecycle_events_append_only` |
| Canonical move evidence | redirect entity metadata records `canonical_move` with from/to paths in the append-only journal |
| Old boundary retained | `/http/property-lifecycle/*` and the P8-21A preflight remain unchanged until P8-23A canonical URL proof |
| Bounded cache invalidation | exact tags for geo, geo+surface, district, development, developer, property and registry; max 32 remains enforced by the existing HTTP facade |
| Sitemap exclusion | purged entities remain excluded by publication filters; route/canonical sitemap wiring is deferred to P8-20/P8-23A and no old route was removed here |

## Database proof

- Clean database: all migrations including `20260924_203000_lifecycle_cache` applied; `pnpm verify:schema` passed.
- Non-empty database: the exact pre-P8-21B `main` migration set was applied, existing developer and redirect rows were inserted, then P8-21B migrated. Proof result `1:1:1:1` means both rows survived, the lifecycle column exists and the journal table exists.
- Integration: property history persisted as `published → archived → purged`; developer and development lifecycle lookups returned their retained states; history update was rejected; canonical move was journaled; sequential and concurrent redirect chains were rejected.
- Scoped down/up proof passed before history existed. After history was written, migration down was rejected by the data-preservation guard. Recovery is forward-fix only; the old HTTP boundary remains available until canonical route proof.

## Verification commands

- `pnpm verify:entity-lifecycle`
- `pnpm verify:entity-lifecycle:integration`
- `pnpm verify:schema`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm quality:architecture`
- `node scripts/quality/module-governance.mjs`

Production, tag creation, GitHub mirror and public route cutover are outside this epic.

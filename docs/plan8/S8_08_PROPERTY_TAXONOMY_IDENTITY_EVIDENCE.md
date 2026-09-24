# P8-08 — property taxonomy and public identity evidence

## Requirement mapping

| Plan 8 section 5A requirement | Implementation evidence | Verification evidence |
|---|---|---|
| persisted market/deal/category domain | `Properties` preserves market/deal and expands category with `room` and `garage`; shared contracts and public query schema use the same six categories | generated Payload types + `pnpm typecheck` |
| category-specific attributes without duplicate apartment fields | additive house, land, communications, commercial and document-check fields; existing rooms/areas/floors remain the sole apartment fields; development relation is deferred to P8-09 | category ownership negative tests in `verify-property-taxonomy.ts` |
| canonical category-to-URL mapping | `propertyCategorySurface` contains the exact six mappings | exact deep-equality test in `verify-property-taxonomy.ts` |
| explicit m²/sotka/hectare normalization and ambiguous review | `normalizeLandArea` converts explicit units and returns a review result for missing, ambiguous or invalid input | unit conversion and missing-unit tests in `verify-property-taxonomy.ts` |
| unique immutable `publicUrlId` from a database sequence/default | migration adds a bigint sequence, default, non-null unique index and immutable-update trigger; Payload allocates through the single allowlisted System Gateway method | clean migration, non-empty backfill, direct SQL default and immutable-update proofs |
| survives republication, concurrent allocation and repeated feed identity | collection hook rejects mutation; feed upsert keeps row identity; semantic slug builder accepts no price input | eight parallel Payload creates, republication assertion, repeated `(feedSource, externalId)` repository assertion |
| semantic slug excludes price | `buildPropertySemanticSlug` uses only factual category/rooms/locality/street attributes | exact slug test and price exclusion assertion |

## Recovery contract

Assigned IDs are never removed or rewritten. The migration intentionally has no lossy down path. If URL adoption later fails, disable the new URL wiring and forward-fix the sequence while retaining every assigned `publicUrlId` and the legacy `slug` lookup.

Public URL cutover, development relation wiring, production, tag and GitHub mirror are outside P8-08.

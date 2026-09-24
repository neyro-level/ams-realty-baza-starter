# P8-10 — Feed mapping, geo normalization and media mirror evidence

Status: implementation evidence for Plan №8 v6. Public route cutover and production are outside this epic.

## Requirement map

| Plan §5A requirement | Implementation / evidence |
|---|---|
| Explicit category / market / deal / subtype mapping | `src/core/ingest/feed-taxonomy.ts`; normalization emits only canonical values |
| Unknown taxonomy records an issue and does not publish | `normalizeYrlOffer` returns no offer; adversarial cases in `pnpm verify:feed-media-mapping` |
| District synonyms are city-scoped | ingest repository uses `resolvePropertyGeoBackfill`; two-city collision proof in `verify:feed-media-mapping` |
| Allowlisted external images use Safe Outbound Client | `src/project/ingest/payload-media-mirror.ts` calls `safeOutboundFetch`; redirects are revalidated by the existing client |
| Existing storage adapter and owned media | Payload `media` upload collection persists the file through its configured adapter and records `ownership=owned-feed-mirror` |
| Bounded size / concurrency / retries | 8 MiB, 10 seconds, 3 redirects, 30 images, concurrency 3 and 2 retries; bounded worker proof is executable |
| Source and rights provenance | source URL, exact host, SHA-256, feed relation, rights status and mirror timestamp are stored on media |
| SAX, manual ownership, source isolation and safe deactivation remain | existing parser/runtime/repository paths retained; feed parser, ingest, lifecycle and manual-ownership suites pass |

## Database proof

- Clean PostgreSQL 18 database: all migrations including `20260924_213000_feed_media_mirror` applied and `verify:schema` passed.
- Scoped empty-data down/up of only the new migration passed. The general Payload batch rollback was not used as proof because it correctly reaches the older intentionally irreversible P8-08 guard.
- Non-empty proof result `1:1:1` confirms one owned media row retained its feed relation and rights provenance after the migration was applied.
- The SHA-256 unique index makes concurrent copies converge on one owned media row.

## Recovery

Disable the `mirrorImages` dependency in the import job to stop new copies. Existing owned files and their source/rights evidence remain intact; feed source isolation and deactivation behavior do not change. Recovery is wiring-off or forward-fix, not deletion of owned files.

## Verification commands

- `pnpm verify:feed-parser`
- `pnpm verify:feed-ingest`
- `pnpm verify:feed-media-mapping`
- `pnpm verify:feed-lifecycle`
- `pnpm verify:manual-ownership`
- `pnpm verify:jobs-config`
- `pnpm verify:security-boundaries`
- `pnpm verify:schema`
- `pnpm verify:integration:required`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm quality:architecture`
- `node scripts/quality/module-governance.mjs`

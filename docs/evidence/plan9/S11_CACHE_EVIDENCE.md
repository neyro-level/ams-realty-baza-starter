# S11 Cache Evidence

## Installed framework decision

- Installed runtime: Next.js `16.3.5` with `cacheComponents` disabled.
- Read from the installed package:
  - `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_cache.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidateTag.md`
- Decision: cache database-backed Public Gateway route resolution with
  `unstable_cache`, a one-hour fallback revalidation period and bounded tags.
  Keep authenticated HTTP invalidation and use `revalidateTag(tag, "max")`.
  The catch-all route no longer needs `force-dynamic`; legacy 404 routes keep it.

## Invalidation proof

- Route cache identity is derived from canonical `PageKey` owner input and is
  capped at eight tags.
- Standalone entity mutation invalidates its broad related surfaces and old/new
  exact canonical identities once.
- Feed invalidation stays coalesced after the batch. Development Excel writes
  suppress per-row hooks and emit one coalesced invalidation after a changed
  apply run.
- The authenticated HTTP route remains the only runtime invalidation facade.

## Measured budget

Raw timings and the full reproducible protocol are stored in
`S11_CACHE_BUDGET.json`.

- Native Windows PostgreSQL `18.6`, isolated database, 2,000 published rows.
- Five warm-up requests followed by 35 measured requests for each surface.
- List query p95: `92.857 ms` (budget `300 ms`).
- Detail query p95: `12.215 ms` (budget `200 ms`).
- Result: PASS. No additional cache infrastructure or Redis is justified.

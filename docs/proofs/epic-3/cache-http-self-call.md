# §18A.B2 HTTP self-call batched revalidate

Checked: 2026-09-21
Mode: `CACHE_INVALIDATION_MODE=http`
In-process B1: not claimed.

## Contract

| Rule | Evidence |
| --- | --- |
| One canonical live facade | `src/core/cache/invalidator.ts` `invalidatePublicCache`; starter mode is HTTP only |
| One batched POST per chunk to `INTERNAL_REVALIDATE_BASE_URL` | facade delegates to `src/core/cache/http-revalidate.ts` `postBatchedHttpRevalidate` |
| Typed targets | `cacheTargetSchema` in `src/core/cache/revalidation-contract.ts` |
| No per-item revalidate from import | import job calls `invalidatePublicCache` once with the target list |
| Secret header, not logged | `x-ams-revalidate-secret`; route returns 404 on mismatch |
| Rate-limit boundary | invalid/anonymous requests use the application bucket; a valid self-call secret bypasses that bucket and is still authenticated by the executor; Nginx limiter remains active |
| Allowed tags/paths | `properties`, `property`, `site`, `media`; `/nedvizhimost` |
| In-process boundary | authenticated Route Handler alone calls `invalidateInProcessCacheTargets`; the public facade has no silent in-process fallback |
| Data success survives cache failure | import finish status is independent of cache result; failure adds a warning and starts SLA tracking |

## Fixture

`scripts/verify-feed-ingest.mjs` posts two targets in a single body and treats HTTP 500 as `warning`, not import failure.

Commands: `pnpm verify:feed-ingest`, `pnpm verify:jobs-config`.

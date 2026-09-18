# §18A.B2 HTTP self-call batched revalidate

Checked: 2026-09-18  
Mode: `CACHE_INVALIDATION_MODE=http`  
In-process B1: not claimed.

## Contract

| Rule | Evidence |
| --- | --- |
| One batched POST per chunk to `INTERNAL_REVALIDATE_BASE_URL` | `src/core/cache/http-revalidate.ts` `postBatchedHttpRevalidate` |
| Typed targets | `cacheTargetSchema` in `src/core/cache/invalidator.ts` |
| No per-item revalidate from import | import calls one helper with the target list |
| Secret header, not logged | `x-ams-revalidate-secret`; route returns 404 on mismatch |
| Endpoint rate-limited | `src/app/api/internal/revalidate/route.ts` |
| Allowed tags/paths | `properties`, `property`, `site`, `media`; `/nedvizhimost` |
| Data success survives cache failure | import finish status is independent of cache result |

## Fixture

`scripts/verify-feed-ingest.mjs` posts two targets in a single body and treats HTTP 500 as `warning`, not import failure.

Commands: `pnpm verify:feed-ingest`, `pnpm verify:jobs-config`.

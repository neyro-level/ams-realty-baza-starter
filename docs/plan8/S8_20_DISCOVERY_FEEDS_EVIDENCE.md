# S8.20 — Discovery feeds evidence

Status: IMPLEMENTED, UNWIRED
Task: P8-20
Risk: RISKY ingest-jobs

## Scope map

| Plan requirement | Implementation / proof |
|---|---|
| Logical sitemap groups and shards up to 50,000 | `src/core/seo/discovery-feeds.ts`; `verify:discovery-feeds` |
| Published, canonical, indexable and Gate-passing only | `buildDiscoveryShards` consumes a Content Gate decision and fails closed |
| Real listing `lastmod` | `latestLastModified` requires source timestamps and never reads deployment time |
| Four profile XML snapshots | `scripts/verify-discovery-feeds.ts` covers `singleGeo`, `multiGeo`, `newbuildFirst`, `secondaryFirst` |
| Public/starter robots | `renderDiscoveryRobots`; starter remains `Disallow: /` |
| Change-driven IndexNow events | `planIndexNowJob` covers publish, canonical move, archive and gone |
| Same-host and key verification | `buildIndexNowRequest`, `buildIndexNowKeyFile`; foreign origins fail closed |
| Payload Jobs retry ownership | programmatic `index-now` queue and `submitIndexNow`; bounded retry for 429/5xx |
| Secret-safe delivery | key is read from runtime env only; job/retry payload and output never contain it |

## Wiring boundary

The generators and the programmatic queue are intentionally not connected to
public routes, collection hooks or deploy-wide submission. P8-23A owns the
atomic route/hook cutover. Until then the existing sitemap and robots routes stay
unchanged, and no IndexNow job can be produced by normal application flows.

## Recovery

Keep the generators unwired and disable the `index-now` queue. No schema or data
rollback is required.

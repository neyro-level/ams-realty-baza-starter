# EPIC-15 Local API inventory

Classification of Payload Local API usage after EPIC-14:

| Kind | Path | Access |
|---|---|---|
| user | `Properties.ts` `/:id/return-to-feed` | request (`overrideAccess: false`, `req`) |
| user | `FeedSources.ts` owner endpoints + `beforeDelete` counts | request |
| user | `LeadDeliveries.ts` `/:id/retry` Local API | request; job enqueue via System Gateway |
| public | `src/core/data-access/public/**`, `publicGatewayReadAccess` | system public-read whitelist |
| ingest | `src/core/ingest/payload-feed-ingest-repository.ts` | system-job |
| system | `src/payload/jobs/tasks.ts`, `src/core/data-access/system/**`, `src/core/data-access/system/**` | systemOverrideAccess whitelist |

`beforeDelete` on feed-sources uses `req` + `overrideAccess: false` so linked-row counts follow the deleting user's access, not a hidden override.

`systemOverrideAccess` imports are mechanically limited to System Gateway, system data-access, jobs, public-gateway writes, ingest repository and deliver-lead. Collection/owner business files cannot import the helper.

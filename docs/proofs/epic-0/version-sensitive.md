# EPIC 0 — version-sensitive proof

Checked: 2026-09-18  
Installed: `payload` / `@payloadcms/next` / `@payloadcms/db-postgres` **3.89.0**, `next` **16.3.5**, `react` **19.2.8**, Node **>=24.20.0 <25**.  
Docs status: **PASS** for the questions below. Public Payload docs do not specify a PostgreSQL `SKIP LOCKED` claim SQL; that low-level claim remains **NOT VERIFIED** as a public contract and is not claimed here.

Decision: keep pinned versions. No upgrade, no ADR.

## Payload Local API and access

Question: how Local API applies access and transactions on PostgreSQL.

Official sources:

- https://payloadcms.com/docs/local-api/overview (fetched 2026-09-18)
- https://payloadcms.com/docs/access-control/overview (fetched 2026-09-18)
- https://payloadcms.com/docs/database/transactions (fetched 2026-09-18)

Assumptions recorded:

- Local API `overrideAccess` defaults to **true**; access is skipped unless `overrideAccess: false` and a `user` is passed.
- Collection access functions (`create`/`read`/`update`/`delete`) run before operations. Default Payload access is “authenticated user present”.
- PostgreSQL adapter uses transactions. Thread `req` through nested Local API calls so they share `req.transactionID`. Unawaited hook work must **not** reuse that `req`.
- Direct transaction API: `payload.db.beginTransaction` / `commitTransaction` / `rollbackTransaction`.
- Per-call opt-out: `disableTransaction: true`. Adapter-level disable: `transactionOptions: false`.

Cross-check: starter uses Local API from jobs/health with default override; Media access is collection-level (`read` public, writes `ownersOnly`).

## Payload Jobs, autoRun, disableScheduling, concurrency, claiming

Question: how jobs are queued, scheduled, run, and claimed on a dedicated server.

Official sources:

- https://payloadcms.com/docs/jobs-queue/overview (fetched 2026-09-18)
- https://payloadcms.com/docs/jobs-queue/queues (fetched 2026-09-18)
- https://payloadcms.com/docs/jobs-queue/jobs (fetched 2026-09-18)
- https://payloadcms.com/docs/jobs-queue/tasks (fetched 2026-09-18)
- https://payloadcms.com/docs/jobs-queue/workflows (fetched 2026-09-18)
- https://payloadcms.com/docs/jobs-queue/schedules (fetched 2026-09-18)

Assumptions recorded:

- A Job is a `payload-jobs` document. Status includes `processing` (currently running), `completedAt`, `hasError`, `waitUntil`.
- A worker **picks up** queued jobs (`payload.jobs.run`, bin `payload jobs:run`, HTTP `/api/payload-jobs/run`, or `jobs.autoRun`). Docs describe `processing: true` while running; stuck `processing: true` means a crashed worker. Public docs do **not** document `FOR UPDATE SKIP LOCKED` as the claim mechanism.
- `autoRun` is for a **dedicated always-on** process (Next.js in-process). It must **not** be used on serverless. Official recommendation for dedicated servers is a separate `pnpm payload jobs:run --cron` process.
- `autoRun` executes already-queued jobs. Recurring enqueue uses task/workflow `schedule`. Queue names on `schedule` and the runner must match.
- Default `autoRun` also calls handle-schedules. `disableScheduling: true` runs queued jobs only (needed when another runner owns scheduling, or to avoid duplicate enqueue).
- Duplicate scheduling: do not combine `jobs:handle-schedules` and `autoRun` with scheduling enabled on the same queue.
- `shouldAutoRun` returning false stops the in-process cron. Starter maps this to `JOBS_AUTORUN`.
- `jobs.enableConcurrencyControl: true` adds indexed `concurrencyKey` and may require a migration. Jobs with the same key run exclusively; jobs without a key run in parallel. If a batch picks several jobs with the same key, extras are released (`processing: false`).
- Prefer `payload.jobs.*` over generic CRUD on `payload-jobs`. Collection CRUD is denied by default; inspect with Local API override.

Cross-check: `payload.config.ts` sets `enableConcurrencyControl: true`, `autoRun` from `src/payload/jobs/queues.ts` (imports/lead-deliveries use `disableScheduling: true`), `shouldAutoRun` from `runtimeEnv.JOBS_AUTORUN`.

## Next.js 16 proxy, status, rewrite, generateSitemaps, Image

Question: Next 16 file convention and sitemap/image contracts.

Official sources:

- https://nextjs.org/docs/app/api-reference/file-conventions/proxy (fetched 2026-09-18)
- https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps (fetched 2026-09-18)
- https://nextjs.org/docs/app/api-reference/components/image (fetched 2026-09-18)

Assumptions recorded:

- `middleware` is renamed to **`proxy`**. Export `proxy` (named or default) from `proxy.ts` at the same level as `app`. Matcher still applies; without matcher, proxy runs on static and `/_next/image` too.
- `NextResponse` can `rewrite`, `redirect`, mutate headers, or return a direct `Response`/`NextResponse` with an HTTP **status** (example: 401 JSON).
- Request order includes Proxy rewrites/redirects before `next.config` `beforeFiles` / `afterFiles` / `fallback` rewrites.
- `generateSitemaps` returns `{ id }[]`. Since **Next.js 16.0.0**, `id` is passed into `sitemap` as **`Promise<string>`**. URLs are `/.../sitemap/[id].xml`. Google limit cited: 50_000 URLs per sitemap.
- `next/image` requires `src` + `alt`. External URLs need `remotePatterns`. Default optimizer does not forward auth headers; authenticated sources should use `unoptimized`.

Cross-check: starter does not yet add `src/proxy.ts` or `generateSitemaps` (later epics). Image remote hosts stay behind `EXTERNAL_IMAGE_HOSTS` / Next config when those epics land.

## Remaining uncertainty

- Exact SQL used by Payload 3.89.0 to mark `processing: true` under concurrent workers is not in public docs. EPIC 3/18A proofs own any SKIP LOCKED claim.
- Payload “current docs” site is not version-pinned to 3.89.0; behavior is accepted only where it matches this installed line and starter config.

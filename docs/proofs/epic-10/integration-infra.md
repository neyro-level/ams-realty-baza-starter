# EPIC 10.1–10.6 — integration infrastructure

Checked: 2026-09-18  
Branch: `epic/10-checkpoint-4`

## Harness

- Dedicated local PostgreSQL database whose name ends with `_test` (`DATABASE_URI_TEST`, otherwise derived from loopback `DATABASE_URI`).
- Clean schema + `payload migrate` from zero before suites.
- Injectable clock: `src/core/time/clock.ts` (`installRuntimeClock` / `createControllableClock`). Job handlers read `getRuntimeClock()`.
- HTTP fixture server: XML feed, redirect, slow, timeout, webhook idempotency (`scripts/integration/fixture-http-server.mjs`).
- Test destinations: `parseTestApprovedOrigins` allows only `http://127.0.0.1:<port>` when `AMS_ALLOW_TEST_DESTINATIONS=true` and `NODE_ENV` is not production. No global private-network bypass.

## Suites in `pnpm verify:integration` (also part of `pnpm verify`)

- Import: truncated/interrupted run cannot deactivate (`decideFeedRunCompletion` + `runImportFeed` + janitor handler on real Payload/PostgreSQL).
- Leads: anonymous Local API cannot read `leads` / `lead-deliveries`.
- Delivery: retry sets `nextAttemptAt`; future `waitUntil` is live and not orphan (`isLiveFuturePayloadJob` + controllable clock).
- Security: loopback outbound denied unless exact test origin is registered.
- Migration: unique feed/delivery indexes and `feed_sources.next_due_at` column present after local PostgreSQL proof. Current committed migrations still allow NULL `next_due_at` (backfill/NOT NULL remains a follow-up if the empty-DB path is granted `CREATE DATABASE`).

When `DATABASE_URI_TEST` / `DATABASE_URI` are absent (SourceCraft merge gate image), Payload/PostgreSQL suites are skipped after the in-memory import/security checks so `pnpm verify` can still finish. Local Windows with `.env.local` still runs the Payload suites.

Production was not touched.

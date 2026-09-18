# §18A.C Dispatcher no catch-up

Checked: 2026-09-18  
SHA: `fe6b51ab8846fba7e534090a9da0812d02c470f7`

Due sources are claimed with `FOR UPDATE SKIP LOCKED` and `LIMIT dispatchBatchSize` (`3`). `next_due_at` advances with `GREATEST(now + interval, previous + interval)`, so a late tick does not enqueue a storm.

`scripts/verify-feed-ingest.mjs` concurrent dispatchers share one claimed source. `scripts/verify-jobs-config.mjs` rejects find-then-update.

Verdict: PASS.

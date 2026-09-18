# §18A.A Heartbeat visibility

Checked: 2026-09-18  
SHA: `fe6b51ab8846fba7e534090a9da0812d02c470f7`

Heartbeat writes `import_runs.heartbeat_at` through a separate drizzle `execute` outside ingest Local API writes. Interval is `importHeartbeatIntervalMs = 15000`.

`scripts/verify-feed-ingest.mjs` starts `startImportHeartbeat` and asserts ticks while ingest work is not holding the timer.

Verdict: PASS.

# §18A.D Stale import recovery

Checked: 2026-09-18  
SHA: `fe6b51ab8846fba7e534090a9da0812d02c470f7`

`decideStaleRunRecovery` marks stale `running` (heartbeat) and stale `queued` (no job) as `interrupted`. `jobsJanitor` applies that recovery with separate thresholds: import stale `max(15m, 3 × observed successful duration)` and queued orphan `max(15m, 3 × dispatcher interval)`. Interrupted runs cannot deactivate (`verify:feed-lifecycle`).

Verdict: PASS.

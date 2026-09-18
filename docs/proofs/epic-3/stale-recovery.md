# §18A.D Stale import recovery

Checked: 2026-09-18  
SHA: `fe6b51ab8846fba7e534090a9da0812d02c470f7`

`decideStaleRunRecovery` marks stale `running` (heartbeat) and stale `queued` (no job) as `interrupted`. `jobsJanitor` applies that recovery. Interrupted runs cannot deactivate (`verify:feed-lifecycle`).

Threshold follows `maintenanceIntervalMinutes`.

Verdict: PASS.

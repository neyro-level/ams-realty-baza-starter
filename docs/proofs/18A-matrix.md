# Core §18A proof matrix

Starter cache mode = `http`. In-process invalidation is not claimed.

Re-run on EPIC-20 SHA `61200e5a0b08a6f17e5c9fe5c79ce808c780c351`: `docs/proofs/epic-20/18a-rerun.md`.

| ID | Claim | Epic | Artifact | Result |
|---|---|---|---|---|
| A | Heartbeat visibility during long import | EPIC 3 / 20 | `pnpm verify:feed-ingest` on `61200e5` | PASS |
| B1 | In-process cache invalidation | — | — | N/A, mode=http |
| B2 | HTTP self-call batched revalidate | EPIC 3 / 20 | contract + `verify:jobs-config`; live server self-call NOT PROVEN | PASS (contract) |
| C | Dispatcher no catch-up | EPIC 3 / 16 / 20 | `pnpm verify:feed-lifecycle` on `61200e5` | PASS |
| D | Stale import recovery | EPIC 3 / 20 | `pnpm verify:operational-recovery` on `61200e5` | PASS |
| E | Retention execution | EPIC 7 / 14 / 20 | `pnpm verify:health-alerts`; live purge NOT PROVEN | PASS (fail-closed skip) |
| F | Lead outbox crash window | EPIC 5 / 20 | `pnpm verify:lead-outbox` + `verify:integration` | PASS |
| G | Retryable delivery + waitUntil | EPIC 6 / 20 | `pnpm verify:lead-delivery-state` + `verify:integration` | PASS |

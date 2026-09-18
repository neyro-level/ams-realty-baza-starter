# Core §18A proof matrix

Starter cache mode = `http`. In-process invalidation is not claimed. HTTP adapter lives in `src/core/cache/http-revalidate.ts`; lazy `next/cache` only in `src/core/cache/in-process.ts`.

Re-run on EPIC-05 SHA `228e6ceef3d49ccc601d81dc0344256a6ede9f42`.

Previous re-run on EPIC-20 SHA `61200e5a0b08a6f17e5c9fe5c79ce808c780c351`: `docs/proofs/epic-20/18a-rerun.md`.

| ID | Claim | Epic | Artifact | Result |
|---|---|---|---|---|
| A | Heartbeat visibility during long import | EPIC-05 | `pnpm verify:feed-ingest`: timer is `setInterval` in import runtime, not inside `ingestNormalizedFeed` | PASS |
| B1 | In-process cache invalidation | — | — | N/A, mode=http |
| B2 | HTTP self-call batched revalidate | EPIC-05 | contract: `verify:jobs-config` + `http-revalidate.ts`; live server self-call NOT PROVEN unless `DATABASE_URI_TEST` | PASS (contract) / NOT PROVEN (live) |
| C | Dispatcher no catch-up | EPIC-05 | `pnpm verify:feed-lifecycle` | PASS |
| D | Stale import recovery | EPIC-05 | `pnpm verify:operational-recovery` | PASS |
| E | Retention execution | EPIC-05 | `pnpm verify:health-alerts`; live purge NOT PROVEN | PASS (fail-closed skip) |
| F | Lead outbox crash window | EPIC-05 | `pnpm verify:lead-outbox` + `verify:integration` | PASS |
| G | Retryable delivery + waitUntil | EPIC-05 | `pnpm verify:lead-delivery-state` + `verify:integration` | PASS |


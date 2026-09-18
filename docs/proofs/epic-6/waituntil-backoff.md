# Proof: retryable delivery + waitUntil (18A-G)

Checked: 2026-09-18  
HEAD at write: `0d57e4c9d90f96234a0908e8f4524dce8131401d`

## Backoff

`completeLeadDeliveryAttempt` (`src/core/leads/delivery-state.ts`) keeps retryable rows `pending` and sets `nextAttemptAt` from adapter `backoffMs` or `retryBackoffMs(attempts)`.

## waitUntil

`deliverLeadToChannel` returns Payload `waitUntil` from `nextAttemptAt` when the attempt stays pending (`src/core/leads/deliver-lead.ts`).

A future `waitUntil` is treated as a live job, not an orphan (`isLiveFuturePayloadJob` in `src/core/leads/job-liveness.ts`). Recovery skips those rows.

## Evidence

- `pnpm verify:lead-delivery-state`
- `pnpm verify:integration` (controllable clock + Payload jobs; see `docs/proofs/epic-10/integration-infra.md`)
- `pnpm verify:operational-recovery`

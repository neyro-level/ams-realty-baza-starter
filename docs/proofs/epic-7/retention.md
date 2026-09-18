# Proof: lead retention execution (18A-E)

Checked: 2026-09-18  
HEAD at write: `0d57e4c9d90f96234a0908e8f4524dce8131401d`

## Contract

`planLeadRetentionRun` is fail-closed on missing policy. Destructive purge runs only when `leadRetentionDays` is a positive integer.

## Execution path

- Decision: `src/core/leads/retention.ts`.
- Job: `payloadJobTaskSlugs.leadRetentionCleanup` in `src/payload/jobs/tasks.ts`.
- Starter `projectConfig.leadRetentionDays` is unset → job returns `skipped: missing_policy` and does not delete/anonymize.
- Independent alert: `retention_policy_missing` (`pnpm verify:health-alerts`).
- When policy is set, expired rows (`retentionUntil <= now`, `piiPurgedAt` absent) are deleted (`retentionMode=delete`) or anonymized (`anonymizeLeadFields`).

Live production purge was not executed (production forbidden). Starter policy remains unset by design.

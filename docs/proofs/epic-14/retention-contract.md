# EPIC-14 retention contract

- `leadRetentionDays` / `archiveRetentionDays` remain `null` placeholders in `project.config.ts`.
- Maintenance jobs skip destructive cleanup when policy is missing (`missing_policy`).
- Production runtime + public lead intake without owner days fails `evaluateProductionRetentionReadiness`.
- Build/dev remain permissive.
- Expired leads and linked deliveries are processed; non-expired leads stay untouched.
- Delivery diagnostics after purge do not retain PII.
- `docs/PROJECT.md` records `leadRetentionDays = NEEDS_OWNER` and `archiveRetentionDays = NEEDS_OWNER`.

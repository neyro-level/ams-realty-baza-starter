# EPIC-12 catalog budget evidence

Payload-first public reads are the closed default. Public `drizzle.execute` was removed; it is not restored if latency budgets miss.

## Budgets

| Path | Target |
|---|---|
| catalog list data path p95 | <= 300 ms |
| property detail p95 | <= 200 ms |

## Measurement

| Field | Value |
|---|---|
| Dataset | representative REALTY_BASE (~2 000) not loaded in this worktree |
| Local DATABASE_URI | absent in epic-12 worktree (`.env.example` only) |
| catalog list p95 | NOT_MEASURED |
| property detail p95 | NOT_MEASURED |
| Decision | keep Payload-first |
| Optimized Read Gateway | `NEEDS_OWNER` after this program |

Do not treat missing p95 as a graph stop. Re-measure on AMS Server demo data during EPIC-21 if a representative catalog exists.

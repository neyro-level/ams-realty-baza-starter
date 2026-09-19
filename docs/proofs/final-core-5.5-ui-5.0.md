# Final Core 5.5 / UI Core 5.0 proof

Status: **PASS — pre-production contract only**  
Plan: `AMS-REALTBASE-RESIDUAL-ALIGN`, version `v1`, EPIC-13  
Checked: `2026-09-19`  
Baseline `main`: `d4fe1995a9139842b1cda78b03b6d13f43128f08`  
Evidence head: the Git commit containing this document. The SourceCraft PR and
RISKY Gate must use that exact full SHA; a changed SHA invalidates this proof.

This document does not claim a production release, production data, live
delivery, production performance, or production readiness beyond the stated
pre-production contract.

## Owner deviations and fixed decisions

- Demo/template contour: owner-operated `start-baza.ams24.ru` on AMS Server.
- Runtime topology: local PostgreSQL plus persistent `MEDIA_DIR`; S3 and
  Timeweb Managed PostgreSQL are not starter dependencies.
- Cache mode: HTTP self-call only; in-process invalidation is not enabled.
- Payload CMS owns data, authentication and migrations. Prisma and a second
  backend/auth layer are absent.
- Retention duration is intentionally unset. Destructive retention execution
  therefore fails closed until the owner sets an approved policy.
- CRM is deferred. Supported outbound adapters are MAX and custom webhook;
  real credentials and a live channel are release-time concerns.
- Production and GitHub are outside this plan.

## Proven on the evidence head

### Hard Contract

| Contract surface | Evidence | Result |
|---|---|---|
| Schema owner | Payload config, collections and Payload migrations; architecture guards reject a second ORM/data owner | PASS |
| Access modes | Explicit operator, `public-read`, `system-job` and deny-by-default paths | PASS |
| Private fields | Raw anonymous business REST denied; public DTOs expose allowlisted fields only | PASS |
| Migrations-only | Clean database and previous-schema fixtures upgrade through committed migrations | PASS |
| Numeric invariants | Previous invalid data fails without partial constraints; valid previous data receives the full constraints | PASS |
| Import safety | Parser, ingest, lifecycle, manual ownership and recovery suites | PASS |
| Jobs ownership | Job configuration, owner operations and manual ownership suites | PASS |
| Outbound safety | Approved-origin, webhook/MAX adapter, secret and safe-fetch guards | PASS |
| Leads and retention | Intake, outbox, delivery state, cascade and fail-closed retention suites | PASS |

The full command `pnpm verify:merge-risky` completed with exit code `0`. It ran
the required PostgreSQL/Payload integration with an explicit isolated
`DATABASE_URI_TEST`; no integration suite was skipped. It also completed
contracts, architecture, security boundaries, product regression, clone
readiness, accessibility, typecheck, lint and production build. Lint reported
19 pre-existing warnings and no error.

### Migrations and schema

- Native PostgreSQL `18.6` on loopback was used; Docker and WSL were not used.
- Test database: isolated local `ams_realtbase_plan5_test`, never the working
  development database.
- Clean database: all committed Payload migrations apply successfully.
- Previous numeric fixture: invalid rows fail atomically; valid rows are
  preserved and constrained.
- Previous lead-delivery fixture: nullable/`SET NULL` state fails closed;
  corrected data upgrades to `NOT NULL` plus `ON DELETE CASCADE`, and the
  cascade is exercised.
- `pnpm verify:schema` completed with exit code `0`, including constraints,
  indexes, triggers, foreign keys, duplicate-delivery rejection and cascade.

### Core §18A matrix

| Item | Current evidence | Result |
|---|---|---|
| A — heartbeat during long import | `verify:feed-ingest` and required integration | PASS |
| B1 — in-process invalidation | Not part of the selected HTTP cache mode | N/A |
| B2 — authenticated batched HTTP revalidate | Job config, HTTP adapter contract and required integration fixture verify authenticated batching | PASS |
| C — dispatcher without catch-up | `verify:feed-lifecycle` | PASS |
| D — stale import recovery | `verify:operational-recovery` | PASS |
| E — retention execution | Missing owner policy produces a fail-closed skip; destructive live purge was not executed | PASS (fail closed) / NOT PROVEN (live purge) |
| F — lead outbox crash window | `verify:lead-outbox` plus required integration | PASS |
| G — retryable delivery and `waitUntil` | `verify:lead-delivery-state` plus required integration | PASS |

### Access and security matrix

| Surface | Anonymous | Operator | System/public gateway | Evidence | Result |
|---|---|---|---|---|---|
| Published pages/properties | Raw REST denied | Admin/owner allowed | `public-read` with publication filters and DTO projection | `verify:public-gateway`, `verify:security-boundaries`, required integration | PASS |
| Private/draft/archive state | Denied | Admin/owner according to collection policy | Explicit lifecycle queries only | security and product regression suites | PASS |
| Leads and deliveries | Collection reads denied; intake endpoint allowlisted | Admin/owner allowed | Intake/outbox/delivery system paths | lead suites and required integration | PASS |
| PII | No anonymous collection listing; public response is allowlisted | Role-scoped | System-job only where declared | raw REST guard, secrets guard, access matrix | PASS |
| Payload jobs | Denied | Denied through collection access | System-only inspection/execution | jobs config and owner operations | PASS |

No secret value, database credential or real outbound token is stored in this
artifact.

### UI, accessibility and SEO

- `pnpm verify:ui-core`: zero design findings and zero baselined findings.
- `pnpm verify:a11y-starter`: PASS.
- `pnpm verify:seo-contracts`: PASS.
- Production build: PASS, 17 application routes generated/recognized.
- Manrope is loaded through `next/font/google` and observed as the computed
  body font in the browser matrix.
- Current domain ownership is `views/home`, `views/catalog`,
  `views/property`, `views/corporate`, shared conversion views and
  `views/site-shell`; historical `views/starter` ownership is not claimed for
  the split page views.

Representative production-server visual matrix:

| Route | 390×844 | 768×1024 | 1280×900 |
|---|---|---|---|
| `/` | PASS | PASS | PASS |
| `/nedvizhimost` | PASS | PASS | PASS |
| `/o-kompanii` | PASS | PASS | PASS |

For every PASS cell: HTTP `200`, exactly one `h1`, exactly one `main`, no
horizontal overflow, no browser/page error, and Manrope is the computed font.
Representative screenshots were manually inspected and remain local ignored
evidence under `.tmp/epic13-visual/`; they are not committed.

Property-detail visual rendering is **NOT PROVEN** in this final fixture pass:
the production gateway correctly returns `404` without a published Payload
record, and the proof did not insert synthetic content into a production-like
database. Property DTO, lifecycle, access, responsive source contract and
production compilation are mechanically covered, but not promoted to visual
PASS.

### Clone readiness

- `pnpm verify:clone-readiness`: PASS.
- Core/package source is unchanged by clone verification.
- Runtime topology, environment contract, migration path, persistent media and
  owner decisions are documented in the active canon.
- Real secrets remain external in Secret Master and were not required for this
  pre-production proof.

## Not proven

- Production deployment, production smoke test and rollback rehearsal.
- Live MAX/custom-webhook delivery with real credentials and recipient.
- Destructive retention purge with an owner-approved retention duration.
- Property-detail visual rendering backed by a published Payload record.
- Production-like performance: LCP, CLS, throughput, job latency and database
  capacity are **NOT PROVEN**. No production-like contour was available, so no
  performance PASS is claimed.

## Remaining findings

| Severity | Validated open findings |
|---|---|
| P0 / blocker | None |
| P1 / major | None |
| P2 / minor | None |

The 19 lint warnings are existing generated/CSS style warnings accepted by the
current lint gate; they are not errors and did not create a new finding in this
proof. Release-time decisions (retention duration, real delivery channel,
credentials and deployment approval) are owner gates, not defects in this
pre-production plan.

## Risks and reproduction

- A future code or document change requires a new exact-head proof and Gate.
- Tests must use an explicit isolated local `DATABASE_URI_TEST`; fallback to a
  working or production database is forbidden.
- Live retention and outbound behavior must remain disabled until the owner
  supplies the corresponding policy and secrets.
- Performance must be measured on a production-like contour before it can be
  called proven.

Reproduction commands:

```text
pnpm verify:merge-risky
pnpm verify:schema
pnpm verify:ui-core
pnpm build
```

After the RISKY exact-head Gate and merge, run only `pnpm verify:daily` on the
clean canonical `main`. Do not deploy as part of this plan.

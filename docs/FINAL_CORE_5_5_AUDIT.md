# FINAL CORE 5.5 AUDIT

Checked: 2026-09-18  
Baseline SHA (program start of corrections on `main` after EPIC-10): `f39826c` (historical EPIC-10 close; not re-audited here).  
**Final SHA of this audit (worktree HEAD / `origin/main` at EPIC-20 start):** `61200e5a0b08a6f17e5c9fe5c79ce808c780c351`

This file records evidence actually run on that SHA. It does not claim production readiness or live RUM.

## Hard Contract

| Invariant | Verdict | Evidence |
|---|---|---|
| Payload is schema/auth/Local API owner | PASS | `payload.config.ts`, collections under `src/payload/collections`, no Prisma package |
| No second ORM | PASS | architecture-guard + dependency-cruiser forbid Prisma; `pnpm quality:architecture` on this SHA |
| Public data via Gateway + DTO | PASS | `src/server/public-gateway`, `pnpm verify:public-gateway` |
| Anonymous collection REST deny | PASS | `pnpm verify:security-boundaries` |
| System Gateway whitelist for override | PASS | `scripts/quality/architecture-guard.mjs` + EPIC-15 |
| Migrations only; production push off | PASS | `payload.config.ts` forces `push: false` in production; `evaluateRuntimeEnv` fails `PAYLOAD_DB_PUSH=true`; `pnpm verify:schema` |
| Safe import + source isolation | PASS | `pnpm verify:feed-ingest`, `verify:feed-lifecycle`, `verify:integration` |
| One jobs owner (Payload Jobs) | PASS | `pnpm verify:jobs-config` |
| UI isolation / one token source | PASS | `pnpm quality:design-tokens` (677 definitions) |
| Starter topology = local PostgreSQL + MEDIA_DIR | PASS | `pnpm verify:production-topology`, `verify:release-artifact`; S3 N/A for this runtime |
| PII retention fail-closed without invented days | PASS | `evaluateProductionRetentionReadiness`; days remain `NEEDS_OWNER` |
| Async lead delivery + destination allowlist | PASS | `pnpm verify:lead-outbox`, `verify:lead-delivery-state`, `verify:safe-outbound` |
| Managed PostgreSQL / S3 | N/A | clone-time option; starter runtime does not require them |

## Architecture / Data Boundary

Public reads stay Payload Local API (EPIC-12). Ingest/system SQL remains behind those gateways (`src/core/data-access/ingest/sql`, `system/sql`). Catalog p95 is **NOT PROVEN** on this SHA (`docs/proofs/epic-12/catalog-budget.md` still `NOT_MEASURED`).

## Import / Jobs / Leads

Re-run on `61200e5`: `verify:feed-parser`, `verify:feed-ingest`, `verify:feed-lifecycle`, `verify:manual-ownership`, `verify:jobs-config`, `verify:lead-intake`, `verify:lead-outbox`, `verify:lead-delivery-state`, `verify:integration`.

Enabled feeds stay due when `nextDueAt` is null (EPIC-16). Derived `pricePerMeterMinor` is ingest/manual-owned (EPIC-17).

## Security

`pnpm verify:security-boundaries` + `verify-safe-outbound` + `verify-secrets-guard` on this SHA. CSP `img-src` is exact hosts. Production `PAYLOAD_DB_PUSH=true` is fail-closed.

## Starter topology

Local PostgreSQL + `MEDIA_DIR`. `pnpm verify:production-topology` PASS.

## UI Core 5.0 / Accessibility / SEO

`pnpm quality:design-tokens`, `verify:a11y-starter`, `verify:seo-contracts` PASS. Live keyboard/dialog session on a running browser **NOT PROVEN** on this SHA. LCP/CLS live measurement **NOT PROVEN** (EPIC-10 freeze still FAIL for RUM).

## Performance

| Budget | Verdict |
|---|---|
| mobile LCP ≤ 2.5 s | NOT PROVEN |
| CLS ≤ 0.1 | NOT PROVEN |
| catalog list p95 ≤ 300 ms | NOT PROVEN |
| property detail p95 ≤ 200 ms | NOT PROVEN |

## Core §18A (commands on this SHA)

| ID | Claim | Command on `61200e5` | Verdict |
|---|---|---|---|
| A | Heartbeat | `pnpm verify:feed-ingest` | PASS |
| B1 | In-process cache | — | N/A (mode=http) |
| B2 | HTTP revalidate | `pnpm verify:jobs-config` + route contract | PASS (unit/contract; live HTTP self-call against running server NOT PROVEN) |
| C | Dispatcher no catch-up | `pnpm verify:feed-lifecycle` + `verify:feed-ingest` | PASS |
| D | Stale recovery | `pnpm verify:operational-recovery` + `verify:feed-lifecycle` | PASS |
| E | Retention | `pnpm verify:health-alerts` + `verify:lead-outbox` | PASS (policy missing → skip; live purge NOT PROVEN) |
| F | Outbox crash window | `pnpm verify:lead-outbox` + `verify:integration` | PASS |
| G | Retryable delivery | `pnpm verify:lead-delivery-state` + `verify:integration` | PASS |

## Verification actually run on `61200e5`

```text
pnpm verify:schema     PASS
pnpm verify:daily      PASS
pnpm verify            PASS (includes verify:integration and next build)
```

Biome reported 20 warnings and an internal `.beads` WinAPI diagnostic; lint exit was 0. Next compiled with warnings. These are not treated as green-washing of the command result.

## NOT PROVEN

- Live production-like LCP/CLS / catalog p95 on `start-baza.ams24.ru` or `next start`.
- Live six-path browser E2E on a running instance.
- Live HTTP revalidate against a deployed `INTERNAL_REVALIDATE_BASE_URL`.
- Live retention purge with owner-set days.
- Production rollout (EPIC-21 only).

## Remaining owner decisions

- `leadRetentionDays` / `archiveRetentionDays` = `NEEDS_OWNER`.
- Optimized Read Gateway after Payload-first = `NEEDS_OWNER`.

## Remaining risks

- Demo template is fail-closed for PII retention until owner days exist; it is not a PII-production claim.
- Catalog latency budgets are unset; Payload-first is the closed default.
- EPIC-20 does not deploy.

Forbidden slogans not used: this audit is not “FULLY VERIFIED”, “PRODUCTION READY”, or “DONE” for live AMS Server.

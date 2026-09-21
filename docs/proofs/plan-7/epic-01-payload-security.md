# Plan 7 / EPIC-01 — Payload security baseline

Date: 2026-09-21

Risk: `RISKY`

Scope: Payload `3.89.0` → `3.90.1`; Next.js remains `16.3.5`.

## Version evidence

- Previous exact version: `3.89.0` for `payload`, `@payloadcms/next` and `@payloadcms/db-postgres`.
- Selected exact version: `3.90.1` for all three packages.
- Payload `3.90.0` security release: <https://github.com/payloadcms/payload/releases/tag/v3.90.0>.
- Payload `3.90.1` patch release: <https://github.com/payloadcms/payload/releases/tag/v3.90.1>.
- Active dependency graph is pinned in `package.json` and `pnpm-lock.yaml`; mixed Payload versions are not accepted.

## Payload 3.90 applicability matrix

| Change note | Decision | Project evidence |
| --- | --- | --- |
| Password reset throttling, session revocation and relational migration | `APPLICABLE` | New `reset_password_requested_at` migration; integration proves throttling, reset, old-password rejection and prior-session revocation. |
| Scheduled-publish queued jobs | `N/A` | No collection/global enables `versions.drafts.schedulePublish`; project jobs remain explicit registry tasks. |
| SVG/XML and client-upload restrictions | `APPLICABLE` | Media retains a server-side MIME allowlist; SVG/XML are absent; client uploads are not enabled. |
| External-file trusted-origin behavior | `N/A` | Media uses local `MEDIA_DIR`; no external-file upload path is configured. |
| Polymorphic join `where` validation | `N/A` | No Payload `join` field is configured. |
| API-key reveal policy | `N/A` | `Users.auth.useAPIKey` is explicitly `false`. |
| Custom Lexical features/direct dependencies | `N/A` | No custom Lexical editor or direct Lexical package dependency exists. |

## Migration evidence

- Migration: `migrations/20260921_185354_add_reset_password_requested_at.ts`.
- Generated snapshot: `migrations/20260921_185354_add_reset_password_requested_at.json`.
- Generated Payload types contain `resetPasswordRequestedAt`.
- The isolated PostgreSQL integration suite proves the migration against a pre-upgrade relational fixture, exercises down/up, resets the database, then replays the complete migration chain from zero.
- `PAYLOAD_DB_PUSH=false`; no schema push path was used.

## Regression coverage

- Auth: successful Payload Admin login, five-attempt lockout, forgot-password request throttling, reset-password login, old-password rejection and previous-session revocation.
- Jobs: registry, auto-run, concurrency, inspection/unstuck, import and lead-delivery paths remain covered by `verify:jobs-config` and the required integration suite.
- Upload: exact allowed MIME list, explicit SVG/XML exclusion, overwrite protection, writable isolated `MEDIA_DIR`, and anonymous Media denial.
- Raw REST: existing anonymous boundary proof remains enabled.

## Checks

The final exact-head results are recorded in this file before delivery and repeated once by the SourceCraft `RISKY` gate. Local database: native PostgreSQL `18.6`, loopback `127.0.0.1:5435`, isolated project test database; Docker/WSL not used.

| Check | Result |
| --- | --- |
| `pnpm install` / synchronized dependency resolution | `PASS` |
| `pnpm payload:generate:types` | `PASS` |
| `pnpm payload:generate:importmap` | `PASS` |
| `pnpm typecheck` | `PASS` |
| `pnpm lint` | `PASS` (existing warnings only) |
| `pnpm verify:schema` | `PASS` |
| `pnpm verify:security-boundaries` | `PASS` |
| `pnpm verify:jobs-config` | `PASS` |
| `pnpm verify:integration:required` | `PASS` |
| `pnpm build` | `PASS` (compiler warnings only) |
| `pnpm verify:merge-risky` | `PASS` (required PostgreSQL integration + build; zero skipped suites) |

## Exact-head binding

The PR head cannot be embedded in the same commit without changing that head. The immutable exact PR head, SourceCraft run ID and gate result are therefore recorded in the Task Manager delivery ledger and SourceCraft gate evidence. This document is part of that exact gated tree.

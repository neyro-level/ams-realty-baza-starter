# Plan 11 v4 final implementation report

Status: `LOCAL PASS / SOURCECRAFT GATE PENDING`

## Exact candidate

- Candidate commit: `4f2c7b2102a841b41491f7e58331ca3f17db0692`
- Candidate tree: `7cf5aefd71580cead60aec4dc30269ee0eaf9414`
- Branch: `codex/plan11-b4-upgrades`
- Base: SourceCraft `main@e83897be61053a0b35c495d4401a3702b2d8548b`
- Plan source SHA-256: `fe0d4e3ea1e488a7b2e28c81a8d11cb0e0edae245a6c3b57ce9b97ecd8ded2d6`
- Inventory SHA-256: `68914a443034b29cfca6c396a0a220c1af1fb4de5570adc01a30be97cb6b62c3`

The candidate above is the exact implementation tree tested before this
evidence-only commit. The report guard permits only this report, its guard,
package command and starter-owned manifest after the candidate.

## Delivered batches

| Batch | SourceCraft delivery | Canonical result |
|---|---|---|
| B1 | PR !178, Gate run 362 | `main@33251d9aab4968fa5539d2b37cee0058e40679d1` |
| B2 | PR !179, RISKY Gate run 371 | `main@90144d5b650afb32ae21c88c7ef15b258a85ac3f` |
| B3 | PR !180, STANDARD Gate run 377 | `main@e83897be61053a0b35c495d4401a3702b2d8548b` |
| B4 | T1 `1776d6f`, T3 `e849f3c`, T2 `a8603d7`, T4 `5e3f9bb`, T5 `65f3b52`, T6 `8340650`, final fix `4f2c7b2` | PR/Gate/merge pending |

## Final local evidence on the exact candidate

| Check | Verdict | Evidence |
|---|---|---|
| `pnpm verify` | PASS | Full contracts, security, integration, clone readiness, architecture, guards, typecheck, lint and Next build exited 0. |
| Required DB suites | PASS | Explicit loopback `DATABASE_URI_TEST`; `verify:integration:required` exited 0 after the full suite. No required DB suite was skipped. |
| `pnpm verify:clone-matrix` | PASS | Souz, NEWBUILD_FIRST, SECONDARY_FIRST, MULTI_GEO and districts+legacy each passed locked install, build, PostgreSQL 18 migrations, seed, runtime HTTP and cleanup. |
| `pnpm verify:souz-parity` | PASS | 94 guarded fields, 7 source sections and 4 negative drift cases. |
| Restore drill | PASS | verify-full/CA/host fixtures, SHA-256 provenance, local PG18 restore, restored-data smoke and target cleanup. |
| Onboarding | PASS | Ordered command/link guard plus init/prepare dry runs and one-way upstream rule. |
| Disposable cleanup | PASS | Containers `0`; profile temp directories `0`; temporary profile worktrees `0`. |

## Explicitly unverified and not authorized

- Real Timeweb Managed PostgreSQL TLS/restore: `NOT RUN`.
- Real Timeweb S3 upload/read/delete: `NOT RUN`.
- Client staging/live runtime: `NOT RUN`.
- Production release or deployment: `NOT RUN`.
- `starter-v2.2.0` tag/release creation: `NOT RUN`.
- SourceCraft-to-GitHub mirror: `NOT RUN`.

These items require separate owner commands and are not implied by local PASS,
PR creation, SourceCraft Gate or merge.

## Remaining delivery risk

- B4 still requires one full diff review, one exact-head SourceCraft
  `RISK_SCOPE=dependency-runtime` Gate and merge into canonical `main`.
- Any commit that changes the implementation tree invalidates this candidate
  evidence and requires regeneration of the affected proof.
- SourceCraft Gate may expose environment-specific failures not reproduced by
  the local Windows + disposable PostgreSQL contour.

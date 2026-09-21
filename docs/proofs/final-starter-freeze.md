# Final starter freeze proof

Status: `READY_FOR_SOURCECRAFT_RISKY_GATE`  
Plan: `AMS-REALTBASE-STARTER-FINAL-FREEZE` v4  
Checked: 2026-09-21  
Production action: `NONE`

## Exact repository identity

- canonical primary: SourceCraft `integrator-p/ams-realty-baza-starter`;
- canonical SourceCraft base entering EPIC-09:
  `2fb19d104bf30ce024c91acd6fcf1ffe695ee606`;
- interim GitHub restoration boundary:
  `f645993d67c64abc200beeef47fbf3ad742ee8b2`;
- final implementation head: exact SHA is bound by the EPIC-09 SourceCraft PR
  and its manual RISKY run;
- final immutable reference: SourceCraft tag `starter-freeze-v1` resolves the
  merged canonical `main` SHA. The tag target is authoritative because a Git
  commit cannot contain its own SHA without changing it;
- GitHub receives the final SourceCraft `main` fast-forward only. GitHub tag is
  intentionally not created.

## Versions

- AMS Realty Platform Core Standard: `5.5`;
- UI Core verification contract: `5.0`;
- Payload CMS: `3.89.0`;
- Next.js: `16.3.5`;
- PostgreSQL target: `18`; local required integration used an isolated test DB.

## Plan №6 delivery ancestry

| Epic | Canonical merge/evidence SHA |
|---|---|
| EPIC-01 | `3b16b545649ed573b6397c7dbd6083fc28855726` |
| EPIC-02 | `28b20b59c05278d6b8df725c527609179985e9ff` |
| EPIC-03 | `9bbf2dd0a5617ec537409fadfdf5f17c09a5bfa8` |
| EPIC-04 | `f645993d67c64abc200beeef47fbf3ad742ee8b2` |
| EPIC-05 | `a5cef8203b625f958d597d68ea61c3a134197c6a` |
| EPIC-06 | `8ff213548581ca536ebc7c6f02569e63a8ba528a` |
| EPIC-07 | `bfb947f30f80be3039552f8bf9ace1784a21bc26` |
| EPIC-08 | `2fb19d104bf30ce024c91acd6fcf1ffe695ee606` |
| EPIC-10 | `df136ca59d3f4068e0f1305803d9841e66563a91` |

EPIC-01…04 are preserved historical GitHub merges that became ancestors of
SourceCraft through EPIC-10. EPIC-05…08 were delivered through SourceCraft.

## Commands actually run

One local `pnpm verify:merge-risky` run on the EPIC-09 worktree completed
`PASS` with `AMS_REQUIRE_INTEGRATION_DB=true`. Its command graph included:

- contracts line endings and frozen contract checks;
- jobs, public gateway, feed parser/ingest/lifecycle and manual ownership;
- lead intake/outbox/delivery state and adapters;
- security boundaries, safe outbound and secrets guard;
- production topology and release artifact contracts;
- required integration against isolated PostgreSQL;
- clone readiness, static accessibility, architecture dependency graph and all
  architecture/UI/token/module/SourceCraft guards;
- Next type generation, TypeScript, Biome lint and Next.js production build.

Additional non-duplicate proof commands:

- `pnpm tokens:report`;
- `pnpm verify:client-readiness --mode=fixture-client`;
- `pnpm verify:integration:required`.

The manual SourceCraft `merge-risky` workflow is run once on the final PR head.

## Evidence summary

| Area | Result | Evidence |
|---|---|---|
| Schema / migrations | PASS | required integration, schema and production-topology contracts in the RISKY graph |
| Security | PASS | security-boundaries, safe-outbound and secrets-guard |
| Jobs / import | PASS | jobs config, feed parser/ingest/lifecycle, ownership and recovery |
| Leads | PASS | intake, outbox, delivery state, retry/recovery and DB integration |
| Core §18A | PASS WITH EXPLICIT LIMITS | `docs/proofs/18A-matrix.md` |
| UI mechanical | PASS | UI Core, DEAD=0, token/ownership/font/a11y/SEO guards |
| UI responsive | PASS WITH NOT PROVEN | `/`, `/nedvizhimost`, `/o-kompanii` at 390×844, 768×1024, 1280×900 and 1440×1000; property detail below |
| Clone readiness | PASS | clone gate plus fixture-client readiness |
| Client blueprint | STATIC PASS | Timeweb activation package and validator |

## NOT PROVEN

- representative property-detail visual proof: clean starter fallback contains no
  published representative record; mandatory for the first client clone;
- real Timeweb Managed PostgreSQL migration and restore drill;
- real Timeweb S3 upload/read path;
- real client domain, selected lead channels and live delivery;
- live scheduled retention purge;
- representative production performance and live smoke.

These are client staging/production proofs. They do not become implicit starter
PASS and no production action was performed.

## Findings and owner decisions

- P0: `0`;
- P1: `0`;
- P2 blocking starter freeze: `0`;
- client decisions still required: identity/domain, retention values, allowlists,
  lead channels, indexing, feed source and production topology activation.

## Freeze decision

`READY FOR FREEZE` only after the final SourceCraft RISKY run is PASS on the
exact PR head and the PR is merged without head drift. Then create
`starter-freeze-v1` on canonical SourceCraft `main`. This is clone readiness,
not client production readiness.

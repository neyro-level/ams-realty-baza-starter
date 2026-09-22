# Final starter freeze v2 decision proof

Status: `READY_FOR_OWNER_FREEZE_DECISION`

Plan: `AMS-REALTY-BAZA-STARTER-AUDIT-CORRECTIONS-7` v2

Checked: 2026-09-21

Production action: `NONE`

Freeze tag action: `NONE`

This document proves that the starter candidate is ready for the owner's
separate freeze decision. It does not declare the repository frozen and does
not authorize production.

## Exact repository identity

- canonical primary: SourceCraft `integrator-p/ams-realty-baza-starter`;
- SourceCraft `main` entering EPIC-14:
  `749385f860fd6302e92ef969c748ea288dd79295`;
- GitHub mirror `main` entering EPIC-14:
  `749385f860fd6302e92ef969c748ea288dd79295`;
- mirror relation: exact SHA equality, one-way SourceCraft → GitHub;
- `starter-freeze-v2`: absent and must remain absent until a separate explicit
  owner command after EPIC-14;
- the canonical post-EPIC-14 merge SHA is recorded by SourceCraft and the Task
  Manager delivery ledger after the final exact-head Gate. It is not guessed
  inside the source commit that creates this document.

## Frozen-candidate versions

- AMS Realty Platform Core Standard: `5.5`;
- UI Core verification contract: `5.0`;
- Payload CMS: `3.90.1`;
- Next.js: `16.3.5`;
- Node.js: `24.20.0`;
- pnpm: `11.5.1`;
- PostgreSQL target: `18`.

## Plan 7 delivery ancestry

| Epic | Canonical SourceCraft merge | Result |
| --- | --- | --- |
| EPIC-01 | `9521d2d9ccf18575770be73ed49b65023410fb2c` | CLOSED |
| EPIC-02 | `92dd9e47382be7851d2570bb7bb133a145037eb2` | CLOSED |
| EPIC-03 | `f2b4eb9111b11b05f041cca424cf823d2b4b895f` | CLOSED |
| EPIC-04 | `231c3faa9721da9e0784f7c09049e33c88ac216a` | CLOSED |
| EPIC-05 | `409c55a334d65aa6fb623f0cc1546a22546e5d6f` | CLOSED |
| EPIC-06 | `9310b7d3bfeccb0c3f15f2bf5e49c40a340ea0de` | CLOSED |
| EPIC-07 | `1b6a7d52a72b5e1417db666bf64566362ff66869` | CLOSED |
| EPIC-08 | `b0e6f07e2ac976056bf27549dc1789eb805dbd04` | CLOSED |
| EPIC-09 | `d36a79541aefcc3e7fe2c1d28881c0391353b87c` | CLOSED |
| EPIC-10 | `91477e4811b886a1dff4470d4d4bcffade8b345a` | CLOSED |
| EPIC-11 | `ed41900f4d7a1373fd0a6569b2dc5978b0a835f0` | CLOSED |
| EPIC-12 | `9de2601c43b8b50b57754c1c48ab62be34d92d3f` | CLOSED |
| EPIC-13 | `749385f860fd6302e92ef969c748ea288dd79295` | CLOSED; RISKY Gate #144 PASS |
| EPIC-14 | recorded in final delivery ledger | pending final exact-head Gate and merge |

## Finding closure matrix

| Finding | Severity | Owning epic | Status | Observable evidence |
| --- | --- | --- | --- | --- |
| F-01 Payload security baseline | P0 | EPIC-01 | CLOSED | Payload `3.90.1`; `docs/proofs/plan-7/epic-01-payload-security.md`; required DB and RISKY checks PASS |
| F-02 foreign currency corruption | P0 | EPIC-02 | CLOSED | feed parser/ingest rejects unsupported currency without silent conversion; feed suites PASS |
| F-03 unsafe JSON-LD serialization | P0 | EPIC-03 | CLOSED | HTML-safe serializer and regression fixtures; SEO/security suites PASS |
| F-04 browser-authoritative consent evidence | P1 | EPIC-05 | CLOSED | server-owned consent version and timestamp; lead intake and DB integration PASS |
| F-05 unbounded business deduplication | P1 | EPIC-05 | CLOSED | attempt-scoped request identity; exact retry reused and new submission persisted in integration suite |
| F-06 lead collection access conflict | P1 | EPIC-06 | CLOSED | owner-only collection contract with classified system/public gateway; security suite PASS |
| F-07 accumulated XML text limit | P1 | EPIC-02 | CLOSED | parser-wide accumulated text budget and negative fixtures PASS |
| F-08 demo crawl/indexing conflict | P1 | EPIC-07 | CLOSED | one indexing authority drives metadata, robots and sitemap; SEO checks PASS |
| F-09 live PII without retention policy | P1 | EPIC-05 | CLOSED | runtime/client readiness fails closed for active channels without retention/legal readiness |
| F-10 docs/runtime authority drift | P1 | EPIC-12 | CLOSED | active docs state server-authoritative consent and RUR/RUB-only ingest; runtime matches |
| F-11 DNS rebinding window | P2 | EPIC-03 | CLOSED | outbound client pins verified resolution and blocks private/link-local targets; security fixtures PASS |
| F-12 client-influenced forwarded IP | P2 | EPIC-03 | CLOSED | trusted Nginx overwrites client address and application parsing is bounded; security checks PASS |
| F-13 UI `plain` escape hatch | P2 | EPIC-09 | CLOSED | bounded semantic variants and clone audit; UI Core PASS |
| F-14 non-canonical gone-property UI | P2 | EPIC-09 | CLOSED | gone view owned by the project UI package and uses canonical composition; live mobile proof PASS |
| F-15 active-document contradictions | P2 | EPIC-12 | CLOSED | one current source per consent/currency/cache/storage/indexing topic; Plan 6 marked historical |
| F-16 starter-only clone residue | P2 | EPIC-10 | CLOSED | idempotent `clone:prepare`, provenance file and client-only cleanup verification PASS |

Open findings at freeze-decision boundary:

- P0: `0`;
- P1: `0`;
- P2 blocking starter freeze: `0`.

## Final validation evidence

`docs/proofs/plan-7/final-validation.md` records the EPIC-13 candidate proof:

- full `pnpm verify:merge-risky`: PASS;
- required native PostgreSQL 18 integration: PASS, skipped suites `0`;
- production build: PASS;
- exact-SHA temporary client clone: PASS;
- client `clone:prepare`, Timeweb S3 activation, readiness, daily checks and
  client production build: PASS without provider access;
- representative `/`, catalog, services, active property, 404 and gone/410
  states at desktop/mobile viewports: PASS;
- live validation found and closed the property-page HTTP 500 and the false
  404 for purged published properties;
- P0/P1 after remediation: `0`;
- production action: `NONE`.

## NOT PROVEN by starter freeze

The following are client staging/production gates, not starter clone gates:

- real client domain and identity;
- approved real client legal text;
- real client XML/feed content;
- real Timeweb Managed PostgreSQL migration, backup and restore drill;
- real Timeweb S3 upload/read lifecycle;
- real client CRM or messenger credentials and delivery;
- real production performance and capacity;
- real production backup execution;
- real production monitoring and alert delivery;
- live indexing decision, rollout and production smoke.

None of these items is silently upgraded to `PASS` by this document.

## Freeze decision

The implementation, validation and Plan 7 finding closure are complete enough
to request the owner's freeze decision. Current state remains:

```text
READY_FOR_OWNER_FREEZE_DECISION
NOT_FROZEN
PRODUCTION_ACTION=NONE
```

Only a new explicit owner command may create the immutable SourceCraft tag
`starter-freeze-v2`. The tag must point to the canonical post-EPIC-14
SourceCraft `main` SHA. GitHub stays a mirror and receives no tag unless a
separate repository policy explicitly requires it.

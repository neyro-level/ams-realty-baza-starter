# P8-07 — additive property geo refs and backfill evidence

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Implemented contract

| Requirement | Evidence |
|---|---|
| additive refs | `properties.regionRef`, `cityRef` and `districtRef` are optional Payload relationships backed by indexed nullable foreign keys |
| raw preservation | existing `region`, `locality` and `district` text fields are unchanged and remain the legacy source during expand |
| deterministic matching | exact normalized aliases only; morphology and district synonyms are used only when approved; archived geo is excluded |
| city-scoped district | district candidates are restricted to one resolved city, so equal synonyms in different cities cannot cross-link |
| no guessing | zero or multiple matches produce a null ref plus a stable issue code; a district without one canonical city is not matched |
| visible unknown | unknown district does not change property status; it sets `districtRef=null`, `needsReview=true` and creates a warning |
| redacted report | issue messages contain the result class but never repeat raw legacy values |
| valid run | apply requires a dedicated `property-geo-backfill-v1` source-scoped import run and processes only properties owned by that run's feed source |
| idempotence | repeated apply on the same run creates no duplicate issues and performs no property updates after convergence |
| bounded execution | properties are processed in configurable batches of 1–500; the CLI is dry-run unless `--apply` is explicit |

## Verification matrix

- Pure resolver: exact/normalized matches, unique-city region derivation,
  ambiguous city, city-scoped synonym and redacted unknown district.
- Migration proof on isolated non-empty PostgreSQL 18: additive up, populated
  relations, down, raw/sentinel preservation and second up.
- Payload integration: three source-scoped properties, two cities, cross-city
  district synonyms, unknown district visibility/report and repeat-zero-diff.
- Full migration chain with `PAYLOAD_DB_PUSH=false`, schema indexes/FKs,
  typecheck, lint, architecture/security guards and production build.

## Recovery

The down migration removes only the three new refs and only before dependent
consumers/data make that safe. It never removes legacy raw text. After P8-08 or
dependent consumers, disable backfill/canonical-ref reads and forward-fix while
preserving IDs and raw source values.

No public route, UI cutover, production, tag or GitHub mirror is part of P8-07.

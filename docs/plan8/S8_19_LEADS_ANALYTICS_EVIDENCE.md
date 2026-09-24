# P8-19 — Leads and analytics evidence

Status: implementation evidence  
Risk: `RISKY auth-pii-leads`

## Scope

- Existing `POST /api/public/leads`, transactional outbox, delivery recovery and
  idempotency remain the only lead path.
- Runtime form kinds add `legal`, `development_price` and `quiz`.
- Optional normalized attribution adds geo, catalog surface, district, immutable
  property URL ID, development and developer keys.
- Provider-neutral analytics covers geo/listing/district/facet/development/
  developer views, development price request submit and legal CTA.
- The project adapter is deliberately no-op; no external analytics vendor or
  second persistence path is enabled.

## Safety and recovery

- Analytics schemas are strict and reject PII-shaped keys, arbitrary free-text
  fields, non-normalized entity keys and non-canonical page dimensions.
- Lead diagnostics remain PII-free. Existing delivery adapters receive the
  normalized context without changing their delivery state machine.
- Migration `20260924_233000_lead_context` is additive. Its down path removes the
  fields and restores the original form-kind enum only when no extended data
  exists; otherwise it stops before loss.
- Analytics rollback is feature-off by retaining the no-op adapter. Lead rollback
  is the tested migration down path after intake is disabled and extended rows are
  absent.

## Acceptance ledger

| Requirement | Evidence |
|---|---|
| New form kinds and optional context | intake matrix plus Payload round-trip |
| Existing API/outbox/idempotency preserved | lead intake/outbox and integration suites |
| Typed provider-neutral events | eight-event contract matrix and test sink |
| PII/free text rejected | automated negative analytics matrix |
| Additive up/down migration | isolated PostgreSQL migration proof, including fail-closed retained-data case |
| No second backend/outbox/vendor | architecture boundary and project no-op adapter |

Final exact-head SourceCraft Gate and merge evidence are recorded by the P8-19
delivery ledger, not predeclared in this implementation document.

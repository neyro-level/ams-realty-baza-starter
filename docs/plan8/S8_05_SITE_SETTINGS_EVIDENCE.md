# P8-05 — Site settings / NAP evidence

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Requirement map

| Plan 8 requirement | Implementation evidence | Verification |
|---|---|---|
| canonical site settings | Payload Global `site-settings` owns brand, contacts, social links, requisites and coordinates | generated Payload types + integration suite |
| public contract | `NapDTO` is exported by `@ams/realtbase-contracts`; `toNapDTO` strips unset optional values | contract lock/check + typecheck + DTO assertion |
| Gateway-only public read | `findPublicNap` uses `overrideAccess: false` and the explicit public Gateway context | anonymous raw Global rejection + Gateway success |
| fixture data | project-owned `fixtureSiteSettingsData` and expected `fixtureNap` | owner seed + exact DTO assertion |
| reversible migration | migration creates only `site_settings` and `site_settings_social_links` with their FK/indexes | clean full migration + direct up/down/re-up proof |
| non-empty safety | migration sentinel survives down and re-up | isolated PostgreSQL integration proof |
| existing presentation retained | no public component or fixture-provider consumer is switched in this epic | diff scope review |

## Database proof

- Engine: native PostgreSQL `18.6`, loopback only.
- Database: isolated `ams_realtbase_p8_05_test` owned by the existing project role.
- `verify:integration:required`: PASS.
- Clean full migration: PASS.
- Non-empty `up -> down -> up`: PASS; unrelated sentinel data preserved.
- `verify:schema`: required site-settings tables and indexes are part of the gate.

## Contract sequencing decision

The public contracts package remains `2.0.0 draft` while Plan 8 adds NAP, geo,
development and listing DTOs. P8-12 is the sole approved freeze gate. Freezing in
P8-02 would have made the planned P8-05/P8-06/P8-08/P8-09 contract evolution
impossible without repeated owner-gated version changes.

## Recovery

Run the tested down migration before dependent data is introduced, then revert the
P8-05 commit. Existing public components still use their previous presentation
source, so disabling this Global does not require a UI rollback.

# ADR-UI-RUNTIME-DESIGN-VALUES

Status: `APPROVED / Final Audit Freeze v2 / OD-FA-01`

## Decision

For the Final Audit Freeze starter line, factual runtime design-system values
return to `src/app/globals.css`.

Clone preset/intake remains the client-owned input for generated project
values. `src/project/brand.css` is allowed only as transitional generated
compatibility input until EPIC-01 moves generation into `globals.css`; after
that migration it has no runtime authority.

## Supersedes

This supersedes the Plan 12 runtime split where generated brand primitives were
owned by `src/project/brand.css` and `src/app/globals.css` owned only the
semantic/component map.

## Consequences

- `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` and `docs/DESIGN.md`
  are locked together by `config/ams-constitution.lock.json`.
- Silent edits to either authority must fail `pnpm verify:constitution-lock`.
- The actual code migration is EPIC-01; this ADR records the approved authority
  change and transition boundary.

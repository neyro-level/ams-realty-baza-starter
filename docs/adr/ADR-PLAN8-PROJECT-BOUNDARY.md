# ADR — Plan 8 project boundary

Status: `ACCEPTED`

## Context

Plan 8 requires reusable `src/core` and `packages/*` code to have no dependency on
`src/project` and no embedded project city, brand or domain literals. The
contracts package exported a starter-specific fixture containing those literals.

## Decision

- Project-aware public gateway, SEO, storage and owner-operation composition lives
  under `src/project`.
- `src/core` remains reusable and may be imported by project composition, never the
  reverse.
- The starter-specific `@ams/realtbase-contracts/fixtures` export is removed. The
  canonical project fixture remains `src/fixture/provider.ts`.
- The contracts package enters `2.0.0` draft evolution because removing an exported
  subpath is a breaking API change. P8-12 remains the only contract freeze gate.
- Architecture and Dependency Cruiser guards enforce the boundary. Project literals
  are read from the project-owned denylist; href literals remain report-only until
  the route cutover epic.

## Recovery

Revert the P8-02 commit and restore contracts lock version `1.0.0`.

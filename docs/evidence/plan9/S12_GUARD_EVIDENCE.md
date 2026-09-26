# S12 Guard Evidence

## Fail-closed guards

- Internal route literals in reusable `packages/ui` views are forbidden. Anchor,
  telephone, email and external URLs remain allowed; route ownership is passed
  through DTOs or explicit component inputs.
- The project literal denylist is generated at guard runtime from the
  project-owned brand/domain/city identity plus configured geo slugs, then scans
  both `src/core/**` and `packages/**`.
- Static `src/app/(site)` page folders and `staticRoutes` must match in both
  directions. Dynamic/catch-all folders are excluded from this static parity.
- Content Gate ownership scans all public app and Public Gateway files instead
  of a manually maintained file list.
- Broken href, project-literal, static-route and owner-boundary fixtures fail in
  the architecture self-test. Guard suppressions and mutable snapshots are not
  used.

## Five-profile acceptance

The deterministic owner matrix is stored in `S12_ACCEPTANCE_MATRIX.json` and
covers `singleGeo`, `multiGeo`, `newbuildFirst`, `secondaryFirst` and
`singleGeoThreeCities`.

- Every generated sitemap URL resolves as a page.
- Category-first routes fail with 404.
- Every emitted menu/switcher link resolves; SINGLE hides and MULTI exposes the
  geo switcher.
- Property, development and developer URLs stay identical across profiles.
- Runtime inventory delegates to the Public Gateway data port; synthetic
  `return 100` logic is forbidden.
- Payload jobs retain `enableConcurrencyControl=true`, explicit queue limits and
  mutually exclusive static/programmatic scheduling semantics.

## Verification

- `pnpm verify:merge-standard` — PASS.
- `pnpm verify:s12-guards` — PASS as part of the merge-standard chain.
- Architecture self-test, architecture guard and Dependency Cruiser — PASS.
- Lint — PASS with 19 pre-existing warnings and no errors.

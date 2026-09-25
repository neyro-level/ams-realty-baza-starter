# S8-24 — Clone tooling and client readiness evidence

Status: `DELIVERED / EVIDENCE`

## Scope

- Base: SourceCraft `main@671a3f1fcf6564eb57f509916528f5cc7b243a81`.
- One preset-driven `clone:prepare`; no competing clone command.
- Separate explicit `clone:activate-timeweb-storage` topology step.
- No production, release tag or GitHub mirror.

## Requirement mapping

| Requirement | Evidence |
|---|---|
| Presets | `MIXED`, `NEWBUILD_FIRST`, `SECONDARY_FIRST` validated by `scripts/clone-preset.mjs` |
| Geo readiness | explicit `SINGLE_GEO | MULTI_GEO`, primary geo and approved morphology for every geo |
| Identity and NAP | generated client identity plus required brand, phone, email, address and working hours |
| SEO/indexing | explicit `public | noindex`, preset-specific active surfaces and draft registry rows |
| Reserved routes | bootstrap reads the canonical reserved namespaces from `src/project/project.config.ts` |
| Brand/feed/Excel | all three readiness decisions are required before preparation |
| Fixture isolation | client runtime without Payload data returns empty/not-found; starter fixture fallback is forbidden |
| Core preservation | three-clone proof asserts zero diff in `src/core`, `packages`, migrations and `scripts/quality` |
| Idempotence | same-preset rerun is a no-op; a different preset fails closed |
| Provenance | `docs/CLONE_PROVENANCE.md` records source tag/SHA, preset SHA and removed starter-only groups |

## Proof matrix

`pnpm verify:client-clone-proof` creates three clean detached temporary clones:

1. `MIXED / SINGLE_GEO`;
2. `NEWBUILD_FIRST / MULTI_GEO`;
3. `SECONDARY_FIRST / MULTI_GEO`.

Each clone runs preparation, validates its generated bootstrap, checks project
profile/runtime fixture isolation and repeats preparation to prove idempotence.

## Local proof

- `pnpm verify:client-clone-proof` — PASS for all three presets.
- `pnpm verify:clone-prepare` — PASS, including fail-closed source-tag gate and
  no mutation on rejection.
- `pnpm verify:clone-readiness` — PASS for separate S3 activation, typecheck and
  idempotence.
- `pnpm verify:client-readiness --mode=fixture-client` — PASS.
- `pnpm verify:runtime-cutover` — PASS, 52 PageKey/profile cases.
- `pnpm verify:daily` — PASS.
- `pnpm quality:architecture` and `pnpm quality:guards` — PASS.
- `pnpm build` — PASS; Next.js 16.3.5 production build completed. Webpack
  reported a non-blocking warning summary without individual warning details.
- Graphify re-indexed 5,092 nodes / 8,876 edges; affected consumers of the
  project profile are covered by the daily routing, SEO, fixture and typecheck
  suites.

## Recovery

- Before merge: discard each temporary clone and revert the tooling branch.
- After merge: revert the P8-24 squash commit.
- A prepared clone with the wrong preset is not mutated in place; recreate it
  from the immutable `starter-v2.0.0` tag with the approved preset.

Delivery: SourceCraft PR `154`, accepted head
`3fbf8b11351a1ac16b85b87a635b41d53aac0acf`, RISKY Gate `240`, squash merge
`a6f6d0a7826022782172165a9fd601f407dcc2cd`.

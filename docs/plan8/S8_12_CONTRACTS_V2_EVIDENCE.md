# S8-12 — Contracts v2 evidence

Статус: `IMPLEMENTED_LOCAL`; delivery evidence заполняется после SourceCraft Gate.

Дата: 2026-09-24

Authority: Plan 8 v6 `APPROVED`, P8-12.

## Scope

- base presentation contract `2.0.0`;
- geo/developer/development/listing/SEO/breadcrumb DTO;
- category-aware property DTO and stable public identity;
- PageKey-derived hrefs at fixture/Public Gateway composition boundaries;
- one accepted ADR and updated feasibility;
- guarded base lock/freeze; journal lock unchanged.

## Local acceptance

| Proof | Result |
|---|---|
| Expected pre-lock `contracts:diff` | PASS: drift detected, command exited 1 as designed |
| Contract fixture verifier | PASS |
| All current TypeScript consumers | PASS |
| Guarded base lock/freeze | PASS: Base frozen `2.0.0`; journal remains draft `0.1.0` |
| Daily/architecture/lint | PASS: exact daily command set executed in two groups after wrapper timeout; 19 unchanged baseline lint warnings |
| RISKY dependency-runtime incl. build | PASS: product regression, topology, release artifact and Next.js production build |

## Boundary proof

- Contracts package has no Payload/Next/project imports.
- Runtime URL ownership remains `src/core/routing` plus project configuration.
- P8-13 owns new Public Gateway methods; P8-17 owns new views; P8-23A owns route
  cutover. None are activated by P8-12.
- Any red consumer proof before merge requires reverting the whole contract wave.

## Delivery

SourceCraft PR, exact-head run, merge SHA and main reconciliation are intentionally
left blank until the local RISKY proof succeeds and Git credentials are available.

## Execution note

The composite `verify:daily` wrapper reached its outer timeout while
`verify:clone-readiness` retried npm registry connections. No child process was
left running. The exact command set was immediately executed in two bounded
groups and every command returned exit `0`; clone-readiness itself passed after
the transient registry retries. The RISKY dependency-runtime additions were then
executed once and passed, including the optimized production build.

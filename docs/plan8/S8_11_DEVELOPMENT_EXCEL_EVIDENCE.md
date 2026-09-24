# P8-11 — development Excel import evidence

## Dependency preflight

- Exact package: `@excel.js/exceljs@0.15.0`; MIT; Node contract `^20.19.0 || >=22.12.0` includes project Node 24.
- Primary evidence: [npm package](https://www.npmjs.com/package/@excel.js/exceljs), [package manifest](https://github.com/excel-js/exceljs/blob/master/package.json) and [MIT license](https://github.com/excel-js/exceljs/blob/master/LICENSE). This maintained fork was selected instead of legacy `exceljs@4.4.0`, whose upstream has unresolved dependency-security issues.
- `pnpm audit --prod --audit-level high`: PASS. The resolved tree has no high/critical findings; reported low/moderate findings belong to pre-existing Payload/drizzle/DOMPurify paths, not the Excel dependency path.
- Parser limits: `.xlsx` only, 10 MiB archive / 50 MiB expanded maximum, ZIP64/encrypted/multi-disk and suspicious compression rejected, 5,000 rows per sheet, formulas rejected, exact sheet order/headers and enums validated before apply.

## Acceptance mapping

| Plan requirement | Evidence |
| --- | --- |
| sheets `Застройщики → ЖК → Цены → Медиа → Тексты` | exact ordered template and parser contract in `development-excel.ts` |
| dry-run / apply / template | package commands plus unit and Payload integration verifier |
| per-sheet validation and provenance timestamps | required columns, enum/date/number validation, source/checkedAt on nested rows |
| idempotent identity | developer slug plus `(excel source, externalId)` for developments; repeated integration dry-run is zero-diff |
| collisions / unknown developer / published slug mutation | fail-closed issue codes and collision count; no apply when validation has errors |
| import-run evidence without YRL regression | `sourceKind`, mutually exclusive `feedSource`/`excelSourceKey` DB guard, workbook hash, counts/evidence JSON and `lastImportRun` relations |
| template opens with enum guidance | generated workbook re-opened by the selected library; validation lists asserted |
| recovery | importer can be disabled; applied rows remain attributable to import run/source/hash and can be re-applied idempotently |

## Verification

- scoped migration `down → absence proof → up`: PASS before dependent imports on local PostgreSQL 18 test database; after non-empty apply the rollback guard rejects provenance loss and leaves schema intact;
- `pnpm verify:development-excel`: PASS;
- `pnpm verify:development-excel:integration`: PASS, including dry-run/apply/repeat-zero-diff and non-empty import-run provenance;
- template CLI plus import CLI dry-run: PASS;
- `pnpm verify:schema`, `pnpm typecheck`, `pnpm lint`: PASS (lint retains repository baseline warnings only).

Production, tag and mirror are outside P8-11.

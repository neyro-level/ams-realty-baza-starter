# EPIC-17 derived property fields

- Canonical calculator: `calculatePropertyDerivedFields` in ingest, used by feed write data.
- Collection hook applies the same function only on non-ingest writes and always writes `null` when price/area are missing or non-positive.
- Banker's rounding for half cases (`2.5 → 2`, `3.5 → 4`).
- Proofs: `pnpm verify:feed-ingest`, `pnpm verify:manual-ownership` (feed create/update, price/area removed, unchanged hash skip, rounding).

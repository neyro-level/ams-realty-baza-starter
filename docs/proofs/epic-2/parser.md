# EPIC 2 proofs

Checked: 2026-09-18  
SHA: recorded with `epic/2-feed-parser` commits.

## Parser and fetch

| Case | Result |
| --- | --- |
| Normal / large YRL stream (180 offers, 127-byte chunks) | PASS `verify:feed-parser` |
| Streaming SAX (`saxes` 6.0.0), no regex production parser | PASS `docs/adr/ADR-SAX-FEED-PARSER.md` |
| DTD / `<!ENTITY>` | critical structural anomaly, not success |
| XML `market` on offer | ignored; market stays feedSource-owned |
| 304 | `status = unchanged` |
| Streaming SHA-256 of HTTP 200 body | PASS |
| Safe Outbound allowlist + TEST-NET resolver in fixture | PASS |
| Shared `calculatePropertyDerivedFields` | ingest write + Properties `beforeChange` |

Commands: `pnpm verify:feed-parser`, `pnpm verify:feed-ingest`, `pnpm verify:feed-lifecycle`, `pnpm quality:guards`.

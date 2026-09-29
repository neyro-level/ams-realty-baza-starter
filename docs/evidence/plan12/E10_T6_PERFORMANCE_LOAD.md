# EPIC-10 T6 performance/load record

Status: `LIMITED / NO PERFORMANCE PASS`

This record applies OD12-02. The owner waived a new isolated PostgreSQL load run for the reusable starter. It does not convert static protection or historical evidence into a current performance claim.

| Required record | Result |
| --- | --- |
| Catalog clean path p95 | `64.793 ms` in historical Plan 10 local PostgreSQL evidence; not re-measured on the Plan 12 candidate |
| Property detail p95 | `NOT_MEASURED` |
| 1000 unique filter-query protection test | `PASS` for the in-runtime bounded cache; no PostgreSQL load was generated |
| Memory behavior | `STATIC BOUNDS ONLY`: 64 entries, 20 s TTL, 64 KiB per entry, 2 MiB total; no database-load RSS claim |
| DB query behavior | `NOT_MEASURED` |
| LCP / CLS | `NOT_MEASURED`; no PASS claim |

Retained exact-candidate proof: `verify:filtered-catalog-cache` validates 1000 normalized filter keys, tracking exclusion, finite TTL/count/bytes, deduplication and eviction. Client-specific staging performance remains a later obligation against its own data volume and topology.

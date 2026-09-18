# EPIC 4 — catalog facets SQL

Checked: 2026-09-18

Facets use `aggregatePublicCatalogFacets` in `src/core/data-access/public/sql/index.ts`.

- Same publication predicate as listing: `status = active`, `published_at IS NOT NULL`, `content_purged_at IS NULL`.
- Matching filters are parameterized; no string-concatenated SQL.
- Covering indexes: `properties_public_catalog_idx`, `properties_public_sitemap_idx` (migration `20260918_101800`).
- Persistent facet-cache collection is not introduced.

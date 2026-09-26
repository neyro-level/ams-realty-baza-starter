# S13 Clone preset v2 evidence

- Plan: `AMS-REALTY-BAZA-STARTER-V2-1-CLONE-READINESS-9` v6.
- Preset schema: `schemaVersion: 2`; schema v1 fails with migration guidance.
- Owner inputs: identity, geo publication/status, NAP, client readiness, indexing,
  brand assets, feed, development Excel and SEO templates.
- SEO templates: inline `seoTemplates` or explicit JSON `seoTemplateFile`.
- Generated owners: SiteProfile, client readiness, project literal denylist,
  SEO template inputs and `CLIENT_BOOTSTRAP.json`.
- Safety: secret-shaped keys are rejected; `clone:prepare` does not add or
  configure `@payloadcms/storage-s3`.

## Clean-checkout matrix

Each profile ran in an isolated Git worktree and passed `clone:prepare`,
`verify:clone-bootstrap`, complete `verify:daily`, S12 guards/matrix,
protected-path before/after comparison and a repeated no-op preparation.

| Profile | Preset | Geo mode | Result |
| --- | --- | --- | --- |
| single-geo-three-cities | MIXED | SINGLE_GEO, 3 configured / 1 routable | PASS |
| secondary-only | SECONDARY_FIRST | SINGLE_GEO | PASS |
| newbuild-only | NEWBUILD_FIRST | SINGLE_GEO | PASS |
| multi-geo | MIXED | MULTI_GEO | PASS |

Protected paths remained unchanged by clone preparation: `src/core/**`,
`packages/**`, `migrations/**`, `scripts/quality/**`.

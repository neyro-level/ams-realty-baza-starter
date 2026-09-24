# P8-06 — canonical geo hierarchy evidence

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Implemented contract

| Requirement | Evidence |
|---|---|
| Payload geo ownership | `regions`, `cities` and `districts` are registered in `payload.config.ts`; Payload/PostgreSQL remain the only schema owners |
| hierarchy | city requires region; district requires city; database foreign keys use `ON DELETE restrict` |
| exact geo fields | region short name/sort; city type, preposition, coordinates, morphology approval/sort; district type, parent, synonyms, preposition, morphology approval/sort |
| morphology | every entity requires nominative, genitive and prepositional forms; whitespace is normalized before persistence |
| publication | `draft`, `published`, `archived`; first publish receives `publishedAt`; database rejects published rows without it |
| agglomeration | optional city-to-city parent, restricted to the same region; pure, Payload and PostgreSQL cycle guards reject self/cycles |
| root uniqueness | region and city slugs are individually unique and share one collision namespace; a transaction advisory lock closes concurrent cross-table races |
| route collisions | platform, catalog, developer, project-static and configured roots cannot become region/city slugs |
| district uniqueness | `(city, slug)` is unique; configured and current project facet slugs cannot become district slugs |
| published slug mutation | Payload hook and PostgreSQL trigger reject rename after publication; no rename operation exists before redirect lifecycle |
| fixture | synthetic `primorsk` and `zarechnyy` cities with three districts; `severnyy` is a parentless microdistrict using preposition `на`; nearby city points to primary agglomeration city |
| raw legacy geo | existing property text `region/locality/district` fields are unchanged; relation expansion belongs to P8-07 |
| public surface | raw geo collections remain private; P8-13 owns bounded Public Gateway reads and P8-23A owns route cutover |

## Verification matrix

- `verify:geo-hierarchy`: canonical slugs, morphology, reserved namespaces,
  publication transition, immutable published slug, valid graph, cycle and
  cross-region rejection, and the two-city fixture.
- migration proof on an isolated non-empty PostgreSQL 18 database: additive up,
  hierarchy/collision/cycle/mutation constraints, down, unrelated sentinel
  preservation, and second up.
- full migration chain from a clean schema with `PAYLOAD_DB_PUSH=false`.
- Payload integration: Unicode fixture creation, private raw access, root and
  district collisions, agglomeration cycle/cross-region rejection and immutable
  published slug.
- `verify:schema`: tables, unique/index contract and all seven geo triggers.

## Recovery

Before P8-07 dependent relations or non-fixture geo data exist, run the tested
down migration. After dependent data exists, do not drop the hierarchy; disable
new consumers and forward-fix while preserving identifiers and relations.

No production, tag, GitHub mirror or public route cutover is part of P8-06.

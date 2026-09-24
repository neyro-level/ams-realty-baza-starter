# P8-09 — unified developments and developers evidence

## Requirement mapping

| Plan 8 section 5A requirement | Implementation evidence | Verification evidence |
|---|---|---|
| developer identity, aliases, optional company/media fields, source freshness and publication | private `developers` Payload collection with canonical immutable slug, aliases, legal name, logo/site/description, source, checkedAt and publication fields | generated types, Payload create/access integration |
| unified development common model | one `developments` collection owns kind, geo/district/developer, address/coordinates, class/completion/deadline, sales/availability, tier/source, prices, lots, media rights, descriptions, FAQ, external identities and publication | clean database migration and Payload integration |
| strict kind-specific fields | `residential_complex` owns layouts/progress; `cottage_village` owns communications/area/plots/village class | pure negative fixtures, Payload rejection and database check constraint |
| semantic slug and collision suffix | persistence stores semantic slug without duplicated `zhk-`/`kp-`; URL helper applies the kind prefix; city suffix is added only for a proven collision | exact prefix, invalid-prefix and collision/no-collision tests |
| optional property relation | additive nullable `properties.development_id` relation with `ON DELETE SET NULL` | Payload relation round-trip and schema verification |
| prepared novostroyki module | project state supports `prepared`; schema markers are allowed while public route/navigation/sitemap markers remain forbidden | governance negative fixture and anonymous Local API denial for published prepared rows |
| additive recovery | down migration removes only P8-09 tables/relations and preserves unrelated sentinel data | isolated up/down/up non-empty migration proof |

No public Gateway reader, route, navigation entry, sitemap record, production,
tag or GitHub mirror is activated by P8-09.

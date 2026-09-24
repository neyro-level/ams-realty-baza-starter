# Geo-Catalog Platform Contract

Status: `APPROVED TARGET / NOT RUNTIME LIVE`

Owner plan: `AMS-REALTY-BAZA-STARTER-GEO-CATALOG-8 v6`

This document is the reusable contract for geo/catalog URL, page resolution,
profile status and lifecycle semantics. It does not claim that target routes,
collections or UI are already implemented. Current runtime truth remains the
code and migrations until each Plan 8 epic lands; public cutover belongs only
to P8-23A.

## 1. Boundary and invariants

- Payload owns schema, migrations, auth and Admin. A second backend, ORM or auth
  contour is forbidden.
- Public reads follow Public Gateway → explicit access/select → DTO → UI.
- Project profile/data may call core pure functions; app composition may use
  project + core + UI; reusable core/packages may not import project.
- Project-owned static routes, brand, domain and geo literals are injected
  explicitly. Reusable core/packages do not contain client-specific literals.
- Schema evolution is additive until accepted cutover evidence permits separate
  cleanup. Raw legacy geo/source data is retained.
- Existing runtime and rollback path remain available until P8-23A acceptance.
- Starter topology remains local PostgreSQL + `MEDIA_DIR`; clone topology is a
  separate project decision.
- Production indexing, release, mirror and tag creation require separate owner
  actions.

## 2. Vocabulary

```text
Status = ACTIVE | NOINDEX_AUTO | PREPARED_OFF | OUT
GeoMode = SINGLE_GEO | MULTI_GEO
Market = newbuild | secondary
DevelopmentKind = residential_complex | cottage_village
```

Canonical PageKey discriminants:

```text
home
geoHub
categoryRoot
categoryGeo
categoryGeoDistrict
categoryGeoFacet
geoDevelopers
property
development
developerRoot
developer
static
```

`parseUrl` is syntax-only and performs no data access. `buildUrl` is the only
canonical URL builder for PageKey and returns lowercase paths with the canonical
trailing slash where applicable.

## 3. Canonical URL grammar

| PageKey | Canonical target |
|---|---|
| `home` | `/` |
| `geoHub` | `/{geo}/` |
| `categoryGeo` | `/{geo}/{category}/` |
| `categoryGeoDistrict` / `categoryGeoFacet` | `/{geo}/{category}/{sub}/` |
| `geoDevelopers` | `/{geo}/zastroyshchiki/` |
| `categoryRoot` | `/{category}/` |
| `property` | `/{category}/{semantic}-{publicUrlId}/` |
| `development` / residential complex | `/novostroyki/zhk-{slug}/` |
| `development` / cottage village | `/kottedzhnye-poselki/kp-{slug}/` |
| `developerRoot` | `/zastroyshchiki/` |
| `developer` | `/zastroyshchiki/{slug}/` |
| `static` | explicit project-profile declaration |

Grammar invariants:

- at most three path segments;
- lowercase canonical form;
- property URL is globally stable and contains no geo;
- district parent is data hierarchy, not an additional URL segment;
- one semantic entity maps to one final canonical URL;
- framework/platform roots, catalog surfaces and explicit static routes are
  reserved and cannot be reused as geo or entity slugs.

Property category mapping:

| Domain category | URL surface |
|---|---|
| `apartment` | `kvartiry` |
| `house` | `doma` |
| `land` | `uchastki` |
| `commercial` | `kommercheskaya-nedvizhimost` |
| `room` | `komnaty` |
| `garage` | `garazhi` |

Transliteration baseline: `й→y`, `ё→e`, `ж→zh`, `х→kh`, `ц→ts`,
`ч→ch`, `ш→sh`, `щ→shch`, `ы→y`; soft and hard signs are removed.

## 4. Deterministic resolution order

1. `/{x}/`: explicit static/platform reserved → category root → published geo
   → not found.
2. `/{geo}/{x}/`: enabled category → geo developers when enabled → not found.
3. `/{category}/{x}/`: entity grammar `zhk-*`, `kp-*` or
   `*-{publicUrlId}` → not found.
4. `/{geo}/{category}/{x}/`: district of this geo → facet whitelist → not
   found.
5. `/zastroyshchiki/{x}/`: developer → not found.
6. Four or more segments → not found.

Resolution returns a typed result: page, direct redirect, notFound or gone.
Redirect results always point to the final canonical URL; chains and loops are
invalid.

## 5. Profile and availability

The future SiteProfile is the explicit input to reusable core and contains:

- `geoMode`, `primaryGeo`;
- `categoryStatus`, `marketCapability`;
- per-geo `geoCategoryStatus` and `marketStatus`;
- `defaultNearbyGeoStatus`;
- root/per-geo `developersSurface`;
- per-surface `facetWhitelist`;
- SEO tier thresholds, inventory minima and unmeasured policy;
- Content Gate thresholds;
- entity prefixes `zhk-` and `kp-`.

No reusable module discovers project profile by importing `src/project/**`.
The application layer passes the validated profile explicitly.

Status semantics:

| Status | Route | Robots/discovery |
|---|---|---|
| `ACTIVE` | eligible for page resolution | final indexability is decided by Content Gate |
| `NOINDEX_AUTO` | 200 when otherwise valid | `noindex,follow`, self-canonical, absent from sitemap/menu |
| `PREPARED_OFF` | 404 | absent from sitemap/menu/interlinks |
| `OUT` | 404 | absent from sitemap/menu/interlinks |

Availability and indexability are separate decisions. A valid but weak ACTIVE
page returns 200 with `noindex,follow`; Content Gate must not turn weak content
into a false 404. Owner override is audited and cannot bypass lifecycle,
`PREPARED_OFF` or `OUT`.

## 6. Geo-mode rules

| Surface | `SINGLE_GEO` | `MULTI_GEO` |
|---|---|---|
| primary geo hub | registry + Gate | registry + Gate |
| other geo hub | status-driven | status-driven |
| category/developer roots | 200 `noindex,follow` | registry-driven |
| GeoSwitcher | hidden | visible |

Entity availability may outlive a disabled listing. If an entity is reachable
but its geo hub/listing is not, breadcrumbs render the geo as text rather than a
link to a 404. Nearby aggregation is agglomeration-only and never pollutes one
city's inventory count with another city's records.

## 7. SEO Registry and Content Gate

SEO Registry rows bind one PageKey/canonical URL to measured or explicitly
unmeasured evidence, source date, tier, inventory threshold and metadata
templates. Allowed source vocabulary:

```text
wordstat | broad39 | webmaster | fallback_no_data
```

An empty metric is not zero. Synthetic fixture values are labelled synthetic.
Registry validation rejects duplicate intent, URL or canonical ownership and
any URL that differs from `buildUrl(PageKey)`. Unapproved morphology cannot
produce an indexable page.

Content Gate is the single indexability decision. It consumes profile status,
registry evidence, inventory/content quality and lifecycle. Newbuild lots are
always `noindex,follow` and absent from sitemap; listing, secondary property,
development and developer thresholds are profile-owned.

## 8. Lifecycle and HTTP semantics

| Entity state | Canonical response |
|---|---|
| missing | 404 |
| active | 200, Gate decides robots |
| archived | 200 `noindex` |
| purged with approved replacement | one direct 301 |
| purged without replacement | 410 |
| canonical slash normalization | one 308 |
| legacy/canonical move | one direct 301 to final URL |

Canonical 301/410 transport must be proven against installed Next.js 16,
including RSC/client navigation and bounded performance, before route cutover.
Until that proof and P8-23A, the current
`/http/property-lifecycle/[slug]` boundary remains the rollback-safe live
owner.

## 9. Discovery, navigation and cache

- Sitemap groups: static, geo, catalog, districts, facets, developments,
  developers and properties; each shard is at most 50,000 URLs.
- Only published, canonical, Gate-passing indexable pages enter sitemap.
- Sitemap `lastmod` comes from relevant entity/registry updates, never deploy
  time.
- Menu, breadcrumbs and interlinks derive from profile + PageKey + Gate +
  project static routes and never target 404 or redirects.
- Query URLs are not linked when a canonical path owner exists.
- Cache identity is bounded by geo, geo+surface, district, development,
  developer, property public ID and registry targets.
- Runtime invalidation continues through the authenticated HTTP facade.
- IndexNow is event-driven for publish, canonical move, archive and gone; key
  material is runtime-only and never enters payloads or logs.

## 10. Current-to-target transition

```text
current routes/data
  -> pure profile and grammar
  -> additive schema + normalized refs
  -> frozen DTO/Public Gateway
  -> resolver/Gate/UI/discovery/lifecycle evidence
  -> P8-23A atomic public cutover
  -> P8-23B contract cleanup
```

Before P8-23A:

- `/nedvizhimost`, `/obekty/[slug]`, static/legal routes, Payload Admin/API
  and the current lifecycle boundary retain current ownership;
- target generators may exist only unwired;
- no target document is evidence that a public route exists.

P8-23A must preserve Payload Admin/API/security and provide the complete
status/robots/canonical/breadcrumb/performance/UI proof. P8-23B may remove only
runtime proven replaced by that accepted cutover; it does not drop retained raw
legacy data.

## 11. Change control

This contract is implemented by Plan 8 epics. A change to PageKey vocabulary,
URL collision precedence, status semantics, lifecycle codes or dependency
direction requires an explicit plan finding/revision before implementation.
An ADR is created only for a genuinely hard-to-reverse deviation that cannot be
stated unambiguously in Architecture or Clone Onboarding.

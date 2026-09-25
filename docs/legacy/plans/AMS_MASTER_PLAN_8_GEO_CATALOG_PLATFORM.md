# AMS MASTER PLAN №8 — GEO-CATALOG PLATFORM

> Archive status: `EXECUTION_COMPLETE / EVIDENCE`. Итоговый отчёт:
> `../../plan8/S8_25_FINAL_EXECUTION_REPORT.md`. Не использовать как READY-граф.

```text
Plan ID: AMS-REALTY-BAZA-STARTER-GEO-CATALOG-8
Version: v6
Status: APPROVED
Phase: APPROVAL_HANDOFF
Approved by: owner
Approved at: 2026-09-24T12:35:41+03:00
Repository: ams-realty-baza-starter
Repository mode: SOURCECRAFT_PRIMARY_GITHUB_MIRROR
Delivery profile: COMMERCIAL
Project profile: AMS_PROFILE=REALTY_BASE / BUILD
Target release tag: starter-v2.0.0 (owner decision recorded; creation remains explicit)
Baseline: local origin/main@48978f53dd02de6f148e9934140749ac1afa55dc
Baseline date: 2026-09-24
```

> Этот документ создан из ТЗ владельца «AMS Realty Baza Starter, Plan 8
> (Geo-Catalog Platform)». Это canonical assembly-версия, а не
> утверждённый execution source. Импорт в Task Manager, реализация, merge,
> release и production запрещены до финального аудита и явной фразы владельца
> «План утверждён».

## 0. Статус основы и границы

Plan №7 v2 исполнен и остаётся историческим evidence. Plan №8 не переписывает
его и не объявляет его невыполненным. После approval Plan №8 станет новым
execution source, а Plan №7 сохранит статус `EXECUTION_COMPLETE / EVIDENCE`.

Фактический starter на baseline:

- Next.js `16.3.5`, React `19.2.8`, Payload `3.90.1`, pnpm `11.5.1`;
- Payload + PostgreSQL — единственный backend/schema/auth contour;
- SourceCraft — primary, GitHub — one-way mirror;
- public runtime: `/`, `/nedvizhimost`, `/obekty/[slug]` и статические страницы;
- отдельная HTTP-граница lifecycle: `/http/property-lifecycle/[slug]`;
- UI изолирован в `packages/ui`, contracts — в `packages/contracts`;
- starter demo использует local PostgreSQL + `MEDIA_DIR` и остаётся `noindex`;
- локальный Beads graph закрыт: 73 closed, 0 open, 0 in progress, 0 blocked.

Production, клиентская инфраструктура, создание release tag и GitHub mirror не
входят в implementation authority этого плана.

## 1. Primary goal

Преобразовать текущий REALTY_BASE starter в переносимую geo-first catalog
platform, где один и тот же platform core поддерживает single-geo и multi-geo
проекты через профиль, данные и SEO registry — без правок reusable core для
каждого нового города или клиента.

### 1.1 Major outcomes

1. Каноническая URL-грамматика и чистый resolver для geo/catalog/entity routes.
2. Нормализованная geo/taxonomy model в Payload с безопасным expand/cutover.
3. SiteProfile и presets без project literals внутри reusable core/packages.
4. Developments/developers и подготовленный модуль новостроек.
5. Public Gateway и frozen DTO для всех новых public surfaces.
6. SEO Registry, Content Gate, sitemap/robots/IndexNow с fail-closed индексацией.
7. Новые catalog/property/development/developer views в существующей Design System.
8. Clone workflow, позволяющий включить второй город без изменения core/packages.
9. Проверяемый cutover с сохранением rollback и без production-действий.

### 1.2 Non-goals

- второй ORM/backend/auth/Admin;
- личный кабинет, Redis, broker, Elasticsearch, PostGIS, Kubernetes;
- новый design system, primitive foundation или icon ecosystem;
- wildcard media hosts;
- автоматическое включение production indexing;
- release, rollout, production migration или создание tag без отдельной команды;
- переписывание действующих import, lead outbox и jobs contracts вне нужного scope.

## 2. Hard contract

1. Payload остаётся владельцем schema, migrations, auth и Admin.
2. Public data: Public Gateway → explicit select/access → DTO → UI.
3. User/Public Local API не использует `overrideAccess: true`; System/Ingest
   operations остаются именованными и allowlisted.
4. Schema меняется только additive migration до доказанного contract cleanup.
5. Старый runtime остаётся доступным до проверенного cutover.
6. URL schema меняется с explicit redirect/lifecycle plan без chains и loops.
7. Design values живут только в `src/app/globals.css`; UI применяет
   `REUSE → VARIANT → CREATE`.
8. Secrets и PII не попадают в Git, plan, logs, analytics или browser bundle.
9. Starter сохраняет local PostgreSQL + `MEDIA_DIR`; client clone topology
   определяется отдельно.
10. Production и release отделены от implementation.

## 3. Delivery contract — draft correction

### 3.1 Stream model

- Один независимо принимаемый epic = отдельные branch/worktree/PR.
- Schema, shared contracts, resolver, routing cutover и release tooling сливаются
  последовательно; параллельность разрешена только после contract freeze.
- Каждый epic получает `PR_ONLY` или `MERGE_AFTER_GATE` при inventory/import.
- Рекомендация Архитектора: implementation epics = `MERGE_AFTER_GATE`, финальный
  freeze/tag остаётся owner gate и не является Developer action.

### 3.2 Checks

- Branch push и PR не запускают CI.
- Перед merge выполняется один exact-head SourceCraft Gate:
  `STANDARD` либо один risk-specific `RISKY`, а не оба как независимые gates.
- UI checks входят в локальное evidence и соответствующий exact-head gate, но не
  образуют второй платный gate.
- После merge одинаковые suites автоматически не повторяются. Проверка на main
  выполняется только при изменившемся SHA/evidence, на wave checkpoint или в
  финальном proof.
- Полный `pnpm verify` — финальный/risk-driven proof, не проверка каждого PR.

### 3.3 Stop conditions

Работа останавливается в пределах конкретной task, если:

- baseline, version или frozen contract изменились;
- требование конфликтует с Core 5.5 или действующим guard;
- нужен обход security/access/data invariant;
- migration нельзя доказать на clean и непустой fixture DB;
- требуется secret, irreversible external action, production или owner decision.

Локально заблокированная task не останавливает весь graph, если существует
независимая ready work.

## 4. Platform contract

### 4.1 URL grammar

```text
/                                        HOME
/{geo}/                                  GEO_HUB
/{geo}/{category}/                       CATEGORY_GEO
/{geo}/{category}/{sub}/                 district или facet whitelist
/{geo}/zastroyshchiki/                   GEO_DEVELOPERS
/{category}/                             CATEGORY_ROOT
/{category}/{semantic}-{publicUrlId}/    PROPERTY
/novostroyki/zhk-{slug}/                 DEVELOPMENT residential_complex
/kottedzhnye-poselki/kp-{slug}/          DEVELOPMENT cottage_village
/zastroyshchiki/                         DEVELOPER_ROOT
/zastroyshchiki/{slug}/                  DEVELOPER
+ explicit static routes from project profile
```

Инварианты: не более трёх сегментов, lowercase, canonical trailing slash,
property URL глобален и не содержит geo, parent района не входит в URL.

### 4.2 Resolution order

1. `/{x}/`: explicit/static/platform reserved → category root → published geo → 404.
2. `/{geo}/{x}/`: enabled category → geo developers when enabled → 404.
3. `/{category}/{x}/`: entity grammar (`zhk-*`, `kp-*`, `*-{digits}`) → 404.
4. `/{geo}/{category}/{x}/`: district of geo → facet whitelist → 404.
5. `/zastroyshchiki/{x}/`: developer → 404.
6. Четыре и более сегмента → 404.
7. Canonical slash normalization → один 308; legacy/canonical move → один 301
   непосредственно на финальный URL.

Exact Next.js 16 behavior для catch-all, Route Handler, metadata, redirects и
trailing slash должен быть повторно проверен по установленной документации до
freeze routing contract.

### 4.3 Status model

```text
Status = ACTIVE | NOINDEX_AUTO | PREPARED_OFF | OUT
categoryStatus[category]
marketCapability[market]
geoCategoryStatus[geo][category]
marketStatus[geo][market]
```

- `PREPARED_OFF` и `OUT`: public route 404, отсутствуют в sitemap/menu/interlinks.
- `NOINDEX_AUTO`: 200 `noindex,follow`, self-canonical, вне sitemap/menu.
- entity availability определяется category/market capability + lifecycle;
- secondary property индексируется по Gate;
- newbuild lot всегда `noindex,follow` и вне sitemap;
- development/developer индексируются только по Gate;
- если entity существует, но geo hub/listing не активен, entity может вернуть
  200, а geo в breadcrumbs не должен ссылаться на 404.

### 4.4 Geo modes

| Surface | SINGLE_GEO | MULTI_GEO |
|---|---|---|
| `/{primaryGeo}/` | registry + Gate | registry + Gate |
| `/{otherGeo}/` | status-driven | status-driven |
| `/{category}/`, `/zastroyshchiki/` | 200 noindex,follow | registry-driven |
| GeoSwitcher | hidden | visible |

## 5. MASTER PLAN MAP — v1

### 5.0 Domain vocabulary correction

URL surface и тип объекта не являются одним enum:

```text
CatalogSurfaceSlug
  = kvartiry | doma | uchastki | kommercheskaya-nedvizhimost
  | komnaty | garazhi | arenda | novostroyki | kottedzhnye-poselki

PropertyCategory
  = apartment | house | land | commercial | room | garage

Market
  = secondary | newbuild

DealType
  = sale | rent
```

`arenda`, `novostroyki` и `kottedzhnye-poselki` — catalog surfaces с
детерминированным query/domain mapping, а не дополнительные property categories.
`categoryStatus`, `geoCategoryStatus` и `facetWhitelist` используют
`CatalogSurfaceSlug`. Feed mapping и persisted property data используют
`PropertyCategory + Market + DealType`. Один canonical mapping между слоями
запрещает двусмысленные URL и фильтры.

### Wave A — baseline and contracts

#### P8-00 — Baseline and impact inventory (`STANDARD`)

Сначала выполнить clean dependency reconciliation через lockfile: package и
lock сейчас требуют Payload `3.90.1`, тогда как существующий соседний install
показывает `3.89.0`; stale `node_modules` не является источником версии.
Остановиться, если `pnpm install --frozen-lockfile` не даёт exact manifest/lock
versions. Затем записать exact base SHA/versions; инвентаризировать routes, views, Payload
collections/globals, quality scripts и verify commands. Найти все связи legacy
catalog/property URLs, static routes, indexed filters, text geo fields,
lifecycle boundary, sitemap and cache targets. Результат:
`docs/plan8/S8_00_INVENTORY.md` с `KEEP | ADAPT | REPLACE | REMOVE_LATER`.

`docs/plan8/PROGRESS.md` не создаётся как второй task store. До approval
execution state принадлежит плану; после import — Beads/ledger. Если проекту
нужен durable delivery state, используется минимальный pointer/state document,
который не дублирует task requirements.

#### P8-01 — Canon adoption and platform contract (`STANDARD`)

Plan №8 уже создаётся Архитектором, поэтому implementation task не «создаёт
собственный plan». После approval task обновляет docs map, Product Structure,
Project/Architecture и фиксирует target contract. Plan №7 помечается
`EXECUTION_COMPLETE / EVIDENCE`, а не `SUPERSEDED`.

Вместо десяти заранее созданных ADR:

- каноническая URL/status/profile модель живёт в одном
  `docs/platform/GEO_CATALOG_CONTRACT.md` и профильных SoT;
- ADR создаётся только для действительно труднообратимого deviation;
- предполагаемые кандидаты: unified development entity и upstream sync, если
  они не помещаются однозначно в Architecture/Clone Onboarding.

#### P8-02 — Platform/project boundary and guards (`STANDARD`)

Не создавать пустые директории. Модуль появляется вместе с первым реальным
contract/code. Dependency direction:

```text
project profile/data → core pure functions
app composition → project + core + UI
core/packages -X→ project
```

Profile передаётся в core явно; `core/profile/getSiteProfile()` не импортирует
`src/project/**`. Guards реализуются в существующем architecture guard и
Dependency Cruiser/Biome contour. ESLint не добавляется только ради одного rule.
`no-literal-hrefs` начинается в report mode и переходит в enforce после cutover.

### Wave B — profile, grammar and geo data

#### P8-03 — SiteProfile, presets and fixtures (`STANDARD`, after P8-02)

Добавить validated `SiteProfile`, statuses, catalog-surface/market matrices, SEO
tiers, Gate thresholds, entity prefixes, presets `MIXED | NEWBUILD_FIRST |
SECONDARY_FIRST` и четыре fixture profiles. Starter demo = `MIXED + SINGLE_GEO`.
Profile invariants запрещают active geo surface при inactive platform surface.
`NOINDEX_AUTO` является configured mode: effective route существует только при
минимальном inventory, иначе 404. «Geo hub always 200» означает 200 для
published/allowed geo; `OUT` и unpublished geo остаются 404.

#### P8-04 — URL grammar (`STANDARD`, after P8-03)

Pure `PageKey`, `buildUrl`, `parseUrl`, reserved namespace and transliteration.
Round-trip/property-based tests проверяют lowercase, trailing slash, all PageKey
variants, collisions and four-or-more segment rejection.

#### P8-05 — Site settings / NAP (`RISKY schema-data`, after P8-02)

Payload Global `site-settings`, migration, public `NapDTO`, explicit access and
fixture data. Existing components switch only at cutover.

#### P8-06 — Regions, cities, districts (`RISKY schema-data`, after P8-04)

Payload collections with morphology, publication, agglomeration and hierarchy;
unique/collision/cycle guards; immutable published slugs. Rename operation is
not enabled until redirect lifecycle exists. Fixture: two cities and districts.

#### P8-07 — Property geo relations and backfill (`RISKY schema-data`, after P8-06)

Текущая schema уже содержит text `region/locality/district`, поэтому relation с
теми же именами добавить нельзя. Expand добавляет `regionRef`, `cityRef`,
`districtRef` и сохраняет текущие text fields как raw legacy source. Backfill
идемпотентен, scoped и сообщает ambiguous/unrecognized values без выдуманной
идентичности. После cutover raw значения могут быть переименованы в
`regionRaw/localityRaw/districtRaw`; relation names не меняются без отдельного
contract migration.

#### P8-08 — Taxonomy and publicUrlId (`RISKY schema-data`, after P8-07)

Текущая schema уже содержит `market`, `dealType`, базовые `category`, apartment
areas/floors и text geo. Epic расширяет category options `room/garage`, добавляет
category-specific attributes и не дублирует существующие поля. `publicUrlId` —
PostgreSQL-backed unique immutable identity. Migration создаёт sequence,
unique/not-null constraint и database default; Payload integration spike на
clean/non-empty DB обязан доказать, что insert не отправляет явный `null`, а при
необходимости использует один allowlisted System Gateway method для atomic
`nextval`. Feed property сохраняет id по `(feedSource, externalId)`, manual
property — по immutable Payload row identity. Текущий `slug` сохраняется как
legacy lookup/redirect source до post-cutover cleanup; canonical semantic URL
строится из factual attributes + `publicUrlId` и не содержит цену.

#### P8-09 — Developments and developers (`RISKY schema-data`, after P8-06)

Add developers/developments and optional property relation. Preserve source,
checkedAt and media rights metadata. Unified `developments.kind` строго разделяет
`residential_complex` и `cottage_village`; invalid cross-kind field combinations
fail validation. Current module guard accepts only enabled/disabled, therefore
`prepared` first becomes an explicit third governance state with negative
fixtures. Prepared schema does not activate public routes, sitemap or navigation.

### Wave C — ingest and contracts

#### P8-10 — Feed mapping, geo normalization and media mirror (`RISKY ingest-jobs`, after P8-06/P8-07/P8-08)

Explicit YRL taxonomy mapping; unknown types do not publish. District lookup is
city-scoped. Media mirror uses existing storage adapter and Safe Outbound Client,
bounded size/concurrency/retries and exact host allowlist. Existing SAX safety,
source isolation, ownership and deactivation invariants remain.

#### P8-11 — Development Excel import (`RISKY ingest-jobs`, after P8-09)

Dry-run/apply/template commands, per-sheet validation, idempotent slug identity,
collision report and import-run evidence. Current `import-runs.feedSource` is
required, so first expand import provenance to `sourceKind = yrl-feed |
excel-developments`, nullable kind-specific source reference and invariant that
exactly one compatible source identity is present. Existing YRL jobs retain
their behavior. Excel library/dependency, license, security posture and exact
version require preflight before implementation.

#### P8-12 — Frozen DTO/contracts (`RISKY dependency-runtime`)

Current base contracts are frozen at `1.0.0` and consumed by fixture, Gateway,
structured data and UI. Geo-catalog introduces a deliberate contract major
`2.0.0`: add NAP/geo/development/developer/listing/SEO/breadcrumb DTOs and evolve
property DTOs into category-aware contracts. Before lock, update feasibility and
fixture acceptance; create the single required
`ADR-CONTRACTS-V2-GEO-CATALOG`; Plan approval supplies owner authorization for
the matching frozen-contract change. Apply the existing guarded lifecycle:
update package/public metadata and feasibility, then run `contracts:diff`; with
the approved plan recorded as authority set `CONTRACT_CHANGE_APPROVED=true`,
point `CONTRACT_ADR` to the accepted ADR and execute the unambiguous base-scope
command `node scripts/contracts.mjs lock --version=2.0.0` (the composite pnpm
script also locks journal and must not receive the base version argument). After
all fixtures pass, set `CONTRACT_FREEZE_APPROVED=true` and execute
`node scripts/contracts.mjs freeze --version=2.0.0`. Migrate all consumers in
the same contract wave. Hrefs are produced from PageKey/buildUrl at the
data/composition boundary.

#### P8-13 — Public Gateway methods (`RISKY auth-pii-leads`, after P8-12)

Add geo/listing/property/development/developer/nearby/count methods with explicit
access/select/depth/limits, status rules and bounded aggregates. Query-budget and
cross-city isolation are mandatory. No default city is inferred.

### Wave D — SEO, Gate and resolver

#### P8-14 — SEO Registry and metadata templates (`STANDARD`, after P8-03/P8-04)

Validated project-owned seed, explicit source/snapshot/value semantics,
duplicate/canonical guard and morphology-safe templates. Missing metric is not
zero. Registry content and indexability require evidence; fixture data must be
clearly synthetic and must not be presented as real demand research.

#### P8-15 — Content Gate (`STANDARD`, after P8-12/P8-14)

Single pure decision module returns pass/reasons/robots/inSitemap. Cover listing,
secondary property, newbuild lot, development and developer rules. Owner override
is audited and cannot bypass OUT/PREPARED_OFF/lifecycle. Active but weak content
returns 200 noindex rather than false 404.

#### P8-16 — Pure resolver (`STANDARD`, after P8-03/P8-04)

Resolve path through an injected `ResolverDataPort`, without Payload/Next imports.
Return page/redirect/notFound/gone, enforce status/grammar and avoid redirect
chains. Fixture matrix covers all profiles and negative cases.

### Wave E — UI and navigation

#### P8-17 — UI extension (`STANDARD` + local UI proof, after P8-12)

Reuse current catalog/property composition and Design System. Add Listing,
GeoHub, development/developer, Nearby and GeoSwitcher views plus price-request
flow through existing leads. No public route activation yet. Add representative
visual/a11y matrix at four viewports. Empty legal-check data yields neutral CTA,
never an unsupported claim.

#### P8-18 — Navigation, breadcrumbs and interlinks (`STANDARD` + local UI proof, after P8-15/P8-16/P8-17)

Pure builders use profile, PageKey and Gate results. No link may target 404 or
redirect in fixture crawl. Geo parent affects breadcrumbs only, not URL.

#### P8-19 — Leads and analytics (`RISKY auth-pii-leads`, after P8-12)

Extend existing lead contract; do not create another backend/outbox. Add geo and
entity context, preserve server authority/idempotency. The starter currently has
analytics data attributes but no provider/runtime. Add a provider-neutral typed
event contract with a safe no-op project adapter and test sink; do not add an
external analytics vendor. Events add normalized dimensions and reject PII.

### Wave F — discovery, lifecycle and fixtures

#### P8-20 — Sitemap, robots and IndexNow generators (`RISKY ingest-jobs`, after P8-14/P8-15)

Pure generators include only canonical/indexable/Gate-passing pages and use real
lastmod. IndexNow uses Payload Jobs and safe secret/env handling. No live route
switch before cutover. Because this adds a new outbound/job path, final risk
classification is not `STANDARD` by default. Implement the official key-file
response at the configured key location (or the official `keyLocation`
equivalent), validate the public host and submit only URLs on that host; key
values never enter jobs, logs or browser bundles.

#### P8-21A — Canonical HTTP status transport proof (`RISKY dependency-runtime`, may start after P8-04)

Next.js `permanentRedirect()` returns 308 and a `page.tsx` cannot emit arbitrary
410, while the current `/http/property-lifecycle/*` route does not own the
canonical property URL. Prove the transport early on the current property model:
a bounded Node Proxy preflight parses only entity grammar, performs a minimal
indexed lifecycle lookup through a dedicated server-only port, returns explicit
301/410 before page render and otherwise passes through. It must exclude
Payload/Admin/API/static assets, avoid recursive self-fetch, overwrite any
client-spoofable internal headers, preserve RSC/client navigation and meet the
property p95 budget. The old `/http/property-lifecycle/*` boundary remains until
this proof passes. Failure blocks P8-21B/P8-23A and returns the plan to
architecture review; it does not authorize a slow global Proxy query.

#### P8-21B — Generalized lifecycle, redirects and cache (`RISKY schema-data`, after P8-21A/P8-08/P8-09)

Generalize the proven transport to property/development/developer lifecycle:
missing 404; active 200; archived 200 noindex; purged with replacement 301;
purged without replacement 410; no loops/chains. Cache tags and invalidation
remain behind the canonical HTTP invalidation facade. Remove the old HTTP
boundary only after canonical URL evidence passes.

#### P8-22 — Starter fixture data (`STANDARD`, after P8-05/P8-06/P8-08/P8-09/P8-11/P8-14)

Idempotent synthetic seed for two cities, districts, developers, developments,
secondary/newbuild inventory, SEO registry and Excel sample. Starter remains
noindex. Integration tests consume this canonical fixture.

### Wave G — cutover, cleanup and clone proof

#### P8-23A — Runtime route cutover (`RISKY dependency-runtime` + local UI proof, after P8-10/P8-13/P8-16/P8-18/P8-19/P8-20/P8-21B/P8-22)

Wire explicit static routes and catch-all resolver/metadata adapter; preserve
Payload Admin/API/proxy; connect new views, navigation, NAP, sitemap/robots and
IndexNow. Enable trailing slash only with installed-version proof and regression
coverage. Legacy public URLs receive direct final redirects where applicable.

#### P8-23B — Post-cutover contract cleanup (`RISKY dependency-runtime`, after P8-23A proof)

Only after new runtime passes HTTP/SEO/visual/integration evidence: enforce
no-literal-hrefs and remove dead views/generators. Legacy text geo fields are not
removed in the same transaction as routing cutover. Their contract migration and
removal require a separate data-preservation proof and rollback checkpoint.

#### P8-24 — Clone tooling and client readiness (`RISKY dependency-runtime`, partial after P8-03/P8-05/P8-14; final after P8-23B)

Evolve the existing guarded `clone:prepare` and
`clone:activate-timeweb-storage` flow instead of creating a competing clone
command. Preset-driven preparation generates project profile, clears fixture
data, preserves Core/guards/migrations and keeps storage activation a separate
client topology step. Update onboarding from obsolete `starter-freeze-v1` to
the approved Plan №8 tag contract. Readiness checks morphology, NAP, registry,
reserved routes and indexing. Prove three temporary clones without edits in
`src/core/**` or `packages/**`. Parts independent of runtime routing may be
implemented before cutover; final end-to-end proof follows P8-23B.

#### P8-25 — Final acceptance and freeze decision (`STANDARD` evidence PR; tag is owner gate, after P8-23B/P8-24)

Run final proof once on the exact implementation `main` after P8-24; verify
second city activation by profile/data/registry only and perform the scoped
security/architecture audit. Then write the execution report in one docs-only
evidence PR with exact implementation-main, PR/head/gate/merge evidence. After
that PR merges, reconcile final `main` by proving its only delta from the tested
implementation SHA is the accepted evidence document; do not repeat the full
suite. Plan becomes `EXECUTED` only after all implementation tasks reconcile
cleanly. Tag `starter-v2.0.0` and GitHub mirror require a separate explicit owner
command and are not Developer actions.

## 5A. Exact epic requirements and acceptance ledger

Этот раздел сохраняет детерминированные требования исходного ТЗ. При конфликте
с краткой картой применяется более безопасная correction v1–v3 и фиксируется в
finding/revision history; требования не исчезают молча.

### P8-00 / P8-01 / P8-02

- Inventory records exact SHA, Node/pnpm/Next/React/Payload versions, all App
  Router routes, UI views, Payload collections/globals, quality scripts and
  package verification commands.
- Every legacy dependency gets `KEEP | ADAPT | REPLACE | REMOVE_LATER` and an
  owning epic: `/nedvizhimost`, `/obekty/[slug]`, `/uslugi`, `/sdat`, query SEO,
  text geo, lifecycle route, sitemap, cache tags and fixture/proof routes.
- `docs/platform/GEO_CATALOG_CONTRACT.md` becomes the reusable contract only
  after plan approval. Project Structure/Project/Architecture show current vs
  target state without presenting unimplemented routes as live.
- `src/project/static-routes.ts` owns project static route declarations.
  Project literals denylist is project-owned; reusable core/packages contain no
  city, brand or domain literals.
- Guards: core/packages may not import project; href literals are report-only
  until cutover and enforce afterwards; existing Biome/architecture/
  Dependency Cruiser tooling remains the owner.
- Acceptance: inventory coverage complete, docs links valid, negative guard
  fixtures prove every new rule, no runtime behavior changes in P8-00/P8-01.

### P8-03 — SiteProfile

SiteProfile contains:

```text
geoMode: SINGLE_GEO | MULTI_GEO
primaryGeo
categoryStatus: Record<CatalogSurfaceSlug, Status>
marketCapability: Record<newbuild | secondary, Status>
geoCategoryStatus: per geo/surface
marketStatus: per geo/market
defaultNearbyGeoStatus
developersSurface: root + per-geo status
facetWhitelist: per CatalogSurfaceSlug
seoTiers: metric, snapshotDate, P1/P2/TEST bands, minInventory,
          unmeasuredPolicy NONE|TEST
gate: listingIntroMinChars, propertyPhotosMin, devA/devB thresholds,
      priceStaleDays, priceFailDays, developerGeoMin,
      developerDescMinChars
entityPrefixes: residentialComplex=zhk-, cottageVillage=kp-
```

Defaults: intro `600`, property photos `3`; devA `2 price rows / 8 media /
1 layout / 1500 chars / progress required`; devB `1 / 3 / 600`; stale/fail
prices `45/120` days; developer geo minimum `5`; developer description `600`;
tier bands `100/50/0`, inventory `5/5/10`, unmeasured=`TEST`.

Presets: `MIXED`, `NEWBUILD_FIRST`, `SECONDARY_FIRST`. Fixtures:
`single-geo`, `multi-geo`, `newbuild-first`, `secondary-first`; `primorsk` is
primary, `zarechnyy.agglomerationOf=primorsk`. Unit tests cover invalid status
combinations and all fixture profiles.

### P8-04 — Grammar

- PageKey discriminants: `home`, `geoHub`, `categoryRoot`, `categoryGeo`,
  `categoryGeoDistrict`, `categoryGeoFacet`, `geoDevelopers`, `property`,
  `development`, `developerRoot`, `developer`, `static`.
- `buildUrl` always lowercases and adds canonical slash where applicable;
  `parseUrl` is syntax-only and does not query data.
- Reserved roots include framework/platform (`admin`, `api`, `media`, `_next`,
  robots/sitemap/search/legal), all catalog surfaces and explicit static routes.
- Transliteration: `й→y`, `ё→e`, `ж→zh`, `х→kh`, `ц→ts`, `ч→ch`, `ш→sh`,
  `щ→shch`, `ы→y`, soft/hard signs removed.
- Acceptance: `parseUrl(buildUrl(key))` round-trip for every PageKey/profile,
  uppercase normalization, collisions, invalid prefixes and ≥4 segments.

### P8-05 — Site settings / NAP

Payload Global fields: `brandName`, optional `legalName`, logo, phone, optional
email/address/workingHours/telegram/whatsapp, social links, requisites and geo
coordinates. Public reads only through Gateway `NapDTO`; raw anonymous Global
access is denied. Acceptance: migration up/down, fixture seed, access test and
DTO mapping.

### P8-06 / P8-07 — Geo data and property relations

- `regions`: name, globally unique slug, shortName, sortOrder, publication.
- `cities`: unique slug, genitive/locative, preposition `в|на`, type, region,
  optional agglomeration parent, approved morphology, sort, coordinates,
  publication.
- `districts`: city-scoped unique slug, admin/microdistrict type, optional
  parent, synonyms, locative/preposition, morphology approval, sort/publication.
- Guards reject city reserved-root collisions, district surface/facet
  collisions, invalid transliteration, self/cyclic agglomeration and published
  slug mutation before redirect operation exists.
- Additive property refs are `regionRef/cityRef/districtRef`; current text
  fields remain raw legacy source during expand. City-scoped synonym matching
  never guesses. Unknown district keeps property visible, sets ref null and
  records a redacted review issue within a valid backfill/import run.
- Acceptance: migrations on clean and non-empty DB, two cities, at least three
  districts including `severnyy` microdistrict (`parent=null`, preposition
  `на`), collision/cycle tests, idempotent backfill and unknown report.

### P8-08 — Property taxonomy and public identity

- Persisted domain: market `newbuild|secondary`, deal `sale|rent`, category
  `apartment|house|land|commercial|room|garage`.
- Category fields: house type; plot sotka/land category/permitted use/
  communications; commercial type; rooms and apartment areas/floors; optional
  development relation (wired in P8-09); optional document-check summary.
- URL mapping: apartment→kvartiry, house→doma, land→uchastki,
  commercial→kommercheskaya-nedvizhimost, room→komnaty, garage→garazhi.
- m²/sotka/hectare normalization is explicit; ambiguous values create review.
- `publicUrlId` uses a database sequence/constraint, is unique/immutable and
  survives re-publication. Parallel allocation and repeated feed identity are
  tested. Semantic slug excludes price.

### P8-09 — Unified developments/developers

- Developers: name, slug, aliases, optional legal name/logo/site/description,
  source/checkedAt and publication.
- Developments common fields: name, prefixed slug, kind, geo/district, developer,
  address/coordinates, class/completion/deadline, sales status/availability,
  data tier/source, price rows with freshness/source, lots count, media with
  type/rights/source/checkedAt, progress, descriptions with provenance, FAQ,
  external identities and publication.
- Kind-specific: residential complex may use layouts/progress; cottage village
  may use communications, total area, plots count and village class. Validation
  rejects cross-kind pollution.
- Slug city suffix is used only for real entity collision. Property relation is
  optional. `novostroyki` manifest and module guard gain `prepared` semantics.
- Acceptance: migrations, prefix/collision tests, relation/access tests and
  prepared module absent from routes/menu/sitemap.

### P8-10 / P8-11 — Import

- YRL mapping is explicit for category/market/deal/subtype. Unknown type records
  issue and does not publish. District synonyms are scoped to object city.
- Media mirror copies allowlisted external images through Safe Outbound Client
  into the existing storage adapter, marks owned media, enforces size/
  concurrency/retry bounds and preserves source/rights. Existing SAX, manual
  ownership, source isolation and safe deactivation remain.
- Excel sheets execute in order `Застройщики → ЖК → Цены → Медиа → Тексты`,
  each with its own validated columns and provenance timestamps.
- Commands: dry-run/apply import and template generation. Report contains new,
  changed, unchanged, errors, warnings and collisions. Unknown developer or
  published slug mutation is an error. Search aliases never create URLs.
- Acceptance: adversarial YRL fixture, mirrored media proof, repeat Excel apply
  produces zero changes, template opens with enum guidance, import run/issue
  access remains System/Ingest-only.

### P8-12 / P8-13 — Contracts and Public Gateway

Contract v2 includes `NapDTO`, geo DTOs, developer DTO, development card/details,
category-aware property card/details, `GeoHubDTO`, `SeoMetaDTO`, breadcrumbs and
`ListingPageDTO` with pageKey/H1/intro/items/total/pagination/subLinks/nearby/
robots/canonical. All hrefs derive from PageKey grammar.

Gateway methods:

```text
getGeoBySlug
getGeoHub
getListing({ geo, surface/category, district?, facet?, query, page })
getPropertyByPublicUrlId
getDevelopment / listDevelopments
getDeveloper / listGeoDevelopers
getNearby (agglomeration only; no cross-city count pollution)
countInventory (bounded aggregates)
```

Acceptance: explicit access/select/depth/limits, contract fixtures, query-budget
without N+1, and a `zarechnyy` secondary property remains directly reachable in
single-geo mode but is absent from `primorsk` listing.

### P8-14 / P8-15 — SEO Registry and Content Gate

Registry seed columns: pageKey, URL, entity ref, target phrases, metric/value,
source, snapshot date, tier, minimum objects, default robots, title/H1/
description/status. Empty value is not zero. Allowed sources:
`wordstat | broad39 | webmaster | fallback_no_data`. Fixture rows are synthetic.

Template keys cover home, geo hub, root/geo/district/facet catalogs, geo
developers, development normal/collision, developer and property. Variables
include brand, city grammatical forms/preposition, region, district forms,
inventory and fresh price. Optional fragments disappear as a whole. Unapproved
morphology cannot become indexable. Registry guard rejects URL/canonical/intent
duplicates and any URL not equal to `buildUrl(PageKey)`.

Gate acceptance matrix across four profiles:

- listing: tier inventory, registry metadata, ≥600-char intro and SSR links;
- secondary: price, area, apartment rooms, district/ref raw fallback, ≥3 owned
  photos and description;
- newbuild lot: always noindex/follow, self-canonical, outside sitemap;
- development: A/B thresholds from profile; C noindex; stale price hidden after
  45 days; all prices older than 120 days fail Gate without rewriting data tier;
- developer geo page: at least five developers with Gate-passing development;
  developer page: Gate-passing development plus sourced/checked description;
- owner override is audited and cannot bypass OUT/PREPARED_OFF/lifecycle;
- valid weak ACTIVE page returns 200 noindex, not false 404.

### P8-16 / P8-17 / P8-18 — Resolver, UI and navigation

- Resolver returns page/redirect/notFound/gone through `ResolverDataPort` and
  covers all grammar/status/mode rules on four in-memory profiles.
- Negative matrix: category-first URL, ≥4 segments, PREPARED_OFF, combined
  district+facet fourth segment, inactive geo links and semantic/category
  mismatch. Redirect result points directly to final canonical.
- UI preserves globals/primitives/site shell/home/corporate/marketing/legal.
  New views: Listing, GeoHub, DevelopmentCard/Details, DevelopersList,
  Developer, Nearby, GeoSwitcher and PriceRequestForm. Property view becomes
  category-aware and legal-check CTA stays neutral when no evidence exists.
- Development details expose prices, layouts, progress and FAQ; stale prices are
  hidden. GeoSwitcher is hidden for SINGLE_GEO. Price requests use existing lead
  flow. No public route is enabled before cutover.
- Navigation builders derive menu/breadcrumbs/interlinks from profile, Gate and
  static routes. Query URL is not linked when a path owner exists. No menu link
  targets a failing Gate; fixture crawl has zero links to 404/301.
- Acceptance: UI core, clone audit without growth of escape-hatch variants,
  one H1, accessible states and visual matrix at 390/768/1280/1440.

### P8-19 — Leads and analytics contract

- Extend form kinds with `legal`, `development_price`, `quiz` and optional
  geo/surface/district/propertyUrlId/development/developer context.
- Preserve `POST /api/public/leads`, transactional outbox and delivery state
  machine. Contract change and migration are risk-classified explicitly.
- Provider-neutral events: geo/listing/district/facet/development/developer view,
  price request submit and legal CTA. Every payload has geo/page/surface/market
  dimensions where applicable. Automated guard rejects phone, email, name,
  free-form text and other PII.

### P8-20 / P8-21 — Discovery and lifecycle

- Sitemap logical groups: static, geo, catalog, districts, facets, developments,
  developers, properties; shards ≤50,000. Only published canonical indexable
  Gate-passing pages enter. Listing lastmod is max relevant entity/registry
  update, never deployment time.
- IndexNow events: publish, canonical move (old+new), archive and gone. Payload
  Jobs owns queue/retries; no deploy-wide blast. Key is runtime secret and never
  job payload/log. Generators remain unwired until cutover.
- Lifecycle: missing 404, active 200, archived 200 noindex, purged replacement
  301, purged no replacement 410. Slug/canonical move creates direct redirect,
  removes old URL from sitemap and rejects loops/chains.
- Cache tags: geo, geo+surface, district, development, developer, property ID and
  registry; relationship changes invalidate bounded related targets through the
  existing authenticated HTTP facade.
- Acceptance: XML snapshots for four profiles, canonical 301/410 live HTTP
  proof, RSC/client-navigation proof, lifecycle/invalidation integration tests.

### P8-22 — Canonical starter fixture

Fixture contains two cities, four districts (two admin, one parentless micro,
one child), two developers, three A/B/C developments, secondary apartment/
house/land, newbuild lots, SEO seed and demo Excel. Seed is idempotent and
starter remains noindex. All integration tests consume this seed rather than
inventing parallel data.

### P8-23A / P8-23B — Cutover and cleanup

- Keep explicit static routes; one catch-all page dispatches resolver output to
  views and `generateMetadata` uses the same resolution contract.
- Preserve Payload Admin/API and `src/proxy.ts` security; enable trailing slash
  only after regression proof. Connect menu/NAP/sitemap/robots/IndexNow and
  canonical lifecycle transport.
- Legacy donor routes map directly to final canonical or are removed only when
  proven never-public; no redirect chain. Existing indexing policy remains
  fail-closed for starter demo.
- Cutover acceptance: status/robots/canonical/breadcrumb matrix for every
  PageKey/profile, real 404/200/301/308/410, zero crawl links to redirect/404,
  zero forbidden href literals, Payload Admin/API regression, performance not
  worse than baseline and representative visual matrix.
- Cleanup is separate: remove old routes/views/generators only after cutover
  evidence. Do not drop legacy geo/source data in the cutover transaction.

### P8-24 / P8-25 — Clone and final

- Clone preset changes only project profile/data/registry/tokens, preserves
  core/packages/guards/migrations and is idempotent.
- Readiness requires approved morphology for active pages, complete NAP,
  registry rows for active surfaces, literal guard, reserved-root agreement and
  explicit indexing decision.
- Three temporary client clones prove MIXED/NEWBUILD_FIRST/SECONDARY_FIRST and
  follow onboarding: preset → site settings → geo/districts → SEO seed → brand
  tokens/logo → feed → development Excel → readiness.
- Final exact implementation-main proof includes full relevant suites, clean client clone,
  security/access/PII/IndexNow/media-host audit and second-city enablement with
  zero diff in core/packages.
- Execution report records every epic PR/head/merge/gate and limitations. Plan
  becomes EXECUTED only after reconciliation. Tag/mirror/live demo remain
  explicit owner actions outside Developer implementation authority.

## 5B. Epic execution contract

Общее правило для всех строк: подробный DoD берётся из раздела 5A; `Exit`
означает зелёное локальное evidence, review без блокеров, один указанный
exact-head Gate и merge в `main`. Любое расхождение SHA, красный gate, потеря
данных, обход access/secret invariant или расширение scope — fail-closed stop.
Rollback означает возврат только данного PR/миграции по проверенному `down` или
feature wiring; уже принятые независимые эпики не откатываются. Все задачи —
`MERGE_AFTER_GATE`; production, tag и mirror не входят в их authority.

| Epic | System outcome / Source of Truth | Entry | Exit / Gate | Rollback or recovery | Epic-specific stop |
|---|---|---|---|---|---|
| P8-00 | Exact impact inventory / `docs/plan8/S8_00_INVENTORY.md` | approved imported plan, clean worktree | complete owner map / STANDARD | revert docs PR | unknown legacy owner or base drift |
| P8-01 | Adopted target canon / docs map + Product Structure + Architecture | P8-00 | current/target truth and links agree / STANDARD | revert docs PR | docs claim unimplemented runtime as live |
| P8-02 | Enforced dependency/profile boundary / guards config and tests | P8-01 | positive and negative guard fixtures / STANDARD | revert guard additions | required exception weakens core boundary |
| P8-03 | Validated profiles/presets / project profile schema and fixtures | P8-02 | four fixtures and invalid matrices pass / STANDARD | revert profile API and fixtures | ambiguous status precedence |
| P8-04 | Reversible URL grammar / PageKey parser-builder tests | P8-03 | complete round-trip and collision matrix / STANDARD | revert pure module | grammar cannot map one path to one PageKey |
| P8-05 | Canonical public NAP / Payload Global, migration, NapDTO | P8-02 | clean/non-empty migration, access and DTO proof / RISKY schema-data | tested down migration; old component source retained | anonymous raw Global access or lossy down |
| P8-06 | Canonical geo hierarchy / Payload geo collections | P8-04 | hierarchy, uniqueness, cycle and mutation tests / RISKY schema-data | tested down before dependent data; otherwise forward fix | collision namespace unresolved |
| P8-07 | Additive property geo refs / property schema + backfill report | P8-06 | idempotent clean/non-empty migration and ambiguity report / RISKY schema-data | down removes refs only after backup/proof; raw text retained | guessed geo identity or raw data loss |
| P8-08 | Stable public property identity / schema migration + identity tests | P8-07 | atomic sequence/default integration, immutability and concurrency proof / RISKY schema-data | keep assigned IDs; disable new URL wiring and forward-fix sequence | Payload insert/default spike fails or ID can be reused |
| P8-09 | Unified development domain / Payload collections + module manifest | P8-06 | kind validation, prepared isolation and access proof / RISKY schema-data | tested additive down before dependent imports | cross-kind pollution or prepared surface leaks public |
| P8-10 | Safe normalized feed/media ingest / ingest mapping and job evidence | P8-06/07/08 | adversarial feed, owned-media and deactivation proof / RISKY ingest-jobs | disable new mapping/mirror; retain source evidence and owned files | unsafe host, unknown type publishes, ownership regression |
| P8-11 | Idempotent development Excel ingest / importer, template, import runs | P8-09 | dependency preflight, dry-run/apply/repeat-zero-diff / RISKY ingest-jobs | importer disabled; applied rows recover from import-run evidence | library/license unresolved or existing YRL provenance breaks |
| P8-12 | Frozen contract major 2.0.0 / contracts package lock + ADR + feasibility | P8-05/06/08/09 | all consumers/fixtures pass and guarded lock/freeze succeeds / RISKY dependency-runtime | do not freeze until consumers pass; revert whole contract wave before merge | partial consumer migration or approval/ADR mismatch |
| P8-13 | Bounded anonymous read boundary / Public Gateway | P8-12 + schemas | access/select/depth/query-budget/cross-city proof / RISKY auth-pii-leads | revert methods; DTO contract stays | Local API access bypass, N+1 or unbounded aggregate |
| P8-14 | Evidence-driven SEO metadata / registry seed, schema and templates | P8-03/04 | source/date/duplicate/morphology fixtures pass / STANDARD | revert seed/template changes | synthetic metric presented as real evidence |
| P8-15 | One indexability decision / pure Content Gate | P8-12/14 | complete four-profile acceptance matrix / STANDARD | revert pure module | override can bypass lifecycle or platform status |
| P8-16 | Framework-free route resolution / resolver and fixture adapter | P8-03/04 | full page/redirect/404/410 matrix and no chains / STANDARD | revert pure module | Next/Payload dependency enters resolver |
| P8-17 | Contract-driven views / UI library and view fixtures | P8-12 | UI/a11y/visual evidence at four viewports / STANDARD | remove unwired views | view requires new route or unsupported legal claim |
| P8-18 | Safe navigation graph / pure builders and crawl test | P8-15/16/17 | zero fixture links to 404/redirect / STANDARD | revert builders; old nav remains | builder invents URL outside PageKey |
| P8-19 | Extended leads plus PII-free analytics / lead contract, migration, no-op adapter | P8-12 | lead/outbox/idempotency and PII rejection proof / RISKY auth-pii-leads | feature-off analytics; tested additive down for lead fields | second backend/outbox or PII reaches event payload |
| P8-20 | Canonical discovery feeds / sitemap, robots, IndexNow job and key verification | P8-14/15 | shard/lastmod snapshots, host/key, retry and secret tests / RISKY ingest-jobs | keep generators unwired; disable job queue | key leaks, foreign-host URL, deploy-wide submission |
| P8-21A | Proven canonical 301/410 transport / transport decision + live HTTP proof | P8-04 | bounded current-model 301/410, RSC and p95 evidence / RISKY dependency-runtime | retain old lifecycle boundary and remove preflight | global/slow Proxy query, asset/API interception or client-nav break |
| P8-21B | Entity lifecycle and bounded invalidation / lifecycle store + cache facade | P8-21A/08/09 | full state/loop/chain/invalidation matrix / RISKY schema-data | old boundary retained until canonical proof; forward-fix persisted history | redirect chain/loop or lifecycle history loss |
| P8-22 | One canonical synthetic dataset / seed + sample Excel | P8-05/06/08/09/11/14 | idempotent seed and all integration consumers agree / STANDARD | scoped fixture reset only | fixture touches non-fixture records or enables indexing |
| P8-23A | Atomic public route cutover / App Router adapters and same resolver contract | all listed runtime predecessors | HTTP/SEO/admin/API/performance/UI matrix / RISKY dependency-runtime | one switchback commit restores old wiring; new additive data retained | any canonical status, admin/API or p95 regression |
| P8-23B | Dead runtime removed after proof / inventory disposition + guards | accepted P8-23A | every removal mapped, no legacy-data drop, guards enforce / RISKY dependency-runtime | revert cleanup PR | removal lacks replacement/evidence or touches retained raw data |
| P8-24 | Repeatable client clone / existing clone commands + onboarding/readiness | partial foundations; final P8-23B | three clean temporary clone proofs / RISKY dependency-runtime | discard temporary clones; revert tooling PR | core/packages mutation, non-idempotence or hidden topology choice |
| P8-25 | Reconciled execution evidence / plan execution report and final main SHA | P8-23B/24 | one implementation-main relevant-suite proof, STANDARD evidence PR, docs-only SHA reconciliation; no tag | revert report PR only; implementation remains at accepted main | any epic/evidence/SHA unresolved, non-doc final delta or implicit tag request |

## 6. Initial dependency model

```text
A: P8-00 → P8-01 → P8-02
B1: P8-02 → P8-03 → P8-04 → P8-06 → P8-07 → P8-08
B2: P8-02 → P8-05
B3: P8-06 → P8-09
C1: P8-08 → P8-10
C2: P8-09 → P8-11
C3: P8-05 + P8-06 + P8-08 + P8-09 → P8-12 → P8-13
D1: P8-03 + P8-04 → P8-14 → P8-15
D2: P8-03 + P8-04 → P8-16
E1: P8-12 → P8-17
E2: P8-15 + P8-16 + P8-17 → P8-18
E3: P8-12 → P8-19
F1: P8-14 + P8-15 → P8-20
F2a: P8-04 → P8-21A (early risk retirement)
F2b: P8-21A + P8-08 + P8-09 → P8-21B
F3: P8-05 + P8-06 + P8-08 + P8-09 + P8-11 + P8-14 → P8-22
G1: P8-10 + P8-13 + P8-16 + P8-18 + P8-19 + P8-20 + P8-21B + P8-22 → P8-23A
G2: P8-23A proof → P8-23B
G3: P8-24 partial work may start after P8-03/P8-05/P8-14; final proof after P8-23B
G4: P8-23B + P8-24 → P8-25
```

### 6.1 Dependency matrix

| Epic | Depends on | Type | Minimum blocking scope | Parallel-safe with |
|---|---|---|---|---|
| P8-00 | baseline | HARD | inventory only | none at program start |
| P8-01 | P8-00 | HARD | canon adoption | none before docs map is stable |
| P8-02 | P8-01 | HARD | dependency/profile boundary | none before boundary freeze |
| P8-03 | P8-02 | CONTRACT | SiteProfile API | P8-05 |
| P8-04 | P8-03 | HARD | grammar requires profile vocabulary | P8-05 |
| P8-05 | P8-02 | CONTRACT | NAP schema/DTO | P8-03/P8-04 pure work; schema merges sequentially |
| P8-06 | P8-04 | HARD | namespace collision rules | P8-14/P8-16/P8-21A after grammar freeze |
| P8-07 | P8-06 | HARD | geo relations require geo IDs | P8-14/P8-16/P8-21A |
| P8-08 | P8-07 | HARD | taxonomy/public identity on expanded property schema | P8-14/P8-16/P8-21A |
| P8-09 | P8-06 | HARD | development geo relations | P8-07/P8-08 only as separate design work; schema merge sequential |
| P8-10 | P8-06/P8-07/P8-08 | HARD | normalized geo/taxonomy mapping | P8-11 after import provenance freeze |
| P8-11 | P8-09 | HARD | development schema + import provenance | P8-10 code work; shared ingest/import-run changes merge sequentially |
| P8-12 | P8-05/P8-06/P8-08/P8-09 | CONTRACT | stable data/view contracts, not complete feature implementations | P8-10/P8-11 |
| P8-13 | P8-12 + relevant schemas | HARD | Gateway select/query/DTO | P8-17/P8-19 on frozen contracts |
| P8-14 | P8-03/P8-04 | CONTRACT | profile + URL grammar | P8-06…P8-11/P8-16/P8-21A |
| P8-15 | P8-12/P8-14 | HARD | entity DTO + registry | P8-13/P8-16/P8-17/P8-19 |
| P8-16 | P8-03/P8-04 | CONTRACT | `ResolverDataPort`, fixture implementation | P8-06…P8-15/P8-17/P8-21A |
| P8-17 | P8-12 | CONTRACT | frozen view DTOs | P8-13/P8-15/P8-16/P8-19 |
| P8-18 | P8-15/P8-16/P8-17 | HARD | Gate + resolver + views | P8-19/P8-20/P8-21B |
| P8-19 | P8-12 | CONTRACT | lead/context contracts | P8-13/P8-15/P8-16/P8-17 |
| P8-20 | P8-14/P8-15 | HARD | registry + Gate decisions | P8-18; sequence with P8-21B if jobs/cache files overlap |
| P8-21A | P8-04 | CONTRACT | entity grammar and current lifecycle | P8-06…P8-20; must finish before P8-21B |
| P8-21B | P8-21A/P8-08/P8-09 | HARD | proven transport + entity identities | P8-18/P8-20/P8-22 subject to shared files |
| P8-22 | P8-05/P8-06/P8-08/P8-09/P8-11/P8-14 | HARD | canonical fixture schema/import | P8-18/P8-20/P8-21B after contract freeze |
| P8-23A | P8-10/P8-13/P8-16/P8-18/P8-19/P8-20/P8-21B/P8-22 | HARD | all wired surfaces required for atomic route cutover | none; isolated cutover stream |
| P8-23B | P8-23A acceptance | HARD | cleanup only after rollback-safe cutover proof | P8-24 documentation prep only |
| P8-24 | partial: P8-03/P8-05/P8-14; final: P8-23B | CONTRACT then HARD | tooling early, end-to-end clone proof late | compatible docs/tooling streams |
| P8-25 | P8-23B/P8-24 | HARD + OWNER for tag only | final main acceptance; tag is separate action | none |

### 6.2 Shared-file and migration ownership

- Schema owners P8-05/06/07/08/09/11/19/21B do not merge concurrently. Each
  next migration rebases on the latest canonical `main` and proves clean DB plus
  relevant non-empty fixture data.
- P8-03/04/14/16 and early P8-21A are contract/pure-module work and form the
  main independent lane while schema work proceeds.
- P8-12 freezes contracts once; P8-13/15/17/19 consume that exact version and
  may work independently when they do not edit the same contract files.
- P8-10 and P8-11 may be implemented in parallel only after import provenance
  ownership is frozen; their PRs merge sequentially.
- P8-20 and P8-21B declare ownership of Payload Jobs/cache/redirect registries
  before coding; overlapping files force sequential merge.
- P8-23A is the only route cutover owner. No other epic changes public route
  ownership while its PR is open.

### 6.3 Ready waves and bypass

```text
Wave 0  baseline/canon: P8-00 → P8-01 → P8-02
Wave 1  parallel foundations: P8-03 + P8-05
Wave 2  grammar/risk retirement: P8-04 → (P8-14 + P8-16 + P8-21A)
Wave 3  sequential data spine: P8-06 → P8-07 → P8-08; P8-09 after P8-06
Wave 4  ingest/contracts: P8-10 + P8-11 + P8-12, with sequential shared merges
Wave 5  product surfaces: P8-13 + P8-15 + P8-17 + P8-19
Wave 6  composition/runtime prep: P8-18 + P8-20 + P8-21B + P8-22
Wave 7  isolated cutover: P8-23A → P8-23B
Wave 8  clone/final: P8-24 → P8-25
```

Если schema lane блокируется, pure profile/grammar/SEO/resolver/status-transport
work продолжается. Если UI блокируется, Gateway/SEO/lifecycle/fixtures остаются
ready. Если внешний Excel dependency не проходит preflight, P8-11 блокируется,
но P8-10/P8-12 и остальные независимые lanes продолжаются; P8-22 и cutover ждут
только необходимый development fixture/import contract. Production не является
dependency implementation graph.

Это assembly-stage dependency model. Readiness verdict будет выдан только после
явного перехода к финальному четырёхпроходному аудиту.

## 7. Initial finding register

| ID | Severity | Finding | Recommendation | Status |
|---|---|---|---|---|
| F8-001 | BLOCKER | Plan task P8-01 создаёт сам plan, который должен существовать до approval/import | Создать canonical plan в Architect assembly; P8-01 оставить как canon adoption | ACCEPTED |
| F8-002 | MAJOR | Повтор gates на PR head и main дублирует evidence и CI cost | Один exact-head gate; main proof только по wave/final/risk trigger | ACCEPTED |
| F8-003 | MAJOR | «Epics do not block each other» противоречит длинной цепи dependencies | Построить DAG, contract freeze и независимые waves | ACCEPTED |
| F8-004 | MAJOR | Пустые core modules нарушают Core 5.5 | Создавать модуль вместе с первым реальным contract/code | ACCEPTED |
| F8-005 | MAJOR | ESLint rule не соответствует Biome/Dependency Cruiser stack | Расширить существующие guards, не добавлять ESLint без trigger | ACCEPTED |
| F8-006 | BLOCKER | `core → project` profile lookup нарушает dependency direction | Profile injection: project/app → core | ACCEPTED |
| F8-007 | MAJOR | Десять ADR создают competing documentation | Один platform contract; ADR только для труднообратимых deviations | ACCEPTED |
| F8-008 | BLOCKER | Routing cutover + destructive field cleanup в одном epic снижает rollback safety | Разделить P8-23A/P8-23B; legacy data cleanup отдельно | ACCEPTED |
| F8-009 | MAJOR | Catch-all page сам по себе не доказывает HTTP 410 в Next 16 | Сохранить proven HTTP lifecycle boundary до version-specific proof | ACCEPTED |
| F8-010 | MAJOR | IndexNow классифицирован STANDARD, хотя добавляет outbound secret/job path | Предварительно RISKY ingest-jobs; уточнить после design | ACCEPTED |
| F8-011 | QUESTION | Старый freeze contract/tag не согласован с target `starter-v2.0.0` | Plan №7 завершён без freeze; Plan №8 целится в новый versioned tag | RESOLVED |
| F8-012 | QUESTION | Delivery mode всех implementation epics не утверждён | Следовать AMS-канону: review + один risk-based exact-head Gate + merge в main | RESOLVED |
| F8-013 | BLOCKER | `CategorySlug` смешивает URL surface, property category, market и deal type | Ввести `CatalogSurfaceSlug` и canonical mapping к domain query | RESOLVED IN v1 |
| F8-014 | BLOCKER | Новые relations `region/district` конфликтуют с существующими text fields тех же имён | Additive `regionRef/cityRef/districtRef`; raw cleanup после cutover | RESOLVED IN v1 |
| F8-015 | MAJOR | Base contracts уже frozen `1.0.0`; исходный additive claim не покрывает discriminated property model | Contract major `2.0.0`, feasibility, fixture acceptance и один обязательный ADR | RESOLVED IN v1 |
| F8-016 | BLOCKER | `import-runs.feedSource` required несовместим с Excel development import | Expand import provenance с kind-specific invariant без поломки YRL | RESOLVED IN v1 |
| F8-017 | BLOCKER | Catch-all page не может сам обеспечить требуемые canonical 301/410; `permanentRedirect` = 308 | Ранний P8-21A: bounded Node Proxy lifecycle preflight; fail-closed до cutover | RESOLVED IN v1; IMPLEMENTATION PROOF P8-21A |
| F8-018 | MAJOR | P8-08 повторно объявляет существующие market/deal/category/area fields | Перевести epic в schema expansion, сохранить existing invariants | RESOLVED IN v1 |
| F8-019 | MAJOR | В starter нет analytics provider/runtime, только data attributes | Provider-neutral event contract + no-op adapter; vendor out of scope | RESOLVED IN v1 |
| F8-020 | MAJOR | «Geo hub always 200» конфликтует с OUT/unpublished → 404 | Always-200 только для published/allowed geo; effective status формализован | RESOLVED IN v1 |
| F8-021 | MAJOR | Новый clone flow мог конкурировать с уже существующими guarded commands | Эволюция существующего prepare/storage activation, не второй workflow | RESOLVED IN v1 |
| F8-022 | MAJOR | Исходный линейный порядок превращает большинство эпиков в искусственные HARD dependencies | Contract-first matrix, schema lane и независимые ready waves | RESOLVED IN v2 |
| F8-023 | MAJOR | Schema/import/jobs/UI потоки имеют скрытые shared-file conflicts | Явные owners, sequential merge для migrations и overlap stop rule | RESOLVED IN v2 |
| F8-024 | BLOCKER | Краткая карта v2 не сохраняла все точные поля, thresholds, Gateway methods, negative cases и DoD исходного ТЗ | Единый exact epic requirements/acceptance ledger внутри canonical plan | RESOLVED IN v3 |
| F8-025 | BLOCKER | У эпиков не было единого entry/exit/rollback/stop/evidence contract | Добавить полную 28-строчную execution matrix | RESOLVED IN v4 |
| F8-026 | MAJOR | `UI`, `RISKY+UI`, `STANDARD/RISKY by diff` и `FINAL` не являются допустимыми однозначными Gate-классами | Зафиксировать ровно STANDARD либо один RISKY scope; UI оставить локальным proof | RESOLVED IN v4 |
| F8-027 | MAJOR | Финальный full proof и последующий evidence PR меняли exact main и могли вызвать повтор suites | Proof на implementation-main, затем docs-only PR и SHA reconciliation без повторного full suite | RESOLVED IN v4 |
| F8-028 | MAJOR | Manifest/lock требуют Payload 3.90.1, а соседний local install содержит 3.89.0 | P8-00 начинает с frozen-lock reconciliation; stale node_modules не источник истины | RESOLVED IN v4 |
| F8-029 | MAJOR | IndexNow task не фиксировал key verification/keyLocation и same-host boundary | Добавить официальный verification contract, host validation и secret exclusions | RESOLVED IN v4 |
| F8-030 | MAJOR | PostgreSQL sequence для `publicUrlId` не доказывала поведение Payload insert | Добавить ранний clean/non-empty integration spike и allowlisted System Gateway fallback | RESOLVED IN v4 |
| F8-031 | MAJOR | Contract v2 shorthand пропускал реальные approval env/ADR/feasibility gates текущего script | Зафиксировать точную guarded lock/freeze последовательность | RESOLVED IN v4 |
| F8-032 | BLOCKER | `pnpm contracts:lock -- --version=2.0.0` неоднозначен для составного script и мог передать version journal-команде вместо base lock | Использовать прямые base-scope `node scripts/contracts.mjs lock/freeze --version=2.0.0` | RESOLVED IN v5 |

## 8. Owner decision register

### OD8-01 — Previous freeze contract

- **Question:** Plan №8 окончательно заменяет намерение создавать
  `starter-freeze-v2`, а существующий неконанический `starter-freeze` остаётся
  только историческим tag до отдельной cleanup-команды?
- **Recommendation:** да; считать Plan №7 завершённым без freeze и целиться в
  новый versioned tag `starter-v2.0.0` после Plan №8.
- **Deadline:** before APPROVAL.
- **Status:** DECIDED.
- **Decision:** старое намерение `starter-freeze-v2` закрыто. Стартер
  пересобирается в Plan №8; целевой новый tag — `starter-v2.0.0`. Создание tag
  остаётся отдельной явной командой владельца после финальной приёмки.

### OD8-02 — Delivery authority

- **Clarification:** отдельное решение владельца не требовалось. Project
  `AGENTS.md`, Delivery Profile и AMS Git workflow уже задают полный порядок.
- **Canonical rule:** `MERGE_AFTER_GATE` для implementation epics; P8-25 tag,
  mirror и production остаются отдельными owner actions.
- **Deadline:** before APPROVAL.
- **Status:** DECIDED.
- **Decision:** действовать по AMS-канону. Каждый завершённый epic проходит
  review, один подходящий exact-head `STANDARD` либо `RISKY` SourceCraft Gate и
  при PASS сливается в `main` без дополнительного вопроса. Красный Gate или
  изменившийся SHA блокирует merge. Production не входит в Plan №8.

### OD8-03 — Development entity model

- **Clarification:** отдельное решение владельца не требовалось. Единая
  collection `developments` с discriminant `kind = residential_complex |
  cottage_village` прямо задана в исходном ТЗ P8-09.
- **Decision:** ACCEPTED AS OWNER REQUIREMENT. Реализация обязана сохранить
  строгую type-specific validation и не смешивать поля ЖК и коттеджного посёлка.
- **Status:** DECIDED FROM ORIGINAL BRIEF.

### OD8-04 — Optional live demo verification

- **Question:** нужен ли после полного завершения Plan №8 в `main` один
  отдельный rollout owner-operated demo `start-baza.ams24.ru` для live smoke
  Nginx/HTTP/Payload Admin/API/migrations?
- **Recommendation:** да, один раз после final main proof. Это не клиентский
  production и не часть Developer implementation loop, но всё равно отдельный
  release action только по явной команде владельца.
- **Deadline:** after P8-25 main acceptance, before optional demo rollout.
- **Status:** OPEN; does not block plan approval or implementation.

## 9. Revision packet — RP8-001

```text
Source: owner brief
Targets: product scope, architecture, data, URL/SEO, UI, delivery, clone flow
Accepted: geo-first goal, status/profile model, Payload ownership, additive
          expand/cutover, developments/developers, SEO Gate, resolver, UI reuse,
          clone proof, owner-only tag
Rejected as written: duplicate post-merge gates, empty modules, ESLint-only guard,
                     core→project dependency, ten mandatory ADRs, same-step data
                     deletion and route cutover, Plan 7 = SUPERSEDED
Needs owner: old freeze reconciliation, delivery mode, unified development entity
Sections changed: all; source brief normalized into v0 DRAFT
Resulting version: v0 DRAFT
```

## 9.1 Revision packet — RP8-002

```text
Source: architect factual inspection of baseline 48978f5
Targets: schema, module governance, contracts, routing/status transport,
         analytics, clone tooling, dependency graph
Accepted: original product outcomes and all owner decisions
Corrected: URL-surface/domain vocabulary, additive geo relation names,
           existing property-field scope, import provenance, frozen contract
           versioning, module prepared state, analytics adapter boundary,
           clone command ownership
Open implementation proof: real canonical 301/410 transport on Next.js 16,
                           with architecture and stop condition already fixed
Owner decisions required: none before next assembly round
Sections changed: 5.0, P8-03, P8-07…P8-09, P8-11…P8-12,
                  P8-19, P8-21, P8-24, finding register
Resulting version: v1 REVIEW
```

## 9.2 Revision packet — RP8-003

```text
Source: architect dependency/autonomy round
Targets: dependency taxonomy, blocking scope, parallel waves, shared ownership
Accepted: one epic/stream/PR and expand→cutover intent
Corrected: serial execution replaced by contract-first ready waves; schema and
           shared runtime merges remain sequential; cutover stays isolated
Owner decisions required: none
Sections changed: epic dependency annotations, section 6, finding register
Resulting version: v2 REVIEW
```

## 9.3 Revision packet — RP8-004

```text
Source: owner brief completeness reconciliation
Targets: exact fields, defaults, methods, negative matrices, verification and DoD
Accepted: all non-conflicting deterministic requirements from original brief
Corrected: requirements expressed with v1 domain/migration/routing decisions
Rejected: none in this round
Owner decisions required: none
Sections changed: new section 5A, finding register
Resulting version: v3 REVIEW
```

## 9.4 Revision packet — RP8-005

```text
Source: final four-pass audit of exact v3
Targets: per-epic execution contract, gate determinism, version/runtime drift,
         exact final-main evidence, IndexNow and publicUrlId integration
Accepted: product scope, domain model, contract-first DAG and all v3 ledger items
Corrected: 28 epic entry/exit/rollback/stop contracts; exact STANDARD/RISKY
           classes; docs-only final SHA reconciliation; frozen-lock bootstrap;
           guarded contract v2 commands; IndexNow verification; sequence spike
Owner decisions required before approval: none
Sections changed: P8-00/P8-08/P8-12/P8-13/P8-17/P8-18/P8-20/P8-23…P8-25,
                  new section 5B, finding register, final audit
Resulting version: v4 REVIEW, then exact-v4 audit
```

## 9.5 Revision packet — RP8-006

```text
Source: exact-v4 audit command-path verification
Target: frozen base contract 2.0.0 lifecycle
Accepted: guarded approval, ADR and feasibility requirements
Corrected: composite pnpm lock command replaced by unambiguous direct base-scope
           lock/freeze commands; journal contract remains untouched
Owner decisions required before approval: none
Sections changed: P8-12, finding register, final audit version
Resulting version: v5 REVIEW, then exact-v5 four-pass audit
```

## 9.6 Revision packet — RP8-007

```text
Source: exact-v5 status/finding reconciliation
Targets: machine-readable plan phase and unresolved-finding count
Accepted: all exact-v5 architecture and execution contracts
Corrected: top-level phase matches completed audit; F8-017 is architecturally
           resolved while its required runtime proof remains P8-21A acceptance
Owner decisions required before approval: none
Sections changed: plan header, finding register, final audit version
Resulting version: v6 REVIEW, then exact-v6 four-pass audit
```

## 10. Final audit — exact v6

### Pass 1 — Logic and completeness

**PASS.** Scope, non-goals, URL/status/profile model and all 28 executable
units reconcile with the exact requirements ledger. Every brief requirement is
accepted or explicitly corrected in the finding history. Remaining OD8-04 is a
post-execution optional demo release choice and is not an implementation input.

### Pass 2 — Architecture, data and security

**PASS.** Payload remains the only schema/auth/data owner; public reads use
Gateway DTOs and explicit access/select/depth/limits; migrations are additive
until proven cleanup; secrets and PII stay server-side. Installed-version review
confirmed Next 16 Node Proxy/308/Route Handler constraints. Manifest and lock
agree on Next `16.3.5` and Payload `3.90.1`; stale Payload `3.89.0` local install
is converted into the mandatory P8-00 reconciliation gate. Official Payload
contracts confirm Next 16.2.6+ compatibility, compound indexes, migrations,
Jobs and explicit Local API access behavior. Official IndexNow documentation
confirms key-file/`keyLocation` and same-host URL constraints now present in
P8-20.

### Pass 3 — Dependencies and autonomy

**PASS.** Automated matrix check: 28 nodes, 28 rows, 28 visited, 0 cycles,
0 unknown dependency references, one intentional initial ready task P8-00.
Contract-first lanes, sequential schema ownership, shared-file stop rules and
blocked-task bypass make autonomous execution deterministic. P8-11 dependency
preflight and P8-21A transport proof are early task-level risk retirement with
objective stop/fallback behavior; neither requires an owner choice.

### Pass 4 — Executability, evidence and delivery

**PASS.** All 28 units now have system outcome, source of truth, entry, exit,
rollback/recovery, stop condition and exact Gate class. Acceptance is observable
through migrations, fixtures, HTTP/status matrices, access tests, visual/a11y,
query/performance budgets, clone proofs and exact SHA evidence. Delivery remains
one stream/branch/PR per independently accepted epic, one exact-head Gate per
PR, sequential merge where required, and no production/tag/mirror authority.

### Final scorecard

```text
Scope blockers: 0
Architecture/data/security blockers: 0
Dependency cycles: 0
Unknown dependency references: 0
Owner decisions before approval: 0
Unresolved BLOCKER/MAJOR findings: 0
Executable units with full contract: 28/28
Production actions in graph: 0
```

### Night Run Readiness

```text
Verdict: READY
Initial ready task: P8-00
Autonomous blocker bypass: YES, only independent READY work
Fail-closed boundaries: schema/data, frozen contracts, access/PII, secrets,
                        external dependency preflight, routing transport, SHA
Human gates during implementation: none
Human gates after implementation: optional demo release, tag, GitHub mirror
```

**Final verdict:** `READY_FOR_OWNER_APPROVAL`.

### Owner approval

```text
Approval phrase: План утвержден
Approved exact version: v6
Approver: owner
Approval date: 2026-09-24 (Europe/Moscow)
Revision result: APPROVED without content changes after exact-v6 audit
Authority: Task Manager import + MERGE_AFTER_GATE implementation delivery
Excluded authority: production, release, tag, GitHub mirror
Inventory coverage: DECLARED P8 anchor mapping explicitly confirmed 28/28
```

## 11. Revision history

| Version | Date | Status | Input | Result |
|---|---|---|---|---|
| v0 | 2026-09-24 | DRAFT | Owner Geo-Catalog Plan 8 brief | Canonical assembly baseline created; old freeze explicitly closed; merge workflow and unified developments recognized as already-defined requirements; optional OD8-04 deferred until final main acceptance |
| v1 | 2026-09-24 | REVIEW | Baseline schema/routing/contracts/guards inspection | Domain and migration conflicts resolved; contract v2 and import provenance formalized; canonical 301/410 transport remains architecture proof before final audit |
| v2 | 2026-09-24 | REVIEW | Dependency/autonomy assembly round | Minimum blocking scope, sequential schema ownership, shared-file rules, nine ready waves and blocker bypass formalized |
| v3 | 2026-09-24 | REVIEW | Owner brief completeness reconciliation | Exact field lists, defaults, methods, negative cases, UI matrix, lifecycle rules, clone acceptance and final evidence retained in canonical plan |
| v4 | 2026-09-24 | REVIEW | Exact-v3 final audit corrections | Full epic execution contracts, deterministic gates/final evidence and version-sensitive risk closures; exact-v4 repeat found composite contract-command ambiguity |
| v5 | 2026-09-24 | REVIEW | Exact-v4 command-path correction + exact-v5 repeat audit | Base contract lock/freeze commands made unambiguous; repeat audit found header/finding-state inconsistency |
| v6 | 2026-09-24 | APPROVED | Exact-v5 status reconciliation + exact-v6 repeat audit + owner phrase `План утвержден` | Header, finding register and scorecard agree; four passes green; exact v6 authorized for Task Manager import and Developer handoff |

## 12. Current architect state

```text
Phase: APPROVAL_HANDOFF
Final four-pass audit: PASS on exact v6
Readiness verdict: READY
Owner decisions before approval: 0
Task Manager import: authorized; pending CLEAN reconcile
Developer handoff: authorized after CLEAN import
Production: forbidden
Next: inventory v2 → Validate → Init → Import → Reconcile → Developer goal
```

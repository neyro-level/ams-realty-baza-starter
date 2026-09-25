# AMS MASTER PLAN №9 — STARTER v2.1 / CLONE READINESS

Plan ID: `AMS-REALTY-BAZA-STARTER-V2-1-CLONE-READINESS-9`  
Version: `v3`  
Status: `APPROVED`  
Phase: `APPROVAL_HANDOFF`  
Baseline: SourceCraft `main@6671b0f0c2ceaf62749cc3b6b78b591c6fe51ed6`  
Owner input: `STARTER v2.1 — готовность к клонам`, received 2026-09-25  
Approved by: `owner`  
Approved at: `2026-09-25T13:00:23+03:00`  
Delivery profile: `COMMERCIAL`  
Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`  
Production authorization: `NONE`

Этот документ — единственная активная основа нового master plan. Планы №2–8
остаются историческим evidence в `docs/legacy/` и не являются очередью работ.
Plan №9 прошёл финальный аудит exact v3 и утверждён владельцем явной фразой
`План утверждён`. Implementation разрешается только через импортированный и
reconciled Task Manager graph; production остаётся запрещён.

## 1. Primary goal и границы

### Primary goal

Довести AMS Realty Baza Starter до переносимого `STARTER v2.1`, из которого
можно детерминированно подготовить клиентский clone с явным SiteProfile,
data-driven geo/SEO registries, единым Content Gate, корректной URL/lifecycle
семантикой, проверяемыми preset-ами и без client literals в reusable platform.

### Major outcomes

1. ProjectSiteProfile v2 выражает SINGLE/MULTI GEO, рынки, категории, Gate,
   SEO tiers, модули, static routes и clone overrides без правки core.
2. Районы читаются из Payload, SEO-фасеты — из project-owned registry; URL
   collisions валидируются до runtime.
3. Resolver, redirects и canonical transport возвращают один доказанный
   `200/301/308/404/410` без chains/loops и фиктивных inventory values.
4. `decidePage(pageKey)` становится единым источником availability,
   indexability и discovery для metadata, sitemap, IndexNow и навигации.
5. SEO templates и client morphology принадлежат project config, reusable core
   остаётся без бренда, города, домена и русских маркетинговых шаблонов.
6. Catalog, developments, navigation, cache и structured data доказаны через
   реальные Gateway/DTO/runtime surfaces.
7. Clone preset v2 воспроизводит четыре reference profiles в clean checkout.
8. UI и acceptance matrix соответствуют каноническим маршрутам v2.1.

### Non-goals

- production rollout, DNS, live client infrastructure или production DB work;
- создание release tag без отдельной команды владельца;
- GitHub как primary или bidirectional sync;
- второй ORM/auth/backend, Redis/broker/PostGIS/search engine;
- новый visual language или вторая UI primitive foundation;
- изменения любых других product repositories;
- импорт DRAFT/REVIEW плана в Task Manager.

## 2. MASTER PLAN MAP

### Platform и data ownership

- Platform: AMS Realty Platform Core Standard 5.5, `REALTY_BASE`, `BUILD`.
- Runtime: Next.js `16.3.5`, React `19.2.8`, Payload `3.90.1`, PostgreSQL.
- Payload — единственный owner schema, migrations, auth и Admin.
- Public reads: Public Gateway → access/select → DTO → UI.
- Dependency direction: `project -> core`; `core/packages -X-> project`.
- UX: public commercial + CMS-native Payload Admin; существующая design system
  сохраняется, redesign не входит в scope.

### Shared foundations

- SiteProfile v2 and project-owned registries;
- PageKey / URL grammar / resolver contracts;
- `decidePage` orchestration and Gate inputs;
- project-owned SEO templates and CSV registry;
- bounded Public Gateway aggregates;
- clone preset v2 and guard-generated literal denylist.

### Data/schema changes

- district category enablement, если текущая schema не выражает матрицу;
- development sales/media/price model and completeness score;
- site-settings only for fields proven missing after inventory;
- every persisted change only through additive Payload migrations with clean and
  upgrade fixture proof.

### Security-sensitive areas

- no raw anonymous Payload business REST;
- no `overrideAccess` bypass outside named System Gateway;
- no PII in analytics/IndexNow/jobs/logs;
- morphology approval and owner Gate override are auditable;
- no project/client literals in `src/core/**` or `packages/**`.

### Infrastructure/release boundary

- Epics S0–S14 are pre-production implementation.
- S15 is an explicit owner/release gate and is excluded from unattended
  implementation until a separate release command.
- `starter-v2.1.0` replaces the uncreated `starter-v2.0.0` target only after
  project canon is updated and the final acceptance exact main SHA passes.

## 3. Global execution contract

1. One epic = one branch/worktree = one SourceCraft PR from current
   `origin/main`.
2. Delivery order is sequential. The next epic starts only after the preceding
   epic is merged and canonical `main` is refreshed.
3. Default delivery mode for S0–S14: `MERGE_AFTER_GATE`, subject to exact-plan
   owner approval. Direct push to `main` is forbidden.
4. Production, mirror and tag remain owner gates.
5. Schema changes use Payload migrations only. Applied migrations are never
   rewritten.
6. Contract changes use the project cycle `contracts:diff → review →
   contracts:lock/freeze` where the affected contract surface requires it.
7. `src/core/**` and `packages/**` contain no client city, brand, domain or
   project marketing literals.
8. Local WORK checks are scope-specific. Before merge:
   - STANDARD → `pnpm verify:merge-standard` and one exact-head STANDARD Gate;
   - RISKY → exactly one canonical `RISK_SCOPE`,
     `pnpm verify:merge-risky`, and one exact-head RISKY Gate;
   - `pnpm verify:schema` is mandatory for schema/data migration scope, not for
     every SEO/runtime change;
   - `pnpm verify:daily` may be used as a work checkpoint but does not replace
     the Merge Gate.
9. Every epic report uses Core §20 and lists only actually executed checks.
   `DONE`, `GREEN`, `PASS` and similar claims without evidence are forbidden.
10. Rollback is per epic: revert code/docs PR for non-persisted work; additive
    forward-fix or tested down/recovery path for persisted schema/data.

### Default Epic Contract for S0-S14

The following clauses apply to every implementation epic and are supplemented,
not replaced, by its local contract below.

- Source of Truth: this exact Plan №9 version and the active project documents,
  code, schema, migrations and tests named by the epic scope. Historical plans
  are evidence only and never supply missing requirements.
- Entry: Plan №9 is `APPROVED` and imported/reconciled cleanly; predecessor is
  merged; `origin/main` is refreshed; the new task worktree is clean; approved
  plan hash and runtime versions have not drifted.
- Exit: every acceptance item has observable evidence; scope-specific local
  checks pass; one review and exact-head SourceCraft Gate of the declared risk
  pass; PR is merged; execution ledger records checks, SHA and delivery state.
- Allowed actions: read, edit, test, commit, push, create PR, review, run the
  declared Gate and merge under `MERGE_AFTER_GATE`. Production, release/tag,
  mirror, new secrets, destructive external actions and unrelated repository
  changes are forbidden.
- Scope out: functionality not named by the epic, speculative infrastructure,
  hidden compatibility fallbacks and opportunistic redesign/refactor.
- Parallel-safe: none by owner delivery policy. A blocked epic pauses the graph;
  Developer records the blocker and does not skip to a later serial epic.
- Owner decisions: none before implementation. A new material choice, source
  drift or ambiguous acceptance returns the plan to Architect/owner.

### Execution prerequisites

- S0-S14 require no production, server, Secret Master or external repository
  access. SourceCraft credentials are used only for the authorized Git/PR/Gate
  flow and are never written to the plan or task evidence.
- DB-bound epics use native PostgreSQL 18 and a loopback test database through
  the project test environment; Docker/WSL and production data are not fallback.
- Version-sensitive Next.js/Payload work uses the installed dependencies and
  the matching local package documentation before code changes.
- If dependencies, test database or SourceCraft exact-head proof are unavailable,
  the current epic stops with evidence; no green status is inferred.

### Shared-contract ownership and freeze points

| Surface | Owning epic | Frozen for downstream use | Downstream consumers |
|---|---|---|---|
| ProjectSiteProfile v2 and reserved roots | S1 | after S1 merge | S2-S7, S9, S12-S14 |
| District and SEO-facet registries | S2 | after S2 merge | S3, S6, S7, S9, S12-S14 |
| PageKey/resolver/redirect semantics | S3 | after S3 merge | S4-S15 |
| `decidePage` and Gate decision | S4 | after S4 merge | S5-S15 |
| SEO template keys/morphology contract | S5 | after S5 merge | S6, S10A, S12-S14 |
| Generated SEO registry | S6 | after S6 merge | S7, S10A, S12-S14 |
| Development DTO/schema | S8 | after S8 merge | S9-S14 |
| Site settings/JSON-LD/sitemap | S10A | after S10A merge | S10B-S15 |
| Cache/tag invalidation contract | S11 | after S11 merge | S12-S15 |
| Acceptance matrix and guards | S12 | after S12 merge | S13-S15 |

Later epics may consume a frozen surface but may not silently redefine it. A
required semantic change returns to Architect as plan drift or becomes a new
explicitly approved scope.

## 4. Owner decisions

| ID | Decision | Impact | Status |
|---|---|---|---|
| D-09-01 | Plan №9 является self-contained: требования задаются этим документом без ссылок на другие master plans | Нет внешнего planning prerequisite; другие repositories вне scope | `DECIDED` |
| D-09-02 | SEO Registry = `CSV → validated typed registry in code`; CMS не является вторым owner | S6 создаёт один deterministic generation/validation path | `DECIDED` |
| D-09-03 | Исходный S10 разделён на S10A=`schema-data` и S10B=`ingest-jobs` | Один epic/PR/SHA использует ровно один RISKY scope | `DECIDED` |

## 5. FINDING REGISTER — final audit v3

| ID | Severity | Finding / evidence | Resolution or recommendation | Status |
|---|---|---|---|---|
| MP9-A01 | BLOCKER | В исходной основе были ссылки на неустановленный planning source | Ссылки удалены; все необходимые требования перенесены непосредственно в Plan №9 по D-09-01 | `RESOLVED` |
| MP9-A02 | MAJOR | `docs/02_PRODUCT_STRUCTURE.md` заявляет legacy `308`, а active geo contract требует legacy/canonical move `301` и slash normalization `308` | S0 приводит все SoT к одной семантике | `ACCEPTED` |
| MP9-A03 | MAJOR | Runtime resolver возвращает redirect только `308`; stored redirect и canonical move не различаются | S3 вводит typed `301 | 308` и direct-final transport | `ACCEPTED` |
| MP9-A04 | MAJOR | `evaluateContentGate` импортируется проверками, но не runtime route; metadata/data layer выставляют indexing отдельно | S4 — central wiring, guard обхода | `ACCEPTED` |
| MP9-A05 | MAJOR | Runtime `countInventory` возвращает `100` для non-listing entities | S3/S4 заменяют factual Gate inputs | `ACCEPTED` |
| MP9-A06 | MAJOR | District/facet URL registry сейчас project code fixtures; новый Admin district требует code edit | S2 — Payload district registry + project SEO facet registry | `ACCEPTED` |
| MP9-A07 | MAJOR | Русские marketing template strings находятся в `src/core/seo/registry.ts` | S5 оставляет в core только renderer and formatter | `ACCEPTED` |
| MP9-A08 | MINOR | `site-settings` Global и NAP Gateway уже существуют | S10 не создаёт второй Global; выполняет gap inventory и wiring | `ALREADY_COVERED / NARROWED` |
| MP9-A09 | MAJOR | Исходный S10 смешивал schema/DTO и IndexNow jobs в одном epic/PR, нарушая one-risk-scope gate | Разделён на S10A/S10B по D-09-03 | `RESOLVED` |
| MP9-A10 | MAJOR | S12 назван «блокирует merge» после S0–S11, но предыдущие PR уже должны быть merged sequentially | S12 блокирует только свой merge и все последующие S13/S14; не ретроактивно | `RESOLVED` |
| MP9-A11 | MINOR | `STANDARD+` не является каноническим gate class | S6/S9 нормализованы в STANDARD с дополнительными named checks | `RESOLVED` |
| MP9-A12 | MAJOR | S15 содержит production/tag action | Изолирован как OWNER/PRODUCTION gate, вне unattended graph | `RESOLVED` |
| MP9-A13 | MAJOR | Exact v2 relied on implicit entry/exit and allowed-action rules | Added one binding Default Epic Contract for S0-S14 | `RESOLVED` |
| MP9-A14 | MAJOR | DB/runtime/Git prerequisites were not fail-closed | Added explicit local prerequisites, prohibited fallbacks and stop behavior | `RESOLVED` |
| MP9-A15 | MAJOR | Shared contracts had consumers but no freeze/ownership map | Added owner and downstream matrix; semantic redefinition is plan drift | `RESOLVED` |
| MP9-A16 | MINOR | Preliminary count mixed implementation graph with release gate | Separated 16 implementation epics S0-S14 from S15 owner/release gate | `RESOLVED` |
| MP9-A17 | MINOR | Project router still exposed only closed Plan №8 and the old tag target | AGENTS/README/Backlog now point to exact v3 as approval-only planning basis; Plan №8 stays evidence | `RESOLVED` |

## 6. Dependency graph и delivery order

```text
S0
 └─ S1
     └─ S2
         └─ S3
             └─ S4
                 └─ S5
                     └─ S6
                         └─ S7
                             └─ S8
                                 └─ S9
                                     └─ S10A
                                         └─ S10B
                                             └─ S11
                                                 └─ S12
                                                     └─ S13
                                                         └─ S14
                                                             └─ S15 OWNER GATE
```

Это delivery serialization policy владельца. Не каждая связь технически HARD:
после S4 части S8–S11 могли бы выполняться параллельно, но для этого plan принят
последовательный merge flow. Следствие: blocked epic останавливает программу;
Night Run Readiness ожидаемо будет не выше `READY_WITH_LIMITS`, если политика
не изменится до финального аудита.

| Epic | Dependency type | Critical reason |
|---|---|---|
| S0→S1 | CONTRACT | SoT и baseline должны быть однозначны до нового profile contract |
| S1→S2 | HARD | Registry ownership зависит от schema Profile v2 |
| S2→S3 | HARD | Resolver должен получать factual district/facet registries |
| S3→S4 | HARD | Gate orchestration зависит от factual resolution and lifecycle |
| S4→S5 | CONTRACT | SEO renderer consumes one Gate/indexability decision |
| S5→S6 | HARD | CSV registry requires frozen template keys and morphology contract |
| S6→S7 | CONTRACT | Catalog facet paths and metadata need validated registry |
| S7→S8 | SOFT / delivery | Development schema technically separable, serialized by owner policy |
| S8→S9 | CONTRACT | Navigation/nearby consumes final entity DTO shape |
| S9→S10A | CONTRACT | Breadcrumb/links are inputs to structured data and sitemap |
| S10A→S10B | HARD | IndexNow events consume final decidePage/discovery model |
| S10B→S11 | SOFT / delivery | Cache is serialized after discovery event contract |
| S11→S12 | HARD | Acceptance matrix must verify final cache/runtime behavior |
| S12→S13 | HARD | Clone preset must run the finalized guards/matrix |
| S13→S14 | HARD | UI acceptance must cover generated clone profiles |
| S14→S15 | PRODUCTION | Release/tag only after final product proof and owner command |

## 7. Epic contracts

### EPIC-S0 — Canon and owner-decision reconciliation

- Outcome: project SoT consistently describes Starter v2.1 target and Plan №9
  baseline without activating execution.
- Scope: ADR `PLATFORM_LAYOUT`; update geo contract §6/§8, Product Structure,
  Architecture, Project, Backlog and target tag references; define
  `src/core/** + packages/**` as reusable platform surface; document
  `docs/UPSTREAM_CANDIDATES.md` lifecycle.
- Required corrections: facet transliteration `dvukhkomnatnye`,
  `trekhkomnatnye`; SINGLE_GEO non-primary hubs/listings = 404; legacy and
  canonical move = one 301; slash normalization = one 308.
- Dependencies: none after Plan approval.
- Acceptance: zero contradictory redirect/status/tag claims across active SoT;
  exact baseline SHA recorded; decisions D-09-01..03 linked.
- Verification: docs links, `git diff --check`, `pnpm verify:merge-standard`.
- Delivery: STANDARD, `MERGE_AFTER_GATE`.
- Rollback: revert docs PR.
- Stop: новый scope, отсутствующий в Plan №9, не добавляется по аналогии.

### EPIC-S1 — ProjectSiteProfile v2 explicit matrices

- Outcome: preset supplies overrideable defaults while the validated project
  config explicitly owns categories, markets, geos, developers, SEO tiers,
  Gate, static routes and modules.
- Scope: add `categoryStatus`, `marketCapability`, `geoCategoryStatus`,
  `marketStatus`, `developersSurface`, `seoTiers`, `gate`, `staticRoutes`,
  `modules`; split geo `published` from `hubStatus`; missing geo defaults to
  `PREPARED_OFF`; SINGLE_GEO requires exactly one routable primary hub, not one
  configured geo.
- SEO tiers: metric `broad39 | wordstat | searchDemand`; `P1 > P2 > TEST >= 0`;
  `unmeasuredPolicy NONE | TEST`; `SeoTier` includes `NONE`; NOINDEX_AUTO route
  exists with at least one active object and is not tied to `minInventory.TEST`.
- Reserved roots: platform roots (`journal`, `legal`, `poisk`, `sotrudniki`,
  `komplex`, `sitemap*`) + categories + project static slugs + module spaces.
  Remove or connect `projectConfig.reservedNamespaces` to this owner.
- Fixtures: single, multi, newbuild-first, secondary-first and
  `single-geo-three-cities` with three configured cities/two inactive hubs.
- Acceptance: `single-geo-three-cities` validates without core edit; invalid enabled
  geo/category/market combinations fail with precise paths.
- Verification: profile property matrix, invalid fixtures, typecheck,
  `verify:site-profile`, merge-risky `dependency-runtime`.
- Rollback: revert contract PR; no persisted data.
- Stop: fixture-specific literals enter reusable core/packages.

### EPIC-S2 — Data-driven districts and SEO facets

- Outcome: published district changes in Payload become resolvable without code
  edits; SEO facet routes exist only from a project-owned validated registry.
- Scope: cached district registry per geo×category from Payload; remove
  `projectDistrictSlugFixtures` from runtime; keep fixtures test-only; add
  `seoFacets: slug → {geo, category, filter}`; rename `facetWhitelist` to
  `filterKeys`; validate district/district, district/facet and reserved-subslug
  collisions. `proxy.ts` remains bounded and performs no district DB lookup.
- Acceptance: newly published Admin district resolves after cache invalidation;
  unknown facet returns 404; proxy has no district registry query.
- Verification: migration/schema proof if category enablement persists;
  integration tests on native test PostgreSQL; collision matrix;
  merge-risky `schema-data`.
- Rollback: additive migration recovery/forward-fix; revert registry wiring.
- Stop: design requiring unbounded/global proxy DB reads.

### EPIC-S3 — Resolver and redirect semantics

- Outcome: resolver produces factual direct-final decisions and honors geo and
  market matrices without synthetic counts.
- Scope: other geo hubs/listings in SINGLE_GEO → 404; global entities remain
  lifecycle/Gate-driven; lookup records return required market/geo/dataTier;
  redirect result supports `301 | 308`; legacy `/nedvizhimost` and
  `/obekty/*` use a declared manifest and one final 301; slash only 308;
  marketStatus affects results/counts/facets; remove `return 100`; category-first
  `/novostroyki/{geo}/` → 404.
- Acceptance: `parseUrl(buildUrl(k)) ≡ k` across five profiles; no chains/loops;
  D-10 uses the real data port; HTTP matrix covers 301/308/404/410.
- Verification: resolver/property tests, runtime HTTP smoke, typecheck,
  merge-risky `dependency-runtime`.
- Rollback: revert runtime contract PR; persisted redirect records unchanged.
- Stop: global slow proxy lookup or canonical move without final target.

### EPIC-S4 — One runtime Content Gate decision

- Outcome: `decidePage(pageKey)` is the only semantic source for status,
  robots, canonical, sitemap, IndexNow eligibility, menu and interlinks.
- Scope: compose resolver → factual Gate inputs → `evaluateContentGate`;
  listing/development/developer/secondary inputs from owner specification;
  newbuild lot always noindex; weak content is 200 noindex/follow,
  self-canonical and absent from sitemap; audited owner override cannot bypass
  OUT/PREPARED_OFF/lifecycle; guard direct `indexing: "index"` in app/public
  data access.
- Acceptance: required four-case matrix (district 1 object, development C,
  stale A prices, property fewer than 3 photos) returns exact decisions; no
  runtime indexing owner outside `decidePage`.
- Verification: pure matrix + real runtime route/metadata tests + guard;
  merge-risky `dependency-runtime`.
- Rollback: revert orchestration PR; old separate decisions are not retained as
  a silent fallback.
- Stop: Gate requires PII or unavailable client-side data.

### EPIC-S5 — Project-owned SEO templates and morphology

- Outcome: reusable core contains only renderer/optional-fragment engine,
  morphology rules and shared Russian plural formatter; all marketing templates
  and brand data are project-owned.
- Scope: project keys from owner input; optional `[...]` fragments disappear
  with punctuation when data is missing/stale; district template selected by
  type; morphology-approved city/district/preposition required for indexability;
  remove manual Title/H1 and `safeSeo` from geo-catalog; following always
  `follow`; brand comes from site-settings Gateway.
- Acceptance: no Cyrillic marketing phrases in `src/core/**`; exact snapshot
  cases include `на Северном в Ростове-на-Дону`; unapproved morphology cannot
  index.
- Verification: template snapshots, literal guard, DTO/runtime metadata proof,
  merge-risky `dependency-runtime`.
- Rollback: revert renderer/config PR.
- Stop: template duplicates client identity in core/package.

### EPIC-S6 — CSV SEO Registry pipeline

- Outcome: `docs/seo/SEO_REGISTRY_SEED.csv` deterministically validates and
  generates the typed project registry used by runtime.
- Scope: explicit columns derived from frozen registry contract, including
  PageKey/url/canonical/intent, metric/value/source/snapshot, tier/minimum,
  template/status/release/contentGateRule; sources
  `broad39|wordstat|webmaster|fallback_no_data`; null for fallback; synthetic
  rows cannot be approved; validate URL via buildUrl and duplicate URL/intent.
- Acceptance: five profile CSV fixtures; deterministic generated output;
  `pnpm seo:registry:check` included in `verify:daily`.
- Verification: parser/negative fixtures, generation idempotence,
  `verify:merge-standard`.
- Delivery: STANDARD; ADR records D-09-02 and rejects a competing CMS owner.
- Rollback: revert CSV pipeline PR.
- Stop: CMS and code become competing registry owners.

### EPIC-S7 — Catalog pagination, filters and truthful aggregates

- Outcome: catalog query behavior is server-validated, index-safe and based on
  bounded factual queries.
- Scope: Zod `page/sort/priceFrom/priceTo/rooms/district`; page≥2 and all query
  filters noindex/follow with defined canonical behavior; SSR pagination links;
  one approved SEO facet maps to clean path; developer projects query by
  relation without primaryGeo/48 cap; city developer aggregate is truthful;
  all counts respect marketStatus.
- Acceptance: E2E catalog→page2→entity; `vtorichka` only secondary; invalid
  query fails closed; pagination/filter canonical matrix passes.
- Verification: Gateway integration on test PostgreSQL, browser/E2E,
  query-bound proof, merge-risky `schema-data`.
- Rollback: revert query/UI PR; no schema unless explicitly proven necessary.
- Stop: unbounded aggregate or client-only canonical logic.

### EPIC-S8 — Development model v2

- Outcome: development availability, room prices, media and completeness are
  persisted and exposed consistently across Admin/import/DTO/UI/JSON-LD.
- Scope: migrate sales status; add salesAvailability, districtRaw,
  completenessScore, priceByRooms, media types and capturedAt rule; D-14 hides
  prices older than 45 days and computes fresh minimum; update Excel/import/DTO;
  published slug remains immutable; public development/developer reads include
  explicit published predicate.
- Acceptance: clean + non-empty upgrade fixture; old values mapped; stale prices
  absent from UI/JSON-LD; invalid construction media rejected; unpublished rows
  absent from public reads.
- Verification: `verify:schema`, migration integration, import repeat, DTO/UI
  tests, merge-risky `schema-data`.
- Rollback: tested additive recovery/forward-fix; no production data action.
- Stop: lossy status mapping without explicit fallback.

### EPIC-S9 — Breadcrumbs, nearby and profile navigation

- Outcome: all internal navigation is PageKey/Gate-derived and never links to a
  404 or redirect.
- Scope: shared breadcrumb builder; inactive geo is text; nearby uses
  agglomeration only and preserves actual city; menu/GeoSwitcher from profile;
  SINGLE hides switcher; create only an interactive leaf if component absent.
- Acceptance: crawl guard zero bad links; same breadcrumb semantics in SINGLE
  and MULTI; nearby counts do not pollute current geo.
- Verification: navigation matrix, UI state/a11y, `verify:merge-standard`.
- Delivery: STANDARD.
- Rollback: revert navigation PR.
- Stop: link owner bypasses PageKey/decidePage.

### EPIC-S10A — Site settings, JSON-LD and sitemap

- Outcome: existing `site-settings` Global is the only public brand/NAP owner;
  structured data and sitemap consume Gateway DTO + decidePage.
- Scope: gap inventory existing Global; add only missing fields via migration;
  remove brand/NAP business values from site.config; RealEstateAgent,
  BreadcrumbList, ApartmentComplex/AggregateOffer, visible-only FAQPage and
  secondary Offer; sitemap groups from owner input; factual updatedAt only.
- Acceptance: no invented lastmod; no hidden FAQ JSON-LD; stale prices excluded;
  every sitemap URL returns 200 and is indexable by decidePage.
- Verification: `verify:schema` if fields change, JSON-LD snapshots, sitemap
  crawl, merge-risky `schema-data`.
- Rollback: additive migration recovery + revert discovery PR.
- Stop: second settings owner or raw Payload document in public UI.

### EPIC-S10B — IndexNow on Gate decision transitions

- Outcome: IndexNow enqueues only same-origin canonical URLs when the Gate
  decision materially changes.
- Scope: events for publish/archive/canonical move/indexability change;
  dedupe/retry and secret-safe payload; no deploy-wide submission.
- Acceptance: event matrix emits expected URLs exactly once; foreign host and
  secret leakage rejected; failures remain observable/retryable.
- Verification: jobs integration, queue config, retry/idempotence,
  merge-risky `ingest-jobs`.
- Rollback: disable event enqueue/revert PR; queue remains recoverable.
- Stop: external request inside DB transaction or job payload contains secret.

### EPIC-S11 — Cache tags and measured budget

- Outcome: Public Gateway reads use bounded tag identities and invalidation
  graph; warmed fixture meets Core §12.2 budget without speculative infra.
- Scope: exact tags from owner input; related-entity invalidation;
  Excel/feed coalescing; remove force-dynamic only with installed Next 16.3.5
  docs proof; retain authenticated HTTP invalidation default.
- Acceptance: no stale related surface after mutation; no per-item mass
  revalidation; p95 list≤300ms/detail≤200ms on documented ~2k fixture protocol.
- Verification: installed Next docs evidence, cache integration and raw timings
  on native PostgreSQL 18 with the documented ~2k fixture; record environment,
  query shape, warm-up, at least 30 measured requests per surface and computed
  p95 for list/detail; merge-risky `dependency-runtime`.
- Rollback: restore previous caching directives/facade; no infra addition.
- Stop: budget failure leads to query/index/cache analysis, not automatic Redis.

### EPIC-S12 — Guards and five-profile acceptance matrix

- Outcome: architecture/runtime invariants fail closed before subsequent clone
  and UI work can merge.
- Scope: block literal href mode; generated project literal denylist over
  core/packages; static route folder↔registry parity; Gate ownership guard;
  no-links-to-404 guard; full owner matrix across five profiles; jobs config
  including `enableConcurrencyControl` and queue semantics.
- Acceptance: every listed matrix row has deterministic fixture/runtime proof;
  every sitemap URL 200; category-first 404; D-10 real port; MULTI switcher
  visible; entity URLs stable.
- Verification: guard negative fixtures, acceptance runner,
  `verify:merge-standard`.
- Delivery: STANDARD. This epic blocks S13/S14 merges, not historical S0–S11.
- Rollback: revert guard/matrix PR.
- Stop: guard suppressions or mutable baseline snapshots.

### EPIC-S13 — Clone preset v2

- Outcome: four schemaVersion 2 presets generate complete project-owned clone
  inputs in a clean checkout without touching protected platform surfaces.
- Scope: fields from owner input; templates or explicit template-file ref;
  generated literal denylist; presets single-geo-three-cities/secondary-only/
  newbuild-only/multi-geo; v1 fails with migration guidance.
- Acceptance: every preset passes clean `clone:prepare`, `verify:daily` and S12
  matrix; protected `src/core/**`, `packages/**`, migrations and quality guards
  have zero unauthorized diff.
- Verification: `verify:clone-bootstrap`, idempotence, clean-checkout diff,
  merge-risky `dependency-runtime`.
- Rollback: revert generator/schema PR; preserve v1 migration message.
- Stop: preset contains secret or silently activates S3/storage topology.

### EPIC-S14 — Canonical UI Core v5 surfaces

- Outcome: existing visual system renders final v2.1 routes and states without
  second primitives or silent redesign.
- Scope: update DESIGN representative routes/viewports; ListingView,
  DevelopmentDetailsView, price/layout/progress/FAQ anchors, lead surface,
  analytics dimensions without PII; REUSE→VARIANT→CREATE.
- Acceptance: canonical responsive pages, pagination/filter states, sales-ended
  state, lead form contract and analytics dimensions proven; no 404/redirect
  links; no design-system drift blockers.
- Verification: `verify:ui-core`, browser matrix, accessibility, visual proof,
  explicit read-only UI Drift Audit, `verify:merge-standard`.
- Delivery: STANDARD.
- Rollback: revert UI PR; contracts remain backward-compatible or change via
  approved lock cycle.
- Stop: redesign, second primitive or new UI dependency without owner decision.

### EPIC-S15 — Starter v2.1 release owner gate

- Outcome: only after explicit owner command, exact canonical main is eligible
  for immutable tag/release.
- Preflight: full `pnpm verify`, `verify:schema`,
  `verify:integration:required`, S12 matrix and all four presets; clean main;
  exact SourceCraft CI evidence; release runbook and rollback point.
- Actions requiring separate authorization: create `starter-v2.1.0`, deploy
  starter demo, live smoke and SourceCraft→GitHub mirror.
- Delivery: `OWNER / PRODUCTION`; not a normal Developer ready task.
- Stop: no release command, dirty main, changed SHA,
  missing artifact/rollback or any red/unknown required proof.

## 8. Final four-pass audit of exact v3

### Pass 1 — logic and completeness

- All 16 supplied implementation epics are represented as S0-S14; original S10
  is deliberately split into S10A/S10B to preserve one RISKY scope per PR.
- Every implementation epic has outcome, in-scope work, measurable acceptance,
  verification, rollback and stop conditions through its local plus default
  contract. S15 is a separate later owner/release gate.
- Blockers: 0. Major findings open: 0. Ambiguous critical DoD: 0.

### Pass 2 — architecture, data and security

- Payload/PostgreSQL remain the only backend/data owners; migrations are
  additive; public reads remain Gateway/DTO-based; project-to-core dependency
  direction and client-literal boundary are preserved.
- Content Gate, URL/redirect semantics, registry ownership, PII boundaries and
  production isolation have named owners and fail-closed verification.
- Architecture/security blockers: 0. Major findings open: 0.

### Pass 3 — dependencies and autonomy

- Cycles: 0. HARD dependencies: 8. CONTRACT dependencies: 5. SOFT delivery
  dependencies: 2. PRODUCTION dependency: 1.
- Independent technical work exists after S4, but the owner-mandated delivery
  policy creates one serialized wave. Shared-contract freeze points prevent
  downstream redefinition.
- Single blocking points: every current epic by deliberate serialization. This
  cannot be safely removed without changing the owner's explicit delivery order.

### Pass 4 — execution and evidence

- Implementation graph: 16 epics (`S0-S9`, `S10A`, `S10B`, `S11-S14`). Every
  epic has acceptance and verification; wired/live promises name a runtime,
  browser, DB, HTTP, job, import or generated-clone surface.
- S15 is not imported as unattended implementation. It remains blocked by a
  separate owner release command and exact canonical-main proof.
- Before-approval owner decisions: 0. Later owner decisions: 1 (S15 release).

### MASTER PLAN AUDIT

```text
Logic/completeness
  blockers: 0
  major: 0
Architecture/data/security
  blockers: 0
  major: 0
Dependency/autonomy
  cycles: 0
  hard dependencies: 8
  softened dependencies: 2
  independent waves: 1 serialized wave by owner policy
  single blocking points: every current epic by explicit sequential delivery
Executability/evidence
  implementation epics with acceptance: 16/16
  implementation epics with verification: 16/16
  wired/live without reachableVia: 0
Owner decisions
  before approval open: 0
  later open: 1 release authorization for S15
Night Run Readiness: READY_WITH_LIMITS
```

`READY_WITH_LIMITS` means the exact v3 graph is executable and has no unresolved
planning blocker, but it cannot skip a blocked epic because the owner explicitly
required strict sequential merge delivery. Removing that limit would change the
approved execution policy rather than merely improve the graph.

## 9. Revision packet and history

### Revision input `MP9-R1`

- Source: owner.
- Targets: Starter v2.1 clone readiness, 16 supplied epics, sequential delivery.
- Accepted: product goal, S0–S15 scope, no production/tag default, one PR per
  epic, migrations-only, contract lock cycle, platform literal boundary.
- Corrected: canonical gate commands, risk scope usage, legacy 301 vs slash 308,
  S12 merge meaning, partial site-settings duplication.
- Needed owner at v1: source references, SEO registry ownership and S10 split;
  all were resolved in MP9-R2 by D-09-01..03.
- Rejected: none. `STANDARD+` normalized to STANDARD because it is not a gate
  class; required extra checks remain explicit.
- Sections changed: full normalized plan, dependency graph, epic contracts,
  findings and owner decisions.
- Resulting version: `v1 REVIEW`.

### Revision input `MP9-R2`

- Source: owner.
- Accepted: Plan №9 is self-contained; unrelated project plans and repositories
  are out of scope; SEO Registry uses CSV → validated typed code; S10 is split
  into S10A/S10B.
- Removed: all dependencies on another master plan, its section numbers,
  repository identity and future repin.
- Renamed: the reusable three-city reference fixture is
  `single-geo-three-cities`, without client/project identity.
- Owner decisions remaining before approval: 0.
- Sections changed: non-goals, decisions, findings, S0/S1/S6/S13/S15,
  readiness summary and handoff.
- Resulting version: `v2 REVIEW`.

### Revision input `MP9-R3`

- Source: final Architect audit of exact v2 against the owner brief, active
  project canon, package scripts and runtime ownership.
- Accepted without scope expansion: all S0-S15 product requirements and owner
  decisions D-09-01..03.
- Corrected: binding default epic contract, local prerequisites, shared-contract
  ownership/freeze points, S11 measurement protocol and implementation-vs-release
  graph count; project router/docs map/backlog were synchronized without
  activating execution.
- Four exact-v3 audit passes: `PASS`; open blockers/major findings/owner
  decisions before approval: `0/0/0`.
- Resulting version: `v3 READY_FOR_OWNER_APPROVAL`.
- Owner approval: exact v3 approved on 2026-09-25; approval handoff authorized.

| Version | Date | Status | Input | Result |
|---|---|---|---|---|
| v0 | 2026-09-25 | DRAFT | Owner attachment `STARTER v2.1 — готовность к клонам` | Existing plan basis accepted for assembly |
| v1 | 2026-09-25 | REVIEW | MP9-R1 canon/runtime reconciliation | Executable contracts drafted; four owner decisions registered; final audit not started |
| v2 | 2026-09-25 | REVIEW | MP9-R2 owner decisions | Self-contained scope; registry path and S10 split fixed; zero before-approval decisions; final audit not started |
| v3 | 2026-09-25 | APPROVED | MP9-R3 final four-pass audit + explicit owner approval | Exact approved execution source; READY_WITH_LIMITS only because delivery is intentionally serial |

## 10. Current handoff state

```text
Plan: AMS-REALTY-BAZA-STARTER-V2-1-CLONE-READINESS-9 v3 APPROVED
Phase: APPROVAL_HANDOFF
Task Manager import: PENDING VALIDATE / INIT / IMPORT / RECONCILE
Developer handoff: PENDING CLEAN RECONCILIATION
Production: NOT AUTHORIZED
Next: docs checkpoint → inventory v2 → Task Manager → Developer goal
```

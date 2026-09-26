# AMS MASTER PLAN №10 — CLONE-READY 2.1

Plan ID: AMS-REALTY-BAZA-CLONE-READY-2-1-10
Version: v4
Status: APPROVED
Phase: APPROVAL_HANDOFF
Approved by: owner
Approved at: 2026-09-27T00:22:37+03:00
Baseline: SourceCraft `main@5e599bb544fbc15a7981536d3557e5abaf8af374`
Input: owner specification «Plan 10 Clone-Ready 2.1», received 2026-09-26
Delivery profile: `COMMERCIAL`
Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`
Production authorization: `NONE`

Этот документ — единственная canonical основа Plan №10. Он развивает
исполненный Plan №9 v6 и не переоткрывает закрытые задачи S0–S14. Plan №9,
планы №2–8 и их evidence используются только для проверки исходного состояния.

Требования из owner specification записаны здесь самодостаточно. Ссылка на
внешний Master Plan «Союза» v4.1.1 считается provenance/reference, а не
необходимым execution prerequisite: ни одна задача не должна извлекать
недостающие требования из другого repository или документа.

## 1. Primary goal и границы

### Primary goal

Довести Starter v2.1 до детерминированного client-clone контура: один источник
preset-конфигурации, профильный geo/SEO bootstrap без fixture leakage,
корректный runtime SEO и Content Gate, bounded public reads, воспроизводимый
release package и исполняемые pre-production/live-proof инструменты.

### Major outcomes

1. Clone preset schema v3 расширяет v2 явными overrides и генерирует SiteProfile
   без второго набора preset-логики.
2. География, районы, морфология, SEO tiers, registry и client skeleton
   формируются из утверждённого project profile; starter fixtures разрешены
   только при `projectKind=starter-demo`.
3. Runtime metadata, breadcrumbs, analytics и Content Gate используют реальные
   entity facts, шаблоны и единый URL contract.
4. Developer/Gate/sitemap paths используют bounded batch reads; бюджет Public
   Gateway доказан на fixture из 2000 объектов.
5. CSP/HSTS остаются fail-closed и добавляют provider-specific allowlist только
   по явному env.
6. Clone/release/runbook документы соответствуют runtime, а release artifact,
   live smoke и Core §18A proofs имеют исполняемые CLI entrypoints.
7. Scope доставляется ровно тремя последовательными delivery batches: три
   branch/worktree, три PR, три exact-head Gate и три merge.

### Non-goals

- production rollout, DNS, server mutation или live proof без отдельной команды;
- создание/перемещение tag `starter-v2.1.0`;
- GitHub как primary или bidirectional mirror;
- новый ORM/auth/backend, новая CMS или второй SEO registry owner;
- redesign, новая visual language или замена UI foundation;
- client-specific production secrets, credentials или infrastructure purchase;
- импорт Plan №10 в Task Manager до owner approval exact version;
- изменение других repositories, включая reference project «Союз».

## 2. MASTER PLAN MAP

### Platform и ownership

- Platform: AMS Realty Platform Core Standard 5.5, `REALTY_BASE`, `BUILD`.
- Runtime: Next.js `16.3.5`, React `19.2.8`, Payload `3.90.1`, PostgreSQL.
- Payload — единственный owner schema, migrations, auth и Admin.
- Public data: Public Gateway → access/select → DTO → UI.
- Project composition owns presets, morphology, templates, registries and
  client bootstrap. `src/core/**` and `packages/**` stay client-neutral.
- SEO Registry owner: project CSV/profile pipeline → validated typed registry.
- UX scope: public commercial + CMS-native Payload Admin; existing Project
  Design System is reused.

### Existing baseline reused

- Plan №9 v6 S0–S14 is `EXECUTION_COMPLETE`.
- ProjectSiteProfile v2, URL grammar, resolver, Content Gate, project SEO
  templates, CSV registry, bounded gateway foundation and clone preset v2 exist.
- Current known drifts are explicit Plan №10 inputs, not evidence that Plan №9
  was incomplete at its approved snapshot.

### Shared contracts changed by Plan №10

- preset schema v3 and `createPresetSiteProfileConfig`;
- geo/district morphology and bootstrap contract;
- SEO tier metric/derivation and generated registry contract;
- project template key set and materialized metadata parity;
- Content Gate entity facts and bounded developer/sitemap reads;
- release artifact manifest and live-proof CLI contract.

### Data/schema boundary

- District bootstrap uses existing Payload-owned geo/district model where it
  can express the contract.
- Persisted `gatePassed` is outside approved v4 scope. A measured failure of
  the bounded-query option stops B2 and requires a new reviewed plan version.
- Applied migrations are never rewritten. Clean and non-empty upgrade proofs
  are mandatory for any new migration.
- The district enum migration is forward-compatible: add `admin_district` and
  `vo`, migrate deterministic existing rows, keep the old DB label
  `administrative` deprecated for compatibility, and remove it only in a later
  explicitly approved compaction migration. Down/recovery maps new rows back
  before reverting application code.

### Security and production boundary

- System/Ingest Gateway is the only privileged write path for geo seed.
- External image hosts remain constrained by `EXTERNAL_IMAGE_HOSTS`.
- Analytics allowlist is provider-specific; absent env adds nothing.
- `HSTS preload` is opt-in through `HSTS_PRELOAD=true`.
- Scripts may build and inspect an artifact or call an explicitly supplied
  origin. They may not select a production target, deploy, mutate DNS or read
  production secrets autonomously.
- Mutating proof scenarios require an explicit proof-capable staging/demo
  identity, synthetic data marker and cleanup/reconciliation contract.

## 3. Global execution contract

1. Delivery topology is fixed: `B1 → B2 → B3`; cycles = 0.
2. One batch = one branch/worktree = one SourceCraft PR = one merge.
3. Every implementation task ends with its own commit/push and
   `EXECUTION_LEDGER_V1`; the batch delivery task owns the only PR/Gate/merge.
4. All three batches use `MERGE_AFTER_GATE` only after exact Plan №10 version is
   approved and imported CLEAN into Task Manager.
5. B1 is `RISKY schema-data`: the persisted district enum changes from
   `administrative` to `admin_district` and requires a Payload migration. B2 is
   `RISKY dependency-runtime`; B3 is also `RISKY dependency-runtime` because
   executable release/runtime tooling and the Docker build are in scope.
6. During a batch only task-specific checks run. At batch exit local
   `pnpm verify:daily` runs once; the exact-head SourceCraft RISKY Gate runs
   `verify:merge-risky`, whose nested `verify:merge-standard` is recorded as
   Gate evidence rather than launched a second time locally.
7. SourceCraft exact-head Gate runs once per batch after review and local proof.
8. `pnpm verify` and `pnpm verify:clone-matrix` run once in B3 final acceptance,
   not after every task.
9. A new commit after Gate invalidates exact-head proof.
10. Production, release tag and actual live proofs remain owner gates.
11. When a conflict with canon is found, create a concrete `NEEDS_OWNER` entry
    in `docs/04_BACKLOG.md`, block only the affected task and continue other
    independent safe work inside the current approved graph.
12. Reports use Core §20 and list only checks actually executed.
13. B1 starts from the exact APPROVED Plan №10 checkpoint commit. Its single PR
    therefore delivers both the approved plan/docs and B1 implementation to
    `main` without creating a fourth PR. B2 and B3 start from refreshed
    canonical `origin/main` after the preceding batch merge.

### Default task contract

- Source of Truth: exact approved Plan №10, active project canon, code, schema,
  migrations and tests named in task scope.
- Entry: predecessor dependency closed; batch worktree clean; `origin/main`
  refreshed at batch start; approved plan hash unchanged.
- Allowed: read/edit/test, additive migration when explicitly required,
  commit/push and plan-authorized SourceCraft delivery.
- Forbidden: production, tag, mirror, new secrets, destructive data action,
  unrelated refactor and cross-repository writes.
- Rollback: revert unmerged task commit; after merge revert batch PR for
  non-persisted work; persisted data/schema uses tested forward-fix/recovery.
- Stop: source drift, ambiguous destructive action, unknown credential/target,
  red required check, changed Gate SHA or requirement contradicting platform
  hard contract.

## 4. Decisions fixed in v1

| ID | Decision | Result |
|---|---|---|
| D-10-01 | External «Союз» plan is reference-only | This plan contains the executable requirement; no hidden cross-repo dependency |
| D-10-02 | Preset logic has one owner | Extract a project-owned `src/project/site-profile-presets.ts`; both runtime profile composition and clone tooling consume it under Node strip-types; core/packages remain client-neutral |
| D-10-03 | Preset v3 is backward-explicit | v2 is rejected with a migration hint; no silent interpretation of old input |
| D-10-04 | SEO tier is derived | `metric` is `SeoTierMetric`; `tier` is computed from profile bands/value/unmeasured policy and checked against CSV |
| D-10-05 | District taxonomy is explicit | `admin_district | microdistrict`; templates are separate keys and selected from district type |
| D-10-06 | Runtime metadata has one renderer | Registry materialization must equal runtime template render for the same context |
| D-10-07 | Performance uses bounded reads only in approved v4 scope | If the bounded query cannot meet the budget, B2 stops and returns to Architect; persisted `gatePassed` requires a new plan version and schema-data decision |
| D-10-08 | Live proof remains operator-triggered | Scripts are implemented/tested pre-production; actual target and execution require release intent |
| D-10-09 | Live mutation proofs require an isolated proof contour | Lead/retention/recovery scenarios run only against an explicitly identified staging/demo proof environment with synthetic markers and cleanup; production needs a separate destructive-proof authorization |

## 5. Delivery DAG и contract freeze points

```text
B1-T1 preset owner/schema
  ├─> B1-T2 geo/district morphology
  ├─> B1-T3 SEO metric/registry
  └─> B1-T4 clone prepare/readiness/routes
        └─> B1-T5 clone matrix
              └─> B1-D delivery
                    └─> B2 runtime correctness/performance/security
                          └─> B2-D delivery
                                └─> B3 docs/UI/release package/proofs
                                      └─> B3-D delivery
```

| Freeze | Owner | Available after | Consumers |
|---|---|---|---|
| Preset v3 / profile overrides | B1-T1 | task checkpoint | B1-T2–T5, B2, B3 |
| Geo/district morphology | B1-T2 | task checkpoint | B1-T3–T5, B2-T1–T4 |
| Metric/tier/registry generation | B1-T3 | task checkpoint | B1-T4–T5, B2 metadata/Gate |
| Clone matrix | B1-T5 | B1 merge | B2 acceptance, B3 final proof |
| Runtime metadata/Gate contract | B2-T1–T4 | respective checkpoints | B2-T5–T8, B3 docs/proofs |
| Bounded query strategy | B2-T6 | task checkpoint | B2 acceptance, B3 final proof |
| Release CLI contract | B3-T3–T5 | task checkpoints | B3 final acceptance |

## 6. BATCH B1 — Clone config и SEO registry v3

Batch risk: `RISKY schema-data`. Batch outcome: four reference profiles can be
prepared in clean temporary clones without client/fixture leakage, and existing
district rows migrate safely to the v3 taxonomy.

### B1-T1 — Single preset owner and preset schema v3

- Outcome: one implementation generates preset defaults; v3 adds optional
  overrides validated by `siteProfileSchema`.
- Scope: extract preset/default composition from `src/project/site-profile.ts`
  into project-owned `src/project/site-profile-presets.ts`; make
  `scripts/clone-preset.mjs` consume it with Node `--experimental-strip-types`;
  remove duplicate status/static/filter/module/default logic from clone tooling;
  support overrides for `categoryStatus`,
  `marketCapability`, per-geo `geoCategoryStatus`/`marketStatus`,
  `developersSurface`, `seoFacets`, `filterKeys`, `seoTiers`, `gate`,
  `staticRoutes`, `legacyRoutes`.
- Acceptance: a guard fails when preset logic is defined in two places; v2
  input fails with an actionable v2→v3 migration hint; invalid override fails
  through the canonical schema.
- Verification: preset unit/negative cases, `verify:site-profile`,
  `verify:clone-prepare`, typecheck.
- Rollback: revert task commit; v2 runtime code remains untouched until batch
  merge.
- Stop: importing project code from core/packages or introducing a second schema.

### B1-T2 — Geo/district morphology and idempotent seed

- Outcome: client bootstrap can seed region, cities and typed districts through
  the privileged project gateway with approved morphology.
- Scope: require geo `preposition`; add `districts[]` with `slug`, `name`,
  `type`, `locative`, `preposition`, `synonyms`, `parent`; migrate persisted
  `districtType=administrative` to `admin_district` through the
  forward-compatible enum sequence defined above; add `vo` to allowed city
  and district prepositions; map preset `locative` to Payload morphology
  `prepositional`; regenerate Payload types; add
  `pnpm clone:seed-geo`; generalize/reuse the existing ordered
  `StarterFixtureSeedPort` geo-upsert engine through System/Ingest Gateway
  rather than creating a second seeder.
- Acceptance: repeated seed produces no duplicates; invalid parent/type/
  morphology fails before write; no raw anonymous Payload REST or direct DB.
- Verification: schema cases, clean migration and non-empty upgrade fixture,
  generated-type check, gateway integration against test PostgreSQL,
  idempotence proof, `verify:geo-hierarchy`, `verify:schema`.
- Rollback: additive seeded records use documented project identity and a
  tested cleanup/reseed path in non-production fixtures only; migration
  recovery remaps new enum values before application rollback.
- Stop: existing rows cannot be mapped deterministically, a parent crosses the
  city boundary, or the migration would rewrite historical migration files.

### B1-T3 — SEO metric, tier derivation and profile-owned registry

- Outcome: registry metric and tier are derived from SiteProfile; grammar uses
  project geos/districts, with fixture grammar only for starter demo.
- Scope: replace `metric: "searchDemand"` literal with `SeoTierMetric`; parse
  enum from CSV; compute tier from value/bands/unmeasured policy; reject CSV
  tier mismatch; generate registry from project profile and
  `docs/seo/DISTRICTS.csv` or bootstrap source.
- Acceptance: client generation imports no fixture registry; starter-demo
  remains deterministic; generated row rendering and URL use the same profile.
- Verification: parser negative cases, deterministic generate/check,
  `verify:seo-registry`, `seo:registry:check`.
- Rollback: revert code and regenerated starter seed together.
- Stop: competing CMS/CSV registry owner or unverifiable district source.

### B1-T4 — Souz example and clone preparation semantics

- Outcome: `docs/CLONE_PRESET.souz.example.json` expresses the complete owner
  matrix without relying on the external reference at execution time.
- Scope: MIXED/SINGLE_GEO; active Rostov-on-Don with all MIXED catalog
  categories active and both markets active; Bataysk and Aksay
  `PREPARED_OFF` with `agglomerationOf=rostov-na-donu` and every per-geo
  category/market status `PREPARED_OFF`; `broad39` bands `500/100/50`,
  `unmeasuredPolicy=NONE`; `vtorichka` facet; profile-driven readiness;
  client SEO skeleton; remove Primorsk fixture artifacts; static/legacy rules.
- Required route rules: `/sdat` exists only when `arenda != OUT`;
  `/nedvizhimost` is legacy 301 and cannot be an indexable static route; an
  indexable route cannot collide with a legacy root.
- Required readiness: SECONDARY_FIRST does not require development Excel;
  NEWBUILD_FIRST does not require a secondary feed.
- Acceptance: `clone:prepare` writes `projectKind=client`, draft synthetic=false
  fallback skeleton for home, geo hub, active geo×category, facets and
  geoDevelopers; no `primorsk`/`Приморск` remains in client tree; repeated run
  is safe according to clone contract.
- Verification: `verify:clone-bootstrap`, registry URL guard, targeted clone
  preparation cases.
- Rollback: regenerate starter-owned seed from canonical starter inputs.
- Stop: example requires secrets or production topology values.

### B1-T5 — Four-profile clone matrix

- Outcome: one proof command validates clone preparation for four profile
  shapes on disposable copies.
- Scope: add `pnpm verify:clone-matrix`; profiles: Souz, NEWBUILD_FIRST,
  SECONDARY_FIRST, MULTI_GEO; run `clone:prepare`, registry generation,
  typecheck and site-profile checks in proof mode.
- Acceptance: every disposable tree is client-kind, fixture-free and passes
  registry URL checks; failures retain a safe diagnostic without secrets.
- Verification: execute `verify:clone-matrix` once before B1 delivery.
- Rollback: proof only; temporary copies are removed through the test harness.
- Stop: command mutates the source worktree or depends on production secrets.

### B1-D — Review, Gate and merge

- Entry: B1-T1–T5 committed/pushed with ledgers; combined worktree clean.
- Checks: targeted checks already recorded; then local
  `pnpm verify:clone-matrix` and `pnpm verify:daily` once. The exact-head
  SourceCraft Gate runs `RISK_SCOPE=schema-data pnpm verify:merge-risky`, which
  includes `verify:schema`, required DB integration and nested STANDARD proof.
- Delivery: create one SourceCraft PR → full diff review → one exact-head
  SourceCraft RISKY Gate → merge → safe cleanup. Any new commit repeats only
  invalidated batch proof.

## 7. BATCH B2 — Runtime SEO correctness, performance and headers

Batch risk: `RISKY dependency-runtime`. Persisted denormalization is outside
approved v4 scope. Batch outcome: factual metadata/Gate/navigation with bounded
reads and measured performance.

### B2-T1 — Property Gate facts

- Outcome: secondary property indexability counts all valid managed and
  allowlisted external images and uses actual district input.
- Scope: respect `EXTERNAL_IMAGE_HOSTS`; pass `rawDistrictRef=districtRaw`.
- Acceptance: fixture with three allowed external photos indexes; two photos
  returns noindex; disallowed/invalid URLs never count.
- Verification: content-gate unit/runtime cases and safe outbound checks.
- Rollback: revert fact adapter task.
- Stop: host validation is bypassed or fetch is introduced into Gate evaluation.

### B2-T2 — Typed district templates and materialized metadata parity

- Outcome: admin districts and microdistricts use different template keys;
  registry materialization equals runtime render.
- Scope: add `categoryGeoDistrictAdmin`, `categoryGeoDistrictMicro`,
  `{districtAdjLocative}`; select by district type; home uses `home` template
  and static Gate; property context uses real city and price freshness from
  `priceCheckedAt`; regenerate the typed registry/seed because this task changes
  the B1-frozen template key contract.
- Acceptance: snapshot includes «Купить квартиру на Северном в
  Ростове-на-Дону — цены» and an admin-district adjective case; registry guard
  fails on any title/H1/description mismatch.
- Verification: template snapshots, runtime metadata proof, deterministic
  registry generation/check, `verify:seo-registry` and registry guard.
- Rollback: regenerate seed after reverting key-set and renderer together.
- Stop: runtime or page retains independent metadata literals.

### B2-T3 — Developer SEO and Gate parity

- Outcome: developer root/by-geo pages render only from `developerRoot` and
  `geoDevelopers` templates and use all relevant published cities.
- Scope: add `developerRoot` template key; evaluate «development passed Gate»
  across all cities; give geo developer hub registry/intro parity with listings.
- Acceptance: MULTI_GEO root includes every published city; a qualifying
  development outside primaryGeo is counted; weak registry/intro fails Gate.
- Verification: resolver/template/Gate matrix and runtime SEO checks.
- Rollback: revert task with regenerated registry.
- Stop: query becomes unbounded or primaryGeo fallback hides factual data.

### B2-T4 — Canonical breadcrumbs

- Outcome: the existing `projectBreadcrumbs`/project navigation builder becomes
  the one producer of HTML and JSON-LD crumbs from `buildUrl`.
- Scope: object path is Home → category → linked city when hub active → object;
  development in inactive city shows city text without link; remove page literals.
- Acceptance: HTML and JSON-LD labels/URLs have exact parity; inactive city is
  not linked; canonical URL builder is the only link source.
- Verification: navigation/structured-data snapshots and runtime route cases.
- Rollback: revert builder consumer task.
- Stop: a second URL grammar or page-local breadcrumb contract appears.

### B2-T5 — Analytics, lead kind and filter parity

- Outcome: analytics uses entity geo, development leads use the existing
  contract mapper, and all declared profile filters are supported end to end.
- Scope: entity geo for development/property; UI context
  `formKind=development` maps through the existing lead mapper to the persisted
  `development_price` kind; use explicit contracts diff/lock only if the
  current mapper/contract cannot express that mapping;
  align `filterKeys` and parser; include area/market and newbuild
  developer/completionYear.
- Acceptance: guard proves every profile filter key is parsed and represented
  by UI; unknown query fails closed; no forced primaryGeo analytics value.
- Verification: contracts diff when required, analytics/filter tests,
  `verify:catalog-query`, `verify:lead-analytics`.
- Rollback: revert compatible contract/runtime commit; frozen contract change
  follows project contract recovery procedure.
- Stop: contract drift is hidden without diff/freeze evidence.

### B2-T6 — Bounded Gate and sitemap reads

- Outcome: developer qualification and sitemap generation avoid per-entity
  resolver/query amplification.
- Scope: replace `passingDevelopmentDeveloperIds` loop with one bounded facts
  query; sitemap consumes batch Gate facts without `resolveRuntimeRoute` per URL.
  Persisted `gatePassed` is not an implementation fallback in this version.
- Acceptance: query-count guard is bounded independently of entity count;
  sitemap URLs preserve exact Gate semantics; no N+1 regression.
- Verification: integration query-count proof and discovery feed tests.
- Rollback: revert bounded query implementation.
- Stop: bounded reads cannot meet the declared budget; return to Architect for
  a new schema-data plan version instead of adding denormalized state silently.

### B2-T7 — Public Gateway performance budget

- Outcome: `measure:public-gateway-budget` proves Core §12.2 on deterministic
  2000-object fixture.
- Scope: extend the existing measurement harness with deterministic 2000-object
  setup, documented warm-up/sample protocol and separate read/aggregate timing;
  do not use production data or an uncontrolled remote database.
- Acceptance: read p95 ≤ 300 ms and aggregate p95 ≤ 200 ms under documented
  machine/DB/test conditions; result records sample count, warm-up and failures.
- Verification: execute the measure command against native test PostgreSQL.
- Rollback: fixture/proof only.
- Stop: environment cannot produce reproducible evidence; report NOT VERIFIED,
  never infer PASS.

### B2-T8 — CSP analytics and HSTS opt-in

- Outcome: headers expand only for explicitly selected provider/flag.
- Scope: `ANALYTICS_PROVIDER=yandex-metrika` adds required `mc.yandex.ru` and
  `yastatic.net` to `script-src`, `connect-src`, `img-src` and `frame-src`;
  absent env adds nothing; update env validation and `.env.example` without
  adding secrets. HSTS always keeps `includeSubDomains`; `preload` appears only
  when `HSTS_PRELOAD=true`.
- Acceptance: header snapshots cover provider on/off and preload on/off; no
  wildcard source or unrelated provider host.
- Verification: security boundary/header tests.
- Rollback: revert configuration task.
- Stop: production domain/DNS assumption is required to enable preload.

### B2-D — Review, Gate and merge

- Entry: B2-T1–T8 committed/pushed with ledgers; B1 merged; worktree clean.
- Acceptance matrix: `verify:runtime-content-gate`,
  `verify:runtime-seo-templates`, `verify:structured-data`,
  `verify:profile-acceptance` across B1 profile matrix, query-bound proof and
  performance budget. Because B2 changes template keys, rerun deterministic
  registry checks and `pnpm verify:clone-matrix`.
- Checks: local `pnpm verify:daily` once; the exact-head SourceCraft Gate runs
  `RISK_SCOPE=dependency-runtime pnpm verify:merge-risky`, including the nested
  STANDARD proof, release/runtime guards and build.
- Delivery: create one SourceCraft PR → full diff review → one exact-head
  SourceCraft RISKY Gate → merge → safe cleanup.

## 8. BATCH B3 — Release readiness and deployment package

Batch risk: `RISKY dependency-runtime`. Batch outcome: synchronized canon,
P0/P1-clean UI foundation and executable release/live-proof package without an
actual rollout.

### B3-T1 — Canon and clone documentation sync

- Outcome: onboarding and active canon describe preset v3, geo seed, registry
  approval and actual runtime.
- Scope: update `CLONE_ONBOARDING.md`, `PROJECT.md`,
  `02_PRODUCT_STRUCTURE.md`, `platform/GEO_CATALOG_CONTRACT.md`,
  `UPSTREAM_CANDIDATES.md`; remove broken references from `DESIGN.md`.
- Acceptance: draft→approved CSV lifecycle, profile matrix and route behavior
  match code; no document implies that production/tag/live proof has happened.
- Verification: link/reference scan and targeted docs guards.
- Rollback: revert docs task.
- Stop: docs are used to hide unresolved runtime drift.

### B3-T2 — UI Core drift remediation

- Outcome: existing UI foundation passes project UI checks with P0/P1 findings
  resolved and no parallel primitive tree.
- Scope: run UI Core, token report and drift audit; verify `components.json`
  aliases if the file exists, otherwise record not applicable; confirm
  light-only policy, `@custom-variant dark` policy and absence of project-owned
  `dark:` usage; fix only evidenced P0/P1.
- Acceptance: no unresolved P0/P1; aliases resolve; one primitive ownership
  path; no speculative token/component cleanup.
- Verification: `verify:ui-core`, `tokens:report`, `verify:drift`, focused
  representative-page checks when code changes affect rendering.
- Rollback: revert UI remediation commit.
- Stop: finding requires redesign or owner visual choice.

### B3-T3 — Exact-SHA release build and manifest

- Outcome: `scripts/release-build.mjs` builds an artifact from a clean exact SHA
  and emits a manifest that can be tied to source and image identity.
- Scope: fail closed on dirty tree/unknown SHA; orchestrate and extend the
  existing `scripts/release-manifest.mjs` instead of creating a second manifest
  owner; build the existing Dockerfile, then attach the image digest/reference
  to the same release evidence; do not build on production host or publish/deploy.
  Synchronize `deploy/README.md` and `docs/OPERATIONS.md` around one explicit
  operator runbook: (1) confirm clean canonical main/exact SHA, (2) run release
  preflight, (3) build immutable image outside production, (4) write/verify the
  release manifest and digest, (5) publish/store the immutable artifact only in
  an owner-authorized release, (6) preserve the previous rollback image,
  (7) apply migrations through the release path, (8) roll out exactly one
  jobs-active runtime, (9) run health/live smoke and rollback on failure.
- Acceptance: manifest includes exact full SHA, build identity and artifact
  digest/reference; mismatch fails.
- Verification: local fixture/dry-run plus existing release artifact guards.
- Rollback: revert script/docs task; no external artifact mutation required.
- Stop: registry credential or production target is needed for local proof.

### B3-T4 — Live smoke CLI

- Outcome: `scripts/smoke-live.mjs <origin>` verifies expected public behavior
  against an explicitly supplied origin.
- Scope: 200/301/308/404/410, X-Robots-Tag, robots.txt, noindex sitemap and one
  lead POST using safe test payload/marker.
- Acceptance: origin is mandatory and allowlisted by explicit invocation;
  response evidence is redacted; lead test is unmistakably synthetic and the
  script has a no-write/dry-run mode for local contract tests. A mutating run
  requires a declared proof environment, unique proof-run marker and verified
  cleanup/reconciliation path for the synthetic lead.
- Verification: mock/local server contract tests. Actual external execution is
  NOT RUN without owner release command.
- Rollback: revert script.
- Stop: target is production, or proof identity, synthetic-lead cleanup or
  permission is unknown.

### B3-T5 — Core §18A proof runner

- Outcome: `pnpm proof:live --origin=… --proof=A..G` dispatches explicit Core
  §18A scenarios and stores structured evidence under `docs/proofs/<sha>/`.
- Scope: A heartbeat; B1 in-process invalidation when claimed; B2 HTTP self-call
  in BASE; C dispatcher no catch-up; D stale import recovery; E retention;
  F lead outbox crash window; G retryable delivery.
- Acceptance: unsupported/not-applicable scenario reports exact status and
  reason; runner never claims PASS from static inspection; secret/PII values
  are redacted; output is tied to SHA/origin/time.
- Verification: dispatcher/serializer tests and mock environment. Actual live
  proofs remain owner-triggered after deployment and use only a dedicated
  staging/demo proof contour with reversible synthetic fixtures.
- Rollback: revert runner/templates.
- Stop: a scenario would mutate production irreversibly or lacks safe fixture
  isolation.

### B3-T6 — Final acceptance and report

- Outcome: exact B3 head has one honest final report at
  `docs/evidence/plan10/FINAL_REPORT.md`.
- Scope: run `pnpm verify` including build and `pnpm verify:clone-matrix` once;
  record made/actually checked/not checked/risks; include batch/PR/SHA evidence.
- Acceptance: no PASS claim without command evidence; live proofs are marked
  NOT RUN unless separately authorized and executed; report distinguishes local
  checks from SourceCraft Gate.
- Verification: report guard/link scan and clean Git status before delivery.
- Rollback: report follows exact candidate SHA and is regenerated after changes.
- Stop: required final suite fails or report SHA does not match candidate.

### B3-D — Review, Gate and merge

- Entry: B3-T1–T6 committed/pushed with ledgers; B2 merged; worktree clean.
- Checks: B3-T6 executes the owner-required local `pnpm verify` and
  `pnpm verify:clone-matrix` once. The exact-head SourceCraft Gate runs
  `RISK_SCOPE=dependency-runtime pnpm verify:merge-risky`; its nested STANDARD
  proof is recorded as CI evidence and is not launched separately again.
- Delivery: create one SourceCraft PR → full diff review → one exact-head
  SourceCraft RISKY Gate → merge → safe cleanup.
- Exit: Plan №10 implementation is complete on canonical main. Production,
  release tag, mirror and actual live proof remain separate owner commands.

## 9. Complete dependency graph

Every implementation and delivery node is listed exactly once. `NONE` means a
ready root inside the current batch; it does not bypass the batch base rule.

| Node | Depends on | Type | Reason / parallel-safe boundary |
|---|---|---|---|
| B1-T1 | NONE | ROOT | First owner of preset schema v3 |
| B1-T2 | B1-T1 | CONTRACT | Morphology/seed consumes the frozen preset input |
| B1-T3 | B1-T1, B1-T2 | CONTRACT | Registry needs exact metric and district source |
| B1-T4 | B1-T1, B1-T2, B1-T3 | HARD | Clone prepare consumes all frozen profile contracts |
| B1-T5 | B1-T4 | HARD | Matrix proves the actual prepared trees |
| B1-D | B1-T1, B1-T2, B1-T3, B1-T4, B1-T5 | HARD | Batch delivery requires every B1 task |
| B2-T1 | B1-D | CONTRACT | Runtime Gate facts consume merged B1 contracts |
| B2-T2 | B1-D | CONTRACT | Typed templates consume merged district/profile schema |
| B2-T3 | B1-D, B2-T2 | CONTRACT | Developer parity consumes the new template keys/registry |
| B2-T4 | B1-D | CONTRACT | Breadcrumbs consume merged URL/profile contract |
| B2-T5 | B1-D | CONTRACT | Analytics/lead/filter parity consumes merged profile |
| B2-T6 | B2-T1, B2-T3 | CONTRACT | Bounded reads preserve final Gate/developer facts |
| B2-T7 | B2-T6 | HARD | Budget measures the final bounded read path |
| B2-T8 | B1-D | CONTRACT | Header policy is independent of B2 runtime query work |
| B2-D | B2-T1, B2-T2, B2-T3, B2-T4, B2-T5, B2-T6, B2-T7, B2-T8 | HARD | Batch delivery requires every B2 task |
| B3-T1 | B2-D | HARD | Canon describes the merged runtime only |
| B3-T2 | B2-D | HARD | UI drift baseline is the merged runtime batch |
| B3-T3 | B2-D | CONTRACT | Release manifest packages the merged clone/runtime state |
| B3-T4 | B2-D | CONTRACT | Smoke CLI targets the final public contract |
| B3-T5 | B3-T4 | CONTRACT | Proof runner reuses proof-origin and safety harness |
| B3-T6 | B3-T1, B3-T2, B3-T3, B3-T4, B3-T5 | HARD | Final report covers all B3 outputs |
| B3-D | B3-T1, B3-T2, B3-T3, B3-T4, B3-T5, B3-T6 | HARD | Final delivery requires every B3 task |

Critical path: `B1-T1 → B1-T2 → B1-T3 → B1-T4 → B1-T5 → B1-D → B2-T2 → B2-T3 → B2-T6 → B2-T7 → B2-D → B3-T4 → B3-T5 → B3-T6 → B3-D`.

Shared-file sequencing is explicit:

- `package.json`: the task owning a new CLI adds its command; later tasks only
  consume or extend it within the same serial chain.
- SEO templates/registry: B1-T3 freezes the base contract; B2-T2 explicitly
  supersedes its key set, regenerates the registry/seed output and reruns the
  registry/clone matrix.
- `src/project/navigation/**`: B2-T4 is the single owner.
- `next.config.ts` and `.env.example`: B2-T8 is the single owner.
- release/proof scripts and deploy documentation: B3-T3 → B3-T4 → B3-T5 is a
  serial shared-utility contract, not parallel writes.

Graph result: 22/22 nodes mapped, cycles = 0.

## 10. Evidence tiers and reachability

- B1/B2 acceptance is `wired`: proofs execute through project CLI, Payload
  migrations/test database or reachable public/runtime adapters named in each
  task. Unit-only evidence cannot close an integration acceptance item.
- B3-T3 is `wired` through the exact-SHA build/manifest CLI.
- B3-T4 and B3-T5 implementation acceptance is `wired/mock`: deterministic
  local/mock-origin proof plus fail-closed target guards. Their actual remote
  execution is `live` evidence and remains outside this implementation graph.
- No task may record `live PASS` without the separately authorized proof origin,
  exact candidate SHA, synthetic marker, cleanup/reconciliation evidence and
  an owner command permitting that execution.
- B1-D/B2-D/B3-D record exact command, exit status, SHA and artifact/report
  paths in `EXECUTION_LEDGER_V1`; prose claims are not evidence.

## 11. Finding register — final audit v4

| ID | Severity | Finding | Resolution/status |
|---|---|---|---|
| P10-A01 | MAJOR | Input had no Plan ID/version/status/revision history | Added canonical metadata; `RESOLVED` |
| P10-A02 | MAJOR | External «Союз» v4.1.1 was not present in checkout | Requirements made self-contained; reference-only via D-10-01; `RESOLVED` |
| P10-A03 | MAJOR | Three large epics had no stable task/dependency contracts | Decomposed into B1/B2/B3 tasks and delivery nodes; `RESOLVED` |
| P10-A04 | BLOCKER | Three automatic merges were requested before owner approval | `MERGE_AFTER_GATE` is conditional on exact plan approval/import; `RESOLVED` |
| P10-A05 | BLOCKER | Live proof/deploy wording could authorize production | Implementation separated from execution; production authorization `NONE`; `RESOLVED` |
| P10-A06 | MAJOR | Persisted `gatePassed` option lacked migration decision | Bounded-query-first decision and schema stop rule added; `RESOLVED` |
| P10-A07 | MAJOR | Batch verification could duplicate full suites | One batch-exit daily/risky proof and one final full verify recorded; `RESOLVED` |
| P10-A08 | MINOR | `components.json` may not exist | Conditional applicability recorded; `RESOLVED` |
| P10-A09 | BLOCKER | Required district enum differs from persisted `administrative`; `vo` is absent | B1 classified `schema-data`; additive migration and non-empty upgrade proof added; `RESOLVED` |
| P10-A10 | MAJOR | Existing idempotent geo seed port could be duplicated | B1-T2 requires extraction/reuse of the existing ordered upsert engine; `RESOLVED` |
| P10-A11 | MAJOR | Existing release manifest could become a competing owner | B3-T3 must orchestrate/extend `release-manifest.mjs`; `RESOLVED` |
| P10-A12 | MAJOR | Owner input referenced external section matrices and unnamed deployment steps | Souz statuses and the nine-step operator runbook are now explicit in this plan; `RESOLVED` |
| P10-F01 | BLOCKER | B3 used an unsupported runtime/release risk label | Replaced with supported `dependency-runtime`; `RESOLVED` |
| P10-F02 | MAJOR | District enum wording could imply destructive rename/removal | Add-new → migrate rows → retain deprecated old label; later compaction only by separate plan; `RESOLVED` |
| P10-F03 | BLOCKER | Preliminary matrix omitted dependencies for multiple nodes | Replaced with a complete 22-node acyclic graph; `RESOLVED` |
| P10-F04 | MAJOR | B1/B2 both change the SEO template/registry contract without ownership handoff | B2-T2 explicitly supersedes/regenerates it and reruns registry/clone proofs; `RESOLVED` |
| P10-F05 | BLOCKER | Approved-plan checkpoint was absent from the fixed three-PR topology | B1 starts from the exact approved plan checkpoint; plan/docs travel in B1 PR; `RESOLVED` |
| P10-F06 | MAJOR | Persisted `gatePassed` fallback could silently add schema risk | v4 selects bounded reads only and returns a budget failure to Architect; `RESOLVED` |
| P10-F07 | MAJOR | Mutating remote proofs lacked proof-contour and cleanup safeguards | Explicit staging/demo identity, synthetic marker and reconciliation are mandatory; `RESOLVED` |
| P10-F08 | MAJOR | Local and SourceCraft checks could duplicate nested STANDARD/daily suites | Exact one-time local batch proof and supported Gate scope are specified; `RESOLVED` |

Open blockers: 0. Open before-approval owner decisions: 0.

## 12. Final four-pass audit and Night Run Readiness

### Pass 1 — logical integrity

- Goal/non-goals, three-batch topology and 19 task outcomes are mutually
  consistent.
- Blockers: 0. Major findings: 0. Hidden owner decisions: 0.

### Pass 2 — architecture, data and security

- Payload remains the only schema/data owner; no second ORM/backend/registry.
- Enum upgrade is additive and proves clean plus non-empty databases.
- Public/System/Ingest boundaries, CSP/HSTS opt-ins and proof-target guards are
  explicit. Blockers: 0. Major findings: 0.

### Pass 3 — dependency and autonomy

- Nodes mapped: 22/22. Cycles: 0. Batch order: `B1 → B2 → B3`.
- Shared-file owners and contract handoffs are explicit. A blocked task may be
  bypassed only by an already-ready node whose inputs cannot be invalidated.
- Blockers: 0. Major findings: 0.

### Pass 4 — executability and evidence

- Implementation tasks with outcome/scope/acceptance/verification/rollback/
  stop: 19/19. Delivery nodes: 3/3.
- Evidence levels distinguish local/mock/wired/live; remote live proof is not
  falsely promised by the implementation graph.
- Blockers: 0. Major findings: 0.

### Night Run Readiness

- Independent ready waves: three owner-fixed sequential batches.
- Cycles: 0.
- Nodes: 22. Cycles: 0. Hard dependencies and critical path are recorded in §9.
- External prerequisites: SourceCraft credentials only at delivery; native test
  PostgreSQL for integration/performance; no server/production prerequisite.
- Production-only stops: actual smoke/proofs, tag, rollout, mirror.
- Safe work if a task blocks: continue only tasks in the same approved batch
  whose contracts are already frozen and whose result cannot invalidate the
  blocked task; otherwise stop that batch before delivery.
- Result: `READY_WITH_LIMITS`. The limits are intentional: the owner fixed
  three sequential branch/PR/merge batches, B1 has an unavoidable schema and
  registry freeze chain, and B2/B3 consume the preceding merged contracts.
  Independent ready work inside B2/B3 may continue under the graph, but a
  contract blocker stops its dependent chain and the batch cannot deliver.
- Owner decisions required before approval: 0.

## 13. Approval and handoff boundary

- Current phase: `APPROVAL_HANDOFF`.
- Current exact version: `v4 APPROVED`.
- Owner approval: exact phrase `План утверждён`, received
  `2026-09-27T00:22:37+03:00`.
- Task Manager import: authorized only after exact snapshot validation and
  clean reconciliation.
- Developer handoff: authorized only after clean import/reconciliation through
  the supported Task Manager goal mechanism.
- B1 must branch from the exact approved-plan checkpoint; that checkpoint and
  B1 implementation form the first of exactly three PRs. B2/B3 branch from
  refreshed canonical `origin/main` after the preceding merge.
- Approval never authorizes production, tag, mirror or live target execution.

## 14. Revision history

### v4 — 2026-09-27 — APPROVED

- Source: explicit owner transition to final checking and four-pass audit of
  exact v3 plus current runtime/risk contracts.
- Resolved: unsupported risk scope, enum migration safety, complete 22-node
  DAG, cross-batch SEO ownership, approved-plan checkpoint topology, bounded
  query-only performance decision, mutating proof safety and nested check
  duplication.
- Audit: logical `PASS`; architecture/data/security `PASS`; dependency/autonomy
  `PASS`; executability/evidence `PASS`.
- Night Run Readiness: `READY_WITH_LIMITS`; cycles 0; open blockers 0; open
  major findings 0; owner decisions before approval 0.
- Owner approval recorded for this exact v4. Approval authorizes the declared
  three-batch `MERGE_AFTER_GATE` implementation graph and Task Manager handoff;
  production, tag, mirror and live target execution remain unauthorized.

### v3 — 2026-09-26 — REVIEW

- Source: line-by-line coverage pass against the owner specification.
- Accepted: explicit Souz category/market status matrix for all three cities;
  exact nine-step deploy runbook ownership in `deploy/README.md` and
  `docs/OPERATIONS.md`.
- Resolved: remaining hidden dependency on external §4.4 and the undefined
  phrase «те же шаги 1–9».
- Sections changed: B1-T4, B3-T3, finding register and current version.
- Owner decisions required before approval: none currently known.

### v2 — 2026-09-26 — REVIEW

- Source: second assembly round against Payload collections/migrations, current
  clone implementation, runtime route resolver, security headers and release
  manifest.
- Accepted: B1 is unconditionally `RISKY schema-data`; persisted
  `administrative→admin_district` mapping, `vo` support, non-empty migration
  proof, existing geo seed engine reuse, project-owned preset module, existing
  release manifest reuse, explicit lead mapper behavior and exact CSP directives.
- Rejected: conditional no-migration assumption; a second geo seeder; a second
  release manifest owner; client-specific preset defaults in core/packages.
- Sections changed: global risk contract, D-10-02, B1-T1/T2, B2-T4/T5/T8,
  B3-T3 and finding register.
- Owner decisions required before approval: none currently known.

### v1 — 2026-09-26 — REVIEW

- Source: owner specification + current SourceCraft main/runtime inventory.
- Accepted: all E1/E2/E3 product requirements, exactly three delivery batches,
  commit per task, batch-level daily/risky checks and Core §20 reporting.
- Clarified: external reference is non-blocking provenance; plan is
  self-contained; bounded-query-first; live proof implementation is separate
  from live execution; production/tag/mirror remain forbidden.
- Added: stable task IDs, acceptance, verification, rollback, stop conditions,
  dependency matrix, freeze points, findings and preliminary readiness.
- Rejected: implicit production authorization; hidden cross-repository
  dependency; preset/schema duplication; automatic import of a REVIEW plan.
- Owner decisions required before approval: none currently known.
- Next: assembly delta review; then explicit final four-pass audit.

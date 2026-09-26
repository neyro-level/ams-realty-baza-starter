# AMS MASTER PLAN №9 — STARTER v2.1 / CLONE READINESS

Plan ID: AMS-REALTY-BAZA-STARTER-V2-1-CLONE-READINESS-9
Version: v6
Status: APPROVED
Phase: APPROVAL_HANDOFF
Approved by: owner
Approved at: 2026-09-25T22:41:46+03:00
Previous approved snapshot: v5, approved by owner at 2026-09-25T14:44:24+03:00
Baseline: SourceCraft `main@c337957e46846d7c8e5d74745866f06c0860d985`
Owner input: `STARTER v2.1 — готовность к клонам`, received 2026-09-25
Delivery profile: `COMMERCIAL`
Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`
Production authorization: `NONE`

Этот документ — единственная активная основа нового master plan. Планы №2–8
остаются историческим evidence в `docs/legacy/` и не являются очередью работ.
Plan №9 v5 прошёл финальный аудит, был утверждён владельцем и исполнен до
включительно S6 на canonical SourceCraft main. До первой записи S7 владелец
разрешил пересобрать оставшуюся delivery-цепочку, чтобы убрать лишние
PR/Gate/merge циклы. v6 не меняет девять product contracts S7-S14 (S10A/S10B):
он заменяет восемь прежних delivery cycles пятью batches с совместимыми risk
scopes. Exact v6 прошёл финальный audit и утверждён владельцем; v5 graph
остановлен на S7 до CLEAN versioned Upgrade, production остаётся запрещён.

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

1. S0-S6 preserve their completed v5 evidence: one epic = one
   branch/worktree/SourceCraft PR. Remaining S7-S14 use one delivery batch = one
   branch/worktree/SourceCraft PR. A batch may contain multiple named epics,
   but each epic keeps its own acceptance and evidence checkpoint.
2. Delivery batches are sequential. Inside a batch, constituent epics are
   implemented in declared order in the same worktree, with a commit/push
   checkpoint after each epic; PR/review/Gate/merge happen once after the whole
   batch is complete.
3. Default delivery mode for remaining batches B1-B5 is `MERGE_AFTER_GATE`,
   subject to exact-v6 owner approval. Direct push to `main` is forbidden.
4. Production, mirror and tag remain owner gates.
5. Schema changes use Payload migrations only. Applied migrations are never
   rewritten.
6. Contract changes use the project cycle `contracts:diff → review →
   contracts:lock/freeze` where the affected contract surface requires it.
7. `src/core/**` and `packages/**` contain no client city, brand, domain or
   project marketing literals.
8. Local WORK checks are scope-specific. Before a batch merge:
   - STANDARD → `pnpm verify:merge-standard` and one exact-head STANDARD Gate;
   - RISKY → exactly one canonical `RISK_SCOPE`,
     `pnpm verify:merge-risky`, and one exact-head RISKY Gate;
   - `pnpm verify:schema` is mandatory for schema/data migration scope, not for
     every SEO/runtime change;
   - a batch declares exactly one canonical RISK_SCOPE; compatible STANDARD
     epics inherit the batch Gate, while a second incompatible RISK_SCOPE is
     never hidden inside the same PR;
   - `pnpm verify:daily` may be used as a work checkpoint but does not replace
     the single final Merge Gate.
9. Every epic checkpoint and batch report use Core §20 and list only actually
   executed checks.
   `DONE`, `GREEN`, `PASS` and similar claims without evidence are forbidden.
10. Rollback is per epic: revert code/docs PR for non-persisted work; additive
    forward-fix or tested down/recovery path for persisted schema/data.
11. Beads stable IDs, node types, roles, work kinds, repository ownership and
    source anchors from v5 are preserved. Batch names B1-B5 are delivery labels,
    not replacement epics or a second task store.
12. In a two-epic batch the final epic delivery task owns the only external
    PR/review/Gate/merge action. The preceding epic delivery task runs after it,
    records the same exact evidence and must not create a second PR, Gate or
    merge. Both parent epics close only after their delivery tasks are closed.
13. Constituent rollback may revert an internal checkpoint while the batch is
    still unmerged. After batch merge, the external rollback boundary is the
    complete batch PR; persisted schema/data still use forward-fix or tested
    recovery instead of destructive rollback.

### Default Work Package Contract for remaining S7-S14

The following clauses apply to every remaining implementation epic and its
delivery batch. They are supplemented, not replaced, by the local epic contract
below.

- Source of Truth: this exact Plan №9 version and the active project documents,
  code, schema, migrations and tests named by the epic scope. Historical plans
  are evidence only and never supply missing requirements.
- Entry: Plan №9 exact v6 is `APPROVED` and imported/reconciled cleanly;
  predecessor batch is merged; `origin/main` is refreshed; the batch worktree
  is clean; approved plan hash and runtime versions have not drifted.
- Epic checkpoint: every local acceptance item has observable evidence;
  scope-specific checks pass; commit/push and `EXECUTION_LEDGER_V1` checkpoint
  are recorded, but PR/Gate/merge wait for the batch exit.
- Batch exit: every constituent epic is complete; combined diff and scope are
  reviewed; one exact-head SourceCraft Gate of the declared batch risk passes;
  one PR is merged; the batch ledger records checks, SHA and delivery state.
- Allowed actions: read, edit, test, commit, push, create PR, review, run the
  declared Gate and merge under `MERGE_AFTER_GATE`. Production, release/tag,
  mirror, new secrets, destructive external actions and unrelated repository
  changes are forbidden.
- Scope out: functionality not named by the epic, speculative infrastructure,
  hidden compatibility fallbacks and opportunistic redesign/refactor.
- Parallel-safe: none by owner delivery policy. A blocked constituent pauses its
  batch; Developer records the blocker and does not skip to a later batch.
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
| Development DTO/schema | S8 | after S8 checkpoint in B1 | S7, S9-S14 |
| Site settings/JSON-LD/sitemap | S10A | after B2 merge | S10B-S15 |
| Cache/tag invalidation contract | S11 | after S11 checkpoint in B4 | S12-S15 |
| Acceptance matrix and guards | S12 | after B4 merge | S13-S15 |

Later epics may consume a frozen surface but may not silently redefine it. A
required semantic change returns to Architect as plan drift or becomes a new
explicitly approved scope.

## 4. Owner decisions

| ID | Decision | Impact | Status |
|---|---|---|---|
| D-09-01 | Plan №9 является self-contained: требования задаются этим документом без ссылок на другие master plans | Нет внешнего planning prerequisite; другие repositories вне scope | `DECIDED` |
| D-09-02 | SEO Registry = `CSV → validated typed registry in code`; CMS не является вторым owner | S6 создаёт один deterministic generation/validation path | `DECIDED` |
| D-09-03 | Исходный S10 разделён на S10A=`schema-data` и S10B=`ingest-jobs` | Один epic/PR/SHA использует ровно один RISKY scope | `DECIDED` |
| D-09-04 | После завершения S0-S6 оставшиеся S7-S14 доставляются пятью совместимыми batches, а не восемью отдельными PR | Сохраняются epic acceptance/evidence checkpoints, но PR/review/Gate/merge выполняются один раз на batch | `DECIDED` |

## 5. FINDING REGISTER — through final audit v6

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
| MP9-A18 | BLOCKER | Approved v3 used inline-code values in Version/Status; canonical importer rejects them before Task Manager writes | v4 normalizes plan metadata to plain machine-readable lines; no epic or requirement changed | `RESOLVED / REAPPROVAL REQUIRED` |
| MP9-A19 | BLOCKER | Full v4 branch review found four trailing-space findings in approved plan metadata and one blank-at-EOF finding in inventory | v5 removes only whitespace; S0 PR/Gate were not created, graph upgrade waits for owner approval | `RESOLVED / REAPPROVAL REQUIRED` |
| MP9-A20 | MAJOR | После S6 восемь отдельных delivery cycles повторяли full review/Gate/PR/merge для тесно связанных scopes | v6 groups S7-S14 into five batches; incompatible `schema-data`, `ingest-jobs` and `dependency-runtime` scopes remain separated | `ACCEPTED / REAPPROVAL REQUIRED` |
| MP9-A21 | BLOCKER | Project router, docs map, Architecture, Backlog, Project and Release Checklist still described v5/per-task PR delivery and contradicted v6 batching | Synchronized every active delivery source to v6 approval-bound batch semantics without activating execution | `RESOLVED` |
| MP9-A22 | BLOCKER | A naive B1-B5 graph would replace managed IDs/work kinds, which canonical Beads Upgrade rejects | Preserve all v5 nodes; change only planned topology/contracts; paired delivery tasks reuse one exact batch evidence with one explicit external owner | `RESOLVED` |

## 6. Dependency graph и delivery order

```text
S0-S6 COMPLETE on canonical main
  └─ B1 [S8 → S7] schema-data
       └─ B2 [S9 → S10A] schema-data
            └─ B3 [S10B] ingest-jobs
                 └─ B4 [S11 → S12] dependency-runtime
                      └─ B5 [S13 → S14] dependency-runtime
                           └─ S15 OWNER GATE
```

Это ускоренная delivery policy владельца для exact v6. Product epic contracts
S7-S14 сохраняются: объединяется delivery boundary, а не acceptance. Внутри
batch последовательность остаётся явной, поэтому schema/DTO, navigation,
discovery, cache, guards, clone и UI не используют ещё не реализованный
контракт. Между batches остаётся один serial critical path; blocked batch
останавливает программу, но число повторных merge cycles сокращается с восьми
до пяти.

| Batch | Epics and internal order | Canonical risk | Why compatible | Exit / rollback boundary |
|---|---|---|---|---|
| B1 | S8 → S7 | `schema-data` | The final development schema/DTO is frozen first; catalog queries and truthful aggregates then consume it without a second rewrite; both require native PostgreSQL integration | All S8/S7 acceptance, schema/upgrade proof, one RISKY Gate; revert batch before any release, persisted changes use forward-fix/recovery |
| B2 | S9 → S10A | `schema-data` | Breadcrumb/navigation output is a direct input to JSON-LD and sitemap; optional site-settings migration determines the batch risk | All S9/S10A acceptance, sitemap crawl and schema proof when applicable, one RISKY Gate |
| B3 | S10B | `ingest-jobs` | IndexNow queue/retry is the only remaining job scope and cannot share a Gate with schema-data or dependency-runtime | S10B event/idempotence evidence and one RISKY Gate; queue can be disabled/reverted |
| B4 | S11 → S12 | `dependency-runtime` | S12 acceptance matrix and guards must verify the final cache/tag runtime behavior | S11 performance/invalidation plus S12 negative fixtures/matrix, one RISKY Gate |
| B5 | S13 → S14 | `dependency-runtime` | UI acceptance must run against the final generated clone profiles; both consume the frozen platform and guards | Four clean clone presets plus UI/a11y/visual proof, one RISKY Gate; revert generator/UI batch |

| Transition | Dependency type | Critical reason |
|---|---|---|
| S6→B1 | CONTRACT | Catalog facet paths and metadata need the validated registry already merged in S6 |
| B1→B2 | CONTRACT | Navigation, structured data and sitemap consume the final development DTO and catalog behavior |
| B2→B3 | HARD | IndexNow transition events consume the final decidePage/discovery model |
| B3→B4 | SOFT / delivery | Cache is technically separable but remains serialized to keep one active writing stream |
| B4→B5 | HARD | Clone presets and UI acceptance must run the finalized guards and runtime matrix |
| B5→S15 | PRODUCTION | Release/tag only after final product proof and owner command |

### Beads v5 → v6 stable-ID Upgrade contract

The approved upgrade keeps the complete v5 managed ID set. It changes only
planned dependencies, card contracts, labels and source metadata. Closed S0-S6
nodes and their ledgers remain closed and immutable. B1-B5 never become new
Beads epic IDs.

| Batch | Implementation order | Sole external delivery owner | Shared-evidence closer | Next batch waits for |
|---|---|---|---|---|
| B1 | `TASK-S8-IMPLEMENTATION` → `TASK-S7-IMPLEMENTATION` | `TASK-S7-DELIVERY` | `TASK-S8-DELIVERY` | closed `S7` and `S8` |
| B2 | `TASK-S9-IMPLEMENTATION` → `TASK-S10A-IMPLEMENTATION` | `TASK-S10A-DELIVERY` | `TASK-S9-DELIVERY` | closed `S9` and `S10A` |
| B3 | `TASK-S10B-IMPLEMENTATION` | `TASK-S10B-DELIVERY` | none | closed `S10B` |
| B4 | `TASK-S11-IMPLEMENTATION` → `TASK-S12-IMPLEMENTATION` | `TASK-S12-DELIVERY` | `TASK-S11-DELIVERY` | closed `S11` and `S12` |
| B5 | `TASK-S13-IMPLEMENTATION` → `TASK-S14-IMPLEMENTATION` | `TASK-S14-DELIVERY` | `TASK-S13-DELIVERY` | closed `S13` and `S14` |

For each two-epic batch, both parent epics depend only on the previous completed
batch. The second implementation task depends on the first implementation task;
the external delivery owner depends on the second implementation task; the
shared-evidence closer depends on the external delivery owner. This avoids a
parent-closure cycle while proving both epic checkpoints before delivery.

Exact parent dependencies are: B1 `S7,S8 ← S6`; B2
`S9,S10A ← S7+S8`; B3 `S10B ← S9+S10A`; B4 `S11,S12 ← S10B`; B5
`S13,S14 ← S11+S12`. No parent inside a two-epic batch depends on its sibling;
internal order belongs to task dependencies above.

Approval handoff must run `Upgrade -DryRun` first and list every topology-changed
stable ID in `ReopenTaskId`. The actual Upgrade is allowed only when dry-run
reports the same managed ID set, zero role/work-kind/repository drift and zero
cycles. After CLEAN Reconcile, the manually paused S7 task/epic may return to
`open`; the first claimed implementation task must be
`TASK-S8-IMPLEMENTATION`. Any incompatible-ID result stops handoff and returns
to Architect; manual rebuild is not an implicit fallback.

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

- Batch: B1 checkpoint 2/2. S7 runs after S8 has frozen the development
  schema/DTO. Completion triggers combined S8+S7 review, `schema-data` Gate,
  one PR and one merge.
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

- Batch: B1 checkpoint 1/2. Commit/push and ledger are required; PR/Gate/merge
  wait until S7 consumes the frozen schema/DTO on the same branch.
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

- Batch: B2 checkpoint 1/2. Local verification is STANDARD; delivery waits for
  S10A and inherits the batch `schema-data` Gate.
- Outcome: all internal navigation is PageKey/Gate-derived and never links to a
  404 or redirect.
- Scope: shared breadcrumb builder; inactive geo is text; nearby uses
  agglomeration only and preserves actual city; menu/GeoSwitcher from profile;
  SINGLE hides switcher; create only an interactive leaf if component absent.
- Acceptance: crawl guard zero bad links; same breadcrumb semantics in SINGLE
  and MULTI; nearby counts do not pollute current geo.
- Verification: navigation matrix, UI state/a11y, `verify:merge-standard`.
- Delivery checkpoint: no standalone PR/Gate/merge.
- Rollback: revert navigation PR.
- Stop: link owner bypasses PageKey/decidePage.

### EPIC-S10A — Site settings, JSON-LD and sitemap

- Batch: B2 checkpoint 2/2. Completion triggers combined S9+S10A review,
  `schema-data` Gate, one PR and one merge.
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

- Batch: B3 single-epic delivery because `ingest-jobs` is incompatible with
  adjacent batch risk scopes.
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

- Batch: B4 checkpoint 1/2. Commit/push and ledger are required; PR/Gate/merge
  wait until the S12 guards and acceptance matrix prove this runtime.
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

- Batch: B4 checkpoint 2/2. Completion triggers combined S11+S12 review,
  `dependency-runtime` Gate, one PR and one merge.
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
- Delivery checkpoint: local guard verification remains STANDARD in character,
  but there is no standalone PR/Gate/merge; B4 owns delivery. This checkpoint
  blocks B5, not historical S0-S10B.
- Rollback: revert guard/matrix PR.
- Stop: guard suppressions or mutable baseline snapshots.

### EPIC-S13 — Clone preset v2

- Batch: B5 checkpoint 1/2. Commit/push and ledger are required; PR/Gate/merge
  wait until S14 validates UI against the generated profiles.
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

- Batch: B5 checkpoint 2/2. Completion triggers combined S13+S14 review,
  `dependency-runtime` Gate, one PR and one merge.
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
- Delivery checkpoint: local UI verification remains STANDARD in character,
  but there is no standalone PR/Gate/merge; B5 owns delivery.
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

## 8. Final four-pass audit of exact v6

### Pass 1 — logic and completeness

- Approved v5 product scope is preserved: completed S0-S6 stay evidence;
  S7-S14 retain all outcomes, scope, acceptance, verification, rollback and stop
  conditions; S15 remains a later owner/release gate.
- Batching changes only delivery boundaries. Five batches replace eight prior
  PR/Gate/merge cycles across nine product contracts; constituent epic checkpoints remain independently
  observable and no requirement is dropped or moved to production.
- MP9-A21 removed active-doc contradictions. Logic blockers: 0. Open major
  findings: 0. Ambiguous critical DoD: 0.

### Pass 2 — architecture, data and security

- Payload/PostgreSQL remain the sole backend/schema owners; public reads remain
  Gateway/DTO-based; project→core direction, secrets/PII boundaries and additive
  migrations are unchanged.
- B1 and B2 each use only `schema-data`; B3 alone uses `ingest-jobs`; B4 and B5
  each use only `dependency-runtime`. STANDARD checkpoints inherit their batch
  Gate; no SHA mixes incompatible canonical RISK_SCOPE values.
- Persisted B1/B2 changes retain forward-fix/recovery rollback; B3 queue can be
  disabled; B4/B5 remain code/runtime rollback boundaries. Production, tag,
  mirror, server and live data stay outside authorization.
- Architecture/data/security blockers: 0. Open major findings: 0.

### Pass 3 — dependencies and autonomy

- Delivery DAG: `S6 → B1 → B2 → B3 → B4 → B5 → S15`; cycles: 0. HARD
  transitions: 2; CONTRACT transitions: 2; SOFT delivery transitions: 1;
  PRODUCTION transition: 1.
- Inside B1, S8 freezes schema/DTO before S7 consumes it. B2 freezes navigation
  before structured data/discovery; B4 proves cache through final guards; B5
  validates UI against generated clone profiles.
- MP9-A22 is resolved by the explicit stable-ID topology: all v5 IDs,
  type/role/work_kind/repository/source anchors are retained; paired delivery
  tasks close from one exact PR/Gate/merge evidence without a second external
  action. `Upgrade -DryRun` and CLEAN Reconcile remain mandatory post-approval.
- Independent waves: one intentional serial batch wave. Single blocking point:
  current batch. This is accepted owner policy; no external service blocks
  pre-production work and a blocked constituent cannot be bypassed safely
  inside its shared rollback boundary.

### Pass 4 — executability and evidence

- Remaining product epics with deterministic acceptance/verification: 9/9
  (`S7`, `S8`, `S9`, `S10A`, `S10B`, `S11`, `S12`, `S13`, `S14`). Delivery
  batches with one risk, owner, exit and rollback boundary: 5/5.
- Each implementation task records pushed exact-SHA evidence. Each two-epic
  batch has one external delivery owner and one shared-evidence closer; the next
  batch waits for both parent epics to close.
- Wired/live promises name PostgreSQL integration, browser/E2E, HTTP/sitemap,
  queue/jobs, cache timings, clone generation or UI/a11y/visual surfaces.
- Approval handoff is fail-closed: exact source hash → inventory → Validate →
  Upgrade DryRun → Upgrade → Reconcile CLEAN → first ready task S8. No import,
  implementation, release or production is authorized by readiness alone.

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
  hard dependencies: 2
  contract dependencies: 2
  soft delivery dependencies: 1
  batches: 5
  single blocking point: current serialized batch by owner policy
Executability/evidence
  remaining epics with acceptance: 9/9
  remaining epics with verification: 9/9
  batches with exact risk/exit/rollback: 5/5
  wired/live without reachableVia: 0
Owner decisions
  before approval open: 0
  later open: 1 release authorization for S15
Night Run Readiness: READY_WITH_LIMITS
```

`READY_WITH_LIMITS` means exact v6 is deterministic and has no unresolved
planning blocker, but shared batch branches intentionally preserve one serial
critical path. The limit reduces external delivery overhead without weakening
proof or silently widening rollback boundaries.

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

### Revision input `MP9-R4`

- Source: fail-closed inventory validation after exact v3 owner approval.
- Finding: importer requires plain `Version: vN` and `Status: APPROVED` lines;
  v3 used inline-code formatting, so no Task Manager mutation occurred.
- Change: normalized machine-readable header only; product scope, all 16
  implementation epics, dependencies, risks, acceptance and production boundary
  are byte-for-byte semantically unchanged.
- Exact-v4 four-pass audit: `PASS`; blockers/major/open owner decisions = `0/0/0`.
- Owner approval: exact v4 approved on 2026-09-25; approval handoff authorized.
- Resulting version: `v4 APPROVED`.

### Revision input `MP9-R5`

- Source: full S0 delivery diff review after v4 import and implementation.
- Finding: `git diff --check origin/main...HEAD` found four Markdown trailing
  spaces in the approved plan header and one extra blank line at inventory EOF.
- Change: whitespace-only normalization. Plan ID, all 16 implementation epics,
  dependencies, risk scopes, acceptance, verification and S15 boundary are
  unchanged. Existing S0 implementation evidence remains valid.
- Delivery state: no PR, Gate or merge was started; v4 graph pauses at
  `ams9-task-s0-delivery` until an approved v5 Upgrade reconciles cleanly.
- Exact-v5 four-pass audit: `PASS`; blockers/major/open owner decisions = `0/0/0`.
- Owner approval: exact v5 approved on 2026-09-25; versioned Upgrade authorized.
- Resulting version: `v5 APPROVED`.

### Revision input `MP9-R6`

- Source: owner.
- Request: reduce repeated PR/Gate/merge overhead by combining compatible
  remaining epics without weakening acceptance or mixing incompatible risks.
- Accepted: five delivery batches B1=`S8→S7`, B2=`S9→S10A`, B3=`S10B`,
  B4=`S11+S12`, B5=`S13+S14`; one branch/PR/Gate/merge per batch and one
  commit/push/ledger checkpoint per constituent epic.
- Rejected: one giant S7-S14 branch because it couples schema, jobs, cache,
  clone and UI rollback; combining S10B with another batch because
  `ingest-jobs` cannot share a canonical Gate with `schema-data` or
  `dependency-runtime`.
- Preserved: exact S0-S6 completed evidence, every S7-S14 product contract,
  production/tag/mirror prohibition and the S15 owner gate.
- Current execution: v5 S7 task and epic blocked before code changes with
  `PLAN_REVISION_PENDING`; v6 inventory/import is forbidden before approval.
- Owner decisions remaining before final audit: 0.
- Sections changed: header/baseline, execution contract, D-09-04, MP9-A20,
  dependency graph, epic delivery checkpoints, assembly/readiness state.
- Resulting version: `v6 REVIEW`.

### Revision input `MP9-R6F`

- Source: explicit owner command `Проверь план финально`.
- Audit: four independent passes over logic/completeness,
  architecture/data/security, dependencies/autonomy and
  executability/evidence/delivery.
- Findings resolved: MP9-A21 synchronized active project canon with v6 batch
  delivery; MP9-A22 preserved the v5 managed ID set and defined a fail-closed
  stable-ID Upgrade topology with one external delivery owner per batch.
- Exact-v6 result: blockers/major/open before-approval owner decisions =
  `0/0/0`; cycles = `0`; Night Run Readiness = `READY_WITH_LIMITS` only because
  the owner-selected batch flow remains serial.
- No Task Manager inventory/import/upgrade, implementation, PR, Gate, merge,
  release, tag, mirror or production action was performed by this audit.
- Resulting version: `v6 READY_FOR_OWNER_APPROVAL`.

### Approval input `MP9-A6`

- Source: explicit owner command `План утверждён` at
  `2026-09-25T22:41:46+03:00`.
- Exact approved version: `v6`; final audit result remains
  `READY_WITH_LIMITS` with `0/0/0` blockers/major/before-approval decisions.
- Authorization: docs checkpoint, stable-ID inventory v6, fail-closed
  `Upgrade -DryRun → Upgrade → Reconcile CLEAN` and automatic Developer handoff.
- Excluded: S15, release, tag, mirror and production.
- Resulting version: `v6 APPROVED`.

| Version | Date | Status | Input | Result |
|---|---|---|---|---|
| v0 | 2026-09-25 | DRAFT | Owner attachment `STARTER v2.1 — готовность к клонам` | Existing plan basis accepted for assembly |
| v1 | 2026-09-25 | REVIEW | MP9-R1 canon/runtime reconciliation | Executable contracts drafted; four owner decisions registered; final audit not started |
| v2 | 2026-09-25 | REVIEW | MP9-R2 owner decisions | Self-contained scope; registry path and S10 split fixed; zero before-approval decisions; final audit not started |
| v3 | 2026-09-25 | APPROVED | MP9-R3 final four-pass audit + explicit owner approval | Exact approved execution source; READY_WITH_LIMITS only because delivery is intentionally serial |
| v4 | 2026-09-25 | APPROVED | MP9-R4 importer metadata compatibility + explicit owner approval | Exact approved execution source; handoff authorized |
| v5 | 2026-09-25 | APPROVED | MP9-R5 whitespace-only delivery correction + explicit owner approval | No scope change; versioned Upgrade authorized |
| v6 | 2026-09-25 | APPROVED | MP9-R6/R6F + MP9-A6 explicit owner approval | Five compatible stable-ID batches; stable-ID Upgrade and Developer handoff authorized; production excluded |

## 10. Current handoff state

```text
Plan: AMS-REALTY-BAZA-STARTER-V2-1-CLONE-READINESS-9 v6 APPROVED
Phase: APPROVAL_HANDOFF
Task Manager: v5 graph paused at ams9-task-s7-implementation before code writes
Developer handoff: AUTHORIZED AFTER CLEAN UPGRADE
Production: NOT AUTHORIZED
Next: stable-ID inventory v6 → Upgrade DryRun → Upgrade → Reconcile CLEAN → Developer
```

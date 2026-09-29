# AMS REALTY BAZA STARTER — FINAL COMMERCIAL FREEZE MASTER PLAN

**Plan ID:** `AMS-REALTY-BAZA-STARTER-FINAL-COMMERCIAL-FREEZE`  
**Plan number:** `12`  
**Version:** `v4`
**Date:** `2026-09-29`
**Status:** `APPROVED`
**Phase:** `APPROVAL_HANDOFF`
**Repository:** SourceCraft `integrator-p/ams-realty-baza-starter` — primary  
**Mirror:** GitHub `neyro-level/ams-realty-baza-starter` — one-way mirror only  
**Assembly baseline:** SourceCraft remote-tracking snapshot `main@84666f93af270b30b5e778e4b6a429de4949c391`  
**Target:** reusable commercial Realty starter for approximately 2 client projects/month  
**Architecture:** AMS Realty Platform Core Standard 5.5 + AMS UI Core v5.0  
**Primary execution model:** solo owner + AI  
**Input basis:** owner-provided external freeze plan incorporating GPT and Cloud Code audit material.  
**Predecessor:** Plan №11 `AMS-REALTY-BAZA-CLONE-FACTORY-2-2-11 v4 APPROVED`; implementation batches B1–B4 are present in the assembly baseline.  
**Prior approved snapshot:** `v3`, owner-approved `2026-09-28T14:01:35+03:00`
**Approved by:** `owner`
**Approved at:** `2026-09-29T08:34:01+03:00`
**Task Manager import:** `AUTHORIZED`; v3 requires a versioned v4 upgrade and clean reconciliation.

Version: v4
Status: APPROVED

---

# ARCHITECT ASSEMBLY STATE

The uploaded document is accepted as the existing basis for Plan №12 and is
treated as `v0 DRAFT` regardless of its original `FINAL CANDIDATE` label. The
prior `v3` remains the exact final-audited and owner-approved snapshot. The
current `v4` records a later owner waiver and is approved for its versioned
execution-graph upgrade.

Plan №12 is a residual remediation program after the implementation merge of
Plan №11. It must not reopen completed Plan №11 work unless exact-baseline
evidence demonstrates a defect or an incomplete contract. Plan №11 remains
historical execution evidence; its stale active-doc status is corrected by
this plan rather than interpreted as an active queue.

The following boundaries apply before execution:

```text
implementation scope = EPIC-01…EPIC-10
release/tag scope     = POST-IMPLEMENTATION RELEASE GATE, owner-triggered only
production            = out of scope
GitHub mirror         = out of scope unless separately ordered
```

The first four-pass final audit was run against exact v1 and remediated in v2.
The owner then clarified the universal-template boundary: the starter must not
require fabricated Souz facts; reusable geo behavior is proved by a separate,
clearly synthetic non-production fixture. OD12-01 is decided and all four passes
were repeated on exact v3. The owner approved this exact snapshot with the
phrase `План утверждён`; Task Manager import and Developer handoff are now
authorized, while production remains forbidden. The later v4 owner decision
waives only the disposable isolated PostgreSQL load-run requirement of EPIC-03
T6; it does not create a performance PASS or waive bounded-cache correctness.

---

# 0. EXECUTIVE DECISION

The starter is already a strong architecture and clone factory. It does **not** require another general backend rewrite.

Before the starter is frozen as the canonical commercial source for repeated cloning, the remaining work is concentrated in five areas:

1. SEO/indexing correctness.
2. Traffic/query safety and crawl load.
3. Development Content Gate correctness.
4. Clone ownership/update boundaries.
5. UI token/source-of-truth and reference-preset parity.

The final freeze condition is:

```text
P0 = 0
P1 = 0
active docs == actual implementation
exact-head SourceCraft Gate = PASS
clone matrix = PASS
upgrade propagation proof = PASS
immutable starter release tag exists
```

The target operating model after this plan is:

```text
RELEASED STARTER
→ COPY / SNAPSHOT
→ CLIENT REPOSITORY OWNS ITS PROJECT LAYER

while:

EXPLICIT OWNER-INITIATED starter:upgrade
→ may deliver platform/security/runtime fixes
→ never auto-updates a client
→ never overwrites client-owned data/config/copy
→ fails closed on conflicts
```

This preserves the UI Core snapshot model while preventing the practical failure mode where a security or SEO fix must be manually ported to dozens of client repositories.

---

# 1. SOURCES OF TRUTH USED BY THIS PLAN

Implementation must read in this order:

```text
1. project AGENTS.md and docs/README.md routing
2. applicable project Source of Truth documents
3. AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL
4. AMS UI Core / docs/DESIGN.md contract
5. this exact approved Plan №12 version, after approval
6. package.json, lockfile, code, migrations, configuration and tests as runtime truth
7. generated artifacts, which never override their declared inputs
```

For the Souz reference fixture:

```text
AMS_SOUZ_HOME_FINAL_MASTER_PLAN_V4_1_1
```

remains the project source for Souz-specific URL, geo, SEO and module decisions.

Historical plans/evidence may explain provenance but must not override active code or current canonical documents.

---

## 1.1 Version-sensitive documentation verification

Checked `2026-09-28` for installed Next.js `16.3.5`:

- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
  confirms shallow merge and replacement of nested `robots` / `openGraph` fields;
- [Next.js robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
  confirms the `MetadataRoute.Robots` shape has no Yandex `Clean-param` field;
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
  confirms custom text responses and dot-suffixed route segments such as
  `rss.xml/route.ts`; Plan №12 requires an exact-version build/runtime proof for
  `robots.txt/route.ts` before removing the old metadata file;
- [Yandex Clean-param](https://yandex.com/support/webmaster/en/robot-workings/clean-param)
  confirms `&`-separated case-sensitive parameter syntax, optional path and the
  requirement that ignored parameters must not affect page content.

```text
Docs status: PASS for metadata merge and Clean-param syntax
Custom robots route: SUPPORTED BY GENERAL ROUTE CONTRACT; exact 16.3.5 proof required
Installed code cross-check: package.json pins Next 16.3.5; current adapter and robots.ts reproduce the audited gaps
Remaining uncertainty: none before implementation; build/runtime proof is an explicit task acceptance
```

---

# 2. AUDIT SYNTHESIS

## 2.1 TRIAGED P1 FINDINGS

Triage is based on exact assembly baseline `84666f93…`:

| Finding | Assembly decision | Reason |
|---|---|---|
| F-01…F-05 | `ACCEPTED` | Exact code confirms the indexing, origin, sitemap, OG and development-Gate gaps. |
| F-06 | `REJECTED AS STATED` | Plan №11 owner decision OD11-03 deliberately established generated `src/project/brand.css` as the sole raw brand-primitive owner and `globals.css` as the semantic/component map. The new plan may harden this split but may not silently reverse it. |
| F-07…F-11 | `ACCEPTED` | Exact code/manifest/reference matrix confirms the residual upgrade, query and SEO gaps. |
| F-12 | `ACCEPTED WITH CORRECTION` | The real defect is conflation of a source-backed Souz reference subset with universal template capability. Full invented Souz parity is forbidden; a separate synthetic geo matrix proves reusable behavior. |
| F-13…F-18 | `ACCEPTED` | Exact code confirms the cleanup and guard gaps; they remain subordinate to existing owner-approved architecture. |

Exact-baseline evidence anchors:

| Finding | Primary evidence anchor |
|---|---|
| F-01, F-04 | `src/core/seo/page-metadata.ts`, `src/app/layout.tsx` |
| F-02 | `src/project/env.ts`, `src/project/seo/site.ts` |
| F-03 | `src/app/sitemap.ts` |
| F-05 | `src/project/routing/content-gate.ts`, development Gate facts in public data access/runtime route |
| F-06, F-13…F-15 | Plan №11 OD11-03, `src/project/brand.css`, `src/app/globals.css`, design-token guards |
| F-07 | `starter-owned.json`, starter ownership/upgrade scripts |
| F-08 | `src/project/routing/catalog-search-params.ts`, runtime route query handling |
| F-09 | `src/app/robots.ts` |
| F-10 | `src/project/routing/public-gateway-cache.ts`, public cache verification |
| F-11 | `src/project/seo/template-inputs.ts`, `src/project/seo/templates.ts`, SEO snapshots |
| F-12 | `docs/reference/SOUZ_MATRIX.json`, `scripts/verify-souz-parity.mjs` |
| F-16 | SiteProfile legacy validation and canonical URL grammar |
| F-17 | clone intake/preset schemas and metadata adapter |
| F-18 | active generated SEO input comments and active-version guards |

### F-01 — Global noindex is not compositional

Current page-level metadata can emit its own `robots` value through `toMetadata()`. In Next.js nested metadata is shallow-merged, so a page-level `robots` object can replace the root-layout `robots` object.

Risk:

```text
productionIndexing=noindex
+
page SEO says index
→ page-level metadata may expose index,follow
```

This is a release-safety defect.

### F-02 — Production public origin accepts HTTP

`NEXT_PUBLIC_SERVER_URL` is validated as `http | https` for production runtime.

That origin is used for metadata base, canonical absolute URLs, sitemap, JSON-LD, robots host and public discovery URLs. A production client origin must fail closed unless it is HTTPS. Loopback HTTP remains valid only for development/internal self-calls.

### F-03 — Sitemap failures are silent

`src/app/sitemap.ts` catches unexpected errors and converts them to an empty sitemap response.

Risk:

```text
DB/Gateway/SEO discovery outage
→ HTTP 200
→ empty sitemap
→ monitoring may not notice
```

Expected zero eligible URLs and a discovery-system failure are different states and must not be conflated.

### F-04 — Open Graph image is lost

The public contract supports `openGraph.image`, but the metadata adapter currently emits only OG title/description. The image contract is therefore not fully materialized.

### F-05 — Development Content Gate is incomplete

The canonical Souz Master Plan requires Tier A/B development indexing to depend on the complete factual passport and content/media thresholds.

Current Gate checks mainly tier, price rows, media count, layout count, progress and description length. It does not fully evaluate developer, city, address, coordinates, class, deadline/completion, salesStatus and description provenance.

Therefore an incomplete development can theoretically pass an indexing decision.

### F-06 — Brand-source reversal is rejected; ownership hardening remains

The external audit proposed moving raw client brand primitives back into
`src/app/globals.css`. That proposal conflicts with the explicit owner-approved
Plan №11 contract and is rejected.

Canonical split retained by Plan №12:

```text
src/project/brand.css = generated client-owned raw brand primitives only
src/app/globals.css   = platform-owned semantic/component token map
```

Residual work may strengthen generation, upgrade preservation and guards around
this split. It must not introduce a second raw-brand source or silently reverse
OD11-03.

### F-07 — Starter update ownership is too narrow

Current `starter-owned.json` v1 includes reusable core/packages/migrations and tooling but excludes `src/project` and `src/app` almost entirely. It also does not own several platform-sensitive root files such as `src/proxy.ts`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`.

Consequences:

1. migrations may update without matching Payload collection/schema code;
2. project routing, Content Gate, data-access, SEO templates and page runtime do not receive platform fixes;
3. robots, sitemap and metadata fixes do not propagate;
4. Next/Payload dependency security patches do not propagate.

This is the most important structural finding for long-term operation of many client repositories.

### F-08 — Advertising/tracking query parameters can produce 404

`parseCatalogSearchParams()` is strict. Any unknown query parameter returns `null`. The canonical runtime treats an invalid query as not found.

Therefore requests such as:

```text
/rostov-na-donu/kvartiry/?yclid=...
/rostov-na-donu/kvartiry/?utm_source=...
/rostov-na-donu/kvartiry/?gclid=...
```

can enter an invalid-query path.

Tracking parameters must not influence route resolution, Content Gate, canonical, business query or cache identity. They must remain present in the browser URL so analytics can observe them.

### F-09 — No explicit Yandex Clean-param contract

The current robots generator has no `Clean-param`.

Yandex supports and recommends `Clean-param` for GET parameters that do not change page content, because it reduces duplicate crawling and server load.

Implementation note: use a text-producing `/robots.txt` route so Yandex-specific directives can be emitted explicitly; do not depend on a typed metadata structure that cannot represent the extension cleanly.

### F-10 — Filtered catalog pages bypass persistent cache

`publicGatewayRouteCacheIdentity()` deliberately returns `null` when functional filters are present. This avoids unbounded persistent-cache keys, but means every filtered bot/user request reaches the data path.

Risk:

```text
crawler
→ many unique query combinations
→ repeated DB queries
→ weak VPS/DB tier degradation
```

The solution must remain bounded and must not introduce Redis or another production component.

### F-11 — SEO templates contain factual/language defects

Verified current template issues include:

1. facet composition uses a title-cased category form where a lowercase form is required;
2. rent can enter a `Купить ...` template;
3. geo hub copy hardcodes categories that may be PREPARED_OFF/OUT;
4. home template assumes a primary-city phrase even for MULTI_GEO;
5. microdistrict H1 contains the city although Souz Master Plan §17.3 defines the microdistrict H1 without the city;
6. developer descriptions use unsupported wording such as `проверенные`.

These are starter-level defects because the templates are reproduced into every client.

### F-12 — Souz completeness was conflated with universal template capability

Current Souz reference preset/matrix represents a source-backed subset of the
Souz v4.1.1 project contract. Treating the absence of every real Souz district
as a generic starter defect would couple the reusable platform to one client's
geography and would pressure implementation to invent unapproved facts.

Verified current preset contains only:

```text
2 administrative districts:
- Ленинский
- Ворошиловский

2 microdistricts:
- Северный
- Центр
```

The Souz Master Plan contains a broader client-specific seed. That expansion is
Souz/client work and must use verified source or owner-approved data. Starter
freeze instead requires two honest verification layers:

```text
SOUZ_MATRIX = only source-backed Souz facts and explicit Souz decisions
TEMPLATE_GEO_MATRIX = synthetic fixture-only geo coverage for generic behavior
```

The source-backed Souz subset still guards these known project behaviors:

- `/uslugi` is present although the R1 responsibility matrix uses `/otzyvy/`;
- journal R1 requirement is not represented as an explicit Souz target/module decision;
- global `/zastroyshchiki/` SINGLE_GEO behavior must be fixed as `200 noindex,follow`;
- legacy apartment detail compatibility `/kvartiry-rostova/{legacy-slug}/` is not represented;
- matrix claims must distinguish verified subset coverage from full client parity.

## 2.2 VERIFIED P2 FINDINGS

### F-13 — Verification-only blue theme ships in project CSS

`data-brand-proof="blue"` is generated into the runtime client CSS. Verification fixtures must not become client production styling.

### F-14 — Typography scale is excessively fragmented

Current token source contains a large number of near-adjacent font sizes, line-heights and tracking values. This increases per-client redesign cost and makes AI changes less predictable.

Consolidation must be visual-proof-driven, not a blind token deletion.

### F-15 — Some UI colors are not brand-derived

Examples:

```text
--home-articles-chip
--home-articles-chip-hover
--home-articles-media
```

contain raw warm-neutral values rather than deriving from semantic/brand surfaces.

### F-16 — Legacy redirect target canonicality is not fully enforced

The SiteProfile validates basic destination shape and redirect-chain relationships but accepts destination forms with and without a trailing slash.

A legacy target that is not final canonical form can therefore create:

```text
301 legacy redirect
→ 308 slash normalization
```

Target validity must be checked against the canonical URL grammar, not only a regex.

### F-17 — Search engine verification is not preset-driven

There is no canonical clone input for Yandex Webmaster / Google Search Console verification. Each clone therefore requires manual metadata editing.

These values are public verification tokens, not application secrets, but they still need typed ownership.

### F-18 — Active source contains obsolete preset-version comments

Example:

```text
Client clones replace this file from preset v2
```

while the current supported preset schema is v3.

The guard must check active code/docs only and must exclude intentionally historical evidence.

---

# 3. RESOLVED AUDIT DISAGREEMENTS

## D-01 — Development media: do not require only project-owned files

The earlier GPT plan proposed an `owned media` threshold. That is rejected.

Core 5.5 allows feed images to remain external by default. Souz data also supports URL/key media inputs.

Canonical Gate concept becomes:

```text
VALID APPROVED MEDIA
=
managed project media
OR
approved external media URL
```

An external item counts only if all applicable checks pass:

- HTTPS;
- exact approved image host;
- valid media record;
- rights/provenance status required by its source;
- no localhost/private host;
- not rejected by media normalization;
- not an obvious duplicate of the same asset.

Uncontrolled hotlinks do not count.

The Gate field should therefore be named semantically, for example `validMediaCount` / `validLayoutCount`, not `ownedPhotoCount` for developments.

For secondary-property Gate, apply the same source-aware media principle where the existing architecture already supports approved external feed images.

If the Souz Master Plan wording still says `project-owned storage` for this threshold, update that project contract/ADR during this plan so Core, project docs and code do not contradict one another.

## D-02 — Snapshot remains default, but explicit upgrades are supported

Default:

```text
released starter
→ snapshot clone
→ client owns project layer
```

There is no automatic propagation of starter changes.

However:

```text
owner explicitly runs starter:upgrade
```

and the upgrade channel must be capable of safely delivering platform/security/runtime changes.

This does not violate the snapshot principle because upgrade is an explicit maintenance operation, not a runtime dependency or automatic registry.

## D-03 — Preserve the approved brand.css / globals.css split

The proposed move of brand values into a protected `globals.css` segment is
rejected because it reverses Plan №11 owner decision OD11-03 without a new
owner decision.

Canonical ownership remains:

```text
src/project/brand.css = GENERATED from CLIENT brand input
src/app/globals.css   = PLATFORM semantic/component map
```

`starter:upgrade` must preserve the generated client brand file, update the
platform semantic map independently and then rerun deterministic generation
and design guards. Missing, manually drifted or non-reproducible generated
brand output is a hard failure.

## D-04 — Microdistrict H1 is not an open question

Souz Master Plan §17.3 already defines:

```text
APT_DISTRICT_MICRO H1
→ Квартиры {prepositionDistrict} {districtLocative}
```

without the city.

Therefore the starter template should follow that canonical behavior. No new owner decision is required for this specific point.

---

# 4. TARGET FILE-OWNERSHIP MODEL

`starter-owned.json` must evolve to schema v2.

Conceptual groups:

```text
PLATFORM
CLIENT
GENERATED
```

## PLATFORM

Reusable code that can receive an explicit starter upgrade:

```text
src/core/**
packages/**
migrations/**

platform portions of src/project/**
  collections schema
  access helpers
  public data-access engine
  routing engine
  lifecycle
  Content Gate integration
  SEO renderer/templates engine
  structured-data engine
  cache/invalidation
  jobs/runtime adapters

explicit platform route shells under src/app/**
src/proxy.ts
next.config.ts

platform scripts/guards/tests
deploy templates
package.json platform fields
pnpm-lock.yaml
```

## CLIENT

Owner/project-authored inputs that upgrade must never overwrite:

```text
project identity
NAP values
legal decisions/content
content/copy inputs
approved project SEO evidence
docs/seo/SEO_REGISTRY_SEED.csv
project-specific semantic snapshot
client media/assets
client custom sections explicitly outside platform ownership
```

## GENERATED

Deterministically regenerated from client-owned inputs:

```text
site-profile.config.ts
project copy output
SEO template inputs
generated SEO registry TypeScript projection
font config
client readiness config
project literals
src/project/brand.css
bootstrap/provenance files
```

Generated outputs are not hand-edited.

## Composite ownership

Some files require structural/segment ownership.

### `src/app/globals.css` and `src/project/brand.css`

These files are related but are not a composite text file:

```text
src/app/globals.css   = PLATFORM
src/project/brand.css = GENERATED from CLIENT input
```

The platform file may consume only the approved brand primitive API. The
generated file is regenerated and verified, never merged as platform text.

### `package.json`

At minimum:

```text
CLIENT:
name

PLATFORM:
engines
packageManager
scripts
core dependencies
core devDependencies

APPROVED CLIENT EXTENSIONS:
explicit client-only dependency overlay, if any
```

Storage activation or another approved client extension must not disappear during a platform dependency upgrade.

`pnpm-lock.yaml` is regenerated from the merged effective dependency model and then verified with frozen install.

---

# 5. EXECUTION GRAPH

```text
PRE-EXECUTION BASELINE FREEZE
   ├── EPIC-01 Ownership v2 + update boundary
   ├── EPIC-02 Global indexing / metadata / sitemap / HTTPS
   ├── EPIC-03 Query traffic / Clean-param / filter load / redirects
   ├── EPIC-04 SEO templates / factual copy / webmaster verification
   ├── EPIC-05 Development Content Gate
   └── EPIC-06 UI ownership hardening / tokens
          │
          ├── EPIC-07 Honest Souz reference + synthetic universal geo coverage
          └── EPIC-08 Real platform-upgrade propagation proof
                    │
                    └── EPIC-09 Active documentation reconciliation
                              │
                              └── EPIC-10 Final clone/performance/security verification

POST-IMPLEMENTATION RELEASE GATE
   explicit owner command only; outside the imported implementation graph
```

EPIC-01 through EPIC-06 are independent implementation streams after their
shared contracts are frozen in the approved plan. EPIC-02…EPIC-06 do not wait
for the whole ownership implementation: EPIC-08 is the point that proves all
accepted platform changes propagate through the finalized ownership model.

One Epic = one branch + one PR unless the owner explicitly chooses a smaller compatible batch.

Proposed delivery mode for EPIC-01…EPIC-10 is `MERGE_AFTER_GATE`: one full diff
review and one exact-head SourceCraft `STANDARD` or risk-specific `RISKY` Gate
per epic PR. Approval of the exact plan version authorizes only the delivery
modes written in that approved version; production and release remain excluded.

## 5.1 Preliminary dependency matrix

This is an assembly map, not the final audited DAG.

| Epic | Depends on | Type | Minimal blocking scope | Parallel-safe with |
|---|---|---|---|---|
| EPIC-01 | baseline freeze | `CONTRACT` | ownership schema and protected client inputs | EPIC-02…06 |
| EPIC-02 | baseline freeze | `CONTRACT` | indexing/metadata public contracts | EPIC-01,03…06 |
| EPIC-03 | baseline freeze | `CONTRACT` | query registry and canonical URL grammar | EPIC-01,02,04…06 |
| EPIC-04 | baseline freeze | `CONTRACT` | SEO input/template contracts | EPIC-01…03,05,06 |
| EPIC-05 | baseline freeze | `CONTRACT` | development Gate input and media semantics | EPIC-01…04,06 |
| EPIC-06 | baseline freeze | `CONTRACT` | approved brand/semantic ownership split | EPIC-01…05 |
| EPIC-07 | relevant contracts from EPIC-03,04,05 | `CONTRACT` | legacy, SEO and Gate reference fields only | completed independent work from EPIC-01,02,06 |
| EPIC-08 | merged EPIC-01…07 | `HARD` | finalized upgrade-relevant delta | none against shared upgrade fixtures |
| EPIC-09 | merged EPIC-01…08 | `HARD` | active docs must describe accepted implementation | none against active docs |
| EPIC-10 | merged EPIC-01…09 | `HARD` | exact integrated candidate | none |
| Release gate | accepted EPIC-10 on canonical main | `PRODUCTION` | immutable tag/release state only | none |

Shared-file serialization:

```text
starter-owned / starter-upgrade / package.json / lockfile → EPIC-01 owner
metadata / robots / sitemap / public origin              → EPIC-02 owner
query parser / URL grammar / legacy redirects            → EPIC-03 owner
SEO templates / preset verification inputs               → EPIC-04 owner
development Gate / media eligibility                     → EPIC-05 owner
brand.css / globals.css / token guards                    → EPIC-06 owner
Souz matrix / synthetic geo fixture / reference preset   → EPIC-07 owner
active canonical docs                                    → EPIC-09 owner
final orchestration and evidence                          → EPIC-10 owner
```

If an implementation discovery crosses one of these owners, the later epic
must consume a frozen contract or wait for the owning PR. Two active branches
must not edit the same shared contract independently.

## 5.2 Global epic contract

Every implementation epic inherits this contract unless it states a stricter
rule:

- **Source of Truth:** exact approved Plan №12, active project canon, exact
  working SHA and affected runtime/tests.
- **Entry:** dependencies for the minimal task scope are satisfied; branch and
  worktree start from current canonical SourceCraft main; working tree clean.
- **Exit:** observable outcome and epic DoD pass; required evidence, changed
  files, exact commit/head SHA and deviations are recorded.
- **Delivery:** one epic branch/worktree/PR; full diff review; one exact-head
  `STANDARD` or risk-specific `RISKY` SourceCraft Gate; merge only with green
  evidence and unchanged head.
- **Rollback:** revert the epic PR or restore the previous versioned contract;
  data/schema changes additionally require an explicit migration recovery
  path and non-empty-data proof.
- **Stop:** changed or unknown baseline, red required check, undocumented
  owner decision, incompatible shared contract, secret/production requirement,
  destructive data action, or evidence that contradicts the plan.
- **Forbidden:** production, tag creation, GitHub reverse sync, automatic
  client updates, guessed factual data and silent scope expansion.

External preflight contract:

```text
SourceCraft primary write/API/Gate access
  preflight: before first delivery and again before each exact-head Gate
  fallback: none; GitHub mirror is not a substitute
  failure: record blocker, keep branch/PR evidence, continue only independent work

Disposable PostgreSQL/runtime harness
  preflight: before DB-dependent task or EPIC-10 matrix
  preferred: reuse the existing Plan 11 isolated disposable harness
  fallback: none for a proof that explicitly requires that harness
  failure: block only the dependent proof; never claim PASS from static checks

Docker
  applicability: only if the retained Plan 11 disposable matrix requires it
  preflight: before the dependent matrix task
  fallback: no native-PostgreSQL result may masquerade as Docker parity proof
  failure: block the matrix while other independent work may continue
```

---

# PRE-EXECUTION BASELINE AND FINDING FREEZE

**Risk:** STANDARD  
**Imported to Task Manager:** no  
**Goal:** verify the approved plan still starts from a known canonical main.

## Tasks

- record exact SourceCraft `main` SHA used to start this plan;
- confirm GitHub is only a mirror;
- record exact versions from `package.json` / lockfile;
- freeze the finding register F-01…F-18;
- keep the finding register in this canonical plan; do not create a competing audit document;
- mark Plan №11 `EXECUTION_COMPLETE / EVIDENCE` in active docs without rewriting its historical report;
- do not create a release tag yet.

## DoD

```text
one exact baseline SHA
one finding register in this plan
one active execution plan
no ambiguity about canonical Git
```

## Checks

```bash
git status
git rev-parse HEAD
pnpm install --frozen-lockfile
pnpm verify:starter-drift
```

If canonical main changed after approval, update the worktree from SourceCraft,
revalidate affected findings and record the new exact baseline before claiming
the first task. A changed baseline is not permission to import a stale graph.

---

# EPIC-01 — STARTER OWNERSHIP V2 AND UPGRADE BOUNDARY

**Severity:** P1  
**Risk:** RISKY  
**Findings:** F-07, D-02, D-03

## T1 — `starter-owned.json` schema v2

Introduce explicit ownership:

```text
platform
client
generated
composite
```

Every tracked runtime/source file relevant to a client clone must resolve to exactly one owner or one declared composite ownership rule.

Unclassified tracked runtime source = merge failure. Overlapping ownership = merge failure.

## T2 — Platform coverage

Platform ownership must include all reusable code required to deliver fixes to existing clients, including at minimum:

```text
src/core/**
packages/**
migrations/**

src/project/collections/**
src/project/data-access/**
platform-owned src/project/routing/**
platform-owned src/project/seo/**
src/project/jobs/**
src/project/cache/** where present

explicitly classified platform route shells under src/app/**
src/proxy.ts
next.config.ts

package.json platform fields
pnpm-lock.yaml
deploy templates
platform guards/tests/scripts
```

Do not blindly classify all `src/project/**` or all `src/app/**` as platform.
The manifest must classify files at the narrowest safe tree/file boundary and
declare client extension slots. A client-owned custom route or section may not
become upgrade-owned merely because it lives below `src/app`.

## T3 — Collection/migration invariant

Add a guard:

```text
schema owner file
and
its migrations
must participate in the same platform upgrade contour
```

An upgrade archive containing a migration that requires a newer collection/schema implementation must be rejected if the required implementation files are absent.

## T4 — Generated-file regeneration contract

Upgrade workflow:

```text
verify source starter version
→ apply platform files
→ preserve client inputs
→ regenerate generated files using new generator
→ regenerate dependency lock if needed
→ run migrations only after code/contract verification
→ run targeted verification
→ update .starter-version
```

A generated output is replaced by regeneration, not a three-way text merge.

## T5 — `package.json` structured merge

Preserve client identity and approved client extensions while allowing platform dependency updates.

Minimum acceptance:

```text
package name preserved
Next/Payload patch arrives
approved client S3 dependency preserved
scripts updated
frozen install succeeds
```

## T6 — Composite-file framework

Add explicit marker/structured merge support.

Required structured file: `package.json`.

`src/app/globals.css` is PLATFORM and `src/project/brand.css` is GENERATED from
CLIENT input; they are verified as two owners and must not be converted into a
shared text-merge surface.

Text-level blind overwrite is forbidden for composite files.

## T7 — Client modification safety

If a client modifies a PLATFORM file:

```text
starter:upgrade
→ does not overwrite
→ creates conflict artifact/report
→ starter version remains old
→ owner resolves explicitly
```

## T8 — Snapshot remains default

Document:

```text
NO background update
NO automatic update
NO runtime starter dependency
```

Only explicit owner command invokes an upgrade.

## DoD

- all upgrade-relevant tracked files classified;
- collection + migration drift cannot occur;
- app/SEO/security fixes can reach existing clones;
- client content/config is protected;
- generated outputs are deterministic;
- dependency patches can propagate.

## Required tests

```text
unclassified file negative fixture
overlap negative fixture
collection-without-implementation negative fixture
migration-without-code negative fixture
modified platform file conflict
generated regeneration idempotency
package merge
lockfile frozen install
symlink/traversal protection
interrupted upgrade recovery
```

---

# EPIC-02 — GLOBAL INDEXING, METADATA, DISCOVERY AND PUBLIC ORIGIN

**Severity:** P1  
**Risk:** RISKY  
**Findings:** F-01, F-02, F-03, F-04

## T1 — Final robots composition

Implement one canonical function:

```text
GLOBAL INDEXING POLICY
×
PAGE CONTENT GATE
×
LIFECYCLE
=
FINAL ROBOTS
```

Invariant:

```text
global noindex can never be raised to index by a page
```

Required cases:

```text
starter-demo + page index → noindex
client noindex + page index → noindex
client public + page index → index
client public + page noindex → noindex
archived entity → noindex
```

This final page-level robots composition is separate from the crawler-policy
file at `/robots.txt`; both consume the same global indexing policy.

## T2 — Single metadata adapter

`src/core/seo/page-metadata.ts` becomes the only public-site adapter that materializes title, description, canonical, final robots, Open Graph and webmaster verification where applicable.

Add a guard against page-level direct business SEO metadata construction outside approved adapters.

## T3 — OG completeness

Map `openGraph.image` to Next metadata.

Required behavior:

```text
managed relative image → resolved using metadataBase
approved external image → retained as absolute HTTPS URL
no factual image → no invented OG image
```

Also set canonical OG URL where appropriate.

## T4 — Production HTTPS fail-closed

Production public origin must satisfy:

```text
protocol = https
hostname = approved client domain
no credentials
no path/query/hash
```

Allowed HTTP exceptions are development/test loopback and internal self-call origin. They must not become `NEXT_PUBLIC_SERVER_URL` for a public production client.

## T5 — Sitemap failure semantics

Remove generic:

```text
catch → []
```

Unexpected discovery/Gateway failure:

```text
→ request failure / 5xx
→ safe log
→ observable by external monitoring
```

Expected states may still return an empty sitemap:

```text
global noindex
zero eligible URLs
```

These states must be explicit, not exception-driven.

## T6 — Sitemap monitor

Client monitoring blueprint must check:

```text
/robots.txt
/sitemap.xml
at least one expected shard when public indexing is enabled
```

A public project with previously non-empty sitemap returning an error/empty result is alertable.

## T7 — Exact custom robots route contract

Next.js `MetadataRoute.Robots` cannot represent Yandex `Clean-param`. Replace
`src/app/robots.ts` with one custom text Route Handler at:

```text
src/app/robots.txt/route.ts
```

The old metadata file and the custom handler must never coexist. Acceptance:

```text
GET /robots.txt → 200 text/plain; charset=utf-8
public mode → Allow/Disallow + Host + Sitemap + one generated Clean-param
noindex mode → Disallow: / and no Clean-param
proxy matcher excludes /robots.txt
route behavior is proven on installed Next 16.3.5
```

Cache/revalidation behavior must be explicit and covered by a route smoke; do
not rely on the default caching semantics of the removed special metadata file.

## T8 — Regression matrix

Add:

```text
global noindex × page index
global public × page noindex
archived entity
query variant noindex
Tier C noindex
newbuild unit noindex
sitemap gateway failure
HTTP production origin rejection
OG image mapping
```

## DoD

One effective indexing authority controls metadata, robots, sitemap and discovery eligibility.

---

# EPIC-03 — INCOMING TRAFFIC, QUERY NORMALIZATION, CRAWL LOAD AND LEGACY REDIRECTS

**Severity:** P1  
**Risk:** RISKY  
**Findings:** F-08, F-09, F-10, F-16

## T1 — Canonical tracking-parameter registry

Create one typed platform contract, for example `trackingQueryParams`.

Initial exact names:

```text
utm_source
utm_medium
utm_campaign
utm_content
utm_term
utm_id
utm_referrer
utm_media
utm_group
utm_expid
yclid
ysclid
yrclid
gclid
_openstat
```

Do not use `utm_*` literally in `robots.txt`; `Clean-param` uses explicit parameter names.

`from` is intentionally not a platform default because it is semantically
ambiguous and may affect content in a client project. A project may add it only
after a route/query audit proves it is tracking-only and adds regression tests.

A project may extend the list. Removing a default item because it affects content requires an explicit project decision and regression tests.

## T2 — Strip tracking only from content interpretation

Pipeline:

```text
raw request URL
→ preserve browser URL
→ separate tracking params
→ parse functional catalog params
→ Gate/cache/business query use normalized functional params only
```

Tracking params must not affect 200/404 route decision, canonical, Content Gate, normalized pagination, query-cache identity or business filtering.

They remain visible to browser analytics such as Yandex Metrika.

## T3 — Paid traffic acceptance

Required fixture:

```text
/rostov-na-donu/kvartiry/?yclid=123&utm_source=yandex
→ HTTP 200
→ same content as clean URL
→ canonical /rostov-na-donu/kvartiry/
→ no redirect required
→ tags still present in browser request URL
```

Equivalent tests for `gclid`, `_openstat` and multiple UTM values. Test `from`
only in a project fixture that explicitly opts it into the tracking registry.

Unknown non-tracking keys remain fail-closed unless separately allowed.

## T4 — Yandex `Clean-param`

Replace/extend current robots generation with a text-producing route that can emit Yandex-specific directives.

Target public-mode directive:

```text
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&utm_id&utm_referrer&utm_media&utm_group&utm_expid&yclid&ysclid&yrclid&gclid&_openstat
```

The platform-default directive omits `from`. If a project explicitly opts it
in under T1, the same typed registry adds it to both request normalization and
the emitted directive.

Only emit it when indexing mode is `public`.

The exact emitted parameter list must be generated from the same typed tracking registry used by request normalization. Do not maintain two independent lists.

## T5 — Filter-query resource protection

Keep high-cardinality functional filters out of unbounded persistent Next cache.

Add bounded protection with no new infrastructure.

Preferred sequence:

```text
1. normalize functional query
2. measure current DB path
3. add short-lived bounded per-runtime LRU/dedup cache for filtered query results
4. if load proof still fails, add project-configured catalog-query rate limiting
```

Bounded-cache requirements:

```text
finite key count
finite TTL
normalized key only
tracking params excluded
no PII
no arbitrary tags
safe eviction
memory ceiling tested
```

Do not introduce Redis/Meilisearch for this task.

TTL/key limits are engineering configuration and must be fixed by the implementation PR using measured memory/query evidence; they must not be guessed in project copy.

## T6 — Owner waiver record for isolated query-load proof

**Owner decision OD12-02:** for this reusable starter, do not create or run a
new isolated PostgreSQL performance/load test with 1000 filter combinations.

T6 is deliberately narrowed to recording that decision in this canonical plan
and carrying the exact source change with the EPIC-03 stream. It does **not**
measure DB query count, p50/p95, memory growth, eviction under database load or
error rate, and it must not be reported as a performance PASS.

What remains proven by EPIC-03 T5 is the in-runtime bounded-cache contract:

```text
finite key count
finite TTL
normalized key only
tracking params excluded
no PII or arbitrary tags
safe eviction and configured memory ceiling
```

Acceptance:

```text
OD12-02 is recorded with its exact limit
no new isolated database/load suite is added or run for T6
no catalogue p95, DB-query or throughput claim is made from T6
client-specific staging/performance proof remains a separate later obligation
```

The Core target `catalog list data path p95 <= 300 ms` remains an unmeasured
target, not evidence for the starter. A client clone may measure it later with
its own approved data volume, database topology and traffic model; that work is
outside this Plan 12 execution graph.

## T7 — Legacy target canonicality

At SiteProfile/grammar validation time `legacyRoutes.to` must already equal the final canonical normalized path.

For a target that is parseable by canonical grammar:

```text
buildUrl(parseUrl(to)) === to
```

must hold.

Static canonical destinations must use their canonical trailing-slash form.

Invalid target = build/validation failure, not runtime `301 → 308`.

## T8 — Parameterized legacy apartment route

Add typed support required by Souz migration evidence:

```text
/kvartiry-rostova/{legacy-slug}/
→ resolved canonical /kvartiry/{semantic}-{publicUrlId}/
```

Rules:

- lookup is entity-aware;
- no blind string rewrite;
- active entity → direct 301;
- archived/purged entity follows lifecycle policy;
- no target → explicit 404/410 decision;
- no chain through `/obekty/`;
- redirect target is final canonical URL.

## DoD

Paid traffic cannot be broken by common tracking tags, Yandex receives an explicit duplicate-cleanup contract, query crawl cannot create unbounded DB/cache load, and legacy redirects are one-hop canonical.

---

# EPIC-04 — SEO TEMPLATE CORRECTNESS AND SEARCH-CONSOLE OWNERSHIP

**Severity:** P1  
**Risk:** RISKY  
**Findings:** F-11, F-17, F-18

## T1 — Category grammatical forms

Extend project SEO category forms with at least:

```text
nominativePlural
nominativePluralLower
accusativeSingular
genitivePlural
dealVerb
```

Examples:

```text
kvartiry:
  nominativePlural = Квартиры
  nominativePluralLower = квартиры
  dealVerb = Купить

arenda:
  nominativePlural = Аренда недвижимости
  nominativePluralLower = аренда недвижимости
  dealVerb = Снять
```

Do not infer Russian cases in runtime template code.

## T2 — Facet template

Canonical composition:

```text
{facet} {categoryLower} {cityPhrase}
```

Snapshot:

```text
Вторичные квартиры в Ростове-на-Дону
```

## T3 — Rent templates

Any route owned by `arenda` must use rent-intent wording.

Guard:

```text
category = arenda
AND rendered metadata contains "Купить"
→ FAIL
```

Use `dealVerb`/dedicated rent template variants rather than ad-hoc string replacement.

## T4 — Dynamic active-category list

Add derived factual input:

```text
activeCategoriesList
```

For a geo hub, build only from locally ACTIVE/visible categories. Never mention PREPARED_OFF/OUT categories.

Example:

```text
Souz R1
→ квартиры и новостройки
```

not `квартиры, дома и новостройки` if houses are disabled.

## T5 — Home SINGLE_GEO / MULTI_GEO split

Do not reuse a primary-city home title for a multi-city agency site.

Required variants:

```text
HOME_SINGLE_GEO
HOME_MULTI_GEO
```

SINGLE may use approved primary-city morphology. MULTI must use brand/agency/general commercial intent without pretending the whole site belongs to one city.

## T6 — Microdistrict H1 parity

Implement Souz Master Plan §17.3 behavior:

```text
Title:
Купить квартиру {districtPhrase} {cityPhrase} — цены

H1:
Квартиры {districtPhrase}
```

The H1 does not repeat the city.

## T7 — Remove unsupported marketing claims

Default SEO templates must not contain unsourced evaluative claims.

Add a guard over active project SEO templates for default-unverified terms such as:

```text
проверенный
лучший
надёжный
№1
официальный
```

A project may only use such a claim through an explicit sourced project decision, not from platform defaults.

## T8 — Search engine verification input

Extend intake/preset with:

```text
searchConsole:
  yandex: string | null
  google: string | null
```

Rules:

- values are public verification tokens;
- no token is invented;
- null means no tag;
- generated client metadata owns output;
- platform adapter renders it using pinned Next metadata APIs.

Add version-sensitive proof for Next `16.3.5`.

## T9 — Version-comment guard

Fix active comments such as `preset v2` when current schema is v3.

Guard scope:

```text
src/**
scripts active runtime/tooling
AGENTS.md
docs/README.md
docs/PROJECT.md
docs/03_ARCHITECTURE.md
docs/CLONE_ONBOARDING.md
docs/DESIGN.md
docs/OPERATIONS.md
```

Exclude intentionally historical:

```text
docs/legacy/**
docs/evidence/**
archived master plans
```

## Required SEO snapshot profiles

```text
Souz SINGLE_GEO
SECONDARY_FIRST SINGLE_GEO
NEWBUILD_FIRST SINGLE_GEO
MIXED MULTI_GEO
rent-enabled fixture
```

## DoD

SEO templates cannot publish grammatically wrong, mode-wrong or unsupported factual copy.

---

# EPIC-05 — DEVELOPMENT CONTENT GATE AND MEDIA SEMANTICS

**Severity:** P1  
**Risk:** RISKY  
**Findings:** F-05, D-01

## T1 — Development Gate factual input

Extend the Gate input with explicit facts:

```text
developerPresent
cityPresent
addressPresent
coordinatesPresent
classPresent
completionOrDeadlinePresent
salesStatusPresent

description
descriptionSource
descriptionCheckedAt

validPriceRows
validMediaCount
validLayoutCount
progressPresent
dataTier
```

Avoid deriving a `present` fact from display strings after DTO formatting if a safer structured source exists.

## T2 — Valid approved media definition

A development media asset counts when it is one of:

```text
managed project media
approved external media
```

Approved external media requires:

```text
https
exact approved host
valid normalized URL
allowed media kind
rights/provenance state required by source
not rejected by security/media guards
```

Uncontrolled hotlink = does not count.

## T3 — Tier A canonical Gate

Use the Master Plan numeric thresholds, not audit prose.

Tier A candidate requires all applicable passport facts plus:

```text
fresh price rows >= 2
valid media >= 8
valid layouts >= 1
progress record >= 1 unless completed
description >= 1500 chars
description provenance present
```

Price freshness:

```text
<=45 days → public fresh price
>45 days → price hidden
all prices >120 days → Gate FAIL
```

## T4 — Tier B canonical Gate

Tier B candidate requires the same required passport facts plus:

```text
fresh price rows >= 1
valid media >= 3
description >= 600 chars
description provenance present
```

No Tier B layout minimum unless the canonical project config explicitly requires one.

## T5 — Tier C

Tier C remains:

```text
200
noindex,follow
self-canonical
outside sitemap
```

It must still meet this exact minimum public/render passport:

```text
stable id + slug + PageKey + canonical href
non-empty name + development kind + cityName
explicit salesStatus + salesAvailability
valid profile status and non-missing/non-gone lifecycle
DTO validation passes without invented fallback facts
```

Address, developer, coordinates, class, completion/deadline, description,
price, media and layouts may be absent for Tier C; their absence must be shown
honestly and must keep the page `noindex,follow`. OUT/PREPARED_OFF and
missing/gone lifecycle still use their existing 404/410 rules rather than the
Tier C fallback.

## T6 — Provenance

Top-level generic `source/checkedAt` must not silently prove every content field.

Description Gate uses provenance of the effective published description. Price Gate uses provenance of effective price rows. Media Gate uses media rights/source provenance.

## T7 — Missing passport negative matrix

Each missing fact must independently fail indexing:

```text
developer
city
address
coordinates
class
completion/deadline
salesStatus
description source
description checkedAt
```

Expected for otherwise public entity:

```text
200 noindex,follow
outside sitemap
```

not fake 404.

## T8 — Documentation reconciliation

If project Master Plan text still requires only project-owned media, update the project ADR/Master Plan contract to the approved-media model so it aligns with Core feed-image behavior.

## DoD

No incomplete or unsourced Tier A/B development can become indexable.

---

# EPIC-06 — UI OWNERSHIP HARDENING AND CLONE-SAFE THEME

**Severity:** P1 foundation + P2 cleanup  
**Risk:** RISKY  
**Findings:** F-13, F-14, F-15, D-03; F-06 rejected as stated

## T1 — Preserve the approved two-file ownership boundary

Keep the owner-approved contract:

```text
src/project/brand.css = generated raw client brand primitives
src/app/globals.css   = platform semantic/component token map
```

Strengthen guards so no raw client brand primitive appears outside
`brand.css`, and no component/page CSS bypasses the semantic map.

## T2 — Upgrade preservation and regeneration

`starter:upgrade` updates `globals.css` as platform code, preserves client brand
input and regenerates `brand.css` deterministically with the upgraded generator.

Tests:

```text
platform semantic-token change arrives
client accent remains unchanged
client radii remain unchanged
missing generated brand file fails or regenerates deterministically
manual modification in generated brand output is detected
second raw-brand source fails
```

## T3 — Verification theme does not ship

Remove `:root[data-brand-proof="blue"]` from generated client runtime CSS.

Move the second-theme proof to a test fixture, temporary generated CSS or isolated test stylesheet.

Production clone output must contain zero `data-brand-proof` selectors.

## T4 — Brand-derived home article surfaces

Replace raw warm-neutral project values for:

```text
--home-articles-chip
--home-articles-chip-hover
--home-articles-media
```

with semantic derivation from approved brand/surface tokens using `color-mix()` or existing semantic surfaces.

## T5 — Typography consolidation

Inventory font-size, line-height and letter-spacing.

Consolidation rule:

- only merge values when the visual source delta is `< 0.5 px` or an equivalent proof shows no layout regression;
- preserve semantic role names where useful;
- remove aliases/values only after usage analysis;
- run representative visual snapshots.

If more than 24 distinct effective font-size values remain after safe consolidation:

```text
NEEDS_OWNER
```

with a report explaining why each remaining family is necessary.

Do not force a target number by breaking layouts.

## T6 — Tracking consolidation

Apply the same role-based consolidation logic to line-height and letter-spacing. Do not merge materially different editorial/display roles merely to reduce count.

## T7 — Updated token guard

Guard must enforce:

```text
raw project brand primitives → brand.css only
semantic/component mappings → globals.css
component/page CSS → var(--*) for design values
test proof colors → tests only
dead project tokens → 0 unless documented reservation
```

## T8 — Clone proof

Generate at least two materially different client themes.

Verify:

```text
UI source unchanged
brand block differs
semantic map unchanged
no raw brand leak elsewhere
visual representative pages acceptable
```

## DoD

Changing client brand/design primitives no longer requires editing dozens of component values, and platform upgrades do not overwrite the client theme.

---

# EPIC-07 — HONEST SOUZ REFERENCE + SYNTHETIC UNIVERSAL GEO COVERAGE

**Severity:** P1 reference integrity  
**Risk:** STANDARD  
**Findings:** F-12

Souz is a source-backed client reference, not the universal starter data model.
It must never contain invented client facts. Generic starter capability is
proved independently by a clearly synthetic, non-production geo fixture.

EPIC-07 is limited to reference data, preset/matrix semantics and their guards.
If its implementation discovers a required schema or reusable runtime change,
stop and route that change to the owning RISKY epic or a plan revision; do not
silently expand EPIC-07 risk/scope.

## T1 — Make `SOUZ_MATRIX.json` claims exact and source-backed

For every represented Souz behavior, include exact source coverage where applicable:

```text
§4.4 Souz R1 project config
§9.4 represented district subset
§9.5 apartment district page tiers
§17.3 canonical metadata templates
§18 active route skeleton
§20 legacy migration policy
§30 R1 page responsibility matrix
module/journal requirements relevant to R1
```

Every Souz field must cite a source section or explicit owner decision. The
matrix must label itself `sourceBackedSubset`, not claim complete real-client
geo parity, until a separate Souz scope supplies the remaining verified data.

## T2 — Add a separate synthetic universal geo matrix

Create `TEMPLATE_GEO_MATRIX` (exact implementation filename may follow project
naming) with explicit safeguards:

```text
fixtureOnly = true
synthetic = true
indexing = noindex
clientExportByDefault = false
productionSeed = forbidden
```

Use the fictional city `Тестоград` (`testograd`) with explicit city forms:

| Field | Value |
|---|---|
| nominative | `Тестоград` |
| genitive | `Тестограда` |
| prepositional | `Тестограде` |
| preposition | `в` |

Add eight fictional administrative districts with explicit forms:

| Name | Slug | Locative | Genitive |
|---|---|---|---|
| Северный | `severnyy` | Северном | Северного |
| Южный | `yuzhnyy` | Южном | Южного |
| Западный | `zapadnyy` | Западном | Западного |
| Восточный | `vostochnyy` | Восточном | Восточного |
| Центральный | `tsentralnyy` | Центральном | Центрального |
| Прибрежный | `pribrezhnyy` | Прибрежном | Прибрежного |
| Лесной | `lesnoy` | Лесном | Лесного |
| Степной | `stepnoy` | Степном | Степного |

Add four fictional microdistrict records:

| Name | Slug | Locative | Genitive | Preposition |
|---|---|---|---|---|
| Солнечный | `solnechnyy` | Солнечном | Солнечного | `в` |
| Речной | `rechnoy` | Речном | Речного | `в` |
| Старая слобода | `staraya-sloboda` | Старой слободе | Старой слободы | `в` |
| Лесная поляна | `lesnaya-polyana` | Лесной поляне | Лесной поляны | `на` |

They exist only to exercise morphology, normalization, URL building,
SINGLE_GEO/MULTI_GEO and publication-state behavior.

Actual client clones receive their own verified geo during client intake. No
synthetic record may be copied into a client seed or exposed by default.

## T3 — District SEO classification in both matrices

Encode separately:

```text
P1
P2
TEST
filter-only
```

Do not infer page publication merely from existence of a normalized district
record. The Souz subset keeps only source-backed classification; the synthetic
matrix deliberately covers every state without making a real-world claim.

## T4 — Static/service surfaces

Souz R1 reference must match the project plan.

Required active/service representation includes:

```text
/
geo hub
novostroyki
kvartiry
zastroyshchiki
ipoteka
prodat
o-kompanii
otzyvy
kontakty
legal
```

`/uslugi` must not silently replace `/otzyvy`.

Its legacy fate, if needed, is an explicit migration decision.

## T5 — Journal

Souz Master Plan includes journal in R1.

The reference must explicitly record one of:

```text
journal module = active target
or
journal activation = required project step before R1
```

It must not be silently absent from parity.

Generic starter Base may still keep the journal module optional.

## T6 — Developer root

Souz SINGLE_GEO effective behavior:

```text
/zastroyshchiki/
→ 200
→ noindex,follow
→ outside sitemap
```

Represent this deterministically in the Souz profile/indexing contract. Do not rely on synthetic registry rows accidentally producing noindex.

## T7 — Legacy apartment details

Add reference coverage for:

```text
/kvartiry-rostova/{legacy-slug}/
→ final global canonical property URL
```

using the typed entity-aware legacy mechanism from EPIC-03.

## T8 — Reference-integrity negative fixtures

Verification must fail when any of the following regress:

```text
an unverified Souz district is presented as source-backed
the synthetic matrix has fewer than 8 admin districts or 4 microdistricts
a synthetic record becomes indexable, production-seeded or client-exported by default
/uslugi incorrectly active
/otzyvy missing
journal requirement missing
developer root becomes indexable in SINGLE_GEO
legacy apartment detail pattern missing
category/market/geo status drift
metadata template drift
```

## T9 — Reference matrix semantics

Current subset-based array checking is not sufficient for unordered domain collections.

For district/static-route sets, compare by stable keys (`slug`, `path`) rather
than relying only on array position/subset length. Emit separate results for
Souz source integrity and generic synthetic capability.

## DoD

Verification proves both: (1) every claimed Souz fact is source-backed and
known Souz behavior remains guarded; (2) the starter supports varied geo data
through an isolated synthetic matrix without hardcoding any client geography.

---

# EPIC-08 — END-TO-END STARTER UPGRADE PROPAGATION PROOF

**Severity:** P1 operational  
**Risk:** RISKY  
**Findings:** F-07

This Epic proves that the update channel actually solves the many-client maintenance problem.

## T1 — Build a realistic old client clone

Create a disposable client from an immutable local release fixture generated
from the exact pre-fix baseline. The fixture must use the same manifest/hash
validation path as a released starter but must not create or mutate a real
SourceCraft tag/release. An existing immutable released tag may be used only if
its manifest schema and provenance satisfy the same contract.

Client must contain client brand, client SiteProfile, client SEO registry/evidence, client copy, client legal/NAP and approved client storage extension where supported.

Fixture evidence records source SHA, manifest hash, generated archive hash and
the exact old `.starter-version`. A moving branch or unverified directory copy
is not an accepted baseline.

## T2 — Platform delta fixture

The upgrade package must include a realistic delta touching at least:

```text
one Payload collection/schema file
one matching migration
one src/app page/route shell
src/proxy.ts or equivalent platform request boundary
SEO metadata/Gate implementation
one SEO template engine file
next.config.ts
package.json dependency change
pnpm-lock.yaml
globals.css platform section
```

## T3 — Apply upgrade without manual copying

Run `starter:upgrade`.

Expected:

```text
platform changes applied
client brand preserved
client project config preserved
client SEO evidence preserved
client legal/NAP preserved
generated outputs regenerated
dependencies updated
migration/code stay in sync
```

## T4 — Post-upgrade verification

Run:

```bash
pnpm install --frozen-lockfile
pnpm verify:daily
pnpm verify:schema
pnpm verify:client-readiness
pnpm build
```

Then run project-specific smoke tests.

## T5 — Conflict fixture

Modify one platform file locally in the disposable client.

Upgrade must:

```text
stop
create deterministic conflict report
not partially advance .starter-version
not silently overwrite
```

## T6 — Generated drift fixture

Manually modify a generated file. Upgrade/verification must detect drift and require regeneration rather than treating it as authoritative client code.

## T7 — Migration safety

Upgrade must prove:

```text
old non-empty DB
→ new code
→ migrations
→ data preserved
→ new schema valid
```

No migration may be applied with old incompatible collection code.

## DoD

A real platform/security/SEO fix can be delivered to an existing client clone without manually copying files across the repository.

---

# EPIC-09 — ACTIVE DOCUMENTATION AND SOURCE-OF-TRUTH RECONCILIATION

**Severity:** P1 for docs-first workflow  
**Risk:** STANDARD

## T1 — Create one release-state authority

Create:

```text
docs/STARTER_RELEASE_STATE.md
```

Required fields:

```text
canonical SourceCraft repo
accepted main SHA
Core version
UI Core version
Node/pnpm/Next/React/Payload versions
ownership manifest version
current released starter tag
last exact-head Gate
clone-matrix status
upgrade-proof status
open P0/P1/P2
production/live proof status
```

## T2 — Plan 11 evidence status

Historical Plan 11 report may remain unchanged as candidate evidence, but active docs must not use `SOURCECRAFT GATE PENDING` as the current repository state after the merge has already happened.

Create/record post-merge evidence rather than rewriting historical facts.

## T3 — Reconcile active docs

Audit and update:

```text
AGENTS.md
docs/README.md
docs/PROJECT.md
docs/02_PRODUCT_STRUCTURE.md
docs/03_ARCHITECTURE.md
docs/04_BACKLOG.md
docs/05_RELEASE_CHECKLIST.md
docs/DESIGN.md
docs/OPERATIONS.md
docs/CLONE_ONBOARDING.md
docs/UPSTREAM_CANDIDATES.md
```

Topics that must agree:

```text
globals.css ownership
brand generation
snapshot + explicit upgrade model
starter-owned v2
preset schema v3
current release tag
current SHA
SEO indexing authority
tracking params / Clean-param
filter load protection
Souz reference scope
development media Gate
HTTPS origin
```

## T4 — Master Plan baseline rule

Client project plans must pin:

```text
immutable released starter tag
+
exact SourceCraft SHA
```

not a moving `main`.

## T5 — Historical-document policy

Historical plans/evidence must have obvious status:

```text
HISTORICAL
SUPERSEDED
EVIDENCE ONLY
```

No AI should treat them as current execution source.

## T6 — Active-version guard

Implement the active-doc/code version guard from EPIC-04 T9.

## DoD

A fresh AI session can identify the current architecture and release state without reconstructing history from ten old master plans.

---

# EPIC-10 — FINAL VERIFICATION AND COMMERCIAL CLONE GATE

**Risk:** RISKY  
**Goal:** prove the final starter before immutable release.

## T1 — Full existing verification

Create one final verification manifest that maps each required capability to
exactly one owning command. On the exact SourceCraft candidate SHA, run the
final orchestrator once:

```bash
pnpm verify
```

Before execution, update `pnpm verify` or a single Plan №12 final orchestrator
so it includes every required Plan №12 capability exactly once. Do not rerun a
suite separately when its exact command and SHA evidence already appear in the
orchestrator. DB-required checks must fail closed, not silently skip.

## T2 — New mandatory suites

Add and run explicit checks equivalent to:

```text
verify:global-indexing
verify:metadata-adapter
verify:sitemap-failure
verify:https-origin
verify:tracking-query
verify:robots-clean-param
verify:filtered-query-load
verify:legacy-canonical-targets
verify:seo-template-matrix
verify:development-gate-passport
verify:ownership-v2
verify:starter-upgrade-e2e
verify:design-source-of-truth
verify:active-doc-state
verify:souz-source-integrity
verify:synthetic-geo-matrix
```

Names may follow repository conventions, but capabilities are mandatory.

The verification manifest must also map existing capabilities such as schema,
required integration, UI Core, client readiness, clone matrix, Souz source
integrity and synthetic universal geo coverage.
Duplicate invocation is a plan defect; missing capability is a failed gate.

## T3 — Five-profile clone matrix

Minimum:

```text
Souz reference
NEWBUILD_FIRST + SINGLE_GEO
SECONDARY_FIRST + SINGLE_GEO
MIXED + MULTI_GEO
districts + legacy migration
```

For every profile:

```text
clean clone/prepare
locked install
clean PostgreSQL migrations
seed
runtime HTTP
SEO contracts
build
cleanup
```

## T4 — Tracking traffic smoke

For every relevant catalog profile:

```text
clean URL
UTM URL
yclid URL
gclid URL
mixed tracking URL
functional filter + tracking URL
```

All tracking-only variations must resolve to the same content/canonical decision.

## T5 — SEO crawl matrix

Check:

```text
status
canonical
robots
title
description
H1
OG
structured data
sitemap inclusion
internal links
query variants
pagination
legacy redirects
404
410
```

## T6 — Performance/load

Record:

```text
catalog clean path p95
property detail p95
1000 unique filter-query protection test
memory behavior
DB query behavior
```

Do not claim LCP/CLS/performance PASS unless actually measured.

## T7 — UI representative browser proof

Profiles/pages:

```text
home
geo hub
catalog
filtered catalog
development A/B/C states
developer root/entity
secondary property
service page
legal page
404
410
```

Viewports:

```text
mobile
tablet
desktop
wide desktop
```

Check one H1, keyboard/focus, no horizontal overflow, no console error, form states, media fallback and reduced motion.

## T8 — Security regression

Re-run:

```text
anonymous raw REST deny
overrideAccess guards
secrets scan
safe outbound
PII logs/analytics
lead outbox
jobs owner
production schema push deny
image host allowlist
```

## DoD

```text
P0 = 0
P1 = 0
P2 blockers = 0
exact-head checks = PASS
```

---

# POST-IMPLEMENTATION RELEASE GATE — IMMUTABLE COMMERCIAL STARTER FREEZE

**Risk:** RISKY  
**Trigger:** explicit owner release command only
**Imported to Task Manager implementation graph:** no

This gate is a release procedure after EPIC-01…EPIC-10 are merged and accepted.
Plan approval does not authorize it. The owner must issue a separate release
command against an exact clean SourceCraft `main`.

## Preconditions

```text
EPIC-01…10 closed
SourceCraft main clean
P0=0
P1=0
release-state doc current
```

## R1 — Exact-main evidence validation

SourceCraft:

```text
accepted merged main SHA
== release candidate SHA
== reusable final verification evidence SHA
```

Any implementation change after proof invalidates the candidate. Do not rerun
the same paid development suite merely to rename evidence; rerun only evidence
invalidated by the changed SHA or required by the release workflow.

## R2 — Immutable starter release

Create the next owner-approved:

```text
starter-v2.MINOR.PATCH
```

Do not reuse an already documented target version if the resulting implementation differs from that historical target.

Release manifest contains:

```text
tag
exact SourceCraft SHA
starter-owned schemaVersion=2
platform file hashes
composite ownership metadata
Core/UI versions
runtime versions
migration set
client migration notes
known non-blocking limitations
```

## R3 — Clone provenance

Every new client records:

```text
source starter tag
source starter SHA
manifest hash
preset hash
generated-output hashes
```

## R4 — No clone from moving main

Commercial onboarding guard rejects a normal production client clone that is not based on an immutable released starter identity.

## Final status

After successful owner release:

```text
COMMERCIAL_CLONE_READY
```

---

# 6. FIRST CLIENT STAGING — NOT A GENERIC STARTER BLOCKER

The following are not generic starter defects, but the first real client must prove them before its own production release:

```text
real Timeweb Managed PostgreSQL TLS
real migrations
real backup/restore drill
real Timeweb S3 upload/read/delete
real client feed
real client lead channel
real monitoring/alerts
real production-like LCP/CLS
real catalog latency/capacity
real legal/NAP
real indexing activation
```

Starter freeze must not mark these as PASS without running them.

---

# 7. FINAL ACCEPTANCE MATRIX

| Area | Commercial freeze requirement |
|---|---|
| Schema owner | Payload only; collection + migration upgrade together |
| Access | explicit access mode, System Gateway override only |
| Public UI | DTO/contracts only |
| Ingest | idempotent, source-isolated, safe deactivation |
| Leads | local transaction/outbox + async delivery |
| PII | no public/log/analytics leakage |
| Jobs | one owner per queue |
| URL grammar | one builder/parser, deterministic canonical |
| Legacy redirects | direct final 301, no 301→308 |
| Global indexing | global noindex cannot be raised by page |
| Canonical origin | HTTPS in production |
| Sitemap | Gate-only and failure observable |
| Tracking params | never 404 or affect canonical/business query |
| Yandex duplicates | Clean-param from canonical tracking registry |
| Filter load | bounded, measured, no unbounded cache |
| SEO templates | grammatical, mode-aware, factual |
| Webmaster verification | preset-driven, optional, typed |
| Development Gate | full factual passport + canonical thresholds |
| Development media | approved managed/external media, no uncontrolled hotlink |
| Design values | globals.css only |
| Brand | protected generated marker in globals.css |
| Proof theme | tests only |
| Typography | consolidated with visual proof |
| Geo/reference fixtures | honest source-backed Souz subset + isolated synthetic universal matrix |
| Ownership | platform/client/generated/composite explicit |
| Upgrade | real app/schema/dependency fixes propagate explicitly |
| Docs | active docs == implementation |
| Clone | five-profile clean runtime matrix |
| Delivery | SourceCraft exact-head Gate |
| Release | immutable tag + release manifest |

---

# 8. DEFINITION OF READY TO COPY

The owner may begin routine production cloning only after:

```text
COMMERCIAL_CLONE_READY
+
immutable SourceCraft starter release exists
```

Standard client workflow then becomes:

```text
1. client intake
2. clone:init
3. clone:prepare from immutable starter release
4. create isolated SourceCraft client repository
5. provision local/staging data boundary
6. seed approved geo/NAP
7. import real semantic demand
8. approve SEO Registry rows
9. activate required project modules
10. load feed/development data
11. perform Design Intake / client composition
12. verify client readiness
13. staging
14. migration/SEO/performance proof
15. explicit client production release
```

The starter architecture is **not** re-audited from zero for each client.

Client-specific work focuses on:

```text
commercial positioning
content
geo
semantic SEO
inventory/data
brand
module activation
client integrations
legal
production proof
```

---

# 9. FINDING → EPIC TRACEABILITY

| Finding | Epic |
|---|---|
| F-01 global noindex | EPIC-02 |
| F-02 HTTPS origin | EPIC-02 |
| F-03 silent sitemap | EPIC-02 |
| F-04 OG image | EPIC-02 |
| F-05 development passport | EPIC-05 |
| F-06 proposed brand-source reversal | `REJECTED AS STATED`; EPIC-06 only hardens the approved split |
| F-07 update ownership | EPIC-01 + EPIC-08 |
| F-08 paid tracking 404 | EPIC-03 |
| F-09 Clean-param | EPIC-03 |
| F-10 filtered-query load | EPIC-03 |
| F-11 SEO templates | EPIC-04 |
| F-12 reference/universal geo boundary | EPIC-07 |
| F-13 proof theme | EPIC-06 |
| F-14 typography fragmentation | EPIC-06 |
| F-15 non-brand colors | EPIC-06 |
| F-16 redirect target canonicality | EPIC-03 |
| F-17 webmaster verification | EPIC-04 |
| F-18 preset-version comments | EPIC-04 + EPIC-09 |

---

# 10. NON-GOALS

Do not use this freeze to introduce:

```text
Prisma
second backend
Redis
broker
Meilisearch
Elasticsearch
PostGIS
Kubernetes
generic page builder
second UI library
second icon system
automatic client updates
server-side personal accounts
```

unless a separate real trigger and owner decision exists.

Do not redesign client pages merely because token cleanup is being performed.

Do not invent real client district morphology, prices, reviews, ratings, search
demand, NAP, legal facts, developer claims or media rights. Clearly labelled
synthetic fixture data is allowed only for isolated non-production verification.

---

# 11. ASSEMBLY REGISTERS

## 11.1 Owner decision register

### OD12-01 — Universal starter geo fixture boundary

- **Decision:** the reusable starter does not require a complete real Souz
  district table for approval. Do not invent missing Souz facts.
- **Owner direction:** keep Souz as an honest source-backed reference subset;
  use a separate fictional geo fixture to prove the universal template.
- **Implementation:** isolated `Тестоград` matrix with 8 fictional
  administrative districts and at least 4 fictional microdistricts, explicit
  morphology and publication states, forced non-production safeguards.
- **Client rule:** each real clone receives verified client geo during intake.
- **Date:** `2026-09-28`.
- **Status:** `DECIDED`; no execution blocker remains.

### OD12-02 — Isolated query-load proof waiver

- **Decision:** do not create or run a new isolated PostgreSQL load test for
  EPIC-03 T6 in this reusable starter execution.
- **Owner direction:** move ahead without that test; do not present the waived
  measurement as passed.
- **Retained protection:** T5 bounded cache, normalization, finite limits and
  static cache/dedup evidence remain required and already belong to EPIC-03.
- **Explicit limitation:** no p50/p95, database-query, throughput, RSS-under-DB
  load or rate-limit efficacy claim is established by Plan 12 T6.
- **Client rule:** a real clone may require staging/performance proof against
  its own approved data, database topology and traffic model before a client
  makes such a claim; that later work is outside this graph.
- **Date:** `2026-09-29`.
- **Status:** `DECIDED`; v4 approval is required before the Beads upgrade may
  supersede the v3 blocker.

## 11.2 Revision packet RP12-001

```text
Revision input ID: RP12-001
Source: owner-provided external plan + exact baseline verification
Targets: full document, findings, ownership model, dependency graph, release boundary
```

Accepted:

- residual SEO/indexing, query-safety, Content Gate, ownership-v2 and reference integrity,
  active-doc and final commercial proof scope;
- explicit snapshot default plus owner-initiated conflict-safe upgrades;
- approved external-media semantics with provenance and host controls;
- immutable commercial starter identity after a separate release command.

Rejected or corrected:

- original `FINAL CANDIDATE` status and non-protocol version label;
- repository wording that presented the GitHub mirror as the repository;
- runtime code above project Source of Truth in the reading hierarchy;
- moving raw brand primitives into `globals.css`, because it contradicts
  owner-approved Plan №11 OD11-03;
- a second `docs/audit/COMMERCIAL_FREEZE_FINDINGS.md` competing with this plan;
- serializing EPIC-02…06 behind full EPIC-01 implementation;
- importing baseline freeze or immutable release as ordinary implementation
  epics;
- rerunning identical paid checks at PR, main and release without invalidated
  evidence.

Already covered and reused:

- Plan №11 implementation on baseline `84666f93…`;
- generated `brand.css` plus platform `globals.css` ownership split;
- explicit starter upgrade/release manifest foundation;
- Souz owner decisions already frozen in Plan №11;
- SourceCraft-primary / GitHub-mirror delivery contract.

Needs owner: none before plan approval.

Sections changed:

- metadata and architect state;
- Source of Truth order and audit triage;
- D-03, file ownership and UI ownership contract;
- execution graph, preliminary dependency matrix and global epic contract;
- baseline handling and release isolation;
- revision, owner-decision and current-state registers.

Resulting version: `v1 REVIEW`.

## 11.3 Final audit register — v1 findings / v3 repeated result

| ID | Severity | Finding | Status / v3 action |
|---|---|---|---|
| P12-F01 | `BLOCKER` | Souz completeness was incorrectly required to prove a universal starter | `RESOLVED IN v3`; OD12-01 separates honest Souz evidence from synthetic generic coverage |
| P12-F02 | `MAJOR` | `from` was treated as a universal tracking-only parameter | `RESOLVED`; removed from platform defaults, project opt-in requires proof |
| P12-F03 | `MAJOR` | Plan required Clean-param but did not freeze an exact Next route contract | `RESOLVED`; one `robots.txt/route.ts`, old file removal, content type/cache/proxy/runtime proof |
| P12-F04 | `MAJOR` | Filter-load p95 claim lacked a reproducible environment/fixture contract | `RESOLVED`; exact fixture/runtime/concurrency/memory/query evidence required |
| P12-F05 | `MAJOR` | Tier C minimum public passport was ambiguous | `RESOLVED`; exact DTO/render minimum and lifecycle boundary added |
| P12-F06 | `MAJOR` | Upgrade propagation proof depended on a real released tag not authorized by implementation | `RESOLVED`; immutable local release fixture uses the real manifest/hash path without external tag mutation |
| P12-F07 | `MAJOR` | EPIC-10 repeated overlapping verification suites | `RESOLVED`; one capability manifest and one final orchestrator, no duplicate invocation |
| P12-F08 | `MAJOR` | SourceCraft/DB/Docker prerequisites lacked explicit preflight/fallback/stop rules | `RESOLVED`; external preflight contract added |
| P12-F09 | `MAJOR` | Blanket `src/app/**` platform ownership could overwrite client extensions | `RESOLVED`; narrow file/tree classification and explicit extension slots required |
| P12-F10 | `MINOR` | Final formula still described the rejected globals marker model | `RESOLVED`; formula aligned with approved brand.css/globals.css split |
| P12-F11 | `QUESTION` | E03 T6 required an isolated DB/load proof after the owner declined new isolated tests | `RESOLVED IN v4`; OD12-02 records a narrow waiver, preserves T5 correctness evidence and forbids a performance PASS |

### Pass 1 — Logic / Completeness

- All accepted findings F-01…F-18 map to EPIC-01…10; F-06 is explicitly
  rejected as stated and replaced by ownership hardening, not silently dropped.
- Baseline freeze and immutable release are correctly outside the imported
  implementation graph.
- Ten implementation epics have observable outcomes and DoD.
- All before-approval blockers are resolved; OD12-01 is recorded as decided.

### Pass 2 — Architecture / Data / Security

- Payload remains the only schema/migration owner; Prisma and a second backend
  remain forbidden.
- Public SEO/query/cache work stays behind canonical Gateway/DTO/Gate owners.
- Collection code and migrations share the same upgrade contour; non-empty-data
  migration proof is mandatory.
- Brand/client/generated/platform boundaries preserve Plan №11 owner decisions.
- Tracking normalization does not mutate the browser URL; arbitrary outbound,
  PII and production actions are not introduced.
- Official Next/Yandex documentation supports the metadata and Clean-param
  decisions; exact Next 16.3.5 route proof remains explicit acceptance.

### Pass 3 — Dependencies / Autonomy

```text
Audited implementation epics: 10
Dependency cycles: 0
Independent first wave: EPIC-01…06
Contract-dependent wave: EPIC-07 after relevant EPIC-03/04/05 contracts
Hard integration path: EPIC-01…07 -> EPIC-08 -> EPIC-09 -> EPIC-10
Production/release edge: isolated outside implementation
```

Shared-file ownership is explicit. A locally blocked EPIC-01…06 does not stop
the other first-wave epics. EPIC-07 no longer depends on unknown real-client
geo facts; it uses source-backed Souz data and the frozen synthetic matrix.

### Pass 4 — Executability / Evidence / Delivery

- Epic acceptance coverage: `10/10`; epic verification coverage: `10/10` via
  local matrices/negative fixtures and the final capability manifest.
- Delivery mode: `10/10 MERGE_AFTER_GATE`, one branch/worktree/PR and one
  risk-based exact-head SourceCraft Gate per epic.
- DB/runtime/performance/browser claims require their real surface and cannot
  be promoted from static inspection or historical evidence. OD12-02 is a
  documented exception only to performing the new isolated DB/load run; it
  leaves the resulting performance claim explicitly unmade.
- Release/tag, mirror and production remain separately owner-triggered.

### Audit scorecard

```text
Logic/completeness: blockers 0 / major 0 after remediation
Architecture/data/security: blockers 0 / major 0 after remediation
Dependency/autonomy: epics 10 / cycles 0 / first-wave parallel epics 6
Executability/evidence: epic acceptance 10/10 / verification 10/10
Owner decisions: before approval open 0 / later release decision 1
Unknown critical prerequisites: 0 after explicit preflight contracts
Production actions inside implementation: 0
```

### Night Run Readiness

```text
Independent ready waves: EPIC-01…06, then EPIC-07, EPIC-08, EPIC-09, EPIC-10
Critical path: relevant contracts -> EPIC-07 -> EPIC-08 -> EPIC-09 -> EPIC-10
Blocking owner decisions before execution: none
External prerequisites: SourceCraft access; disposable DB/runtime; conditional Docker
Fallback: none may be substituted for required exact proof
Production-only stops: release tag, mirror, production/client rollout
Safe work if one epic blocks: another first-wave epic until the EPIC-07 boundary
Result: READY_WITH_LIMITS
```

`READY_WITH_LIMITS` means the plan is complete and executable after explicit
owner approval, while SourceCraft access and the disposable runtime/conditional
Docker proof remain real execution prerequisites with no safe substitute.

## 11.4 Revision packet RP12-002

```text
Revision input ID: RP12-002
Source: owner final-audit command
Audit passes: logic / architecture-data-security / dependencies-autonomy / execution-evidence
Resulting version: v2 REVIEW / FINAL_AUDIT NOT_READY
```

Accepted and resolved:

- nine audit findings P12-F02…F10;
- exact custom robots route and official documentation evidence;
- safe tracking defaults, reproducible load proof and exact Tier C passport;
- immutable local upgrade fixture without release mutation;
- external preflight/fallback rules and verification economy;
- narrow app ownership and final formula drift.

Needs owner at the historical v2 checkpoint:

- P12-F01 / OD12-01.

Task Manager import and Developer handoff: `NOT ALLOWED`.

## 11.5 Revision packet RP12-003

```text
Revision input ID: RP12-003
Source: owner clarification that the product is a universal starter
Decision: honest Souz subset + isolated synthetic universal geo matrix
Audit passes repeated: logic / architecture-data-security / dependencies-autonomy / execution-evidence
Resulting version: v3 READY_FOR_OWNER_APPROVAL / READY_WITH_LIMITS
```

Resolved:

- OD12-01 and P12-F01 without fabricating any real Souz data;
- EPIC-07 now proves source integrity and universal behavior separately;
- synthetic geo cannot be indexed, production-seeded or exported to a client by default;
- all four final-audit passes remain green with 10 epics and zero dependency cycles.

Needs owner before execution: exact approval phrase only.

Task Manager import and Developer handoff: `NOT ALLOWED` until approval.

## 11.6 Approval packet AP12-001

```text
Approval: owner exact phrase `План утверждён`
Approved version: v3
Approved at: 2026-09-28T14:01:35+03:00
Readiness at approval: READY_WITH_LIMITS
Authority: Task Manager import + plan-authorized MERGE_AFTER_GATE delivery
Excluded authority: release tag, GitHub mirror and production
```

Result: `APPROVED`; inventory validation, import, reconciliation and Developer
handoff must use the SHA-256 of this exact snapshot.

## 11.6a Revision packet RP12-004 — v4 waiver audit

```text
Revision input ID: RP12-004
Source: explicit owner direction to skip new isolated tests
Targets: EPIC-03 T6, owner decision register, audit/evidence boundary, execution state
Decision: OD12-02 accepted; no isolated PostgreSQL 1000-query run is required
Resulting version: v4 REVIEW / FINAL_AUDIT READY_WITH_LIMITS
```

Four-pass delta audit:

- **Logic / completeness:** T6 remains represented by its stable task and
  preserves the required E03 delivery boundary; the waived run is not silently
  treated as a result.
- **Architecture / data / security:** no schema, database, secret, runtime or
  infrastructure change is introduced. T5 cache bounds remain unchanged.
- **Dependencies / autonomy:** no ID, parent, delivery mode or planned edge
  changes; cycles remain zero. The v3 owner-blocker is superseded only after a
  successful v4 upgrade.
- **Executability / evidence:** a plan-source diff is the sole T6 artifact;
  its acceptance forbids a performance claim. Client-specific performance
  proof is explicitly outside this graph.

Readiness result: `READY_WITH_LIMITS`. Owner decisions before approval: `0`.
Exact v4 approval is the only remaining prerequisite for the versioned graph
upgrade; production, tag and mirror remain excluded.

## 11.6b Approval packet AP12-002

```text
Approval: owner exact phrase `План утверждён`
Approved version: v4
Approved at: 2026-09-29T08:34:01+03:00
Readiness at approval: READY_WITH_LIMITS
Authority: versioned Beads upgrade, then plan-authorized implementation and MERGE_AFTER_GATE delivery
Excluded authority: production, release tag, GitHub mirror and new secrets
```

Result: `APPROVED`; the v4 inventory must be validated and upgraded from v3
before any further implementation claim is made.

## 11.7 Revision history

### v4 — 2026-09-29 — APPROVED / READY_WITH_LIMITS

- Accepted OD12-02: the owner explicitly waived a new isolated PostgreSQL
  query-load test for EPIC-03 T6.
- Replaced T6 with a narrow waiver-record contract; it preserves the completed
  T5 bounded-cache correctness work and removes any implied p95, DB-query,
  throughput or live-load PASS.
- Kept the task ID, parent, delivery mode and dependencies stable: no graph
  migration is needed; the approved v3 graph requires a versioned upgrade
  after exact owner approval of v4.
- Repeated the four audit passes for this delta: blockers 0, open major 0,
  cycles 0; readiness remains `READY_WITH_LIMITS` because performance is now a
  stated client-specific future proof, not a starter claim.
- Received exact owner approval after the audited snapshot; authorized only the
  versioned graph upgrade and subsequent plan-authorized work.
- No production, release tag, GitHub mirror, new secret or external mutation
  is authorized by this revision.

### v3 — 2026-09-28 — APPROVED / READY_WITH_LIMITS

- Recorded the owner decision that this is a universal starter, not a frozen
  copy of one client's full geography.
- Replaced the false full-Souz prerequisite with an honest source-backed Souz
  subset plus an isolated fictional `Тестоград` geo matrix.
- Repeated all four final-audit passes: blockers 0, open major 0, cycles 0.
- Received exact owner approval after the audited snapshot; authorized Task
  Manager import and Developer handoff without authorizing production.

### v2 — 2026-09-28 — REVIEW / FINAL AUDIT NOT_READY

- Ran all four final-audit passes against exact v1.
- Resolved nine plan-level major/minor findings and repeated the audit on v2.
- Confirmed zero dependency cycles, 10/10 epic acceptance/verification coverage
  and complete production/release isolation.
- Kept OD12-01 open as the sole blocker; did not import Task Manager or start
  Developer.

### v1 — 2026-09-28 — REVIEW

- Accepted the uploaded document as `v0 DRAFT` and verified its claims against
  exact baseline `84666f93af270b30b5e778e4b6a429de4949c391`.
- Confirmed Plan №11 B1–B4 implementation is present; treated Plan №12 as
  residual remediation rather than a competing rerun.
- Triaged findings F-01…F-18: 17 accepted; F-06 rejected as stated because it
  reverses an owner-approved architecture decision.
- Corrected ownership, parallelism, shared-file boundaries and release scope.
- Opened OD12-01. Final four-pass audit was not run.

### v0 — 2026-09-28 — DRAFT (input basis)

- Owner-provided `2.0 FINAL CANDIDATE` accepted as the existing plan basis.
- No readiness, approval, import or execution authority attached to the input.

## 11.8 Current architect state

```text
Plan: AMS-REALTY-BAZA-STARTER-FINAL-COMMERCIAL-FREEZE / Plan 12 / v4 APPROVED
Phase: APPROVAL_HANDOFF
Revision input: owner waiver of a new isolated PostgreSQL load test
Revision delta: OD12-02 accepted; E03-T6 becomes a waiver-record task, no performance PASS
Audit: four passes repeated on exact v4 delta / READY_WITH_LIMITS
Findings: blockers 0 / open major 0 / resolved 11
Dependency graph: implementation epics 10 / cycles 0 / first-wave parallel 6
Night Run Readiness: READY_WITH_LIMITS after explicit v4 approval
Owner decisions before approval: 0
Task Manager import: v3 historical graph; v4 Upgrade AUTHORIZED
Developer handoff: Upgrade -> Reconcile -> Developer
Release/production: NOT AUTHORIZED
Next: Validate -> Upgrade -> Reconcile -> Developer
```

---

# 12. FINAL FORMULA

```text
CORE 5.5
+
UI CORE 5.0
+
FULL SEO INDEXING AUTHORITY
+
PAID-TRAFFIC-SAFE QUERY NORMALIZATION
+
YANDEX CLEAN-PARAM
+
BOUNDED FILTER LOAD
+
FACTUAL SEO TEMPLATE ENGINE
+
COMPLETE DEVELOPMENT CONTENT GATE
+
VALID APPROVED MEDIA MODEL
+
GENERATED BRAND PRIMITIVES + PLATFORM SEMANTIC MAP
+
CLONE-SAFE TWO-FILE DESIGN OWNERSHIP
+
HONEST SOUZ REFERENCE + SYNTHETIC UNIVERSAL GEO MATRIX
+
PLATFORM / CLIENT / GENERATED OWNERSHIP V2
+
EXPLICIT SAFE STARTER UPGRADE CHANNEL
+
DOCS-FIRST RELEASE STATE
+
EXACT-HEAD SOURCECRAFT GATE
+
IMMUTABLE STARTER RELEASE
=
COMMERCIAL_CLONE_READY
```

**END OF PLAN**

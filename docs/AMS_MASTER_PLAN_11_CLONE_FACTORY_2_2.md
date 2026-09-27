# AMS MASTER PLAN №11 — CLONE FACTORY 2.2

Plan ID: `AMS-REALTY-BAZA-CLONE-FACTORY-2-2-11`

Version: v4

Status: APPROVED

Phase: `APPROVAL_HANDOFF`

Approved by: `owner`

Approved at: `2026-09-27T12:11:02+03:00`

Approval phrase: `План утверждён`

Date: `2026-09-27`

Baseline: SourceCraft remote-tracking snapshot
`main@67d1abd76a4bcdda093fb3eea4c08f3f822813ba`

Input:

- owner specification «Plan 11 Clone Factory 2.2»;
- `AMS_SOUZ_HOME_FINAL_MASTER_PLAN_V4_1_1.md`, Plan ID
  `AMS-SOUZ-HOME-GEO-CATALOG-PLATFORM-BUILD`, version `4.1.1 FINAL`;
- repository-pinned AMS Realty Platform Core Standard 5.5;
- project Design System / UI Core evidence;
- executed Plan №10 v4 and its final implementation report.

Delivery profile: `COMMERCIAL`

Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`

Production authorization: `NONE`

Task Manager import: `AUTHORIZED AFTER VALIDATION`

Developer handoff: `AUTHORIZED AFTER CLEAN RECONCILIATION`

This document is the only canonical Plan №11 Markdown. It starts from the
owner-provided specification as `v0 DRAFT` and records the exact owner-approved
snapshot as `v4 APPROVED`. Plan №11 does not reopen or rerun completed
Plan №10 work. It changes only the contracts explicitly listed below.

---

## 1. Primary goal and boundaries

### Primary goal

Turn the current clone-ready starter into a safe and maintainable Clone Factory
2.2: a client can be created from a short intake, receive an exact project
profile, brand, geo/SEO bootstrap and legacy rules, pass a real disposable
runtime matrix, and later receive manifest-scoped starter upgrades without
overwriting client-owned files.

### Major outcomes

1. The Souz preset is derived from the mandatory Souz v4.1.1 reference instead
   of the generic `MIXED` defaults introduced by Plan №10.
2. One short intake deterministically produces preset v3, SiteProfile,
   client-owned copy/brand inputs and an explicit diff from preset defaults.
3. Legacy exact routes and property legacy patterns belong to SiteProfile; the
   proxy, resolver and namespace guards do not use a competing handwritten
   manifest.
4. District and category morphology is stored as approved data. Template code
   never derives Russian word forms with regular expressions or suffix changes.
5. SEO demand import, approval journal and coverage guards make the CSV
   registry an auditable operational pipeline rather than an editable status
   spreadsheet.
6. Project UI branding is generated from a small approved brand contract;
   changing the test theme changes every accent/effect without redesign.
7. Starter-owned files and client-owned files have an explicit manifest and
   hash boundary. `starter:upgrade` applies safe upstream changes and reports
   conflicts instead of overwriting client work.
8. Final clone acceptance runs actual builds, migrations, geo seed and HTTP
   smoke against disposable PostgreSQL for the approved profile matrix.
9. Clone onboarding becomes a one-day operator checklist. Production, release
   tag and real provider execution remain separate owner commands.

### Non-goals

- production rollout, DNS, server mutation, tag creation or live provider proof;
- changing SourceCraft primary / GitHub mirror policy;
- creating a second ORM, auth system, CMS, registry owner or task store;
- redesigning pages or changing the approved visual language;
- silently activating `PREPARED_OFF` or `OUT` product surfaces;
- silently deciding missing Souz category statuses or Russian morphology;
- replacing native local PostgreSQL as the workstation default;
- automatically updating client-owned files or resolving `.rej` conflicts;
- bidirectional synchronization between starter and clients;
- importing this `REVIEW` version into Beads or starting Developer.

---

## 2. MASTER PLAN MAP

### Platform and ownership

- Platform: repository-pinned AMS Realty Platform Core Standard 5.5,
  `AMS_PROFILE=REALTY_BASE`, mode `BUILD`.
- Runtime: Next.js `16.3.5`, React `19.2.8`, Payload `3.90.1`, PostgreSQL.
- Payload remains the only owner of Admin, auth, access, schema and migrations.
- Public data remains `Public Gateway -> access/select -> DTO -> UI`.
- Project composition owns SiteProfile, presets, intake, morphology, project
  copy, SEO templates, SEO registry inputs and brand values.
- `src/core/**` and `packages/**` remain client-neutral reusable platform code.
- Production secrets remain in Secret Master and are never inputs to clone
  generation, reports or committed manifests.

### Existing baseline reused

Plan №10 is `EXECUTION_COMPLETE` on canonical SourceCraft. The following are
existing foundations, not new work:

- preset schema v3 and one project-owned preset composition function;
- `docs/CLONE_PRESET.example.json` and Souz example preset;
- SiteProfile status matrices, filter keys, SEO facets and legacy route list;
- four config-only clone profiles and `pnpm verify:clone-matrix`;
- idempotent privileged `clone:seed-geo`;
- project-owned typed SEO templates and deterministic CSV Registry generation;
- runtime Content Gate, bounded public reads and exact route grammar;
- release manifest/build, live smoke and Core proof CLI contracts;
- UI Core v5 proof with one current token source, 618 definitions, zero dead
  tokens and zero P0/P1 findings at the Plan №10 evidence snapshot.

Plan №11 extends these owners. It must not build parallel implementations.

### Proven baseline gaps

| Gap | Current evidence | Plan owner |
|---|---|---|
| Souz category matrix is generic and wrong | `doma`, `uchastki`, commercial, cottage, `komnaty`, `garazhi`, `arenda` are currently `ACTIVE`; `/sdat` exists | B1-T1 |
| Souz districts are empty | all three `geos[].districts` arrays are empty | B1-T1/B1-T4 |
| Legacy contract has two owners | SiteProfile has `legacyRoutes`, while proxy/guards import `legacy-route-manifest.ts` | B1-T2 |
| Fixture knowledge remains in preset defaults | default facets and `primorsk`/`zarechnyy` fixture behavior are still project preset concerns | B1-T3 |
| No short intake compiler | no `clone:init` or intake JSON Schema exists | B1-T5 |
| District adjective is inferred | `templates.ts` strips `районе|округе` with `replace(...)` | B1-T4/B2-T1 |
| Category copy is a single string | no nominative/accusative/genitive form object exists | B2-T1 |
| Demand/approval pipeline is absent | no import-demand, approve command or approval journal exists | B2-T2/B2-T3 |
| Registry coverage is not exhaustive | no ACTIVE/NOINDEX_AUTO coverage command exists | B2-T4 |
| App copy is not preset-owned | no generated `src/project/copy.ts`; Cyrillic literals remain in app/core | B2-T6 |
| Brand is not isolated | 618 tokens, 147 hex and 93 rgba values live in `globals.css`; no `brand.css` | B3 |
| No client update boundary | no starter-owned manifest, `.starter-version` or `starter:upgrade` | B4-T1/B4-T2 |
| Release tag is hardcoded | clone preparation requires exact `starter-v2.1.0` | B4-T3 |
| Clone matrix is config-only | it prepares/checks disposable trees but does not run DB migrations or HTTP smoke | B4-T4 |
| Managed PostgreSQL proof is documentary only | Timeweb proof explicitly says NOT PROVEN; no restore-drill CLI | B4-T5 |

### Data and migration boundary

- B1 adds approved district morphology fields through a new additive Payload
  migration. Applied migrations are never edited.
- Clean database and previous non-empty database upgrade proofs are mandatory.
- `clone:seed-geo` writes only through the existing privileged seed gateway.
- B2 registry operations update controlled project CSV data and an append-only
  approval journal; they do not introduce a Payload registry.
- B4 disposable runtime tests may use an explicit Docker PostgreSQL exception.
  Normal Windows development remains native PostgreSQL.
- A real Timeweb Managed PostgreSQL connection/restore run remains an owner
  gate for the first client and is not simulated as PASS.

### Security and external side effects

- Intake, preset and generated env templates contain no secrets.
- Starter update downloads only an explicitly requested immutable tag and
  verifies its release manifest before applying files.
- Upgrade is path-manifested, hash-checked and fail-closed. It never executes
  code from an unverified archive and never edits client-owned paths.
- `.rej` conflicts and the upgrade report contain paths/hashes, not file
  contents that may include secrets.
- Demand approval requires actor/reason, but actor is an audit label, not an
  authentication substitute.
- Real provider, DNS, registry, tag and production actions are excluded.

### UX/UI boundary

- UX scope: `PUBLIC_COMMERCIAL` plus `CMS_NATIVE_ADMIN`.
- Existing Project Design System is reused; design intake is not repeated.
- Component decision: `REUSE`; B3 changes token ownership/generation, not page
  composition or visual language.
- Payload Admin remains CMS-native.
- B3 must prove no visible drift beyond the explicit <=1 px tolerance and must
  stop on larger drift rather than redesigning automatically.

---

## 3. Souz mandatory reference extraction

Plan №11 supersedes Plan №10 decision D-10-01 for the Souz reference preset:
Souz v4.1.1 is a mandatory requirement source. Execution must materialize the
relevant requirements into repository-owned, line-addressable data so later
client generation does not depend on an external path.

### Souz status matrix from §4.4

```text
geoMode = SINGLE_GEO
primaryGeo = rostov-na-donu

categoryStatus:
  novostroyki = ACTIVE
  kvartiry = ACTIVE
  doma = PREPARED_OFF
  uchastki = PREPARED_OFF
  kommercheskaya-nedvizhimost = PREPARED_OFF
  kottedzhnye-poselki = PREPARED_OFF
  arenda = OUT
  komnaty = OUT
  garazhi = OUT

marketCapability:
  newbuild = ACTIVE
  secondary = ACTIVE

geoCategoryStatus.rostov-na-donu:
  novostroyki = ACTIVE
  kvartiry = ACTIVE
  all explicitly prepared categories = PREPARED_OFF
  arenda = OUT

marketStatus.rostov-na-donu:
  newbuild = ACTIVE
  secondary = ACTIVE

bataysk/aksay hubs, categories and markets = PREPARED_OFF
bataysk/aksay agglomerationOf = rostov-na-donu
```

The Souz document does not define `komnaty` or `garazhi` as category statuses,
and its property taxonomy lacks separate room/garage categories. The owner has
therefore explicitly fixed both as `OUT`: this makes no public-route, schema or
prepared-readiness claim and may change only through a separate product plan.

### Souz template source from §17.3

The repository reference artifact must preserve at least:

- city variables `name`, genitive, locative and preposition;
- separate district admin/micro template selection;
- admin Title/H1 based on an approved adjective locative;
- micro Title/H1 based on approved district preposition/locative;
- category-specific morphology without hardcoded `квартиру` or `Квартиры`;
- optional inventory/price fragments only from fresh source-backed facts;
- exact required examples:
  - `Купить квартиру на Северном в Ростове-на-Дону — цены`;
  - `Купить дом в Ленинском районе Ростова-на-Дону — цены`.

### Souz legacy source from §20

- legacy decisions are per exact URL: `KEEP | REDIRECT_301 | ARCHIVE |
  GONE_410 | REVIEW`;
- bulk redirects to `/` or a generic category are forbidden;
- slash normalization (`308`) and legacy migration (`301`) are different;
- `/kvartiry-rostova/ -> /rostov-na-donu/kvartiry/` is a direct one-hop `301`;
- `/kvartiry-rostova/{legacy-slug}/` maps only to an individually proven
  canonical property target;
- `/sdat/` is `404` while rent is `OUT`, unless evidence later authorizes an
  exact same-intent legacy redirect.

Execution artifact: `docs/reference/SOUZ_MATRIX.json` with source plan ID,
version, section IDs, source line/range evidence and a guard that rejects drift
between that artifact and `CLONE_PRESET.souz.example.json`.

---

## 4. Global execution and delivery contract

1. Delivery order is fixed: `B1 -> B2 -> B3 -> B4`; cycles are forbidden.
2. One approved batch = one branch/worktree = one SourceCraft PR = one merge.
3. Every implementation task ends with one logical commit/push and one
   `EXECUTION_LEDGER_V1` entry. The batch delivery node owns PR/Gate/merge.
4. Delivery mode after approval is `MERGE_AFTER_GATE` for all four batches.
5. B1 is `RISKY schema-data`; B2 is `RISKY dependency-runtime`; B3 is
   `STANDARD`; B4 is `RISKY dependency-runtime` plus isolated DB/runtime proof.
6. During tasks run only targeted checks. Do not run `pnpm verify`, full clone
   runtime matrix or repeated daily suites after every commit.
7. B1/B2/B3 each run local `pnpm verify:daily` once at batch exit.
8. B4 final `pnpm verify` must incorporate/reuse the daily proof instead of
   launching a duplicate separate daily command. `pnpm verify:clone-matrix`
   runs once, in B4 final acceptance, after it has become a real runtime matrix.
9. Earlier batches use lightweight targeted profile/preset/template/registry
   matrix guards. They do not claim runtime clone acceptance.
10. Each batch receives one full diff review and one exact-head SourceCraft
    Gate. A new commit invalidates the Gate.
11. Schema/DB checks require safe isolated `DATABASE_URI_TEST`; missing DB is
    `FAIL`, never `SKIPPED`, for B1 delivery and B4 final acceptance.
12. Docker is an explicit B4 proof exception for disposable PostgreSQL and
    disposable clone runtime only. It is not the workstation database default.
13. Reports follow Core §20 and distinguish `LOCAL PASS`, SourceCraft Gate,
    `NOT RUN`, and real live evidence.
14. Production, release tag, mirror, registry publication, Timeweb resource
    mutation and live first-client run remain separate owner commands.
15. This plan may enter Task Manager only after exact-version final audit,
    `READY_FOR_OWNER_APPROVAL`, and the exact owner phrase `План утверждён`
    or `План утвержден`.
16. Before approval handoff, run a non-mutating environment preflight: exact
    Node/pnpm versions, clean worktree, authenticated SourceCraft API/read plus
    `git push --dry-run`, and isolated `DATABASE_URI_TEST` capability. GitHub
    mirror is not a credential fallback. Any failure blocks Developer handoff.
17. At B4 entry, preflight Docker availability and disposable resource cleanup.
    Docker is mandatory for B4-T4 parity proof; no native-PostgreSQL substitute
    may be reported as that proof. If unavailable, B4-T4 onward stops while
    already delivered B1-B3 evidence remains valid.

### Default task contract

- Source of Truth: exact approved Plan №11, active project canon, code,
  schema, migrations and tests named by the task.
- Entry: dependencies closed, current batch worktree clean, canonical
  SourceCraft main refreshed, approved plan hash unchanged.
- Allowed: scoped read/edit/test, explicitly declared additive migration,
  disposable fixtures, commit/push and plan-authorized SourceCraft delivery.
- Forbidden: production, tag, mirror, new secret, destructive production data
  action, unrelated refactor, cross-repository write or hidden dependency.
- Rollback: revert unmerged task; revert batch PR for code-only changes;
  schema/data uses tested forward recovery and never rewrites applied migration.
- Stop: source drift, unknown target/credential, red required check, changed
  Gate SHA, unsafe archive/path, unapproved morphology/status, >1 px visual
  drift, production side effect or platform hard-contract contradiction.

---

## 5. Decisions and triage in v2

| ID | Input claim | Triage | Decision / reason |
|---|---|---|---|
| D11-01 | Souz v4.1.1 is mandatory for the reference preset | ACCEPTED | Supersedes Plan №10 D-10-01 only for Souz; extraction becomes a repository-owned reference artifact |
| D11-02 | All Souz surface statuses must match the source | ACCEPTED | Exact §4.4 matrix is frozen; missing statuses are not guessed |
| D11-03 | `komnaty` and `garazhi` follow the source | OWNER DECIDED | Both are explicitly `OUT`; no route/schema/prepared-readiness claim is made |
| D11-04 | Legacy routes live in the profile | ACCEPTED | Remove/generated-away handwritten competing manifest; exact paths and typed patterns share one owner |
| D11-05 | Preset defaults must not contain fixture knowledge | ACCEPTED | Fixture-only values move to `src/fixture/**`; client preset fields are explicit |
| D11-06 | Full clone matrix in B1, B2 and B4 | REJECTED AS DUPLICATION | Owner preamble says full matrix once at B4; B1/B2 receive targeted lightweight matrix guards |
| D11-07 | Separate generated `brand.css` | OWNER DECIDED | Approved controlled canon change: brand primitives only in `src/project/brand.css`; semantic/component map remains in `globals.css`; Core/DESIGN/guards update in B3-T1 |
| D11-08 | Starter becomes an update channel | ACCEPTED WITH GUARDS | Explicit owner requirement supersedes snapshot-only default for manifest-owned files; client-owned paths remain immutable to updater |
| D11-09 | Docker PostgreSQL in final clone proof | ACCEPTED EXCEPTION | B4-only disposable proof; native PostgreSQL remains default elsewhere |
| D11-10 | Any released `starter-v2.MINOR.PATCH` is accepted | ACCEPTED | Exact tag + released manifest + SHA/hash verification replace hardcoded v2.1.0; no tag is created by this plan |
| D11-11 | Real Timeweb DB validation | ACCEPTED AS OWNER GATE | Script and safe local contract are implemented; first live client run remains not authorized |
| D11-12 | Visual consolidation may redesign values | REJECTED | Only exact duplicates and <0.5 px differences; larger drift is `NEEDS_OWNER` |

---

## 6. BATCH B1 — Profile truth, Souz parity and intake

Batch risk: `RISKY schema-data`.

Batch outcome: one approved short intake deterministically creates the exact
Souz/client profile, owned legacy contract and approved geo morphology without
fixture leakage or inferred language forms.

### B1-T1 — Souz reference extraction and exact reference preset

- Outcome: `docs/reference/SOUZ_MATRIX.json` and
  `docs/CLONE_PRESET.souz.example.json` express the same source-backed matrix.
- Scope: extract Souz §4.4, §17.3 and §20 provenance; correct statuses;
  set `arenda=OUT`; remove `/sdat`; keep `vtorichka`; add at least two admin
  and two micro districts for Rostov with approved morphology; add direct
  `/kvartiry-rostova/` legacy route.
- Frozen owner input: the exact city and four district morphology values are
  recorded in OD11-04; no executor may infer or substitute them.
- Frozen owner decision: `komnaty=OUT`, `garazhi=OUT`; the reference preset
  must make no route/schema/prepared-readiness claim for either category.
- Acceptance: `verify:souz-parity` checks every reference field and section
  reference; preset cannot contain an unresolved placeholder at delivery.
- Verification: JSON schema/reference guard, preset parse, profile acceptance,
  negative source-drift fixture.
- Rollback: revert reference/preset together.
- Stop: another source value is missing/ambiguous, the frozen owner decision
  is contradicted, or provenance cannot identify the exact Souz plan
  version/section.

### B1-T2 — One SiteProfile legacy owner

- Outcome: exact legacy routes and typed legacy patterns are read from
  SiteProfile by proxy, resolver and namespace guards.
- Scope: add `legacyPatterns` for `/obekty/{slug}`; generate or delete
  `legacy-route-manifest.ts`; remove `/nedvizhimost` from starter static routes;
  preserve direct 301 and separate framework 308.
- Acceptance: guard fails on a legacy declaration outside profile; a static
  route cannot share a legacy root; no chains; property lifecycle/410 semantics
  remain intact.
- Verification: resolver/proxy/SEO route matrices, redirect graph negative
  cases, no-literal-owner guard.
- Rollback: revert owner migration as one unit.
- Stop: stored Payload redirect and profile redirect precedence is ambiguous or
  a current canonical route would become legacy accidentally.

### B1-T3 — Honest preset and starter config generation

- Outcome: preset logic contains no starter fixture geography/facets and both
  starter/client configs are generated through one compiler.
- Scope: move `primorsk`, `zarechnyy` and fixture facets to `src/fixture/**`;
  require client `seoTiers`, `seoFacets`, `staticRoutes`; allow defaults only
  for `starter-demo`; generate starter `site-profile.config.ts` from
  `docs/CLONE_PRESET.starter.json`.
- Acceptance: generated-config drift guard; no fixture literal in client
  generator; invalid/incomplete client preset fails with exact field paths.
- Verification: preset schema cases, deterministic generation, profile guard.
- Rollback: regenerate current starter config from prior canonical input.
- Stop: one runtime profile would be owned by two editable files.

### B1-T4 — Explicit district morphology and additive Payload migration

- Outcome: admin and micro districts store all forms required by templates;
  code never derives Russian endings.
- Scope: admin requires `adjLocative`, `adjGenitive`; micro requires
  `locative`, `preposition`; update preset/intake DTO, Payload collection,
  generated types, seed gateway and fixture dataset; add a new migration.
- Frozen input: only the exact OD11-04 forms may enter the Souz reference seed.
- Acceptance: clean migration + previous non-empty upgrade; repeated seed is
  idempotent; `src/project/seo/**` guard rejects morphology `replace`, regex or
  suffix mutation; invalid type/form combination fails before write.
- Verification: schema/types, migration integration, seed idempotence,
  geo hierarchy and negative morphology fixtures.
- Rollback: forward recovery maps/retains old generic morphology fields; never
  edit Plan №10 migration history.
- Stop: existing rows cannot be mapped without guessing or migration would
  remove data.

### B1-T5 — Intake to preset compiler

- Outcome: `pnpm clone:init --intake=<file>` produces full preset v3 and a
  deterministic default-diff report.
- Scope: JSON Schema and Souz example intake; brand/domain/NAP/preset, cities,
  morphology, surfaces, markets, districts, legacy, metric and thresholds;
  no secrets/infrastructure credentials.
- Acceptance: intake -> preset -> SiteProfile round-trip is byte-stable after
  normalization; Souz intake produces the exact corrected reference preset;
  errors use JSON paths; repeated run does not drift.
- Verification: schema positive/negative cases, round-trip hash, Souz parity.
- Rollback: generated outputs are regenerated from intake; intake stays owner.
- Stop: compiler invents a missing status/morphology/default for client kind.

### B1-D — Delivery

- Entry: OD11-04 decided; B1-T1–T5 committed/pushed with ledgers; frozen
  `komnaty=OUT` and `garazhi=OUT` decisions preserved; worktree clean;
  required DB available.
- Local exit: targeted guards + migration clean/non-empty proof +
  `verify:souz-parity` + lightweight profile matrix + `pnpm verify:daily` once.
- Gate: full diff review -> one exact-head SourceCraft
  `RISK_SCOPE=schema-data` Gate -> merge.
- Fail closed: missing `DATABASE_URI_TEST`, unresolved Souz status, red
  migration/parity guard or changed SHA.

---

## 7. BATCH B2 — SEO templates and auditable Registry pipeline

Batch risk: `RISKY dependency-runtime`.

Batch outcome: all active/noindex surfaces have source-backed registry rows,
approved morphology and category-aware templates; demand/status mutations are
performed only by deterministic audited commands.

### B2-T1 — Category-aware district templates

- Outcome: nine category labels are form objects, and admin/micro district
  templates work for any supported category without apartment literals.
- Scope: `nominativePlural`, `accusativeSingular`, `genitivePlural`; approved
  district forms; update template context, input schema and runtime renderer.
- Acceptance: snapshots `9 categories x 2 district types x 2 cities`; required
  apartment and house examples exact; registry materialization equals runtime.
- Verification: template snapshots, runtime SEO proof, ownership guard,
  generated registry check.
- Rollback: revert forms/renderer/generated registry together.
- Stop: any form is inferred or a route uses an unapproved form.

### B2-T2 — Demand snapshot import

- Outcome: `seo:registry:import-demand --file=<csv>` atomically applies measured
  `value/source/snapshotDate` and derives tier from current bands.
- Scope: exact columns `url,phrase,value,snapshotDate`; normalization and
  deterministic ordering; no manual tier input.
- Acceptance: unknown URL and duplicate URL fail before write; partial invalid
  input leaves owner CSV unchanged; rerun is idempotent.
- Verification: parser/unit fixtures, atomic temp-write proof, generate/check.
- Rollback: version-control revert of the CSV snapshot.
- Stop: file mixes metrics/snapshot semantics that SiteProfile cannot express.

### B2-T3 — Append-only Registry approval journal

- Outcome: `seo:registry:approve` is the only way to make eligible measured
  rows approved; `docs/seo/REGISTRY_APPROVALS.csv` is append-only audit evidence.
- Scope: scope selector, actor, reason, timestamp; require `synthetic=false`,
  approved morphology and tier != `NONE`; status is materialized from journal.
- Acceptance: manual CSV status edit fails guard; duplicate/conflicting
  approval is rejected; journal entry identifies prior row hash.
- Verification: approve/dry-run cases, tamper fixture, deterministic rebuild.
- Rollback: approvals are not deleted; correction is a new explicit journal
  event defined by the contract.
- Stop: actor/reason absent or row changed since selected hash.

### B2-T4 — Registry coverage

- Outcome: `seo:registry:coverage` enumerates every required
  ACTIVE/NOINDEX_AUTO geo x category, geo hub, facet, geoDevelopers and
  developerRoot row and shows missing rows remaining noindex.
- Acceptance: missing required row fails delivery; PREPARED_OFF/OUT does not
  create false coverage requirements; output is machine-readable and concise.
- Verification: all approved profile fixtures and negative missing-row cases.
- Rollback: report-only guard.
- Stop: route inventory and registry use different URL builders.

### B2-T5 — Bounded route cache keys

- Outcome: cache keys are built only from canonical allowed page, sort and
  filter values; unknown/unbounded query state is not cached.
- Acceptance: finite-key guard proves an upper bound for each profile fixture;
  unknown parameters cannot create keys; semantic responses remain unchanged.
- Verification: property-based key cases, runtime cache integration, no N+1
  or cache bypass regression.
- Rollback: revert key builder; uncached safe path remains available.
- Stop: correctness would require caching arbitrary user input.

### B2-T6 — Project copy generation and Cyrillic ownership guard

- Outcome: public Russian copy used by app routes is generated into
  `src/project/copy.ts`; reusable app/core routing code contains no client copy.
- Scope: inventory `src/app/**` and `src/core/**`; move project literals, not
  technical error identifiers or test fixtures; define documented exceptions.
- Acceptance: guard fails on unapproved Cyrillic literals in app/core;
  generated copy is preset-owned and typed; no copy enters core packages.
- Verification: guard positive/negative fixtures, typecheck, representative UI
  smoke without visual text changes.
- Rollback: regenerate project copy from preset.
- Stop: migration would move reusable platform errors into client branding or
  change legal text without owner evidence.

### B2-D — Delivery

- Entry: B1 merged; B2-T1–T6 committed/pushed with ledgers; worktree clean.
- Local exit: template snapshot matrix, demand/approval/coverage guards,
  bounded cache proof, copy ownership proof, registry generate/check and
  `pnpm verify:daily` once.
- Gate: full diff review -> one exact-head SourceCraft
  `RISK_SCOPE=dependency-runtime` Gate -> merge.
- The full runtime clone matrix is not rerun here.

---

## 8. BATCH B3 — Brand as a controlled clone input

Batch risk: `STANDARD` under the approved brand-source split without
dependencies/runtime changes. Any new dependency or framework/font-loader change reclassifies B3 as
`RISKY dependency-runtime` before execution.

Batch outcome: an approved brand block can be replaced from a preset and every
accent/effect follows it, while the current visual language and component
foundation remain unchanged.

### B3-T1 — Brand source and derived semantic tokens

- Outcome: `src/project/brand.css` is the sole owner of 20–30 project brand
  primitives for accent, hover/soft, foreground, background, surfaces, border,
  radii, font and status colors. `src/app/globals.css` remains the sole
  semantic/component token map and consumes those primitives through
  `var()`/`color-mix()`; no second semantic token system is allowed.
- Scope: implement the approved OD11-03 model; update repository-pinned Core,
  `docs/DESIGN.md`, token/drift guards and clone docs in the same task; remove
  raw brand-colored shadows such as `rgba(138,21,21,...)`; keep neutral/effect
  exceptions in an explicit allowlist.
- Acceptance: swapping to a blue proof theme changes every accent/shadow and
  no non-allowlisted raw brand color remains; token report proves the project
  primitive set contains 20–30 values.
- Verification: color ownership guard, token report, five representative pages
  in current and proof theme at approved viewports.
- Rollback: restore prior generated brand input and token map.
- Stop: contrast/a11y fails, visual composition changes, or current canon is not
  updated consistently with the chosen owner model.

### B3-T2 — Token-scale consolidation without redesign

- Outcome: exact duplicates and typography/spacing/tracking differences below
  0.5 px are consolidated with <=1 px rendered drift.
- Scope: baseline and after `tokens:report`; preserve semantic names where
  removal would harm ownership; target <=24 unique font sizes, not <=24 total
  typography tokens.
- Acceptance: no dead token, P0/P1 or >1 px visual drift; if <=24 unique sizes
  cannot be reached safely, retain the remainder and report it.
- Verification: token diff, browser pixel/geometry evidence, a11y snapshots.
- Rollback: revert consolidation only; brand layer remains independently valid.
- Stop: any change exceeds 0.5 px source difference or 1 px rendered drift.

### B3-T3 — Brand in intake/preset and deterministic generation

- Outcome: intake/preset owns brand colors, approved radius and allowlisted
  `next/font` family; `clone:prepare` generates brand CSS and font config.
- Scope: validate font allowlist; require logo/favicon assets; hash generated
  brand outputs; never download arbitrary font code or remote assets.
- Acceptance: missing assets/font fails; same preset produces same files;
  starter and client profiles pass both theme guards.
- Verification: schema/codegen/asset negative cases, build/typecheck.
- Rollback: regenerate from previous preset.
- Stop: preset points outside repository or requires an unapproved dependency.

### B3-T4 — UI Core and two-theme acceptance

- Outcome: current and proof themes pass UI Core, drift and clone portability.
- Scope: run `verify:ui-core`, `verify:drift`, `ui:clone-audit`; conditionally
  verify `components.json` aliases only if the file exists; fix only P0/P1
  caused by the batch.
- Acceptance: P0=0, P1=0, dead=0, second primitive tree=false; visual evidence
  for five pages/two themes; dark mode remains disabled.
- Verification: commands above plus targeted browser/a11y proof.
- Rollback: revert B3 if brand isolation cannot preserve parity.
- Stop: fixing requires redesign or unrelated component rewrite.

### B3-D — Delivery

- Entry: B2 merged; B3-T1–T4 committed/pushed with ledgers; approved OD11-03
  model and canon updates preserved; worktree clean.
- Local exit: two-theme proof, UI Core/drift/clone audit and
  `pnpm verify:daily` once.
- Gate: full diff review -> one exact-head SourceCraft `STANDARD` Gate -> merge.

---

## 9. BATCH B4 — Safe starter upgrades and real clone runtime proof

Batch risk: `RISKY dependency-runtime`.

Batch outcome: clients record exact starter provenance, can apply safe
manifest-owned updates, and every reference profile proves build, migrations,
seed and HTTP behavior on a disposable runtime.

### B4-T1 — Starter-owned manifest and provenance

- Outcome: `starter-owned.json` declares exact starter-owned paths; prepared
  clients receive `.starter-version` with tag, SHA, manifest version and hashes.
- Scope: include `src/core/**`, `packages/**`, platform guards/scripts and core
  migrations; explicitly exclude project preset, project copy/brand,
  `docs/seo/**` and other client-owned paths.
- Acceptance: overlap/unknown path guard; manifest paths normalized, no symlink
  escape; hashes reproducible; generated client file contains no machine path.
- Verification: ownership positive/negative fixtures and clone preparation.
- Rollback: manifest/version files are regenerated.
- Stop: a path has mixed ownership that cannot be split safely.

### B4-T2 — `starter:upgrade` conflict-safe update

- Outcome: a client can upgrade to an immutable released starter tag without
  overwriting modified starter-owned files.
- Scope: download/resolve tag, verify released manifest and SHA, compare prior
  hashes, apply untouched files, add migrations, emit `.rej` and report on
  conflicts, update `.starter-version` only for reconciled state.
- Acceptance: synthetic clean upstream change applies; changed client file
  conflicts; path traversal/symlink/archive bomb/unreleased tag/hash mismatch
  fails before write; interrupted run is recoverable.
- Verification: disposable Git repositories, synthetic tag/archive fixtures,
  conflict/idempotence/rollback tests; `verify:starter-drift` warning in client
  daily path and fail/report modes for operators.
- Rollback: pre-upgrade backup/index plus report; no automatic conflict merge.
- Stop: source identity unverified, dirty target outside declared policy, or
  migration order incompatible.

### B4-T3 — Semver release manifest contract

- Outcome: clone/upgrade accepts `starter-v2.MINOR.PATCH` only when the exact
  tag has a release manifest with `status=released` and matching SHA/hashes.
- Scope: remove `starter-v2.1.0` hardcode from runtime tooling; add/update
  `CHANGELOG.md` with a `Client migration` section for every released version.
- Acceptance: unreleased/malformed/non-v2 tag fails; no tag is created or
  marked released by implementation tests.
- Verification: semver/manifests positive/negative fixtures.
- Rollback: no external release state changed.
- Stop: implementation would mutate SourceCraft tag/release state.

### B4-T4 — Disposable clone runtime matrix

- Outcome: `verify:clone-matrix` proves Souz, NEWBUILD_FIRST,
  SECONDARY_FIRST, MULTI_GEO and `districts+legacy` profiles on disposable
  application runtimes and PostgreSQL databases.
- Scope: clone, locked install, build, temporary PostgreSQL via explicit Docker
  exception, migrations, `clone:seed-geo`, local start and `smoke:live`.
- Acceptance per profile: ACTIVE hub=200; PREPARED_OFF/OUT=404; direct legacy
  301 without chain; draft registry=noindex; robots contract correct; process
  and DB cleanup proven even on failure.
- Verification: full matrix once in B4 final; missing Docker/DB is FAIL for this
  acceptance, not SKIPPED.
- Rollback: disposable resources only; source worktree remains unchanged.
- Stop: harness targets a non-disposable DB/origin, leaks a container/process,
  or requires production secret.

### B4-T5 — Timeweb Managed PostgreSQL and restore-drill contract

- Outcome: generated client env/runbook requires `verify-full`, Timeweb CA,
  bounded pool/timeouts; `db-restore-drill` restores a dump to a temporary DB
  and runs smoke.
- Scope: no secret values; CA path/host/database are inputs; safe target identity
  guard; local/mock contract tests.
- Acceptance: `sslmode=verify-full`/equivalent verified; wrong CA/host fails;
  restore refuses non-temporary/protected target; smoke is tied to restored DB.
- Verification: parser/connection-option fixtures and local temporary restore;
  real Timeweb run remains `NOT RUN` until first-client owner command.
- Rollback: temporary DB cleanup; source dump untouched.
- Stop: target identity or backup provenance unknown.

### B4-T6 — One-day clone onboarding and upstream contribution path

- Outcome: `CLONE_ONBOARDING.md` is an ordered checklist:
  intake -> clone:init -> clone:prepare -> activate storage -> seed geo ->
  import demand -> approve -> deploy; `UPSTREAM_CANDIDATES.md` explains how
  client fixes return to the starter through a separate reviewed stream.
- Acceptance: every command exists, inputs/outputs/stop conditions are named,
  production steps remain owner-gated, no secret example contains a value.
- Verification: docs command/link guard and dry-run paths.
- Rollback: docs-only revert.
- Stop: checklist implies production authorization or reverse automatic sync.

### B4-T7 — Final evidence package

- Outcome: `docs/evidence/plan11/FINAL_REPORT.md` records exact candidate SHA,
  delivered batches, actual checks, unverified items and risks under Core §20.
- Scope: run final `pnpm verify` with DB-required behavior, runtime clone matrix
  once, Souz parity and report/link/claim guards.
- Acceptance: no SKIPPED DB suite in required final proof; no live/provider/tag
  PASS claim; worktree clean before delivery.
- Verification: report guard and exact artifact hashes.
- Rollback: regenerate report after any candidate change.
- Stop: final suite fails, SHA/report mismatch or disposable cleanup incomplete.

### B4-D — Delivery

- Entry: B3 merged; B4-T1–T7 committed/pushed with ledgers; clean exact head.
- Local exit: `pnpm verify` once with nested/reused daily evidence,
  `pnpm verify:clone-matrix` once, `pnpm verify:souz-parity`, report guard.
- Gate: full diff review -> one exact-head SourceCraft
  `RISK_SCOPE=dependency-runtime` Gate -> merge.
- Exit: implementation complete on canonical main. Production, tag, mirror and
  real Timeweb/client run remain separate explicit commands.

---

## 10. Audited dependency graph

This exact v4 graph includes final-audit remediation and the frozen OD11-04
input. It is importable only after explicit owner approval.

```text
B1-T1 -> (B1-T2 || B1-T4)
B1-T2 -> B1-T3
(B1-T3 + B1-T4) -> B1-T5
B1-T1..T5 -> B1-D

B1-D -> (B2-T1 || B2-T2 || B2-T5 || B2-T6)
(B2-T1 + B2-T2) -> B2-T3 -> B2-T4
B2-T1..T6 -> B2-D

B2-D -> B3-T1 -> (B3-T2 || B3-T3)
(B3-T2 + B3-T3) -> B3-T4 -> B3-D

B3-D -> B4-T1 -> B4-T3
B4-T3 -> (B4-T2 || B4-T4)
B4-T4 -> B4-T5
(B4-T2 + B4-T5) -> B4-T6
B4-T1..T6 -> B4-T7 -> B4-D
```

### Dependency matrix

| Node | Depends on | Type | Minimal blocking reason |
|---|---|---|---|
| B1-T1 | NONE | ROOT | All Souz surface and morphology decisions are owner-frozen inputs |
| B1-T2 | B1-T1 | CONTRACT | Legacy exact routes/patterns consume reference profile schema |
| B1-T3 | B1-T1, B1-T2 | CONTRACT | Generator consumes frozen profile/legacy contract |
| B1-T4 | B1-T1 | CONTRACT | Morphology fields derive from accepted source model, not preset code |
| B1-T5 | B1-T3, B1-T4 | HARD | Intake output requires final preset and morphology schemas |
| B1-D | B1-T1–T5 | HARD | Batch delivery requires complete truth/compiler/migration scope |
| B2-T1 | B1-D | HARD | Category/district renderer consumes merged morphology |
| B2-T2 | B1-D | CONTRACT | Demand import consumes merged profile bands and URLs |
| B2-T3 | B2-T1, B2-T2 | CONTRACT | Approval needs final morphology and measured rows |
| B2-T4 | B2-T3 | CONTRACT | Coverage distinguishes approved/measured/eligible rows |
| B2-T5 | B1-D | CONTRACT | Cache canonicalization consumes merged filter/profile contract |
| B2-T6 | B1-D | CONTRACT | Copy generator consumes merged preset/intake owner |
| B2-D | B2-T1–T6 | HARD | One registry/template/runtime delivery |
| B3-T1 | B2-D | CONTRACT | Approved batch order requires the exact merged B2 base before B3 starts |
| B3-T2 | B3-T1 | HARD | Consolidation measures final brand-derived baseline |
| B3-T3 | B3-T1 | CONTRACT | Generator consumes frozen brand schema/owner |
| B3-T4 | B3-T2, B3-T3 | HARD | Two-theme acceptance covers final generated output |
| B3-D | B3-T1–T4 | HARD | UI batch delivers only after parity proof |
| B4-T1 | B3-D | HARD | Ownership manifest describes merged final starter layout |
| B4-T2 | B4-T1, B4-T3 | HARD | Updater requires both ownership and released-tag contracts |
| B4-T3 | B4-T1 | CONTRACT | Semver/release contract is frozen before updater implementation |
| B4-T4 | B4-T3 | CONTRACT | Runtime matrix consumes the frozen semver clone contract |
| B4-T5 | B4-T4 | CONTRACT | DB/restore smoke reuses disposable runtime harness |
| B4-T6 | B4-T2, B4-T5 | CONTRACT | Checklist documents final updater and runtime/restore commands |
| B4-T7 | B4-T1–T6 | HARD | Final report covers every implemented outcome |
| B4-D | B4-T1–T7 | HARD | Final delivery |

Audited nodes: 26. Cycles found: 0. B4-T3 freezes the release contract
before B4-T2 implements the updater; B4-T2 and B4-T4 can proceed independently
after that freeze. The graph remains non-importable until the owner explicitly
approves exact v4.

### Shared-file and contract owners

- SiteProfile/preset/intake schema: B1-T1 -> B1-T3 -> B1-T5.
- Payload Districts/migration/types/seed: B1-T4 only.
- Proxy/resolver/legacy roots: B1-T2 only.
- SEO templates and registry schema: B2-T1 -> B2-T2 -> B2-T3 -> B2-T4.
- Project copy: B2-T6 only.
- Token source/brand/font: B3-T1 -> B3-T2 -> B3-T3.
- Clone/update/release manifests: B4-T1 -> B4-T3 -> B4-T2.
- Clone matrix/runtime harness: B4-T4 -> B4-T5.
- `package.json`: each CLI task adds its own entry; B4-T7 owns final orchestration
  and removes duplicated suite invocation.

---

## 11. Owner decision register

### OD11-01 — Souz `komnaty` status

- Question: what is the explicit reference preset status for `komnaty`?
- Evidence: absent from Souz §4.4 and not a separate category in Souz property
  taxonomy.
- Recommendation: `OUT`. A future room product requires its own taxonomy,
  routing, import and SEO decision; `PREPARED_OFF` would falsely claim schema
  readiness.
- Options: `OUT` (recommended) | `PREPARED_OFF` with an explicit documented
  readiness claim.
- Decision: `OUT`.
- Decided by: owner, `2026-09-27`.
- Impact: B1 uses an explicit absence contract and makes no route, schema or
  prepared-readiness claim for rooms.
- Status: `DECIDED`.

### OD11-02 — Souz `garazhi` status

- Question: what is the explicit reference preset status for `garazhi`?
- Evidence: absent from Souz §4.4 and from the declared property category enum.
- Recommendation: `OUT` for the same reason as rooms.
- Options: `OUT` (recommended) | `PREPARED_OFF` only after a separately proven
  schema/readiness contract.
- Decision: `OUT`.
- Decided by: owner, `2026-09-27`.
- Impact: B1 uses an explicit absence contract and makes no route, schema or
  prepared-readiness claim for garages.
- Status: `DECIDED`.

### OD11-03 — Brand token source model

- Question: may Plan №11 deliberately replace the current Core 5.5/DESIGN rule
  «all numeric design values live only in `src/app/globals.css`»?
- Context: a separate generated brand file is materially better for cloning,
  but silently adding it would violate the present hard contract and drift
  guard.
- Recommendation: approve a controlled repository-canon change:
  `src/project/brand.css` owns only 20–30 generated project brand primitives;
  `src/app/globals.css` remains the single semantic/component token map and
  consumes those primitives. Update repository-pinned Core sections, DESIGN,
  drift/token guards and clone docs in B3-T1. No second semantic token system.
- Options: approve the split above (recommended) | keep all values in generated
  blocks inside `globals.css` and reject a separate brand file.
- Decision: approve the recommended split exactly as stated above.
- Decided by: owner, `2026-09-27`.
- Impact: B3-T1 must update repository-pinned Core, DESIGN, token/drift guards
  and clone docs together with the implementation. Until B3-T1 is delivered,
  the current runtime canon remains unchanged.
- Status: `DECIDED`.

### OD11-04 — Souz city and district morphology baseline

- Question: which exact morphology values may be committed to the Souz
  reference intake/preset for one city, two administrative districts and two
  microdistricts?
- Evidence: Souz §9.4 and EPIC-08 require owner approval before metadata
  freeze; OQ-06 explicitly forbids platform templates from guessing forms.
- Why it matters: B1-T1, B1-T4 and B1-T5 promise an exact deterministic Souz
  reference. Without frozen values the executor must either invent Russian
  morphology or stop the first batch.
- Recommendation:
  - Ростов-на-Дону: `nameGenitive=Ростова-на-Дону`,
    `nameLocative=Ростове-на-Дону`, `preposition=в`;
  - Ленинский: `adjLocative=Ленинском`, `adjGenitive=Ленинского`;
  - Ворошиловский: `adjLocative=Ворошиловском`,
    `adjGenitive=Ворошиловского`;
  - Северный: `locative=Северном`, `preposition=на`;
  - Центр: `locative=Центре`, `preposition=в`.
- Options: approve the recommended baseline | provide corrected exact values.
- Decision: approve the recommended baseline exactly as listed.
- Decided by: owner, `2026-09-27`.
- Impact: B1-T1/B1-T4/B1-T5 receive deterministic source data and no longer
  contain an owner gate.
- Status: `DECIDED`.

---

## 12. Finding register — repeated final audit v4

| ID | Severity | Finding | Status / action |
|---|---|---|---|
| P11-A01 | BLOCKER | Souz `komnaty` status is absent | `RESOLVED IN v2`; owner fixed `OUT` |
| P11-A02 | BLOCKER | Souz `garazhi` status is absent | `RESOLVED IN v2`; owner fixed `OUT` |
| P11-A03 | MAJOR | Separate brand CSS conflicts with current hard contract | `RESOLVED IN v2`; owner approved the controlled canon change for B3-T1 |
| P11-A04 | MAJOR | Input repeats full clone matrix in B1/B2 despite one-final-run rule | `RESOLVED IN v1`; targeted early guards, full runtime matrix once in B4 |
| P11-A05 | MAJOR | Current matrix is config-only and cannot prove HTTP/DB claims | `ACCEPTED`; B4-T4 expands evidence surface |
| P11-A06 | MAJOR | Current legacy manifest competes with SiteProfile | `ACCEPTED`; B1-T2 establishes one owner |
| P11-A07 | MAJOR | `starter:upgrade` creates a new supply-chain/update boundary | `ACCEPTED WITH GUARDS`; exact tag/manifest/hash/path and conflict policy added |
| P11-A08 | MAJOR | Plan input omitted rollback/stop/evidence contracts | `RESOLVED IN v1`; every task/delivery node has them |
| P11-A09 | MAJOR | B4 Docker requirement conflicts with normal native-Postgres default | `RESOLVED IN v1`; explicit disposable B4 exception only |
| P11-A10 | MAJOR | Plan input did not distinguish tooling implementation from real Timeweb run | `RESOLVED IN v1`; real first-client proof remains owner gate |
| P11-A11 | MAJOR | Current hardcoded `starter-v2.1.0` is not a semver release contract | `ACCEPTED`; B4-T3 |
| P11-A12 | MINOR | <=24 typography target was ambiguous | `RESOLVED IN v1`; target is unique font sizes, safety prevails |
| P11-F01 | BLOCKER | Required Souz city/district morphology had no owner-approved exact values | `RESOLVED IN v4`; OD11-04 freezes the exact baseline |
| P11-F02 | MAJOR | B4 updater preceded the semver/release contract it consumes | `RESOLVED IN v3`; B4-T3 now freezes the contract before B4-T2 |
| P11-F03 | MAJOR | SourceCraft and Docker external prerequisites lacked an explicit preflight/fallback boundary | `RESOLVED IN v3`; non-mutating preflight, no unsafe fallback and stop rules added |
| P11-F04 | ALREADY_COVERED | Production/live provider actions could contaminate implementation | `ALREADY_COVERED`; global non-goals, delivery contract and B4 stops isolate them |
| P11-F05 | ALREADY_COVERED | Task outcomes might lack measurable evidence | `ALREADY_COVERED`; 22/22 task contracts have observable acceptance and verification |

Open blockers: 0. Open major findings: 0. Owner decisions before approval: 0.

---

## 13. Evidence and report policy

- `spike/reference`: exact source plan/version/section, extracted value and
  unresolved field; no product value invented.
- `domain-model`: schemas, pure functions, property/negative cases, typecheck.
- `wired`: generated preset/config/registry, Payload migration/seed, CLI entry,
  updater on disposable repositories, clone runtime on disposable DB.
- `live`: actual HTTP process/DB or provider surface. Only B4 disposable
  runtimes are authorized inside implementation; real Timeweb/client/production
  remains owner-triggered.
- Every closed implementation task records changed files, command/exit status,
  exact commit SHA and deviations in `EXECUTION_LEDGER_V1`.
- No report may convert `SKIPPED`, static inspection or historical Plan №10
  evidence into current PASS.

---

## 14. Repeated final audit result — exact v4

### Pass 1 — Logic / Completeness

- All nine major outcomes map to B1-B4; production, release tag, mirror and
  live provider execution remain outside implementation.
- All 22 implementation tasks and four delivery nodes have a system outcome,
  bounded scope or explicit small-task boundary, acceptance, verification,
  rollback/recovery and stop conditions.
- The exact Souz morphology values are frozen in OD11-04. No outcome is left
  without an owner or deterministic definition of done.
- Open logic/completeness blockers: `0`.

### Pass 2 — Architecture / Data / Security

- Payload remains the only schema/migration owner; the new migration is
  additive and requires clean plus non-empty upgrade evidence.
- SiteProfile, Registry CSV+journal, project copy, brand primitives and starter
  ownership each have one declared owner; no second ORM, registry or token map
  is introduced.
- Upgrade/archive, path, symlink, hash, migration and secret boundaries are
  fail-closed. Production and real Timeweb actions remain isolated.
- No open architecture/data/security major finding after v4 confirmation.

### Pass 3 — Dependencies / Autonomy

- Audited graph: 26 nodes, 26 matrix rows, 0 unknown nodes, 0 cycles.
- Contract inversion P11-F02 is fixed: B4-T3 precedes B4-T2; B4-T2 and B4-T4
  may proceed independently after the release-contract freeze.
- Parallel windows exist inside B1 (`T2 || T4`), B2
  (`T1 || T2 || T5 || T6`), B3 (`T2 || T3`) and B4 (`T2 || T4`).
- The four batch deliveries remain intentionally serial by owner contract.
- OD11-04 is resolved; B1-T1 is the deterministic root. No owner edge remains.

### Pass 4 — Executability / Evidence / Delivery

- Task acceptance coverage: `22/22`; task verification coverage: `22/22`.
- Delivery contracts: `4/4` use one branch/worktree, PR, exact-head Gate and
  merge; required DB proof is fail-closed rather than `SKIPPED`.
- Promise/evidence tiers distinguish source, domain-model, wired, disposable
  live runtime and real provider evidence. Named CLI/route/DB surfaces provide
  `reachableVia` for every wired/live claim.
- SourceCraft and Docker preflight/failure boundaries are explicit. GitHub and
  native PostgreSQL cannot masquerade as their required proof.

### Audit scorecard

```text
Logic/completeness: blockers 0 / major 0
Architecture/data/security: blockers 0 / major 0
Dependency/autonomy: nodes 26 / cycles 0 / owner edges 0
Executability/evidence: task acceptance 22/22 / verification 22/22 / delivery 4/4
Owner decisions: before approval open 0 / later implementation open 0
Unknown critical prerequisites: 0
Production actions inside implementation: 0
```

### Night Run Readiness

```text
Independent ready waves: B1-T1 root; four parallel windows across B1-B4
Critical path: B1 -> B2 -> B3 -> B4
Single blocking points: SourceCraft credential preflight; Docker at B4
External prerequisites: SourceCraft write/Gate access; isolated test DB; Docker for B4
Fallback: none for SourceCraft primary or Docker parity proof; fail closed
Production-only stops: tag, mirror, DNS, Timeweb mutation, live client run
Safe work if one task blocks: choose another ready task in the same open window
Expected stops: failed preflight, red check, changed SHA,
  unsafe target/archive, >1 px UI drift, production side effect
Result: READY_WITH_LIMITS
```

Limits are explicit and cannot be weakened safely: the four delivery batches
are intentionally serial; SourceCraft primary has no GitHub fallback; Docker
parity in B4 has no native-PostgreSQL substitute. The headless SourceCraft
write/API preflight passed on `2026-09-27` before approval handoff. Any later
authentication, Gate or Docker failure remains fail-closed at its own boundary.

Exact v4 passed the readiness gate. The owner supplied the exact phrase
`План утверждён` on `2026-09-27T12:11:02+03:00`; this snapshot is `APPROVED`.
Inventory generation, validated Task Manager import and Developer handoff are
authorized. Their mutable runtime status remains outside this immutable plan.

---

## 15. Revision packets

### AR11-001 — owner approval record

- Exact snapshot: `AMS-REALTY-BAZA-CLONE-FACTORY-2-2-11 v4`.
- Approved by: `owner`.
- Approved at: `2026-09-27T12:11:02+03:00`.
- Approval phrase: `План утверждён`.
- Final audit: `PASS`; Night Run Readiness: `READY_WITH_LIMITS`.
- Authorized: validated Task Manager import and Developer handoff after clean
  reconciliation.
- Not authorized: production, release tag, mirror, DNS/Timeweb mutation or
  live first-client run.

### RP11-004 — owner morphology decision and repeated final gate

Revision input ID: `RP11-004`

Source: `owner confirmation, 2026-09-27`

Accepted:

- exact city morphology for Rostov-on-Don;
- exact adjective forms for Leninskiy and Voroshilovskiy districts;
- exact locative/preposition pairs for Severny and Tsentr;
- removal of the only owner edge from B1-T1.

Repeated audit:

- logic/completeness: PASS;
- architecture/data/security: PASS;
- dependencies/autonomy: PASS, 26 nodes, zero cycles;
- executability/evidence/delivery: PASS;
- Night Run Readiness: `READY_WITH_LIMITS`.

Limits at the RP11-004 checkpoint: fixed serial batch delivery, mandatory
SourceCraft preflight without GitHub fallback and mandatory Docker parity proof
at B4. SourceCraft write access was still unverified at that checkpoint and
therefore had to pass before Developer handoff; AR11-001 records that pass.

Owner decisions before approval: `0`.

Sections changed: metadata, B1 frozen input, dependency root, OD11-04,
P11-F01, repeated audit scorecard, readiness and architect state.

Resulting version: `v4 READY_FOR_OWNER_APPROVAL`.

Task Manager import and Developer handoff: `NOT ALLOWED` until explicit owner
approval.

### RP11-003 — final audit remediation

Revision input ID: `RP11-003`

Source: `owner final-audit command + exact v2 audit evidence`

Audit passes:

- logic/completeness;
- architecture/data/security;
- dependencies/autonomy;
- executability/evidence/delivery.

Accepted and resolved:

- B4 release-contract/updater dependency inversion;
- explicit SourceCraft, isolated DB and Docker preflight/failure boundaries;
- final scorecard, audited dependency graph and Night Run evidence.

Needs owner:

- OD11-04 exact Souz city/district morphology baseline.

Already covered:

- production isolation;
- 22/22 task acceptance and verification contracts;
- four exact-head delivery gates and evidence tiers.

Sections changed: metadata, global execution contract, B1 owner gates,
dependency graph/matrix, owner decisions, final findings, scorecard and Night
Run Readiness.

Resulting version: `v3 REVIEW / NOT_READY`.

Task Manager import and Developer handoff: `NOT ALLOWED`.

### RP11-002 — owner decisions checkpoint

Revision input ID: `RP11-002`

Source: `owner confirmation, 2026-09-27`

Accepted decisions:

- `komnaty=OUT`;
- `garazhi=OUT`;
- `src/project/brand.css` is the only owner of 20–30 brand primitives;
  `src/app/globals.css` remains the semantic/component token map; Core, DESIGN,
  token/drift guards and clone docs change together during B3-T1.

Conflicts resolved:

- undefined Souz room/garage statuses no longer block B1;
- the brand clone boundary no longer silently conflicts with the current canon:
  the canon change is explicit, bounded and part of B3-T1.

Sections changed: metadata, Souz matrix, decisions, B1/B3 contracts, dependency
matrix, owner-decision register, findings and assembly readiness.

Owner decisions remaining: `0`.

Resulting version: `v2 REVIEW`.

Final four-pass audit: `NOT RUN`.

### RP11-001 — initial assembly

Revision input ID: `RP11-001`

Source: `owner + external/reference plan + current runtime inventory`

Targets:

- exact Souz preset;
- profile/legacy/morphology/intake;
- SEO templates/registry/cache/copy;
- brand and token ownership;
- starter upgrade, semver, runtime matrix and client operations;
- four-batch delivery and verification economy.

Accepted:

- all four product outcomes and batch order;
- mandatory Souz provenance for the reference preset;
- one profile owner, explicit morphology and intake compiler;
- audited SEO Registry operations;
- bounded brand contract without redesign;
- manifest/hash/conflict-safe upgrade;
- runtime clone matrix and Timeweb/restore tooling boundaries;
- production/tag/live-provider exclusion.

Rejected or corrected:

- repeated full clone matrix in B1/B2;
- guessed Souz statuses;
- silent second token source;
- automatic conflict resolution or client-owned file overwrite;
- implied live Timeweb/production PASS;
- visual consolidation beyond the stated tolerance.

Already covered and reused:

- preset schema v3;
- SiteProfile and clone compiler foundation;
- geo seed gateway;
- CSV Registry owner;
- runtime SEO/Content Gate/bounded reads;
- release build/smoke/proof tooling;
- current UI Core and token/drift analyzers.

Needed owner at v1:

- OD11-01, OD11-02, OD11-03.

Sections changed: all sections in this initial canonical Plan №11.

Resulting version: `v1 REVIEW`.

---

## 16. Revision history

### v4 — 2026-09-27 — APPROVED

- Recorded the exact owner-approved Souz morphology baseline in OD11-04.
- Closed P11-F01 and removed the final owner edge from B1-T1.
- Repeated all four audit passes against exact v4: 26 nodes, 26 matrix rows,
  zero cycles, 22/22 acceptance and verification contracts, four delivery
  nodes.
- Set Night Run Readiness to `READY_WITH_LIMITS`; SourceCraft and Docker limits
  remain explicit and fail-closed.
- Passed the headless SourceCraft write/API preflight.
- Recorded owner approval by the exact phrase `План утверждён` at
  `2026-09-27T12:11:02+03:00` without changing the executable graph.
- Authorized validated Task Manager import and Developer handoff after clean
  reconciliation. Production remains forbidden.

### v3 — 2026-09-27 — REVIEW / FINAL AUDIT NOT_READY

- Completed all four final-audit passes against exact v2 and current project
  contracts.
- Corrected the B4 dependency inversion and added fail-closed external
  preflights.
- Recomputed the graph: 26 nodes, 26 matrix rows, zero cycles.
- Opened OD11-04 because Souz requires owner-approved morphology and execution
  is forbidden from guessing it.
- Night Run Readiness is `NOT_READY`; after OD11-04 and restored SourceCraft
  access, expected result is `READY_WITH_LIMITS` because the four batches are
  intentionally serial and Docker parity has no safe fallback.
- Did not import Task Manager or start Developer.

### v2 — 2026-09-27 — REVIEW

- Recorded the owner's decisions: `komnaty=OUT`, `garazhi=OUT` and the bounded
  `brand.css` primitive-source split.
- Removed owner dependencies from B1-T1 and B3-T1 without changing the 26-node
  implementation/delivery inventory.
- Closed assembly findings P11-A01–A03 and reduced remaining owner decisions to
  zero.
- Kept the plan in assembly REVIEW: final audit, Task Manager import and
  Developer handoff were not run.
- Next transition requires an explicit final-audit command.

### v1 — 2026-09-27 — REVIEW

- Established the exact canonical baseline after completed Plan №10.
- Compared the owner specification with Souz v4.1.1 §4.4/§17.3/§20 and the
  actual current code/config/guards.
- Preserved four delivery batches and decomposed them into 22 implementation
  tasks plus four delivery nodes with acceptance, verification, rollback and
  stop conditions.
- Resolved verification duplication and isolated the B4 Docker exception.
- Identified three owner decisions; no value was guessed.
- Did not run final audit, import Task Manager or start Developer.

### v0 — 2026-09-27 — DRAFT (input basis)

- Owner-provided Plan №11 specification accepted as the assembly basis.
- No readiness or approval claim attached to the uploaded text.

---

## 17. Current architect state

```text
Plan: AMS-REALTY-BAZA-CLONE-FACTORY-2-2-11 v4 APPROVED
Phase: APPROVAL_HANDOFF
Revision input: exact owner approval phrase
Revision delta: approval record added without executable-graph changes
Audit: four passes REPEATED / PASS
Findings: open blockers 0 / open major 0 / final-audit resolved 3 / already covered 2
Dependency graph: audited nodes 26 / cycles 0 / owner edges 0
Night Run Readiness: READY_WITH_LIMITS
Owner decisions before approval: 0
Approval record: owner / 2026-09-27T12:11:02+03:00 / `План утверждён`
Task Manager import: authorized after validation
Developer handoff: authorized after clean reconciliation
Production: forbidden
Next: Validate -> Init -> Import -> Reconcile -> Developer goal
```

# AMS REALTY BAZA STARTER — FINAL AUDIT & COMMERCIAL FREEZE MASTER PLAN

**Plan ID:** `AMS-REALTY-BAZA-STARTER-FINAL-AUDIT-FREEZE`  
**Version:** `v2`  
**Date:** `2026-09-30`  
**Status:** `APPROVED`  
**Phase:** `APPROVAL_HANDOFF`  
**Architect gate:** `READY_WITH_LIMITS`  
**Approved by:** `owner`  
**Approved at:** `2026-09-30T23:03:11+03:00`  
**Execution owner:** Codex  
**Repository:** `integrator-p/ams-realty-baza-starter` in SourceCraft  
**GitHub:** mirror only — `neyro-level/ams-realty-baza-starter`  
**Audit mirror snapshot:** `main@47afbde798c77d10725681e9401dee78e471d7d5`  
**Architecture:** AMS Realty Platform Core Standard 5.5 + AMS UI Core v5.0  
**Profile:** `AMS_PROFILE=REALTY_BASE`  
**Delivery model:** solo owner + AI  
**Production:** NOT AUTHORIZED by this plan  
**New infrastructure provisioning:** FORBIDDEN by this plan  

Version: v2
Status: APPROVED

---

# 0. OWNER DECISIONS

This document started as `v1.0 FINAL`, but Task Manager Architect treated the
uploaded basis as a reviewable plan, not as an approved execution graph. The
owner-approved deltas below created `v2`; the final audit on exact `v2`
found no approval-blocking findings. The owner then explicitly approved this
exact version with the phrase `План утверждён`. Task Manager import and
Developer handoff are authorized after inventory validation and clean
reconciliation. Production and release tag creation remain outside this
approval.

## 0.1. Starter topology

### Starter remains lightweight

The starter is a reusable demo / verification template. It does **not** receive separate commercial infrastructure.

Keep:

```text
start-baza.ams24.ru
+
existing AMS server
+
local PostgreSQL
+
persistent local MEDIA_DIR
+
one Next/Payload runtime
+
one jobs owner
+
Nginx
```

Do **not** create for the starter:

```text
new Timeweb VPS
new Managed PostgreSQL
new S3 bucket
new Redis
new broker
new search engine
new queue infrastructure
new monitoring stack
```

This is intentional and must remain documented.

## 0.2. Commercial client boundary

A commercial client clone keeps a separate production contract:

```text
client project
→ own repository
→ own approved production topology
→ Timeweb Managed PostgreSQL
→ Timeweb S3-compatible Object Storage
→ separate secrets
→ staging
→ backup / monitoring
```

The starter demo topology must never silently become a client-production topology.

## 0.3. Critical invariant

```text
STARTER DEMO:
local PostgreSQL + MEDIA_DIR = allowed

CLIENT PRODUCTION:
local PostgreSQL + MEDIA_DIR as source of truth = forbidden
Managed PostgreSQL + S3 = required by Core 5.5
```

No real Timeweb resources are provisioned during this plan. Client storage behavior is verified with code-level and disposable fixtures only.

## 0.4. Owner decision OD-FA-01 — runtime design values return to `globals.css`

**Status:** `DECIDED`  
**Decision date:** `2026-09-30`  
**Owner direction:** return factual runtime design-system values to
`src/app/globals.css`.

This intentionally supersedes the current Plan №12 / Core 5.5 implementation
split where `src/project/brand.css` owns generated brand primitives and
`src/app/globals.css` owns the semantic/component map. The change is allowed
because the owner explicitly confirmed the new direction during this Architect
round.

Execution must therefore:

```text
clone preset / intake = client-owned input
→ clone tooling generates factual runtime design values into src/app/globals.css
→ src/project/brand.css is removed from runtime ownership or becomes only a
   temporary non-authoritative generation intermediary
→ all guards, docs and ownership manifests are updated to the new model
```

This is a new owner decision, not a claim that the current repository canon
already says this. The implementation must update the project canon and add a
short ADR/supersession note so future agents do not re-open the Plan №12
contradiction.

## 0.5. Owner decision OD-FA-02 — repository UI Core authority

**Status:** `DECIDED_FOR_THIS_PLAN`  
**Decision date:** `2026-09-30`

No standalone `AMS_UI_CORE_v5.0_FINAL.md` file is currently present in this
repository. For this plan, `docs/DESIGN.md` is the repository-owned UI Core
v5.0 authority and must be locked by hash together with the Core 5.5 document.

If the owner later supplies a separate upstream UI Core file, that file may
replace `docs/DESIGN.md` as the lock target through a separate documented
revision. Until then, execution must not block on a missing external UI Core
document.

---

# 1. AUDIT SUMMARY

## 1.1. Strong areas — preserve, do not rebuild

The current foundation already contains mature implementation for:

```text
Payload CMS as schema/application owner
Public Gateway + DTO
packages/contracts boundary
packages/ui boundary
Payload Jobs
multi-feed XML/YRL ingest
source isolation
manual field ownership
safe deactivation
Safe Outbound Client
SSRF controls
lead intake
transactional lead outbox
lead delivery state machine
PII boundaries
JSON-LD safe serialization
SEO registry
Content Gate
URL resolver
property lifecycle
redirect graph
robots/sitemaps
clone:init / clone:prepare
clone matrix
architecture/security/UI guards
SourceCraft exact-head delivery model
```

These areas must be reused, not rewritten.

## 1.2. Confirmed work before commercial freeze

### P0-01 — design-value ownership must be realigned by owner decision

Current repository Core 5.5, `docs/DESIGN.md` and Plan №12 evidence allow:

```text
src/project/brand.css
```

as a runtime owner of generated project brand primitives.

The owner has now decided that the new commercial-freeze direction is:

```text
src/app/globals.css
```

as the single runtime owner of factual design-system values.

Therefore this plan must not describe the change as if the old canon already
said this. It must apply OD-FA-01, update the active project canon, preserve
clone theming determinism and add a documented supersession trail.

### P1-01 — current `main` is not an immutable commercial release

The GitHub mirror currently points to:

```text
47afbde798c77d10725681e9401dee78e471d7d5
```

while `docs/STARTER_RELEASE_STATE.md` correctly states that no current
`starter-v2.*` release exists.

A moving `main` is not a valid client baseline.

### P1-02 — dependency security floor needs refresh

Pinned baseline currently includes:

```text
pnpm 11.5.1
Next.js 16.3.5
Payload 3.90.1
undici 7.29.0
```

Before a new immutable release, perform a version-sensitive security review and move only to compatible patched versions.

Execution must perform a fresh version-sensitive official-doc/security check
and choose exact compatible patch versions at implementation time. Known floor
candidates at plan assembly:

```text
pnpm >= 11.11.0 within approved 11.x
Next.js >= 16.3.6, or newer security-patched stable 16.3.x after official-doc verification
Payload family = 3.90.2 exact unless a newer compatible patch is explicitly proven
undici >= 7.29.1 within approved 7.x; do not jump to 8.x without a separate major-upgrade decision
```

Do not perform unrelated major upgrades.

### P1-03 — client S3 activation has a local-media dependency leak

The starter itself remains local and is correct to use `MEDIA_DIR`.

However, after explicit client S3 activation, code must not still require `MEDIA_DIR` or execute local media directory setup.

Fix the **activation boundary**, not the starter topology.

### P1-04 — UI Core v5.0 authority is not locked in repository governance

Lock `docs/DESIGN.md` as the current repository-owned UI Core v5.0 authority
together with Core 5.5. A separate upstream `AMS_UI_CORE_v5.0_FINAL.md` can
replace it only through a later owner-supplied revision.

### P1-05 — release-state authority needs a stricter verifier

`docs/STARTER_RELEASE_STATE.md` is already the active authority and already
records Plan №12 as complete. The remaining gap is mechanical enforcement:
release state must explicitly differentiate and verify:

```text
repository head
accepted implementation head
last verified head
released tag
released tag SHA
```

and must fail if a future edit treats a moving `main` as an immutable released
starter baseline.

### P1-06 — verification commands referenced by the plan must exist before use

The plan introduces new gates. They must be created before any later epic
references them as required checks:

```text
pnpm verify:constitution-lock
pnpm verify:dependency-security
pnpm verify:release-state
pnpm verify:safe-outbound
pnpm verify:timeweb-blueprint
```

Where an underlying script already exists, add a package script wrapper. Where
the check is new, implement it in the earliest epic that introduces the
contract.

### P2-01 — clone activation script is brittle

`clone:activate-timeweb-storage` performs source-string patching. It is fail-closed, so not a current blocker, but should move toward deterministic file generation after freeze if it can be done without widening scope.

---

# 2. EXECUTION RULES FOR CODEX

## 2.1. Canonical Git workflow

For every Epic:

```text
refresh SourceCraft main
→ confirm clean worktree
→ create branch
→ implement only Epic scope
→ run targeted checks
→ self-review full diff
→ create SourceCraft PR
→ exact-head Gate
→ merge to main
→ post-merge verification
→ delete branch
→ continue to next Epic
```

One Epic = one PR.

GitHub is not the release source.

## 2.2. No infrastructure actions

Codex must not:

```text
buy/provision VPS
create Managed PostgreSQL
create S3 bucket
change DNS
deploy production
create production secrets
create Redis
create broker
create search engine
```

This plan is repository-only.

## 2.3. No architecture expansion

Do not:

```text
add Prisma
add second ORM
add second backend
add second auth
add Redis
add Meilisearch
add Elasticsearch
add PostGIS
add Kubernetes
introduce microservices
replace Payload Jobs
rewrite working Gateway/DTO/import/lead subsystems
```

## 2.4. Constitution priority

When implementation and constitution disagree:

```text
OWNER CANONICAL CORE/UI
→ project architecture
→ code
```

Never:

```text
current code
→ silently rewrite constitution
```

A deviation is allowed only through explicit owner decision and ADR.

---

# 3. EPIC-00 — CANONICAL CONSTITUTION LOCK

**Severity:** P0  
**Risk:** RISKY / foundation  
**Branch:** `epic/00-constitution-lock`

## Goal

Make Core 5.5 and the repository UI Core authority immutable, while recording
OD-FA-01 as an explicit owner-approved supersession of the previous
`brand.css` / `globals.css` split.

## Tasks

### T00-01 — reconcile Core 5.5 with OD-FA-01

Update the repository Core 5.5 document:

```text
AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL
```

It must explicitly say that, for this starter line, factual runtime
design-system values live in `src/app/globals.css`. Preserve all unrelated Core
5.5 constraints. Do not use this task to normalize unrelated architecture or
rewrite working subsystems.

Add a short ADR or decision note that links the change to OD-FA-01 and names
the superseded Plan №12 / current Design split.

### T00-02 — lock the repository UI Core v5.0 authority

Use the existing repository-owned UI Core authority:

```text
docs/DESIGN.md
```

Update it to OD-FA-01:

```text
src/app/globals.css = runtime factual design-value owner
clone preset/intake = client-owned input
src/project/brand.css = no runtime authority after migration
```

Do not invent or require a missing standalone `AMS_UI_CORE_v5.0_FINAL.md`
unless the owner supplies it in a later revision.

### T00-03 — constitution lock manifest

Create:

```text
config/ams-constitution.lock.json
```

Minimum:

```json
{
  "core": {
    "version": "5.5",
    "path": "AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md",
    "sha256": "..."
  },
  "ui": {
    "version": "5.0",
    "path": "docs/DESIGN.md",
    "sha256": "..."
  }
}
```

### T00-04 — merge-blocking verification

Add:

```bash
pnpm verify:constitution-lock
```

It must:

```text
verify exact file hashes
verify declared versions
fail on silent canonical edits
fail if either locked authority is missing
run from package script `pnpm verify:constitution-lock`
```

### T00-05 — documentation priority

Update active docs so reading order is:

```text
AGENTS.md
→ canonical Core 5.5
→ repository UI Core v5.0 authority (`docs/DESIGN.md`)
→ project docs
→ ADR/module docs
→ code/runtime truth for implementation detail
```

Project docs may specialize project configuration but cannot weaken Hard Contract.

## DoD

```text
Core 5.5 reconciled with OD-FA-01
repository UI Core v5.0 authority locked
lock manifest committed
silent constitution edits fail CI
no unrelated starter-specific policy embedded into Core
```

## Checks

```bash
pnpm verify:constitution-lock
pnpm verify:version-comments
pnpm quality:architecture-guards
pnpm typecheck
pnpm lint
```

---

# 4. EPIC-01 — UI DESIGN VALUE OWNERSHIP RECONCILIATION

**Severity:** P0  
**Risk:** RISKY / UI foundation  
**Branch:** `epic/01-ui-design-ownership`

## Goal

Return runtime design-value ownership to the canonical UI contract without losing clone theming.

## Required target

```text
clone preset = input
↓
clone:prepare
↓
src/app/globals.css = only runtime factual design-value owner
```

## Tasks

### T01-01 — remove `brand.css` as runtime design owner

Remove:

```text
src/project/brand.css
```

from runtime design ownership.

If a temporary generated intermediary is needed during clone preparation, it must not remain a second runtime source of truth.

### T01-02 — keep brand data in clone input

Keep brand fields in clone intake/preset:

```text
colors
radii
font
logo
favicon
```

but use them to generate the project values into `globals.css`.

### T01-03 — deterministic `globals.css` generation

Refactor clone tooling so:

```text
approved starter globals template
+
clone brand input
=
project globals.css
```

Generated output must remain deterministic and hash-tracked.

### T01-04 — adapt guards

Update:

```text
scripts/quality/design-tokens.mjs
scripts/verify-brand-ownership.mjs
scripts/quality/drift-audit.mjs
clone prepare verifiers
starter ownership manifest
generated-output manifest
```

New rules:

```text
raw factual design values only in globals.css
other CSS consumes var(--*)
no duplicate brand literals
no second token owner
```

### T01-05 — preserve two-theme proof

Retain isolated test proof showing that two materially different clone themes can be generated without changing reusable UI source.

Do not ship the proof theme at runtime.

### T01-06 — preserve UI isolation

Do not change:

```text
packages/ui persistence boundary
shadcn primitive ownership
Server Component default
existing reusable view APIs
```

## DoD

```text
globals.css = only factual runtime design-value owner
clone brand customization still deterministic
two-theme proof passes
no visual-system fork
UI Core drift = 0 P0/P1
```

## Checks

```bash
pnpm verify:constitution-lock
pnpm verify:brand-ownership
pnpm quality:design-tokens
pnpm verify:token-scale
pnpm verify:drift
pnpm verify:ui-core
pnpm verify:clone-theme-proof
pnpm verify:clone-prepare
pnpm typecheck
pnpm lint
```

---

# 5. EPIC-02 — DEPENDENCY SECURITY PATCH BASELINE

**Severity:** P0/P1  
**Risk:** RISKY / dependency-runtime  
**Branch:** `epic/02-security-patch-baseline`

## Goal

Release a starter only on a currently supported patched dependency baseline.

## Rules

Before editing versions, check current official release/security documentation for the pinned major/minor lines.

Do not blindly upgrade to a new major.

## Tasks

### T02-01 — pnpm

Move from:

```text
11.5.1
```

to a compatible patched 11.x version:

```text
>= 11.11.0
```

Prefer the newest stable 11.x only if lockfile/install/clone checks pass.
Record the exact chosen version and official source checked in the epic
evidence.

Update:

```text
packageManager
lockfile metadata if required
active docs
```

### T02-02 — Next.js

Current:

```text
16.3.5
```

Required:

```text
minimum 16.3.6
```

If a newer official stable security patch in `16.3.x` exists at execution time, evaluate it and prefer it if targeted regression passes.

Do not change major.
Record the exact chosen version and official source checked in the epic
evidence.

### T02-03 — Payload family

Update together:

```text
payload
@payloadcms/next
@payloadcms/db-postgres
```

from:

```text
3.90.1
```

to:

```text
3.90.2
```

unless official version-sensitive review proves a newer safe patch should be used.

Also update the client S3 activation expected exact Payload/storage adapter version consistently.
Record the exact chosen Payload family versions and source checked in the epic
evidence.

### T02-04 — undici

Update:

```text
7.29.0
→ >=7.29.1
```

within approved 7.x.

Re-run Safe Outbound SSRF and DNS-pinning checks.
Do not move to Undici 8.x without a separate major-upgrade owner decision.

### T02-05 — security verification command

Create package scripts:

```bash
pnpm verify:dependency-security
pnpm verify:safe-outbound
```

It must at minimum verify:

```text
package-manager floor
pinned framework/package versions
known Critical/High advisories where machine-readable check is available
documented exceptions
exception expiry
lockfile consistency
```

`pnpm verify:safe-outbound` may wrap the existing Safe Outbound / SSRF /
DNS-pinning verifier if one already exists; it must be a stable package script
because later epics call it directly.

A security exception must include:

```text
package
advisory
reason
exposure assessment
owner
expiry/review date
```

### T02-06 — no unrelated upgrades

Do not upgrade React, Sharp, Zod, Tailwind or other packages unless compatibility/security requires it.

## Required regression matrix

```text
Next build
Payload Admin
Payload REST boundary
proxy.ts
trailing slash
canonical 308
legacy 301
404/410 lifecycle
next/image
Payload Jobs config
Safe Outbound
clone tooling
```

## DoD

```text
no known unapproved Critical/High in direct runtime baseline
package manager security floor fixed
Next patch floor fixed
Payload family aligned
undici patched
frozen install reproducible
```

## Checks

```bash
pnpm install --frozen-lockfile
pnpm verify:dependency-security
pnpm verify:security-boundaries
pnpm verify:safe-outbound
pnpm verify:jobs-config
pnpm verify:seo-contracts
pnpm verify:product-regression
RISK_SCOPE=dependency-runtime pnpm verify:merge-risky
pnpm build
```

---

# 6. EPIC-03 — CLIENT S3 ACTIVATION BOUNDARY

**Severity:** P1  
**Risk:** RISKY / storage boundary  
**Branch:** `epic/03-client-s3-boundary`

## Goal

Keep the starter on local media while proving that an explicitly activated client clone becomes truly S3-only.

**No real S3 bucket is created.**

## Canonical modes

### Starter demo

```text
projectKind=starter-demo
media mode=local
MEDIA_DIR required
staticDir enabled
local directory creation allowed
```

### Client after explicit S3 activation

```text
projectKind=client
media mode=timeweb-s3
S3 variables required
MEDIA_DIR not required
local media directory is not initialized
disableLocalStorage=true
```

## Tasks

### T03-01 — explicit storage mode

Introduce one typed storage mode owner, for example:

```ts
type MediaStorageMode = "local-demo" | "timeweb-s3";
```

Do not infer the mode from random env combinations.

### T03-02 — conditional Media config

Refactor `Media` collection so local `staticDir` / `ensureMediaDirectory()` is used only in `local-demo`.

S3 client mode must not evaluate local filesystem initialization.

### T03-03 — runtime env contract

After client S3 activation:

```text
S3_* required
MEDIA_DIR not required
```

Starter demo remains unchanged.

### T03-04 — deterministic activation

Update:

```text
clone:activate-timeweb-storage
client readiness
.env example generation
Payload plugin activation
package script `pnpm verify:timeweb-blueprint`
```

The activation remains repository-only and must not contact Timeweb.

If `scripts/verify-timeweb-blueprint.mjs` remains the canonical verifier, expose
it through `package.json` so later checks do not depend on an implicit script
path.

### T03-05 — disposable S3 activation fixture

Create a temporary fresh client clone fixture:

```text
released-like clean starter fixture
→ clone:init
→ clone:prepare
→ clone:activate-timeweb-storage
→ delete/unset MEDIA_DIR
→ load config
→ typecheck
→ build
→ verify client readiness
```

Use fake non-secret provider configuration. Do not perform real network calls.

### T03-06 — negative fixture

Prove:

```text
client mediaStorage=timeweb-s3
+
missing S3 required env
→ fail closed
```

and:

```text
starter-demo
+
no S3 env
→ remains valid
```

## DoD

```text
starter still uses local PG + MEDIA_DIR
no new infrastructure created
client S3 mode has zero runtime dependency on MEDIA_DIR
client activation is idempotent
fixtures prove both modes
```

## Checks

```bash
pnpm verify:timeweb-blueprint
pnpm verify:clone-readiness
pnpm verify:clone-prepare
pnpm verify:client-clone-proof
pnpm verify:clone-matrix
pnpm verify:client-readiness --mode=fixture-client
pnpm typecheck
pnpm build
```

---

# 7. EPIC-04 — CORE 5.5 / UI 5.0 COMPLIANCE AUDIT

**Severity:** P1  
**Risk:** RISKY / architecture  
**Branch:** `epic/04-core-compliance`

## Goal

Create an executable compliance map and eliminate undocumented deviations.

## Tasks

### T04-01 — compliance matrix

Create:

```text
docs/CORE_5_5_COMPLIANCE_MATRIX.md
```

Columns:

```text
Rule ID
Canonical requirement
Implementation path
Status PASS / DEVIATION / N/A
Evidence
Required action
```

Cover every Hard Contract item.

### T04-02 — UI matrix

Create/update a matching UI section for AMS UI Core v5.0:

```text
primitive foundation
REUSE → VARIANT → CREATE
design values
Server/Client boundaries
DTO boundary
forms
accessibility
media
SEO page contract
dark mode
motion
drift audit
```

### T04-03 — review always-on schema

Explicitly classify:

```text
Regions
Cities
Districts
Developers
Developments
LifecycleEvents
```

Determine whether each is:

```text
base platform capability
activated optional module
operational collection
```

Do not silently change Core to fit the answer.

If a real reusable deviation from base Core is intentional, create a project/starter ADR and keep the global Core unchanged.

### T04-04 — review data-access physical layout

Current implementation places public application readers under project composition paths.

Verify that logical Hard Contract is satisfied:

```text
public reads
server only
overrideAccess:false
explicit select
explicit depth
explicit limit
publication predicate
DTO only
```

Do not move files only for cosmetic path matching if the enforced dependency boundary is already correct.

### T04-05 — module governance consistency

Verify:

```text
novostroyki base development surface
prepared building/layout/chessboard extension
journal disabled
agents disabled
```

No module manifest may contradict live schema/routes.

### T04-06 — mechanical guard coverage

Verify guards cover at least:

```text
overrideAccess
Local API access mode
raw SQL boundary
private fields
wildcard CORS
direct configurable outbound fetch
secret exposure
top-level next/* in jobs/ingest/cache
UI persistence dependencies
dark mode
design literals
module URL reservations
```

## DoD

```text
0 undocumented Hard Contract deviations
0 P0 findings
0 P1 architecture drift
module state consistent
no unnecessary refactor
```

## Checks

```bash
pnpm quality:architecture
pnpm quality:architecture-guards
pnpm quality:guards
pnpm verify:security-boundaries
pnpm verify:public-gateway
pnpm verify:schema
pnpm verify:ui-core
```

---

# 8. EPIC-05 — RELEASE STATE / DOCUMENT GOVERNANCE

**Severity:** P1  
**Risk:** STANDARD  
**Branch:** `epic/05-release-state-governance`

## Goal

Make current implementation/release state impossible to misread by owner or AI.

## Tasks

### T05-01 — harden release state fields

`docs/STARTER_RELEASE_STATE.md` is already the active release-state authority.
Harden it so it explicitly separates and keeps verifying:

```text
Canonical SourceCraft repository
Repository main SHA
Accepted implementation SHA
Last fully verified SHA
Current immutable released tag
Released tag SHA
Last SourceCraft Gate
Open P0
Open P1
Open P2
Production/live proof state
```

Preserve existing true facts about Plan №12 completion. Do not rewrite
historical evidence and do not claim that Plan №12 is open.

### T05-02 — update current facts

After EPIC-00…04, populate from actual SourceCraft state.

Do not copy old SHA values from historical plans.
The document may keep the Plan №12 implementation checkpoint as provenance, but
the final commercial-freeze candidate SHA must be a distinct field after this
new plan has produced one.

### T05-03 — release-state verifier

Create:

```bash
pnpm verify:release-state
```

It must fail if:

```text
declared SHA format invalid
declared versions differ from package/lock
constitution versions differ from lock manifest
released tag/sha pair inconsistent
state says released without immutable tag
state says P0/P1=0 while active blocker registry says otherwise
state treats `main`, `latest` or `origin/main` as an immutable released starter baseline
```

The command does not create tags.

### T05-04 — documentation cleanup

Update active docs only:

```text
AGENTS.md
docs/README.md
docs/PROJECT.md
docs/03_ARCHITECTURE.md
docs/04_BACKLOG.md
docs/05_RELEASE_CHECKLIST.md
docs/DESIGN.md
docs/OPERATIONS.md
docs/CLONE_ONBOARDING.md
docs/STARTER_RELEASE_STATE.md
```

Historical evidence remains historical.

### T05-05 — clone hygiene check

Verify `clone:prepare` removes starter-only execution history from client clones:

```text
docs/legacy
docs/proofs
starter-only evidence
starter plans
starter demo compose/nginx
```

Client clone must keep only useful canonical project documentation.

## DoD

```text
one unambiguous current release authority
no stale Plan 12 open-state claim
no moving main treated as released baseline
client clone does not inherit starter execution history
```

## Checks

```bash
pnpm verify:release-state
pnpm verify:version-comments
pnpm verify:clone-onboarding
pnpm verify:clone-prepare
pnpm verify:clone-readiness
pnpm lint
```

---

# 9. EPIC-06 — FINAL COMMERCIAL FREEZE GATE

**Severity:** BLOCKING  
**Risk:** RISKY / final acceptance  
**Branch:** `epic/06-commercial-freeze`

## Goal

Produce the first current immutable starter baseline that can safely be used for new commercial projects.

## Preconditions

Must be true:

```text
EPIC-00 merged
EPIC-01 merged
EPIC-02 merged
EPIC-03 merged
EPIC-04 merged
EPIC-05 merged
P0 = 0
P1 = 0
```

## Tasks

### T06-01 — clean exact-head verification

From clean SourceCraft main:

```bash
pnpm install --frozen-lockfile

pnpm verify:constitution-lock
pnpm verify:dependency-security
pnpm verify:release-state

pnpm verify
pnpm verify:schema
pnpm verify:integration:required
pnpm verify:ui-core
pnpm verify:client-readiness
pnpm verify:clone-matrix
pnpm verify:starter-release
```

No required DB suite may be skipped.

### T06-02 — fresh clone matrix

Run disposable fresh-clone proof for at least:

```text
MIXED
NEWBUILD_FIRST
SECONDARY_FIRST
MULTI_GEO
typed districts + legacy
```

Each must start from the exact final candidate SHA.

### T06-03 — S3 activation proof without infrastructure

Run one disposable client clone:

```text
clean candidate
→ clone:init
→ clone:prepare
→ clone:activate-timeweb-storage
→ no MEDIA_DIR
→ typecheck
→ build
→ client-readiness
```

No real Timeweb calls.

### T06-04 — final drift / security review

Run:

```text
architecture
security
UI drift
SEO crawl matrix
performance record
clone bootstrap
release artifact contract
```

### T06-05 — final report

Create:

```text
docs/evidence/final-freeze/FINAL_REPORT.md
```

Must contain:

```text
candidate exact SHA
versions
constitution hashes
checks actually run
DB suites result
clone matrix result
S3 activation fixture result
P0/P1/P2
known non-blocking risks
not-run items
production explicitly NOT RUN
```

### T06-06 — release candidate state

Update `STARTER_RELEASE_STATE.md`:

```text
implementation READY_FOR_RELEASE
P0=0
P1=0
candidate SHA=<exact SHA>
production=NOT AUTHORIZED
```

Do not yet invent a tag.

## DoD

```text
all required checks PASS on one exact SourceCraft SHA
clone matrix PASS
S3 fixture PASS
P0=0
P1=0
final report exists
candidate immutable SHA known
```

---

# 10. EPIC-07 — IMMUTABLE STARTER RELEASE

**Severity:** OWNER-GATED  
**Risk:** RELEASE  
**Trigger:** explicit owner command after EPIC-06  
**Branch:** release procedure according to SourceCraft policy

## Goal

Create the immutable baseline for all new client projects.

## Sequence

```text
confirm exact candidate SHA
→ confirm final report
→ confirm P0=0 / P1=0
→ choose starter-v2.MINOR.PATCH
→ create release manifest
→ create immutable SourceCraft tag
→ verify tag resolves to exact candidate SHA
→ update STARTER_RELEASE_STATE.md
→ optional one-way GitHub mirror
```

## Required release identity

Every new client Master Plan must record:

```text
Starter tag: starter-v2.MINOR.PATCH
Starter SourceCraft SHA: <exact 40-char SHA>
```

Never:

```text
main
latest
origin/main
directory snapshot
historical starter-freeze
```

## DoD

```text
immutable starter-v2.* exists
tag == exact verified SHA
release manifest matches SHA
STARTER_RELEASE_STATE current
commercial clone baseline officially available
```

---

# 11. CLIENT PROJECT START PROCEDURE AFTER RELEASE

Once EPIC-07 is complete, a new client project uses:

```text
1. create private SourceCraft repository
2. import exact starter-v2.* tag/SHA
3. record docs/CLONE_PROVENANCE.md
4. prepare client intake outside Git
5. pnpm clone:init
6. pnpm clone:prepare
7. decide client topology
8. if Timeweb S3 selected → clone:activate-timeweb-storage
9. seed geography/NAP
10. import demand
11. approve SEO registry
12. pnpm verify:client-readiness
13. continue client-specific Master Plan
```

The starter repository itself stays on its current lightweight server topology.

---

# 12. WHAT CAN START TODAY BEFORE THE NEW TAG

Do not block commercial planning while starter freeze is being completed.

Allowed immediately in a new client planning workspace:

```text
PRD
business goals
commercial offer
site structure
SEO semantics
legacy crawl
URL strategy
city/district taxonomy
content inventory
feed inventory
data-source inventory
NAP collection
legal-content preparation
design intake
reference/Figma analysis
client clone intake JSON draft
```

Do not create the final code repository baseline from current moving `main`.

After `starter-v2.*` is released, materialize the code project from the exact tag/SHA.

---

# 13. PRIORITY / EXECUTION ORDER

```text
EPIC-00  Canonical constitution lock
↓
EPIC-01  UI design value ownership
↓
EPIC-02  Dependency security patch baseline
↓
EPIC-03  Client S3 activation boundary
↓
EPIC-04  Core/UI compliance audit
↓
EPIC-05  Release-state governance
↓
EPIC-06  Final commercial freeze gate
↓
OWNER GATE
↓
EPIC-07  Immutable starter-v2.* release
```

No production deployment is part of this sequence.

## 13.1 Dependency and autonomy notes

This plan is intentionally foundation-heavy and mostly serial. The serial path
is acceptable because EPIC-00 and EPIC-01 change the governing contracts for
later work.

```text
EPIC-00 → EPIC-01
  Type: HARD
  Reason: design-value ownership cannot be migrated before the locked Core/UI
  authority and OD-FA-01 supersession are recorded.

EPIC-02 → EPIC-03
  Type: CONTRACT
  Reason: S3 activation must use the chosen Payload/storage adapter patch line.
  Blocking scope: activation script and S3 fixture only.

EPIC-00…05 → EPIC-06
  Type: HARD
  Reason: final freeze must verify the exact merged candidate after all
  blockers and verifier scripts exist.

EPIC-06 → EPIC-07
  Type: OWNER / RELEASE
  Reason: immutable tag creation requires explicit owner release command.
```

Parallel-safe work after EPIC-00 contract freeze:

```text
EPIC-02 dependency patch review can proceed in parallel with EPIC-01 implementation
only if both branches avoid the same lockfile and generated UI files.
EPIC-04 compliance matrix can begin as read-only inventory after EPIC-00, but
its PASS status waits for EPIC-01…03.
```

---

# 14. BLOCKING VS NON-BLOCKING

## Blocking before commercial clone release

```text
canonical constitution fork
design-value owner conflict
unpatched dependency floor
client S3/local-media boundary leak
release-state verifier missing
missing exact final verification
missing immutable tag
```

## Non-blocking / may remain after freeze

```text
starter local PostgreSQL
starter local MEDIA_DIR
starter demo domain
no real Timeweb S3 on starter
no separate starter Managed PostgreSQL
no Redis
no Meilisearch
no dedicated job runner
clone activation implementation using guarded string patching, if all current fixtures stay green
```

---

# 15. FINAL ACCEPTANCE FORMULA

```text
STARTER DEMO
=
existing AMS server
+
local PostgreSQL
+
persistent MEDIA_DIR
+
one jobs-active runtime
+
no new infrastructure

COMMERCIAL REUSABILITY
=
Core 5.5 reconciled with OD-FA-01
+
repository UI Core v5.0 authority
+
constitution lock
+
patched dependency floor
+
Gateway / DTO boundaries
+
safe ingest
+
lead outbox
+
SEO / lifecycle
+
deterministic clone factory
+
client S3 boundary proof
+
P0 = 0
+
P1 = 0
+
exact-head full verification
+
immutable starter-v2.* tag
```

Only after this formula is satisfied may the starter be treated as the default code baseline for new AMS Realty commercial projects.

---

# 16. FINAL ARCHITECT AUDIT RESULT

```text
Plan: AMS-REALTY-BAZA-STARTER-FINAL-AUDIT-FREEZE / v2 APPROVED
Phase: APPROVAL_HANDOFF
Revision input: owner decision + Architect audit findings
Revision delta:
  - accepted OD-FA-01: globals.css returns as runtime factual design-value owner
  - accepted OD-FA-02: docs/DESIGN.md is current repository UI Core authority
  - corrected release-state finding from stale-state claim to verifier hardening
  - added missing package-script creation requirements before later checks
  - clarified dependency patch targets as exact-at-execution, no major upgrades
Audit:
  logic/completeness: PASS
  architecture/data/security: PASS
  dependency/autonomy: PASS_WITH_LIMITS
  executability/evidence/delivery: PASS
Findings:
  blockers 0
  open major 0
  needs owner before approval 0
  previous blockers A01/A02 resolved in plan text
  previous missing-script major converted into executable tasks
Dependency graph:
  cycles 0
  hard dependencies EPIC-00 -> EPIC-01 and EPIC-00...05 -> EPIC-06 are intentional
  release edge EPIC-06 -> EPIC-07 is OWNER / RELEASE and remains isolated
  critical path EPIC-00 -> EPIC-01 -> EPIC-02/03 -> EPIC-04 -> EPIC-05 -> EPIC-06
Night Run Readiness:
  READY_WITH_LIMITS
  Limit: foundation-heavy serial path plus explicit owner release gate before EPIC-07.
  Why acceptable: implementation work through EPIC-06 is deterministic; production is out of scope;
  release tag creation is isolated behind explicit owner command.
Owner decisions before approval:
  0 currently known
Approval:
  owner-approved at 2026-09-30T23:03:11+03:00 after exact v2 final audit
Task Manager import:
  authorized after inventory validation and clean reconcile
Developer handoff:
  authorized after approval + clean import/reconcile
Next:
  inventory validation -> Beads import/reconcile -> Developer goal
```

---

# 17. CODEX FINAL REPORT FORMAT

At the end of every Epic report:

```text
EPIC:
SOURCECRAFT MAIN BEFORE:
BRANCH:
PR:
MERGED MAIN SHA:

DONE:
ACTUALLY CHECKED:
CHECKS PASSED:
MIGRATIONS:
SECURITY:
CONSTITUTION COMPLIANCE:
NOT CHECKED:
RISKS:
NEXT EPIC READY: YES / NO
```

Never write `PASS`, `GREEN`, `DONE`, or `CHECKED` for a proof that was not actually executed.

---

# END

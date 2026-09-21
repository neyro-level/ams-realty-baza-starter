# AMS REALTY BAZA STARTER — RESIDUAL ALIGN MASTER PLAN

```text
Plan ID: AMS-REALTBASE-RESIDUAL-ALIGN
Version: v1
Status: APPROVED
Phase: APPROVAL_HANDOFF
Approved by: owner
Approved at: 2026-09-19T13:38:27+03:00
Delivery profile: COMMERCIAL
Profile: REALTY_BASE
Mode: BUILD
Baseline branch: main
Baseline SHA: f8344deff1f7982f71d4f40a75bafa7703835590
Predecessor: AMS-REALTBASE-CORE-ALIGN v1 APPROVED, EPIC-01…08 closed on baseline SHA
Repository mode: SOURCECRAFT_PRIMARY_GITHUB_MIRROR
Delivery mode: MERGE_AFTER_GATE per epic
Production: OUT OF SCOPE
GitHub: OUT OF SCOPE
```

## 0. Статус и назначение

Этот документ — следующий самостоятельный master plan после закрытого Plan №4.
Он не переоткрывает EPIC-01…08 предыдущего плана и не повторяет закрытые
HARDENING/CORRECTIONS программы.

Цель: устранить подтверждённый residual drift между фактическим starter на
`main@f8344de` и его канонами Core 5.5 / UI Core 5.0, усилить обязательные
proof surfaces и оставить автономно исполнимый граф без скрытых owner gates.

Владелец утвердил exact v1 командой `План утвержден` 2026-09-19. Architect
обязан выполнить `Validate → Init → Import → Reconcile` и передать exact graph
Task Manager Developer. Production остаётся отдельной командой владельца.

## 1. Source of Truth и зафиксированные решения

Приоритет текущего scope:

1. `AGENTS.md` и `docs/README.md`;
2. `docs/01_PRD.md`, `02_PRODUCT_STRUCTURE.md`, `03_ARCHITECTURE.md`;
3. этот exact plan после owner approval;
4. Core 5.5 и UI Core 5.0 в применимой части;
5. package/lockfile, migrations, код и tests baseline SHA.

Зафиксировано и не требует нового вопроса:

- starter runtime: local PostgreSQL + persistent `MEDIA_DIR` на AMS Server;
- Payload — единственный schema/auth/access/migration owner;
- Prisma, второй backend/ORM/auth запрещены;
- `AMS_PROFILE=REALTY_BASE`, один jobs-active runtime;
- cache mode starter: `http`; `in-process` не заявляется без отдельного B1 proof;
- Public Gateway: explicit `overrideAccess:false`, select/depth/limit/predicate,
  DTO-only output;
- System Gateway: `overrideAccess:true` только через whitelist operation;
- агентство управляет лидами через Payload Admin: `owner` и `admin` могут
  читать/обновлять business lead state и PII; destructive delete/retention и
  sensitive owner operations остаются owner-only; public access отсутствует;
- `leadRetentionDays` и `archiveRetentionDays` остаются `NEEDS_OWNER` только
  перед client production configuration; null policy fail-closed и не блокирует
  pre-production implementation;
- один epic = одна branch/worktree = один SourceCraft PR;
- merge только после diff review и одного exact-head STANDARD/RISKY Gate;
- production и GitHub mirror в этот граф не входят.

## 2. Сопоставление с Plan №4 и входным черновиком

### 2.1 Уже закрыто Plan №4 v1 — не повторять

- demo topology local PostgreSQL + `MEDIA_DIR`;
- proof Next 16 `src/proxy.ts` и deny anonymous Payload REST;
- перенос Public/System Gateway в `src/core/data-access/**`;
- базовый runtime env fail-fast;
- split HTTP/in-process cache implementation files и существующие §18A artifacts;
- home/shell composition без runtime import donor `home-page.css`;
- базовый drift audit;
- ISR/cleanup/ADR pass.

Новый plan исправляет оставшиеся contract gaps внутри этих областей, но не
исполняет предыдущие эпики заново.

### 2.2 Revision packet MP5-R1

```text
Source: owner + provided draft AMS_MASTER_PLAN_№4_FINAL.md
Baseline: main@f8344deff1f7982f71d4f40a75bafa7703835590
Resulting version: v1 READY_FOR_OWNER_APPROVAL
```

ACCEPTED:

- отдельный mandatory DB proof для RISKY merge;
- Public Gateway `overrideAccess:false` и explicit Local API mode inventory;
- runtime checks для `INTERNAL_REVALIDATE_BASE_URL` и `LEAD_OUTBOUND_HOSTS`;
- DB-level money/area invariants;
- bounded ingest вместо whole-feed `offers[]`;
- `approvedAt` в one-time deactivation approval;
- FK/retention consistency для lead deliveries;
- реальный `payload.jobs.queue({ waitUntil })` для controlled retries;
- terminal `abandoned` для permanent/exhausted business outcomes;
- mechanical architecture/UI guards;
- новый exact-SHA final proof.

ADAPTED:

- входные `EPIC-32…45` заменены на plan-local `EPIC-01…13`;
- strict linear chain заменена DAG/waves и task-level dependencies;
- lead access приведён к PRD: owner+admin business operations, owner-only
  destructive operations, system-only service mutations;
- cache epic не активирует speculative `in-process`; starter остаётся HTTP;
- UI ownership refactor объединён с фактическим cleanup и не создаёт второй
  design system;
- documentation sync не переносит нормативные root documents без отдельного
  доказанного trigger.

REJECTED:

- название `Plan №4 FINAL`: Plan №4 уже закрыт на baseline SHA;
- owner-only read/update всех лидов: противоречит PRD;
- перенос `AMS_PROJECT_ARCHITECTURE_v1.0.md` и Core 5.5 в `docs/reference/`:
  затрагивает действующие ссылки и исторические inventories без необходимости;
- включение нового cache mode ради симметрии с Core: режим без proof запрещён;
- обязательная полная последовательность всех эпиков: создаёт искусственный
  single blocking point.

ALREADY_COVERED:

- canonical queues и concurrency control;
- Safe Outbound Client, DTD deny, redirect re-check;
- transactional lead outbox и unique `(leadId, channelId)`;
- `packages/ui`, `packages/contracts`, layout primitives и `components.json`;
- HTTP cache self-call implementation;
- fail-closed null retention decision logic;
- anonymous raw Payload REST boundary.

## 3. Подтверждённый baseline

Installed versions:

```text
Node 24.20.0
Next 16.3.5
React / react-dom 19.2.8
Payload / @payloadcms/* 3.89.0
pnpm lockfile present
```

Проверено по коду baseline:

| Finding | Evidence | Verdict |
|---|---|---|
| Public Gateway bypasses access | `publicGatewayPolicy` наследует `overrideAccess:true` из System Gateway | CONFIRMED |
| Local API calls omit explicit mode | `src/payload/jobs/tasks.ts`, health route и core services имеют calls без explicit wrapper | CONFIRMED |
| RISKY DB proof can skip | `verify-integration-suites.mjs` exits 0 without test DB | CONFIRMED |
| HTTP env incomplete | runtime requires secret but not internal base URL | CONFIRMED |
| Lead allowlist env incomplete | active channels do not require `LEAD_OUTBOUND_HOSTS` | CONFIRMED |
| Money/area DB invariant absent | migration uses generic `numeric` | CONFIRMED |
| Dispatcher uses low-level SQL | ingest SQL claim path exists | CONFIRMED; fallback may remain only by ADR |
| Feed retained in memory | `runImportFeed` pushes all offers into `offers[]` | CONFIRMED |
| Approval lacks `approvedAt` check | snapshot validator checks run/expiry/consumed only | CONFIRMED |
| Retention FK contradictory | `lead_id NOT NULL` + `ON DELETE SET NULL` | CONFIRMED |
| Retry scheduling unsupported | task result includes `waitUntil`, installed handler type accepts only state/output | CONFIRMED |
| Permanent result uses `failed` | delivery state maps permanent to `failed` | CONFIRMED |
| UI literals remain | `rounded-[18px]`, `rounded-[15px]` | CONFIRMED |
| Donor CSS is dead runtime source | `home-page.css` has no runtime import, 27 KB remains in package source | CONFIRMED |
| `react-dom` peer missing | `packages/ui/package.json` has only React peer | CONFIRMED |

Version-sensitive cross-check performed against installed Payload types and
official Payload docs:

- Local API defaults to access override; user/public operations require
  explicit `overrideAccess:false` and user/request context;
- task handler result is `output/state`, not `waitUntil`;
- future execution is queued through `payload.jobs.queue({ waitUntil })`.

Official references checked 2026-09-19:

- `https://payloadcms.com/docs/local-api/access-control`
- `https://payloadcms.com/docs/local-api/overview`
- `https://payloadcms.com/docs/jobs-queue/tasks`
- `https://payloadcms.com/docs/jobs-queue/jobs`

## 4. Execution policy

### 4.1 Global epic contract

Каждый implementation epic обязан:

1. стартовать от свежего `origin/main` в отдельной branch/worktree;
2. записать base SHA и проверить отсутствие drift утверждённого contract;
3. менять только scope epic;
4. выполнить targeted checks во время WORK;
5. commit + push + SourceCraft PR;
6. провести diff review;
7. выполнить один exact-head STANDARD/RISKY Gate;
8. merge в `main`, проверить merge SHA, удалить epic branch;
9. записать `EXECUTION_LEDGER_V1` в Beads;
10. продолжить следующую READY task.

Если epic блокируется, Developer фиксирует blocker, освобождает claim и берёт
другую независимую READY task. Production actions не выполняются.

### 4.2 Gate classes

`STANDARD`:

- docs, guards, package metadata, CSS/presentation refactor;
- targeted checks + `verify:daily`/эквивалентный canonical aggregate;
- build только при изменении routes/exports/package/runtime/Tailwind graph.

`RISKY`:

- access/security, schema/migrations, import, jobs, PII/retention, cache/env;
- targeted checks + mandatory isolated PostgreSQL/Payload proof + build;
- schema epic дополнительно clean DB и previous-data migration proof.

Ни один RISKY gate не может преобразовать `SKIPPED` в PASS.

### 4.3 External prerequisites and fallbacks

| Prerequisite | Preflight | Fallback / stop condition |
|---|---|---|
| Native local PostgreSQL + isolated test DB | EPIC-01 validates non-production URI and migration capability | backend RISKY tasks block; continue STANDARD UI/docs tasks; never use production DB |
| SourceCraft credential/quota | read-only identity/preflight before first PR/gate | keep commit/push evidence where allowed; do not claim merge; continue only work that does not require changed main |
| Official Payload semantics | installed types + official docs | if atomic primitive is not proven, use narrow SQL fallback + ADR; no guessed API |
| Visual/browser contour | representative routes + baseline assets | UI epic cannot close without required matrix; no source-only PASS |

## 5. Dependency graph

### 5.1 Taxonomy

- `HARD`: dependent acceptance technically cannot be proven earlier;
- `CONTRACT`: implementation can begin after a small contract freeze;
- `SOFT`: preferred order only;
- `EXTERNAL`: environment/service preflight;
- `PRODUCTION`: separate owner authorization, not an implementation dependency.

### 5.2 Waves

```text
WAVE A — independent foundations
  EPIC-01 Verification contract
  EPIC-10 UI Core gate

WAVE B — backend corrections after EPIC-01 exit
  EPIC-02 Access boundaries
  EPIC-03 HTTP cache/env
  EPIC-04 Numeric invariants
  EPIC-05 Dispatcher/SQL governance
  EPIC-06 Bounded ingest/deactivation
  EPIC-07 Lead retention/access
  EPIC-08 Lead retry scheduling

WAVE C — consolidation
  EPIC-09 Architecture guards
  EPIC-11 UI cleanup/ownership

WAVE D — truth and proof
  EPIC-12 Source-of-truth sync
  EPIC-13 Final conformity proof
```

Один Developer физически выполняет эпики последовательно, но DAG не блокирует
выбор другой READY work при локальном blocker.

### 5.3 Dependency matrix

| Epic | Depends on | Type / blocking scope | Parallel-safe with | Critical path |
|---|---|---|---|---|
| 01 | isolated test DB | EXTERNAL, only DB-required tasks | 10 | yes |
| 02 | 01 merge surfaces | HARD for exit/merge, not initial analysis | 03,04,05,06,07,08 | yes |
| 03 | 01 | HARD for runtime DB proof only | 02,04,05,06,07,08 | no |
| 04 | 01 | HARD, migrations | 02,03,05,06,07,08 | yes |
| 05 | 01 | HARD; Payload primitive investigation is first task | 02,03,04,06,07,08 | yes |
| 06 | 01 | HARD for integration proof | 02,03,04,05,07,08 | yes |
| 07 | 01; access contract from 02 | HARD on 01, CONTRACT on EPIC-02 contract only | 03,04,05,06,08 | yes |
| 08 | 01 | HARD for jobs DB proof | 02,03,04,05,06; serialize with 07 if shared files overlap | yes |
| 09 | 02–08 | CONTRACT/HARD only for guards of changed boundaries | 11 after 10 | yes |
| 10 | baseline only | none | 01 | no |
| 11 | 10 | HARD: scanner/matrix must exist before cleanup acceptance | 02–08 | no |
| 12 | 02–09,11 | HARD for exact docs truth | none | yes |
| 13 | 02–12 | HARD for exact-SHA final evidence | none | yes |

Cycles: `0`.

Shared-file rules:

- `src/payload/jobs/tasks.ts`: EPIC-02, 03, 08; merge serially even if logically
  independent;
- `LeadDeliveries`/lead migrations: EPIC-07 before EPIC-08 if both touch the
  same generated schema snapshot;
- `architecture-guard.mjs` and `.dependency-cruiser.mjs`: feature epics add only
  essential local rules; EPIC-09 owns aggregate normalization/self-tests;
- `package.json` scripts: EPIC-01 owns merge surface names; later epics may add
  targeted commands without redefining the gate contract.

## 6. Epic contracts

### EPIC-01 — Mandatory verification contract

```text
Outcome: STANDARD and RISKY merge surfaces are materially different; RISKY
cannot pass without isolated PostgreSQL/Payload proof.
Risk: STANDARD foundation
Branch: chore/residual-01-verification-contract
Delivery: MERGE_AFTER_GATE / STANDARD
Dependencies: EXTERNAL isolated non-production test DB preflight
```

Scope:

- add `verify:merge-standard`, `verify:merge-risky`,
  `verify:integration:required`;
- keep optional developer integration command if useful, but required command
  fails when DB contour is absent;
- split SourceCraft manual workflows by real commands;
- preserve exact-head assertion;
- add negative proof: missing DB env → non-zero RISKY result;
- document native PostgreSQL test contour; Docker/WSL are not automatic fallback.

Acceptance / evidence:

- STANDARD does not execute unnecessary DB suite;
- RISKY executes required DB suite and build;
- missing/production-looking DB fails closed before mutation;
- exact-head mismatch fails;
- existing checks are not removed or downgraded.

Checks: current `verify:daily`, `verify`, `verify:schema`; then new merge-standard
and negative required-integration scenario.

Rollback: revert scripts/workflow as one PR; no schema/data mutation.

Stop: no safe isolated DB; record blocker and continue EPIC-10.

### EPIC-02 — Public/System Gateway and explicit Local API modes

```text
Outcome: public/user operations respect access; privileged operations are
enumerated System/Ingest operations; raw anonymous REST remains closed.
Risk: RISKY security/access
Branch: fix/residual-02-access-boundaries
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01 exit; EPIC-07 consumes frozen role/access contract
```

Scope:

- remove Public Gateway dependency on System `public-read` override;
- public reads use `overrideAccess:false`, request/user/context as required,
  explicit select/depth/limit/publication predicate and DTO output;
- add context-aware collection rules without opening generic anonymous REST;
- inventory Local API calls in app/core/jobs/health/hooks;
- route privileged calls through whitelisted System/Ingest helpers;
- preserve private field-level access;
- update access/architecture tests and mechanical guard.

Role decision:

- owner+admin: operational lead read/update as required by PRD;
- owner-only: destructive delete/retention and sensitive owner actions;
- system-only: automated delivery/import/maintenance mutation;
- anonymous/public: no lead PII or delivery diagnostics.

Acceptance / verification:

- published public DTO available; unpublished/private denied;
- raw anonymous Payload business REST denied;
- private property/lead/delivery fields absent from public path;
- owner/admin allowed exactly by matrix; editor/anonymous denied;
- Local API guard catches missing explicit mode on broken fixture.

Checks: public-gateway, security-boundaries, architecture, required integration,
merge-risky, build.

Rollback: revert access/helper changes together; do not partially restore public
system override.

Stop: access matrix conflicts with updated PRD; return to Architect/owner.

### EPIC-03 — HTTP cache contract and runtime env fail-fast

```text
Outcome: starter has one unambiguous HTTP invalidation path and refuses runtime
startup when required self-call or active-channel allowlist settings are absent.
Risk: RISKY runtime/security
Branch: fix/residual-03-cache-env
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01
```

Scope:

- keep `CACHE_INVALIDATION_MODE=http` as starter enum/default;
- distinguish canonical HTTP adapter from internal Route Handler executor;
- require `REVALIDATE_SECRET` and `INTERNAL_REVALIDATE_BASE_URL` for HTTP mode;
- require `LEAD_OUTBOUND_HOSTS` when any lead channel is active;
- preserve per-channel credentials and no top-level `next/cache`;
- strengthen B2 using existing proof files/tests, not a parallel harness.

Acceptance:

- missing each conditional key fails runtime mode and does not break build/migrate;
- one batched authenticated self-call reaches internal route and invalidates;
- no recursion/self-call loop;
- job/HTTP adapter has no top-level `next/cache`;
- no new in-process claim or mode is exposed.

Checks: jobs-config, feed-ingest, health-alerts, security-boundaries, required
integration, merge-risky, build.

Rollback: revert adapter/env changes together.

Stop: self-call requires production-only endpoint; use local controlled HTTP
fixture, never production.

### EPIC-04 — Property numeric DB invariants

```text
Outcome: money is integer minor units and areas satisfy decimal(10,2) semantics
at the database boundary, including manual/Admin writes.
Risk: RISKY schema/migration
Branch: fix/residual-04-property-numeric-invariants
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01
```

Scope:

- preflight fractional/negative invalid existing values;
- add DB constraints/precision for `price_minor`, `price_per_meter_minor`,
  `total_area`, `living_area`, `kitchen_area`;
- one `normalizeAreaM2` path for ingest/manual hooks;
- preserve banker's rounding for derived price per meter;
- extend schema verifier.

Acceptance:

- clean DB migration PASS;
- previous schema + representative valid data preserves values;
- fractional money and >2-decimal/out-of-range area fixtures fail deterministically;
- no silent rounding of historical invalid data;
- Admin/manual/feed paths converge on same invariant.

Checks: schema, feed-ingest, required integration, merge-risky, build.

Rollback/recovery: reversible constraint migration where safe; preflight before
DDL; no destructive normalization.

Stop: invalid baseline rows found — record counts only, do not print PII or
mutate; require a separate data decision if correction is not deterministic.

### EPIC-05 — Dispatcher lifecycle and narrow SQL governance

```text
Outcome: feed-run lifecycle transitions are atomic and conditional through a
supported application/adapter primitive; remaining SQL is minimal and governed.
Risk: RISKY jobs/data
Branch: fix/residual-05-dispatcher-sql
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01
```

First task is version-sensitive investigation on Payload 3.89.0 installed
types/runtime. Decision is predetermined:

- supported atomic conditional affected-result primitive exists → use it;
- not provable → retain only narrow claim SQL, document concrete reason in
  `ADR-INGEST-SYSTEM-SQL.md`, and prove race safety.

Scope:

- conditional queued→running claim;
- running-only heartbeat outside ingest transaction;
- conditional running→terminal transition;
- explicit allowlist for approved ingest/system SQL operations;
- no generic exported query helper;
- guard raw SQL outside whitelist.

Acceptance:

- two contenders produce one winner;
- terminal run cannot restart;
- heartbeat visible to independent reader during controlled long import;
- remaining SQL functions each have named invariant/reason;
- broken-path guard fixture fails.

Checks: jobs-config, feed-lifecycle, operational-recovery, security-boundaries,
required integration, merge-risky, build.

Rollback: preserve last proven claim implementation until replacement passes
concurrency proof; never remove atomicity first.

Stop: installed API semantics ambiguous after official docs/types/runtime test —
use documented narrow SQL fallback, not guessed API.

### EPIC-06 — Bounded ingest and deactivation approval correctness

```text
Outcome: large feeds flow through a bounded parser→normalize→batch→ingest
pipeline; destructive deactivation occurs only after complete safe input and a
valid one-time approval when required.
Risk: RISKY import/data
Branch: fix/residual-06-bounded-ingest
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01
```

Scope:

- replace whole-feed `offers[]` accumulation with bounded awaited batches;
- implement real backpressure, not an unbounded promise queue;
- keep aggregate run counters and issue handling;
- decide deactivation only after EOF/parser complete/no critical anomaly;
- approval requires matching run, `approvedAt`, future `expiresAt`, null
  `consumedAt`; consume uses the same decision timestamp/invariants;
- keep source isolation and first-run baseline rules.

Acceptance:

- synthetic 10k+ feed proves maximum buffered offers never exceeds configured
  internal batch bound;
- truncated/anomalous/interrupted feed produces zero mass deactivation;
- approval without approvedAt, expired, consumed or other-run approval denied;
- Feed A cannot archive Feed B;
- unchanged hash causes zero business rewrites;
- cache invalidation occurs only after committed changes.

Checks: feed-parser, feed-ingest, feed-lifecycle, manual-ownership, required
integration, merge-risky, build.

Rollback: retain previous successful catalog snapshot; batch failure leaves run
failed/interrupted and forbids deactivation.

Stop: repository API cannot provide source-scoped idempotent batches; create an
implementation blocker, do not fall back to whole-feed memory.

### EPIC-07 — Lead access and retention relational contract

```text
Outcome: lead PII follows the project role matrix and delete/anonymize retention
has a consistent relational DB result.
Risk: RISKY PII/schema
Branch: fix/residual-07-lead-retention
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01; CONTRACT on EPIC-02 access matrix
```

Scope:

- enforce the owner/admin/system/public matrix from EPIC-02;
- generic raw REST create remains closed; public intake stays classified route;
- change contradictory FK to observable `lead delete → deliveries delete`,
  preferably `NOT NULL + ON DELETE CASCADE`;
- anonymize retains lead business shell but removes PII and linked diagnostics;
- null retention stays no-op + operational alert;
- prove alert has an operational dispatch/health surface.

Acceptance:

- delete fixture leaves no lead or linked deliveries;
- anonymize fixture leaves no PII/diagnostics and preserves allowed business row;
- public/editor cannot read lead PII or delivery diagnostics;
- owner/admin access matches frozen matrix;
- missing retention policy makes no destructive mutation and emits safe alert.

Checks: lead-intake, lead-outbox, health-alerts, security-boundaries, schema,
required integration, merge-risky, build.

Rollback/recovery: migration proof on previous non-empty fixture; restore from
test snapshot if constraint application fails.

Stop: existing data violates target FK in a non-deterministic way; no silent
deletion.

### EPIC-08 — Lead retry scheduling and terminal states

```text
Outcome: retryable delivery explicitly queues one future Payload job and
permanent/exhausted outcomes end in canonical abandoned state.
Risk: RISKY jobs/PII integration
Branch: fix/residual-08-lead-retry
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-01; serialize after EPIC-07 if generated schema/shared files overlap
```

Scope:

- handler returns only supported output/state;
- retryable result persists pending + `nextAttemptAt`, queues a new
  `deliverLead` with `waitUntil`, then stores new `jobId`;
- enqueue failure leaves recoverable pending row; sweeper requeues only due,
  orphaned rows without a live future job;
- permanent/exhausted → `abandoned`; `failed` reserved for unexpected internal
  terminal state only if retained;
- unknown delivery certainty uses conservative delay and documented duplicate risk.

Acceptance:

- real Payload jobs table contains one future job with correct task/queue/input/
  `waitUntil`;
- task result conforms to installed Payload type;
- enqueue crash window is recovered by sweeper;
- live future job prevents duplicate requeue;
- permanent and exhausted fixtures become abandoned;
- job input contains only stable non-secret delivery ID.

Checks: lead-delivery-state, lead-outbox, adapters, operational-recovery,
required integration, merge-risky, build.

Rollback: preserve pending rows and sweeper recoverability; never mark delivered
without remote evidence.

Stop: pinned Payload queue semantics differ from official/types cross-check;
return to version investigation, no handler metadata workaround.

### EPIC-09 — Aggregate architecture guards

```text
Outcome: corrected boundaries are mechanically regression-tested by one
coherent guard surface with positive and negative fixtures.
Risk: STANDARD
Branch: chore/residual-09-architecture-guards
Delivery: MERGE_AFTER_GATE / STANDARD
Depends on: changed contracts from EPIC-02…08
```

Scope:

- UI/contracts cannot import persistence/framework runtime;
- application Local API calls require explicit access mode;
- raw SQL restricted to approved paths;
- cache graph prohibits top-level `next/cache` outside approved executor;
- consolidate under existing `quality:architecture` / `quality:guards`;
- self-test each critical rule with intentionally broken fixture.

Acceptance: every critical rule has pass + fail fixture; no duplicate guard
systems; legitimate DTO/pure-type imports remain allowed.

Checks: architecture, guards, verify:daily, merge-standard; build only if
package/import graph changed.

Rollback: revert aggregate guard only if it produces a proven false positive;
do not revert underlying architecture fix.

Stop: guard requires parsing it cannot perform reliably — replace with targeted
test and document classification, no regex theater.

### EPIC-10 — UI Core verification gate

```text
Outcome: one `verify:ui-core` matrix classifies every UI Core rule as mechanical,
targeted, visual, manual or N/A and catches current project-authored drift.
Risk: STANDARD
Branch: chore/residual-10-ui-core-gate
Delivery: MERGE_AFTER_GATE / STANDARD
Dependencies: baseline only; independent fallback work if EPIC-01 blocks
```

Scope:

- aggregate existing token/drift/a11y/SEO checks without duplicate runner;
- scan project-authored UI for color/type/weight/radius/motion literals while
  allowing structural geometry and CSS variables;
- representative heading/form association checks;
- report justified client boundaries rather than blanket banning `use client`;
- canonical owner checks for core primitives and `components.json`;
- font loader/CSS mapping check;
- UI proof-report schema.

Acceptance:

- known `rounded-[18px]` and `rounded-[15px]` fixtures are detected;
- `var(--*)`, `%`, `fr`, `auto`, aspect/grid geometry are not false positives;
- broken font mapping and duplicate primitive fixtures fail;
- command is deterministic on clean checkout.

Checks: design-tokens, drift, a11y-starter, seo-contracts, new ui-core,
merge-standard.

Rollback: scanner can be reverted independently; no production UI change.

Stop: rule cannot be mechanized without false positives — classify TARGETED,
VISUAL, MANUAL or N/A instead of weakening silently.

### EPIC-11 — UI drift cleanup and ownership

```text
Outcome: verified UI drift is removed without redesign; package ownership and
peer metadata are explicit; dead donor CSS is outside live package source.
Risk: STANDARD
Branch: fix/residual-11-ui-cleanup
Delivery: MERGE_AFTER_GATE / STANDARD
Depends on: EPIC-10
```

Scope:

- fix full scanner inventory using `REUSE → VARIANT → CREATE`;
- remove dead `home-page.css` from live package source after second import-graph
  proof; preserve donor evidence by exact source SHA/reference, not copied dump;
- split `StarterPages.tsx` by existing home/catalog/property/marketing ownership
  without changing public exports or design;
- retain one Property Card owner and thin app routes;
- review client boundaries and move interactivity to leaves when safe;
- add `react-dom` peer compatible with installed React line;
- keep root exports unless bundle/dependency evidence proves a breaking split useful.

Acceptance:

- `verify:ui-core` passes;
- no known arbitrary design literals remain outside justified allowlist;
- donor CSS has no runtime/package export/import path;
- public API and representative page behavior remain stable;
- frozen install, typecheck, lint and build pass;
- visual matrix 390×844, 768×1024, 1280×900, 1440×1000 for `/`,
  `/nedvizhimost`, representative property detail and `/uslugi` shows no redesign.

Rollback: file moves are behavior-preserving and independently revertible;
visual regression blocks merge.

Stop: baseline route/fixture unavailable; do not claim visual PASS from source.

### EPIC-12 — Source-of-truth sync

```text
Outcome: project docs describe the merged implementation and commands exactly,
without rewriting historical proof or moving normative documents.
Risk: STANDARD docs
Branch: docs/residual-12-source-of-truth
Delivery: MERGE_AFTER_GATE / STANDARD
Depends on: EPIC-02…09 and EPIC-11
```

Scope:

- update architecture folders, access matrix, cache contract, approved SQL,
  numeric invariants, ingest/lead jobs and verification commands;
- fill actual font contract (system stack or loader, weights, CSS variable,
  Cyrillic/license status); do not invent `next/font`;
- update README/AGENTS/backlog/operations links and reading order;
- keep root architecture/Core documents in place;
- historical proof remains immutable; new facts go to final proof;
- evaluate Docker context only as evidence: no runtime packaging rewrite without
  a separate measured trigger.

Acceptance: all links resolve; no doc claims unsupported mode/infra/PASS;
clone-readiness and architecture/docs checks pass.

Checks: clone-readiness, architecture, verify:daily, merge-standard; build only
if packaging/config changes.

Rollback: docs-only revert.

Stop: implementation SHA changes during sync; rebase/re-audit changed scope.

### EPIC-13 — Final Core 5.5 / UI Core 5.0 proof

```text
Outcome: one exact-SHA evidence package proves the completed pre-production
contract and names every unproven or production-only claim honestly.
Risk: RISKY verification
Branch: chore/residual-13-final-proof
Delivery: MERGE_AFTER_GATE / RISKY
Depends on: EPIC-02…12 merged
Production: forbidden
```

Entry:

- fresh clean `main`, exact full SHA recorded;
- all predecessor epics reconciled;
- isolated clean DB and previous-schema fixture available;
- no unreviewed source drift.

Proof matrix:

- Hard Contract: schema owner, access modes, private fields, migrations-only,
  numeric invariants, import safety, jobs ownership, outbound, leads/retention;
- clean DB migrations and previous-data migration;
- required integration with zero skipped suites;
- §18A A/B2/C/D/E/F/G on current SHA;
- published/private/raw REST/PII access matrix;
- UI Core command plus representative manual/visual matrix;
- clone readiness;
- performance measured only if a production-like test contour is available;
  otherwise `NOT PROVEN`, never PASS.

Acceptance:

- все mandatory suites выполнены на exact head SHA без `SKIPPED`;
- clean DB и previous-data migration proofs воспроизводимы;
- §18A и access/UI matrices содержат реальное evidence либо честный `NOT PROVEN`;
- blocker/major findings отсутствуют; production claims отсутствуют;
- итоговый документ, PR head и Gate относятся к одному SHA.

Artifact:

```text
docs/proofs/final-core-5.5-ui-5.0.md
```

Required sections: base SHA, owner deviations, proven, not proven, remaining
P0/P1/P2, migrations, security, import, leads, jobs, cache, UI, accessibility,
SEO, performance, clone readiness, risks.

Final checks: merge-risky, schema, ui-core, build; exact-head gate; after merge
only `verify:daily` on clean main. No deploy/live-production claim.

Rollback: proof epic changes only tests/docs unless a newly found blocker is
returned to its owning epic; no broad fixes hidden in final proof.

Stop: any blocker/major finding reopens owning epic and invalidates final SHA.

## 7. Owner decision register

### Before approval

Open decisions: `0`.

Resolved by existing canon:

- topology: local PostgreSQL + `MEDIA_DIR`;
- cache: HTTP only;
- lead operational roles: owner+admin; destructive owner-only;
- delivery: per-epic `MERGE_AFTER_GATE`;
- production: excluded.

### Later / not blocking this plan

| Decision | Deadline | Current safe behavior |
|---|---|---|
| concrete lead retention days | before client production | null → no destructive mutation + alert |
| archive retention days | before client production | null → no destructive mutation + alert |
| enable real lead channels | before channel rollout | disabled/missing credentials fail closed |
| production release | separate owner command | no deploy |

## 8. Finding register and final audit

| ID | Severity | Finding | Resolution | Status |
|---|---|---|---|---|
| F-01 | BLOCKER | draft identity collides with closed Plan №4 | separate Plan №5 / stable Plan ID | RESOLVED |
| F-02 | BLOCKER | arbitrary EPIC-32…45 numbering | plan-local EPIC-01…13 | RESOLVED |
| F-03 | BLOCKER | strict all-epic serial chain | DAG, waves, task-level blockers | RESOLVED |
| F-04 | MAJOR | lead owner-only claim conflicts with PRD | frozen owner/admin/system/public matrix | RESOLVED |
| F-05 | MAJOR | speculative in-process cache activation | HTTP-only starter contract retained | RESOLVED |
| F-06 | MAJOR | root spec move creates wide reference drift | rejected; docs stay in place | RESOLVED |
| F-07 | MAJOR | RISKY DB suite may skip | EPIC-01 mandatory proof | ACCEPTED |
| F-08 | MAJOR | broad cross-epic shared-file conflicts | owners/sequence recorded | RESOLVED |
| F-09 | MAJOR | final proof could hide implementation fixes | reopen owning epic, exact SHA invalidation | RESOLVED |
| F-10 | QUESTION | Beads database absent before approval | expected; Init only after approval | RESOLVED |

### Audit scorecard

```text
Logic/completeness
  blockers: 0
  major open: 0

Architecture/data/security
  blockers: 0
  accepted implementation findings: 8 backend/runtime + 2 UI/governance groups

Dependency/autonomy
  cycles: 0
  independent first-wave epics: 2
  hard dependencies: minimized to proof/contract boundaries
  single blocking points: none before final proof

Executability/evidence
  epics with outcome/entry/exit: 13/13
  epics with acceptance/verification: 13/13
  rollback/stop conditions: 13/13

Owner decisions
  before approval open: 0
  later production decisions: 4, all fail-closed
```

Four passes:

- Logic / Completeness: PASS;
- Architecture / Data / Security: PASS;
- Dependencies / Autonomy: PASS;
- Executability / Evidence / Delivery: PASS.

## 9. Night Run Readiness

```text
Independent ready waves: EPIC-01 and EPIC-10 first; backend and UI branches
split after their foundations
Critical path: 01 → backend corrections → 09 → 12 → 13
Cycles: 0
Owner decisions remaining before approval: 0
Unknown critical prerequisites: 0
Production-only stops: release/deploy, real channel credentials, retention values
Safe work if DB proof blocks: EPIC-10 → EPIC-11 UI gate and cleanup
Safe work if UI/browser blocks: backend EPIC-01…09
Expected stop conditions: exact contract drift, unsafe DB identity, unavailable
SourceCraft merge gate with no independent ready work, or new owner decision

Result: READY
```

## 10. Revision history

| Version | Status | Date | Input | Result |
|---|---|---|---|---|
| v0 | DRAFT | 2026-09-19 | `AMS_MASTER_PLAN_№4_FINAL.md` | External/owner draft; identity, numbering, dependencies and several claims unresolved |
| v1 | APPROVED | 2026-09-19 | owner request + four-pass audit + `План утвержден` | 13 executable epics; cycles/owner blockers removed; exact snapshot approved for Beads import and Developer handoff |

## 11. Approval boundary

```text
Task Manager import: ALLOWED for exact approved v1
Developer handoff: REQUIRED after CLEAN reconcile
Next: Validate → Init → Import → Reconcile → Developer goal
```

Любой дальнейший смысловой edit approved snapshot создаёт v2 REVIEW, блокирует
текущий graph и требует повторного final audit и owner approval.

# AMS MASTER PLAN №6 — STARTER FINAL FREEZE / CLIENT CLONE READINESS

**Plan ID:** `AMS-REALTBASE-STARTER-FINAL-FREEZE`  
**Version:** `v3`  
**Status:** `APPROVED`  
**Phase:** `APPROVAL_HANDOFF`  
**Approved by:** `owner`  
**Approved at:** `2026-09-21T13:48:30+03:00`  
**Target:** GitHub `neyro-level/ams-realty-baza-starter`  
**Canonical baseline:** GitHub `main@59ff2f8bd3908145ad7eda140d00f2d500dee347`  
**Historical SourceCraft baseline:** `main@59ff2f8bd3908145ad7eda140d00f2d500dee347` — no further writes  
**Canonical delivery surface:** GitHub `main`  
**Repository mode:** `GITHUB_PRIMARY`  
**Core:** `AMS REALTY PLATFORM CORE STANDARD 5.5 — SOLO + AI`  
**UI:** `AMS UI CORE v5.0`  
**Profile:** `AMS_PROFILE=REALTY_BASE`  
**Delivery profile:** `COMMERCIAL`

Version: v3
Status: APPROVED

> Этот документ является новым Plan №6 и продолжает уже закрытую программу Plan №5, в которой были выполнены EPIC-01…13. Эпики нового плана получают собственные номера **EPIC-01…09**. Полная идентичность задачи всегда задаётся парой `Plan ID + Epic ID`, поэтому исторические идентификаторы не конфликтуют.
>
> Перед стартом EPIC-01 обязательно повторно сверить canonical GitHub `main` с baseline. Если `main` изменился после `59ff2f8...`, зафиксировать новый exact SHA и повторно проверить только изменившийся scope до начала реализации. SourceCraft с этого owner decision не получает новых push, PR, Gate, merge или mirror updates.

## 0. Архитектурный статус документа

Вход владельца принят как `v0 DRAFT`. После первого assembly checkpoint
`v1 REVIEW` owner изменил repository policy; `v2 REVIEW` зафиксировал GitHub
primary. Текущая редакция `v3` прошла финальный четырёхпроходный аудит и
утверждена владельцем exact фразой `План утвержден`.

```text
Task Manager import: AUTHORIZED FOR EXACT v3 AFTER VALIDATE
Developer handoff: AUTHORIZED AFTER CLEAN RECONCILE
Production: OUT OF SCOPE
Next gate: GitHub checkpoint → Validate → Init → Import → Reconcile → Developer
```

### MASTER PLAN MAP

```text
Primary goal:
  заморозить starter на проверяемом exact SHA, пригодном для первого client clone

Non-goals:
  production release starter
  live client infrastructure
  dual local/S3 runtime внутри starter
  redesign или новый platform subsystem

Major outcomes:
  canonical folder form
  one env owner
  centralized identity and client-readiness gate
  project-owned lead policy
  module activation manifests
  static Timeweb client blueprint
  one token analyzer with report mode
  clean active docs path and exact-head freeze proof

Shared foundations:
  EPIC-01 GitHub primary delivery contract
  EPIC-02 path contract
  EPIC-03 env contract
  EPIC-06 module manifest contract

Data/schema:
  migration path moves without migration semantic changes

External integrations:
  GitHub repository, Pull Requests and manual exact-head Actions gates
  official Payload and Timeweb documentation
  no real Timeweb credentials required inside this plan

Security-sensitive areas:
  env/secrets, Payload access paths, lead PII, outbound allowlists

Infrastructure/release boundary:
  blueprint and immutable freeze reference only; no rollout
```

### Revision packet MP6-R1

```text
Source: owner plan + repository evidence + official stack documentation
Accepted:
  Plan №6 identity and scoped EPIC-01…08 numbering
  canonical SourceCraft baseline at assembly v1
  structural/env/identity/lead/module/blueprint/token/docs findings
  static blueprint separated from live client proof
Rejected:
  continuation numbering EPIC-14…21 inside the new plan
  duplicated post-merge verification of the same exact SHA
  unsafe claim that token-report is independent from module manifests
Needs owner: none for the next assembly round
Deferred:
  final four-pass audit
  approval, Beads import and Developer handoff
```

### Revision packet MP6-R2

```text
Source: explicit owner decision
Decision:
  GitHub primary
  GitHub PR / merge / freeze tag allowed
  SourceCraft fully excluded from future delivery
  starter production fully excluded
Accepted:
  new repository cutover foundation EPIC-01
  GitHub manual exact-head gates without automatic deploy
  SourceCraft config removal and active-doc cleanup
  existing implementation epics renumbered EPIC-02…09
Rejected:
  local-only unversioned execution
  SourceCraft fallback for Gate or mirror
  any production workflow in Plan №6
Needs owner: none
```

### Revision packet MP6-R3

```text
Source: final four-pass audit of exact v2
Accepted:
  provider-neutral exact-head assertion for GitHub Actions
  explicit GitHub-only approval checkpoint before Beads import
  deterministic stop/recovery matrix for every epic
  final finding register, scorecard and Night Run Readiness
Rejected:
  SourceCraft credential or delivery fallback
  production action as a workaround for static blueprint limitations
Needs owner: none before approval
Result: v3 READY_FOR_OWNER_APPROVAL
```

### Approval checkpoint and handoff boundary

Exact фраза владельца `План утвержден` получена. Architect выполняет только
следующую последовательность для утверждённого `v3`:

```text
mark exact v3 APPROVED
→ create task-owned worktree/branch codex/github-primary-bootstrap
  from verified GitHub main baseline
→ commit approved plan as the docs checkpoint
→ push that branch only to GitHub; no SourceCraft write
→ Validate → Init → Import → Reconcile in local stealth Beads
→ hand off the same registered worktree/branch and APPROVED graph
  to Task Manager Developer
```

Первый checkpoint не merge и не production. Developer продолжает EPIC-01 в
том же stream, добавляет repository-policy/workflow changes и создаёт один
итоговый GitHub PR EPIC-01. Если GitHub push permission не подтверждён, docs
checkpoint, Beads import и handoff не выполняются.

---

# 1. ЦЕЛЬ ПЛАНА

Довести starter не до абстрактного «идеального состояния», а до состояния, в котором его безопасно копировать в первый клиентский Realty-проект без повторного проектирования foundation.

После выполнения плана должно быть доказано:

```text
STARTER
→ каноническая структура Core 5.5
→ один понятный env/config contract
→ starter identity не размазана по runtime
→ clone onboarding однозначно отделяет demo от client production
→ lead retry policy проектно настраивается
→ optional modules имеют activation manifests
→ Timeweb production topology имеет reference blueprint
→ UI token cleanup использует один существующий analyzer
→ historical docs не мешают AI читать active source of truth
→ exact-head final proof
→ FREEZE
→ первый клиентский clone
```

План **не** включает production release starter и **не** превращает demo runtime в клиентский production runtime.

---

# 2. ВЕРИФИЦИРОВАННЫЕ ФАКТЫ НА BASELINE

На `main@59ff2f8bd3908145ad7eda140d00f2d500dee347` подтверждено статическим ревью:

| ID | Finding | Статус |
|---|---|---|
| F-01 | Schema/auth/jobs физически живут в `src/payload/**`, хотя Core 5.5 folder-form задаёт `src/project/**` + root `migrations/` | CONFIRMED |
| F-02 | `src/payload/env.ts` и `src/core/operations/runtime-env.ts` совместно реализуют env contract; semantic validation разделена между двумя владельцами | CONFIRMED |
| F-03 | `CLONE_ONBOARDING.md` говорит, что client clone принимает «собственное topology decision», хотя client production default в Core 5.5 — Timeweb Managed PostgreSQL + Timeweb S3 | CONFIRMED |
| F-04 | Starter identity/SEO имеет hardcoded `AMS Realty Baza Starter` и `https://example.test` в runtime source | CONFIRMED |
| F-05 | `verify:clone-readiness` проверяет snapshot clonability, но не client-production readiness | CONFIRMED |
| F-06 | Retry ladder `[0, 1, 5, 15, 60, 240]`, unknown-timeout backoff и stale sending threshold находятся в `src/core/leads/delivery-state.ts` | CONFIRMED |
| F-07 | `docs/modules/` отсутствует; module activation contract существует только в Core | CONFIRMED |
| F-08 | Client Timeweb S3/Managed PG activation blueprint в репозитории отсутствует | CONFIRMED |
| F-09 | Existing `scripts/quality/design-tokens.mjs` уже определяет DEAD tokens и требует `DEAD=0` | CONFIRMED |
| F-10 | Создавать второй самостоятельный token parser не требуется | CONFIRMED |
| F-11 | Starter intentionally использует local PostgreSQL + persistent `MEDIA_DIR`; это оформлено ADR и не является дефектом demo | CONFIRMED |
| F-12 | `@payloadcms/storage-s3` отсутствует намеренно и не должен становиться обязательной зависимостью demo runtime | CONFIRMED |
| F-13 | Historical master plans и architecture reference остаются в обычном reading path AGENTS/docs | CONFIRMED |
| F-14 | Текущие critical backend subsystems уже имеют risky/integration proof из завершённого EPIC-13; повторная перепись foundation без нового finding не нужна | CONFIRMED |

---

# 3. КОРРЕКЦИИ НЕЗАВИСИМОГО АУДИТА

Следующие предложения независимого аудита **не переносить дословно**.

## 3.1 Не вводить `DEMO_MODE`

Не создавать:

```text
DEMO_MODE=true|false
```

Причина: это второй параллельный признак topology рядом с `AMS_PROFILE`, project canon и snapshot-моделью starter → client. Он создаёт новые комбинации состояний и не нужен для решения задачи.

Demo и client разделяются **на уровне snapshot/project configuration + client readiness gate**, а не переключателем одного runtime.

## 3.2 Не запрещать production-looking `DATABASE_URI` в настоящем client runtime

Проверка имён `prod|production|live` остаётся защитой **test DB tooling**, где она предотвращает случайную мутацию production.

Не применять этот запрет к реальному client `DATABASE_URI`: production database закономерно может иметь такое имя.

## 3.3 Не требовать HTTPS для loopback internal revalidation

`INTERNAL_REVALIDATE_BASE_URL=http://127.0.0.1:<port>` допустим для same-host internal call.

HTTPS обязателен для внешних trust boundaries; loopback self-call не переводить на внешний TLS только ради формального правила.

## 3.4 Не размножать env knobs без runtime-owner

`REVALIDATE_RATE_LIMIT_PER_MINUTE` и `LEAD_RATE_LIMIT_PER_MINUTE` уже существуют как knobs. Их нужно валидировать централизованно.

Не вводить новые rate-limit env-переменные, если фактический runtime их не использует.

## 3.5 Не подключать S3 plugin в live demo starter

Не делать demo runtime двухрежимным только ради будущего клиента.

Запрещено в рамках этого плана:

```text
starter package.json → обязательный @payloadcms/storage-s3
starter payload.config.ts → production S3 runtime branch
starter Media.ts → permanent local/S3 dual-mode complexity
```

Client S3 подключается **при clone activation**. Starter остаётся локальным demo snapshot.

Официальная документация Payload подтверждает `@payloadcms/storage-s3` и conditional `enabled`, но это не означает, что dual-mode plugin обязан жить в demo starter.

## 3.6 Не создавать второй token analyzer

Existing `scripts/quality/design-tokens.mjs` уже:

```text
парсит token definitions
→ находит usages
→ определяет DEAD
→ fail при dead token
```

Нужно расширить его report interface, а не создавать параллельную реализацию с другой семантикой.

## 3.7 Не создавать speculative dedicated-runner service

Client Timeweb blueprint описывает только канонический `REALTY_BASE`:

```text
один application runtime
JOBS_AUTORUN=true
```

Dedicated queue runner появляется только после доказанного §22 trigger и отдельного ADR.

---

# 4. DELIVERY CONTRACT ДЛЯ ВСЕХ ЭПИКОВ

## 4.1 Global Epic Contract

Для каждого EPIC обязательны: observable outcome, Source of Truth, scope in/out,
entry/exit conditions, минимальные dependencies, acceptance, verification,
delivery mode, rollback и stop conditions. Плановые delivery tasks используют
`MERGE_AFTER_GATE` в GitHub; production не входит ни в один EPIC.

Каждый EPIC выполняется как независимый delivery stream:

```text
latest canonical GitHub main
→ новая branch/worktree
→ только scope текущего EPIC
→ implementation
→ relevant checks
→ commit
→ push в GitHub
→ GitHub Pull Request
→ ручной STANDARD или RISKY exact-head GitHub Actions Gate
→ merge в main
→ зафиксировать merge SHA и delivery evidence без повторения уже пройденного Gate
→ удалить epic branch/worktree
→ следующий READY EPIC от нового main
```

Общие правила:

- один EPIC = один PR;
- unrelated cleanup запрещён;
- `merge != production release`;
- production не выполняется этим планом;
- любой изменившийся exact SHA инвалидирует proof текущего EPIC;
- final EPIC не исправляет найденные P0/P1 скрытно — он возвращает finding владельцу соответствующего EPIC;
- GitHub является единственным canonical delivery surface;
- SourceCraft не получает push, PR, Gate, merge или mirror update;
- GitHub Actions не запускаются автоматически на обычный `push` или создание/обновление PR;
- deploy workflows и production environments в рамках этого плана не создаются и не запускаются;
- secrets/PII не появляются в docs, fixtures, logs или commits;
- RISKY EPIC использует `pnpm verify:merge-risky` с isolated `DATABASE_URI_TEST`;
- required integration suites не имеют права silently `SKIP`.
- один и тот же command graph не повторяется до и после merge без нового SHA
  или отдельного доказанного риска;
- локально заблокированный EPIC не останавливает программу, пока существует
  другая независимая READY-работа.

---

# 5. DEPENDENCY GRAPH

```text
EPIC-01  GitHub primary cutover
   │
   └────────────→ EPIC-02  Canonical folder-form
                      │
                      ├────────────→ EPIC-03  Unified env/runtime contract
                      │                  │
                      │                  └────────→ EPIC-04  Project identity + client readiness
                      │                                   │
                      │                                   └────────→ EPIC-07  Timeweb client blueprint
                      │
                      ├────────────→ EPIC-05  Lead delivery project policy
                      │
                      └────────────→ EPIC-06  Module manifests/governance

EPIC-08  Token report / clone UI cleanup
   └── after EPIC-06 module contract; shared docs/guards are serialized

EPIC-01…08
   └────────────→ EPIC-09  Docs cleanup + exact-head final proof + freeze
```

Безопасные execution waves:

```text
WAVE-A: EPIC-01
WAVE-B: EPIC-02
WAVE-C: EPIC-03 + EPIC-06
WAVE-D: EPIC-04 + EPIC-05 + EPIC-08
WAVE-E: EPIC-07
WAVE-F: EPIC-09
```

EPIC-07 начинается после EPIC-04; EPIC-03 уже входит в его транзитивную
dependency chain.

EPIC-09 всегда последний.

## 5.1 Dependency matrix

| Epic | Dependency | Type | Blocking scope | Причина / защита от блокировки |
|---|---|---|---|---|
| EPIC-01 | owner decision + canonical GitHub baseline | OWNER/EXTERNAL resolved | whole epic | GitHub primary подтверждён; bootstrap workflow доказывает cutover без SourceCraft |
| EPIC-02 | EPIC-01 | HARD | whole epic | все новые streams должны идти только через GitHub primary |
| EPIC-03 | EPIC-02 | HARD | whole epic | canonical owner `src/project/env.ts` появляется после path move |
| EPIC-04 | EPIC-03 | CONTRACT | client-readiness tasks | identity использует отдельный `site.config.ts`; env contract должен быть frozen |
| EPIC-05 | EPIC-02 | HARD | path owner | новый jobs path обязателен до изменения policy composition |
| EPIC-05 | EPIC-03 | SOFT | shared `jobs/tasks` integration only | не выполнять конфликтующий integration task параллельно; domain policy/tests можно готовить независимо |
| EPIC-06 | EPIC-02 | HARD | module marker/guard paths | guard должен строиться сразу на canonical `src/project/**` |
| EPIC-07 | EPIC-04 | CONTRACT | blueprint validation | использует frozen client identity/readiness contract; EPIC-03 покрыт транзитивно |
| EPIC-08 | EPIC-06 | CONTRACT | module-reserved integration + shared files | `PROJECT.md`, `DESIGN.md` и quality guards не меняются параллельно |
| EPIC-09 | EPIC-01…08 | HARD | final proof/freeze only | доказывает один итоговый GitHub SHA; implementation эпиков не блокируется им |

Cycles: `0`.

## 5.2 External prerequisites and bypass

| Prerequisite | Preflight | Fallback / stop condition |
|---|---|---|
| GitHub push/PR/Actions permissions | read-only preflight до EPIC-01 | EPIC-01 STOP; SourceCraft fallback запрещён |
| GitHub bootstrap gate | exact branch trigger `codex/github-primary-bootstrap` | если exact-head GitHub run не PASS, cutover PR не merge |
| isolated native PostgreSQL test DB | проверить до первого RISKY Gate | не запускать destructive DB checks без safe `*_test`; продолжить STANDARD/docs scope |
| Payload/Timeweb official docs | проверять exact вопрос перед EPIC-02/07 | при несовместимости вернуть finding в план, не угадывать API |
| visual representative data | проверить перед EPIC-09 UI proof | записать `NOT PROVEN`; freeze блокируется только если это P0/P1 или обязательный acceptance |
| immutable tag permission | проверить перед freeze task | merge evidence сохранить; tag task остановить без production action |

## 5.3 Entry / exit / evidence matrix

| Epic | Entry | Exit | Evidence tier | Delivery / rollback |
|---|---|---|---|---|
| EPIC-01 | GitHub and historical SourceCraft main both at `59ff2f8…` | GitHub primary canon, manual gates available, SourceCraft active delivery removed | exact-head GitHub bootstrap proof | GitHub `MERGE_AFTER_GATE`; revert cutover PR before later work |
| EPIC-02 | exact baseline + Payload `migrationDir` contract verified | один canonical path, migrations unchanged semantically, old live refs = 0 | wired + DB migration proof | `MERGE_AFTER_GATE`; revert path-only commit |
| EPIC-03 | EPIC-02 merged | один env schema owner и deterministic mode matrix | wired runtime/config proof | `MERGE_AFTER_GATE`; revert without changing secrets |
| EPIC-04 | EPIC-03 contract frozen | starter identity centralized, fixture client rejected/accepted deterministically | wired build/SEO/readiness proof | `MERGE_AFTER_GATE`; revert identity/readiness stream |
| EPIC-05 | EPIC-02 merged; EPIC-03 shared-file task serialized | one typed project delivery policy drives state, job and recovery | wired + required DB integration | `MERGE_AFTER_GATE`; revert policy injection while preserving state schema |
| EPIC-06 | EPIC-02 merged | manifests and mechanical activation guard exist without activating modules | contract + guard proof | `MERGE_AFTER_GATE`; revert docs/guard stream |
| EPIC-07 | EPIC-04 merged + fresh official docs | static Timeweb activation blueprint validated; live provider proof remains explicit `NOT PROVEN` | static contract only | `MERGE_AFTER_GATE`; revert blueprint files |
| EPIC-08 | EPIC-06 module contract merged | one analyzer exposes report mode and preserves fail gate | wired CLI + positive/negative fixtures | `MERGE_AFTER_GATE`; revert analyzer/report split |
| EPIC-09 | EPIC-01…08 merged | exact-head proof, P0/P1=0, clean docs path and immutable GitHub freeze ref | exact-head integrated proof | GitHub `MERGE_AFTER_GATE`; do not tag if proof fails |

## 5.4 Deterministic stop / recovery matrix

| Epic | Stop condition | Safe recovery / bypass |
|---|---|---|
| EPIC-01 | GitHub permission, baseline or exact-head bootstrap proof fails | do not import/merge; fix GitHub access or baseline, never fall back to SourceCraft |
| EPIC-02 | migration semantics, generated types or import map change unexpectedly | revert path stream; keep previous canonical main; EPIC-03/05/06 remain blocked |
| EPIC-03 | build-time compatibility or mode matrix cannot be preserved | revert env stream; do not weaken fail-closed rules; EPIC-06 may continue independently |
| EPIC-04 | fixture client can pass with starter identity or invalid topology | do not merge; retain pre-identity main; EPIC-05/06 may continue if ready |
| EPIC-05 | retry/recovery proof diverges or required DB suite skips | do not merge; revert policy injection; EPIC-04/06/08 may continue by DAG |
| EPIC-06 | guard produces false activation or requires a second framework | do not merge; narrow marker contract; EPIC-03/04/05 may continue |
| EPIC-07 | official Payload/Timeweb contract conflicts with blueprint | mark affected claim `NOT PROVEN`, stop blueprint merge and return finding; no live workaround |
| EPIC-08 | report mode changes existing `DEAD=0` fail semantics | revert analyzer refactor; preserve current guard; EPIC-04/05/07 may continue |
| EPIC-09 | exact-head gate, P0/P1, tag permission or mandatory proof fails | no tag and no freeze claim; return finding to owning epic without production action |

---

# EPIC-01 — GITHUB PRIMARY CUTOVER + MANUAL GATE BOOTSTRAP

**Risk:** RISKY repository governance / CI  
**Goal:** сделать GitHub единственным canonical repository и delivery surface,
не используя SourceCraft и не создавая production delivery.

## 1.1 Owner decision

Зафиксировано владельцем:

```text
Repository mode: GITHUB_PRIMARY
GitHub PR / merge / freeze tag: allowed
SourceCraft: no push, PR, Gate, merge or mirror update
Production: fully out of scope
```

Это решение заменяет прежний project-local `SOURCECRAFT_PRIMARY` contract для
всей будущей работы Plan №6. Исторический SourceCraft evidence остаётся
историей и не переписывается как будто delivery происходил в GitHub.

## 1.2 Baseline and preflight

До первой записи подтвердить:

```text
local HEAD = 59ff2f8bd3908145ad7eda140d00f2d500dee347
GitHub main = 59ff2f8bd3908145ad7eda140d00f2d500dee347
historical SourceCraft main = same SHA, read-only fact only
GitHub push / PR / Actions permissions = available
```

Если GitHub `main` изменился, обновить baseline и повторить scope diff. Не
использовать SourceCraft как fallback.

## 1.3 Canonical project policy update

Перевести active canon на GitHub primary:

```text
AGENTS.md
docs/README.md
docs/03_ARCHITECTURE.md
docs/04_BACKLOG.md
docs/05_RELEASE_CHECKLIST.md
docs/OPERATIONS.md
docs/PROJECT.md where applicable
```

Правила:

- прошлые SourceCraft PR/Gate/SHA сохраняются только как historical evidence;
- будущие branch/PR/merge/tag принадлежат GitHub;
- GitHub не называется mirror;
- production sections явно помечаются `OUT OF SCOPE FOR PLAN №6` и не
  превращаются в workflow;
- `DELIVERY_PROFILE=COMMERCIAL` сохраняется.

## 1.4 CI policy migration

Удалить active SourceCraft-only delivery configuration:

```text
.sourcecraft/ci.yaml
```

SourceCraft-specific mechanical guard заменить GitHub-owned policy guard без
ослабления zero-CI и exact-head invariants.

Provider-specific exact-head assertion также заменить:

```text
scripts/ci/assert-exact-head.mjs
  EXPECTED_COMMIT_SHA = requested full SHA
  CI_COMMIT_SHA = GitHub GITHUB_SHA
  git rev-parse HEAD = checked-out SHA
  all three values must be equal full SHAs

scripts/quality/sourcecraft-policy.mjs
  → scripts/quality/github-actions-policy.mjs

package.json quality:guards
  → references only the GitHub policy guard
```

После migration active code/config не требует `SOURCECRAFT_COMMIT_SHA` и не
читает `.sourcecraft/ci.yaml`. Historical documentation может сохранять слово
SourceCraft только как явно обозначенное прошлое evidence.

Создать один project-owned GitHub Actions contract:

```text
.github/workflows/manual-gate.yml
```

После bootstrap он имеет только ручной `workflow_dispatch` и inputs:

```text
expected_commit_sha
gate = standard | risky
```

Обычные `push`, `pull_request` и `schedule` не запускают validation. Deploy,
publish и production jobs отсутствуют.

### One-time bootstrap trigger

Поскольку manual workflow ещё отсутствует в default branch, EPIC-01 использует
ровно один временный branch-specific trigger:

```text
push:
  branches:
    - codex/github-primary-bootstrap
```

Он запускает RISKY gate только для bootstrap branch, проверяет exact
`GITHUB_SHA` через provider-neutral assertion и не выполняет deploy. После merge branch удаляется; trigger
остаётся ограниченным этим зарезервированным именем и становится недостижимым
для обычной разработки. Project policy запрещает повторно создавать этот
branch после EPIC-01.

## 1.5 GitHub delivery sequence

```text
GitHub main@baseline
→ branch codex/github-primary-bootstrap
→ project canon + CI policy migration
→ push only to GitHub
→ one-time exact-head GitHub RISKY run
→ GitHub Pull Request
→ verify PR head = proven SHA
→ merge without force
→ confirm GitHub main merge SHA
→ remove SourceCraft from active local remote workflow
→ delete bootstrap branch safely
```

Новые clones получают `origin=GitHub`. Текущий checkout после подтверждённого
merge также переводит `origin` на GitHub; SourceCraft remote удаляется из
active local configuration, а не сохраняется как write fallback.

## 1.6 Acceptance

```text
GitHub is the only active primary in canonical docs
GitHub main and PR head SHAs are recorded
manual STANDARD/RISKY exact-head gate is available from main
ordinary push/PR does not auto-run CI
no deploy/production workflow exists
.sourcecraft/ci.yaml is absent
active quality guards do not require SourceCraft
active exact-head assertion does not require SOURCECRAFT_COMMIT_SHA
SourceCraft received no new write during cutover
```

Checks:

```bash
pnpm quality:guards
pnpm verify:daily
pnpm verify:merge-risky
```

Final CI evidence for EPIC-01 must come from the one-time GitHub bootstrap run
on the exact PR head SHA.

## 1.7 Stop conditions

STOP и не merge, если:

```text
GitHub permissions are insufficient
bootstrap workflow runs on ordinary branches
workflow contains deploy/publish/production action
exact GITHUB_SHA cannot be proven
project canon still names SourceCraft as active primary
cutover requires any new SourceCraft write
```

## 1.8 Rollback

До merge — закрыть GitHub PR и удалить bootstrap branch. После merge — revert
cutover только через новый GitHub PR; SourceCraft не синхронизировать назад и
не использовать как rollback repository.

---

# EPIC-02 — CANONICAL FOLDER-FORM ALIGNMENT

**Risk:** RISKY  
**Depends on:** EPIC-01  
**Goal:** убрать structural deviation от Core 5.5 до тиражирования starter.

## 2.1 Target structure

Целевое состояние:

```text
src/
  core/
    access/
    data-access/
    ...
  project/
    collections/
    access/          # только если реально есть project-specific predicates
    jobs/
    project.config.ts
    env.ts
    payload-types.ts

migrations/

payload.config.ts
```

`payload.config.ts` остаётся root config entry point.

## 2.2 Move set

Выполнить через `git mv`, где файл не generated:

```text
src/payload/collections/**   → src/project/collections/**
src/payload/jobs/**          → src/project/jobs/**
src/payload/env.ts           → src/project/env.ts
src/payload/migrations/**    → migrations/
```

`src/payload/access/roles.ts`:

```text
generic role/access predicates
→ src/core/access/roles.ts
```

Если при ревью обнаружится predicate, действительно завязанный на конкретную collection/project business rule:

```text
→ src/project/access/**
```

Public Gateway access mode остаётся в своей data-access boundary и не переносится механически ради структуры.

## 2.3 Generated types

`src/payload/payload-types.ts` не переносить как обычный source.

Порядок:

```text
1. изменить types output в payload.config.ts
2. удалить old generated artifact
3. pnpm payload:generate:types
4. получить src/project/payload-types.ts
5. обновить imports
```

## 2.4 Migrations

Перенести committed migration chain в:

```text
/migrations
```

`migrationDir` задать явно относительно `payload.config.ts`.

Version-sensitive implementation сначала сверить с pinned Payload `3.89.0` и установленным package API.

Официальный Payload contract допускает custom `migrationDir`; root `/migrations` поддерживается как common migration location.

Не менять semantics существующих migrations.

## 2.5 Mandatory path inventory

Обновить все реальные references:

```text
payload.config.ts
scripts/**
tests / integration scripts
dependency-cruiser config
architecture guards
schema verification
GitHub workflows и active CI/policy guards при наличии hardcoded paths
docs/03_ARCHITECTURE.md
docs/PROJECT.md
docs/OPERATIONS.md
AGENTS.md
proof scripts
generated import map references, если есть
```

Обязательный grep:

```text
src/payload/
src/payload
payload-types
migrationDir
```

После migration path move старых live references быть не должно, кроме historical/legacy evidence.

## 2.6 Import map

После перемещения:

```bash
pnpm payload:generate:importmap
```

Если generated import map изменился — проверить diff и committed policy.

## 2.7 Architecture guards

Mechanical guards должны проверять новую структуру, а не old paths.

Обязательно сохранить:

```text
UI -X→ Payload/DB/project persistence
overrideAccess:true only System Gateway
raw SQL only approved paths
Local API explicit access mode
schema migrations only
```

## 2.8 Acceptance

```bash
pnpm payload:generate:types
pnpm payload:generate:importmap
pnpm quality:architecture
pnpm quality:guards
pnpm verify:schema
pnpm typecheck
pnpm lint
pnpm verify:daily
pnpm verify:merge-risky
```

RISKY DB proof:

```text
clean DB
→ all moved migrations apply
→ schema verification PASS
→ required integration zero skipped
→ jobs registry imports correctly
```

## 2.9 Stop conditions

STOP и не merge, если:

```text
migration ordering изменился
generated schema diff неожиданно изменил DB
old/new migration folders читаются одновременно
Payload CLI создаёт новую migration не в canonical folder
architecture guard был ослаблен ради green
```

## 2.10 Rollback

Path-only move должен откатываться одним EPIC revert без data migration.

---

# EPIC-03 — UNIFIED ENV / RUNTIME CONFIG CONTRACT

**Risk:** RISKY  
**Depends on:** EPIC-02  
**Goal:** один понятный source of truth для env parsing + mode-aware fail-closed runtime validation.

## 3.1 Current problem

Сейчас semantics разделены:

```text
src/project/env.ts (после EPIC-02)
+
src/core/operations/runtime-env.ts
+
несколько прямых process.env reads
```

Это допустимо функционально, но плохо для клонируемого starter: новый env knob легко добавить только в одну половину.

## 3.2 Target design

Один schema owner:

```text
src/project/env.ts
```

Он предоставляет:

```text
parseProjectEnv(rawEnv, mode)
runtimeEnv
```

Mode:

```text
build
development
migrate
runtime
test
```

`src/core/operations/runtime-env.ts` либо:

```text
A. становится thin mode detector
```

либо:

```text
B. удаляется после переноса mode policy в project/env.ts
```

Не оставлять два независимых списка required keys.

## 3.3 Preserve build behavior

`next build` не требует real production secrets.

Build-only fallbacks допустимы только для compile/import phase и не имеют права сделать runtime «готовым».

Runtime instrumentation должен fail-fast до обслуживания production traffic.

## 3.4 Conditional validation

Обязательные rules для текущего starter:

### Cache

Если:

```text
CACHE_INVALIDATION_MODE=http
```

то runtime требует:

```text
REVALIDATE_SECRET
INTERNAL_REVALIDATE_BASE_URL
```

`INTERNAL_REVALIDATE_BASE_URL`:

```text
http://127.0.0.1 / localhost → допустим same-host internal call
https://... → допустим
arbitrary external http:// → reject
```

### Lead channels

Если `LEAD_CHANNELS` пуст:

```text
delivery channels = none
```

Если непуст:

```text
только known channel IDs
LEAD_OUTBOUND_HOSTS non-empty
required credentials конкретного channel
```

`max`:

```text
MAX_BOT_TOKEN
MAX_CHAT_ID
MAX_API_URL if adapter actually requires configurable URL
```

`custom-webhook`:

```text
CUSTOM_WEBHOOK_URL valid HTTPS
CUSTOM_WEBHOOK_HMAC_SECRET
```

Unknown channel → startup/config validation failure, а не silent skip.

### Rate limit knobs

Уже существующие:

```text
REVALIDATE_RATE_LIMIT_PER_MINUTE
LEAD_RATE_LIMIT_PER_MINUTE
```

добавить в typed env schema как positive integer.

Сохранить current documented defaults, если knob пуст.

Не создавать новые rate-limit env keys.

### Payload

Runtime/migrate:

```text
DATABASE_URI
PAYLOAD_SECRET
```

Production runtime:

```text
PAYLOAD_DB_PUSH=true → fail
```

### Retention

Не создавать `DEMO_MODE`.

Retention policy остаётся project/business decision:

```text
projectConfig.leadRetentionDays
projectConfig.archiveRetentionDays
```

Если public lead intake выпускается в client production без approved lead retention → client readiness/release gate FAIL.

Starter demo может сохранять `null` fail-closed behavior.

## 3.5 Eliminate direct env drift

Inventory всех:

```text
process.env.*
```

Классифицировать:

```text
PROJECT RUNTIME CONFIG
TEST-ONLY
NEXT BUILD PHASE
library-required unavoidable
```

Project runtime knobs по возможности читаются через canonical parsed env.

Не делать mechanical rewrite там, где Next build-time access действительно нужен; документировать исключение.

## 3.6 Env matrix tests

Добавить один canonical test surface:

```text
scripts/verify-env-contract.mjs
```

или встроить в существующий `verify:security-boundaries`, но не дублировать assertions в двух файлах.

Minimum matrix:

```text
build без secrets → PASS
migrate без DB → FAIL
runtime без site URL → FAIL
runtime PAYLOAD_DB_PUSH=true → FAIL
http cache без REVALIDATE_SECRET → FAIL
http cache с loopback base URL → PASS
external plain HTTP revalidation URL → FAIL
unknown LEAD_CHANNELS → FAIL
max без credential → FAIL
custom-webhook без HMAC → FAIL
invalid rate-limit integer → FAIL
empty channels → PASS
```

## 3.7 Acceptance

```bash
pnpm verify:security-boundaries
pnpm verify:health-alerts
pnpm verify:jobs-config
pnpm verify:lead-intake
pnpm verify:lead-delivery-state
pnpm typecheck
pnpm lint
pnpm verify:merge-risky
```

## 3.8 Stop conditions

STOP, если:

```text
next build внезапно требует production secrets
loopback internal cache self-call становится невозможен
test-only env начинает влиять на production parsing
две independent required-key matrices остаются после refactor
```

---

# EPIC-04 — PROJECT IDENTITY + CLIENT READINESS GATE

**Risk:** STANDARD  
**Depends on:** EPIC-03  
**Goal:** исключить копирование starter identity/SEO/demo topology в клиентский проект.

## 4.1 Centralize project identity

Создать отдельный project-local owner:

```text
src/project/site.config.ts
```

`project.config.ts` сохраняет operational/domain knobs. Такое разделение снимает
shared-file conflict с EPIC-05 и не смешивает site identity с lead/import/jobs
policy.

Minimum non-secret identity:

```ts
{
  brandName,
  defaultTitle,
  defaultDescription,
  locale,
  currency,
  projectKind: "starter-demo" | "client"
}
```

Не хранить secret/credential values.

Production/staging URL остаётся environment/runtime value:

```text
NEXT_PUBLIC_SERVER_URL
```

## 4.2 Remove runtime hardcodes

Убрать runtime ownership из:

```text
src/app/layout.tsx
src/core/seo/site.ts
structured data
default metadata helpers
```

Не должно быть самостоятельных runtime constants:

```text
"AMS Realty Baza Starter"
"https://example.test"
```

Допустимый placeholder `example.test` может существовать в tests/fixtures/build proof, но не как silent client runtime default.

## 4.3 Client readiness command

Текущий:

```bash
pnpm verify:clone-readiness
```

переименовывать не обязательно — он остаётся проверкой **snapshot clonability**.

Добавить:

```bash
pnpm verify:client-readiness
```

Назначение: запускать уже в client clone перед staging/release.

## 4.4 Client readiness rules

Для `projectKind=client` FAIL, если обнаружено:

```text
starter brand identity
example.test runtime fallback
start-baza.ams24.ru в client runtime/deploy config
local MEDIA_DIR как client production media source of truth
starter demo nginx/compose как client production target
lead/archive retention unset перед production release
placeholder legal TODO в active public legal content
production noindex не имеет explicit project decision
missing client domain
missing required host allowlists
missing client storage/deployment contract
```

Не сканировать исторические docs/tests как runtime defect.

Guard должен понимать approved paths:

```text
docs/legacy/**
tests/**
fixtures/**
proof historical evidence
```

## 4.5 Clone checklist

`CLONE_ONBOARDING.md` должен явно разделить:

```text
A. starter demo
B. client development
C. client Timeweb staging
D. client Timeweb production
```

Client production baseline:

```text
Timeweb VPS / approved runtime
Timeweb Managed PostgreSQL
Timeweb S3-compatible Object Storage
manual Payload media → S3
feed images → external URLs unless explicit project decision
one jobs-active runtime
Nginx
automatic backup
external monitoring
```

Формулировку:

```text
client clone принимает собственное topology decision
```

заменить на:

```text
client production default follows Core 5.5:
Timeweb Managed PostgreSQL + Timeweb S3.
Deviation requires explicit owner decision + ADR where Core requires it.
```

## 4.6 `verify:clone-readiness`

Усилить existing test:

```text
starter snapshot remains cloneable
src/core unchanged by project identity edit
packages unchanged by simple identity edit
src/project changes expected
docs/PROJECT.md changes expected
```

Добавить negative fixture: clone с не заменённым starter identity должен быть rejected `verify:client-readiness`.

## 4.7 Acceptance

```bash
pnpm verify:clone-readiness
pnpm verify:client-readiness --mode=fixture-client
pnpm verify:seo-contracts
pnpm verify:ui-core
pnpm typecheck
pnpm lint
pnpm verify:merge-standard
```

---

# EPIC-05 — CONFIG-DRIVEN LEAD DELIVERY POLICY

**Risk:** RISKY  
**Depends on:** EPIC-02  
**Goal:** вынести project-tunable delivery policy из core hardcodes без создания speculative routing engine.

## 5.1 Move project policy

Из:

```text
src/core/leads/delivery-state.ts
```

в project config должны перейти только реально project-tunable values.

Добавить:

```ts
leadDelivery: {
  retryScheduleMinutes: [0, 1, 5, 15, 60, 240],
  unknownDeliveryBackoffMinutes: 60,
  staleSendingThresholdMinutes: 15,
  maxAttemptLogEntries: 20,
  routingMode: "all-enabled",
}
```

Не создавать сейчас:

```text
routing by property type
routing by source
routing DSL
per-client expression engine
```

пока нет реального client trigger.

## 5.2 Core remains behavior owner

`src/core/leads/delivery-state.ts` продолжает владеть:

```text
state machine
claim semantics
attempt transition
retry calculation algorithm
abandoned rules
redacted log behavior
```

Core принимает policy как argument/dependency, а не импортирует client business data скрыто.

Допустим import `projectConfig` только в project/application composition layer; pure core function предпочтительно получает typed policy.

## 5.3 Config validation

Проверять:

```text
retry schedule non-empty
first delay = 0
all values integer >= 0
schedule non-decreasing
max attempts = schedule length
unknown timeout delay >= normal immediate retry floor
stale threshold > 0
attempt log cap bounded
routingMode known enum
```

Не дублировать maxAttempts отдельным independent value, если он однозначно выводится из ladder length.

## 5.4 Recovery consistency

Сейчас:

```text
recoverStaleSendingDelivery()
```

и job sweeper используют разные threshold sources.

После EPIC:

```text
одна project policy
→ state helper
→ recoverLeadDeliveries
→ tests
```

При этом orphan pending threshold Core 5.5:

```text
max(5 min, 2 × maintenanceIntervalMinutes)
```

оставить derived formula, не заменять ещё одним arbitrary knob.

## 5.5 Channel capability contract

Capability/idempotency не хранить как свободно редактируемый project config.

Adapter owner фиксирует:

```text
native idempotency known/proven
external lookup capability
HMAC/idempotency header behavior
unknown delivery certainty
```

`PROJECT.md` документирует residual risk фактически активных channels.

## 5.6 Routing

Current default:

```text
все enabled channels получают lead
```

зафиксировать как project policy.

Если будущий client требует selective routing — отдельная project task без изменения базового starter до появления trigger.

## 5.7 Verification

Расширить:

```text
verify:lead-outbox
verify:lead-delivery-state
verify:operational-recovery
verify:max-adapter
verify:custom-webhook-adapter
required integration
```

Targeted proof:

```text
изменён test policy ladder
→ handler рассчитывает новый nextAttemptAt
→ waitUntil получает то же значение
→ recovery не создаёт duplicate live job
```

## 5.8 Acceptance

```bash
pnpm verify:lead-outbox
pnpm verify:lead-delivery-state
pnpm verify:operational-recovery
pnpm verify:max-adapter
pnpm verify:custom-webhook-adapter
pnpm verify:integration:required
pnpm verify:merge-risky
```

Повторить Core §18A-G.

---

# EPIC-06 — MODULE MANIFESTS + ACTIVATION GOVERNANCE

**Risk:** STANDARD  
**Depends on:** EPIC-02  
**Goal:** module activation из Core §22A превратить в механический project workflow.

## 6.1 Create directory

```text
docs/modules/
  README.md
  novostroyki.md
  journal.md
  agents.md
```

## 6.2 Common manifest schema

Каждый manifest содержит:

```text
Status
Prerequisites
Enabled flag owner
Reserved URLs
Collections to add
Migration contract
Backfill contract
Gateway/DTO additions
Feed identity requirements
Cache targets
UI composition
SEO contract
Verification
Non-goals
Trigger to REALTY_EXTENDED
Rollback/deactivation notes
```

## 6.3 `README.md`

Canonical activation:

```text
owner enables module in PROJECT.md
→ expand migration
→ backfill only if actually required
→ verify schema/data
→ gateway + DTO activation
→ cache registry update
→ activate reserved URL namespace
→ UI activation
→ PROJECT.md final sync
→ targeted proof
```

Модуль не имеет права сам:

```text
добавлять Redis/broker/search
создавать второй backend
менять auth model
переводить REALTY_BASE в EXTENDED без §22 trigger
```

## 6.4 Novostroyki manifest

Document only:

```text
residential-complexes
buildings
layouts
developers
```

Prerequisites:

```text
market
externalComplexId
externalComplexName
externalBuildingId
externalLayoutId where source provides it
layout != unit
```

Mapping/disambiguation:

```text
source identity first
fallback grouping may use complex/building + rooms + area + source-specific attributes
ambiguity → needsReview
no auto-merge by area alone
```

## 6.5 Journal manifest

Document:

```text
posts collection
reserved /journal/*
existing frozen journal DTO contract
pagination
Article structured data
canonical/OG
sitemap
related materials
cache targets
RSS optional
```

Не создавать `posts` заранее.

## 6.6 Agents manifest

Document:

```text
agents collection
agent pages
required relationships only when real product journey proves them
```

Не pre-create `properties.assignedAgent` только потому, что manifest существует. Relation shape определяется activation task.

## 6.7 Module governance guard

Добавить один mechanical guard в существующий quality system.

Contract:

```text
если active runtime imports path project/modules/<module>
или module collection/route marker существует
→ docs/PROJECT.md обязан содержать enabled module
→ corresponding docs/modules/<module>.md exists
```

Не создавать отдельный framework.

## 6.8 Acceptance

```bash
pnpm quality:guards
pnpm quality:architecture
pnpm verify:daily
pnpm verify:merge-standard
```

Negative fixture:

```text
module source marker exists
PROJECT module disabled
→ FAIL
```

---

# EPIC-07 — TIMEWEB CLIENT PRODUCTION BLUEPRINT

**Risk:** RISKY architecture/reference  
**Depends on:** EPIC-04 (`EPIC-03` транзитивно)  
**Goal:** сделать первый client activation повторяемым, не превращая demo starter в dual-runtime system.

## 7.1 Boundary

Live starter остаётся:

```text
local PostgreSQL
MEDIA_DIR
no @payloadcms/storage-s3 runtime dependency
```

Создать reference blueprint:

```text
deploy/clients/timeweb/
```

Blueprint — вход для clone activation, не runtime dependency starter.

## 7.2 Required layout

```text
deploy/clients/timeweb/
  README.md
  env.client.example
  payload/
    s3-plugin.example.ts
    activation.patch.md
  compose/
    client.compose.yml.example
  nginx/
    site.conf.example
  backup/
    README.md
  monitoring/
    README.md
  proofs/
    CLIENT_TIMEWEB_PROOF.md
```

Не хранить реальные credentials.

## 7.3 Managed PostgreSQL

Blueprint фиксирует:

```text
Timeweb Managed PostgreSQL
DATABASE_URI from Secret Master
migrations only
PAYLOAD_DB_PUSH=false
separate staging DB
backup schedule enabled
restore drill before production
```

Не хардкодить конкретный host/cluster ID.

## 7.4 S3

Client activation устанавливает version-compatible:

```text
@payloadcms/storage-s3
```

Exact version сверяется с pinned Payload version до изменения lockfile.

Official Payload contract:

```text
S3 plugin
collections.media
bucket
AWS S3ClientConfig
endpoint supported through S3 client config
disableLocalStorage automatically while adapter enabled
```

Timeweb предоставляет S3-compatible API, Access Key/Secret Key и endpoint из панели.

Не угадывать:

```text
region
forcePathStyle
public URL
ACL mode
signed URL policy
```

Эти параметры берутся из актуальной Timeweb документации/панели и доказываются targeted staging upload.

## 7.5 Client activation approach

В clone:

```text
1. install storage adapter
2. apply reviewed payload config patch
3. add S3 env schema
4. switch manual Payload media to S3
5. remove client production dependence on MEDIA_DIR
6. preserve external feed image policy
```

Не делать permanent local/S3 dual mode в starter source.

## 7.6 Client compose / artifact

Client blueprint использует **immutable application artifact/image**.

Не задавать production workflow:

```text
git pull on server
pnpm build on server
```

Client compose example принимает:

```text
IMAGE=<registry/image@digest or immutable tag>
JOBS_AUTORUN=true
NODE_ENV=production
env_file=/approved/path
```

Один service является jobs owner.

Rollout сохраняет:

```text
old runtime JOBS_AUTORUN=true
new runtime JOBS_AUTORUN=false
→ readiness/live proof
→ old runtime stop
→ confirmed no active owner
→ new runtime restart JOBS_AUTORUN=true
→ jobs health proof
```

## 7.7 Nginx template

Template должен иметь placeholders, а не demo domain.

Minimum:

```text
HTTPS
exact server_name
proxy headers
login/leads/internal route rate limits
HSTS
nosniff
Referrer-Policy
frame protection
request body limits where applicable
admin access policy placeholder
```

Не копировать local `/media/` alias в S3 client production.

## 7.8 Backup

Timeweb Managed PostgreSQL:

```text
provider physical backup schedule
documented retention
restore procedure
optional additional logical export according to project policy
```

S3:

```text
versioning/lifecycle policy decided
restore/recovery procedure
```

Не писать фиктивный `pg_dump_to_s3.sh`, если он не будет реально использоваться и проверяться. Blueprint описывает только выбранный operational path.

## 7.9 Monitoring

Blueprint должен требовать:

```text
external uptime monitoring
DB/feed/jobs health
backup status
lead-delivery backlog
critical integration alert channel
```

Конкретный provider может быть выбран в client project.

## 7.10 Timeweb proof status

Starter может содержать blueprint без client credentials.

Поэтому final starter proof различает:

```text
BLUEPRINT STATIC CONTRACT → PROVEN
REAL TIMEWEB S3 UPLOAD → NOT PROVEN until first client staging
REAL MANAGED PG MIGRATION → NOT PROVEN until first client staging
RESTORE DRILL → NOT PROVEN until first client staging
```

Нельзя назвать Timeweb production topology «проверенной» только по static files.

## 7.11 First client mandatory proof

Перед первым client production:

```text
Managed PG connection
clean migrations
S3 Payload Admin upload
media public/private behavior per project policy
no local MEDIA_DIR dependency
backup configured
restore drill on staging
§18A required proofs
one jobs owner
live smoke
```

Результат после первого успешного client proof можно вернуть в starter blueprint отдельным improvement PR.

## 7.12 Acceptance для starter EPIC

```bash
pnpm verify:client-readiness --mode=fixture-client
pnpm quality:guards
pnpm verify:daily
pnpm verify:merge-risky
```

Static blueprint validation:

```text
no secret values
no demo domain
no local media alias in client production nginx
no second jobs owner
immutable artifact contract
Managed PG required
S3 required
```

---

# EPIC-08 — TOKEN REPORT MODE + CLONE UI CLEANUP WORKFLOW

**Risk:** STANDARD  
**Depends on:** EPIC-06 module manifest contract  
**Goal:** помочь client clone быстро очистить donor/project tokens без второго analyzer.

## 8.1 Refactor existing analyzer

Не создавать:

```text
scripts/quality/token-inventory.mjs
```

как отдельную реализацию.

Вместо этого выделить reusable analysis из:

```text
scripts/quality/design-tokens.mjs
```

например:

```text
scripts/quality/design-token-analyzer.mjs
scripts/quality/design-tokens.mjs
```

Первый возвращает structured inventory, второй остаётся fail gate.

## 8.2 New report command

Добавить:

```bash
pnpm tokens:report
```

Options:

```text
--format=table
--format=json
--dead-only
--explain=<token>
```

Output:

```text
CORE
SHADCN
PROJECT ACTIVE
MODULE-RESERVED
DEAD
usage locations
```

## 8.3 No automatic destructive prune

Не делать interactive auto-delete command частью канона.

Причина:

```text
token может использоваться dynamic/indirect path
clone cleanup должен иметь review diff
solo + AI лучше удалить verified dead set обычным patch
```

Workflow:

```text
pnpm tokens:report --dead-only
→ review
→ удалить verified dead tokens
→ pnpm quality:design-tokens
→ pnpm verify:drift
→ visual representative page check
```

## 8.4 Module reserved integration

`MODULE-RESERVED` считается допустимым только если:

```text
docs/modules/<module>.md exists
PROJECT.md module state documented
DESIGN.md explicitly names reserved token family
```

Иначе unused token = DEAD.

## 8.5 Clone onboarding

После Design Intake нового клиента:

```text
удалить unused starter views
→ tokens:report
→ remove verified dead tokens
→ representative page
→ verify:ui-core
→ drift audit
→ масштабировать страницы
```

Не удалять весь Atlas-derived vocabulary механически до появления нового Design System.

## 8.6 Acceptance

Current starter:

```text
DEAD = 0
```

Negative fixture:

```text
добавить temporary unused project token
→ report marks DEAD
→ quality:design-tokens FAIL
```

Positive fixture:

```text
token documented MODULE-RESERVED with active manifest contract
→ not DEAD
```

Checks:

```bash
pnpm tokens:report
pnpm quality:design-tokens
pnpm verify:drift
pnpm verify:ui-core
pnpm verify:merge-standard
```

---

# EPIC-09 — DOCUMENTATION CLEANUP + FINAL EXACT-HEAD PROOF + STARTER FREEZE

**Risk:** RISKY verification  
**Depends on:** EPIC-01…08 merged  
**Goal:** оставить AI один ясный active reading path и заморозить starter перед первым client clone.

## 9.1 Historical plan cleanup

Создать:

```text
docs/legacy/
```

Переместить исторические execution plans, которые больше не являются active scope:

```text
AMS_MASTER_PLAN №2.md
AMS_MASTER_PLAN №3.md
AMS_MASTER_PLAN №4.md
старый закрытый AMS_MASTER_PLAN №5.md / residual-align snapshot
historical orchestration inventories, если они нужны только evidence
```

Не удалять proof history.

Текущий этот план после завершения переводится в historical только отдельным final docs commit после фиксации completion status.

## 9.2 Architecture reference

`AMS_PROJECT_ARCHITECTURE_v1.0.md`:

```text
если документ полностью historical
→ docs/legacy/architecture/
```

Если какой-либо active guard/doc ещё использует его как normative source:

```text
оставить до устранения зависимости
```

Не перемещать механически ради красоты.

## 9.3 Research

`docs/research/ATLAS_BASELINE.md`:

```text
reference provenance
```

может остаться в `docs/research`, но должен быть явно помечен:

```text
REFERENCE / NOT NORMATIVE / NOT CLONE ONBOARDING
```

Не нужно переносить, если path уже стабилен и не мешает reading order.

## 9.4 Active reading order

`AGENTS.md`:

```text
1. docs/README.md
2. Core 5.5 relevant section
3. docs/PROJECT.md
4. docs/03_ARCHITECTURE.md
5. docs/DESIGN.md / OPERATIONS.md by scope
6. docs/04_BACKLOG.md
7. module manifest when module scope active
8. legacy only for historical evidence
```

Не отправлять AI в old master plan для обычной implementation-задачи.

## 9.5 Final CLONE_ONBOARDING

### First clone session

```text
[ ] copy approved starter snapshot from frozen SHA/tag
[ ] rename package/project identity
[ ] projectKind=client
[ ] set client brand metadata
[ ] set client domain
[ ] configure client PROJECT.md
[ ] set retention decisions
[ ] configure allowlists
[ ] select enabled lead channels
[ ] keep secrets only in Secret Master
[ ] pnpm install --frozen-lockfile where lock unchanged
[ ] pnpm verify:daily
[ ] pnpm verify:client-readiness
```

### Before Timeweb staging

```text
[ ] apply deploy/clients/timeweb activation
[ ] install pinned S3 adapter in client clone
[ ] configure Timeweb Managed PostgreSQL
[ ] configure Timeweb S3
[ ] remove client production MEDIA_DIR dependency
[ ] run clean migrations
[ ] configure one jobs owner
[ ] configure monitoring/backup
[ ] client readiness PASS
```

### Before first real feed

```text
[ ] parser selected
[ ] feed host approved
[ ] EXTERNAL_IMAGE_HOSTS exact
[ ] refresh interval approved
[ ] safetyThresholdPercent approved
[ ] maxDeactivationsPerRun approved
[ ] first full staging import establishes baseline
[ ] no mass deactivation on first run
[ ] truncated/suspicious proof remains green
```

### Before client production

```text
[ ] staging required risky proofs
[ ] real S3 upload proof
[ ] Managed PG migration proof
[ ] restore drill
[ ] lead intake with PII retention policy
[ ] live selected delivery channels
[ ] one jobs owner proof
[ ] URL schema frozen
[ ] noindex decision switched intentionally
[ ] performance baseline measured
[ ] immutable artifact exact SHA
[ ] rollback point known
```

## 9.6 Final drift audit

Run on clean exact head:

```bash
pnpm contracts:test
pnpm contracts:check
pnpm quality:architecture
pnpm quality:guards
pnpm quality:design-tokens
pnpm tokens:report
pnpm verify:clone-readiness
pnpm verify:client-readiness --mode=fixture-client
pnpm verify:ui-core
pnpm verify:security-boundaries
pnpm verify:jobs-config
pnpm verify:feed-parser
pnpm verify:feed-ingest
pnpm verify:feed-lifecycle
pnpm verify:manual-ownership
pnpm verify:lead-intake
pnpm verify:lead-outbox
pnpm verify:lead-delivery-state
pnpm verify:operational-recovery
pnpm verify:schema
pnpm verify:integration:required
pnpm typecheck
pnpm lint
pnpm build
pnpm verify:merge-risky
```

Не запускать duplicate commands, если `verify:merge-risky` уже доказуемо включает их на том же exact SHA; final proof должен записать реальный command graph.

## 9.7 Targeted Core §18A

Final matrix:

```text
A  heartbeat visibility
B1 in-process cache            N/A
B2 HTTP revalidation contract
C  dispatcher no catch-up
D  stale import recovery
E  retention fail-closed / execution fixture
F  lead outbox crash window
G  retryable delivery + waitUntil
```

Каждый:

```text
PASS with evidence
N/A with reason
NOT PROVEN
```

Никакого implicit PASS.

## 9.8 UI final proof

Mechanically:

```text
verify:ui-core
DEAD tokens = 0
primitive ownership
font mapping
persistence boundary
SEO contracts
a11y static checks
```

Visual matrix:

```text
/
 /nedvizhimost
 /o-kompanii
 representative property detail if fixture/published record exists
```

Viewports:

```text
390×844
768×1024
1280×900
1440×1000
```

Если property detail всё ещё не имеет representative data:

```text
NOT PROVEN
```

и это переносится в first client mandatory proof, а не маскируется.

## 9.9 Final artifact

Создать:

```text
docs/proofs/final-starter-freeze.md
```

Required fields:

```text
canonical GitHub SHA
historical SourceCraft SHA at cutover boundary
Core/UI versions
epic merge SHAs 01–08
commands actually run
schema/migration proof
security proof
jobs/import proof
lead proof
UI proof
clone readiness proof
client blueprint status
Timeweb live status
NOT PROVEN
remaining P0/P1/P2
owner decisions
freeze decision
```

## 9.10 Freeze

Freeze разрешён только если:

```text
P0 = 0
P1 = 0
required RISKY gate = PASS
schema proof = PASS
client clone fixture readiness = PASS
starter demo topology still intentional
no undocumented structural deviation from Core
```

После freeze:

```text
tag / immutable reference:
starter-freeze-v1
```

Tag создаётся только в GitHub на exact proven `main` SHA. SourceCraft tag или
mirror update запрещены.

---

# 6. FINDING → EPIC MAPPING

| Finding | Owner EPIC |
|---|---:|
| SourceCraft active primary / missing GitHub gate | 01 |
| `src/payload/**` structural drift | 02 |
| migration folder drift | 02 |
| duplicated env semantics | 03 |
| conditional env validation gaps | 03 |
| direct runtime env drift | 03 |
| clone topology ambiguity | 04 |
| hardcoded starter runtime identity | 04 |
| weak clone-readiness semantics | 04 |
| lead retry hardcodes | 05 |
| recovery threshold ownership | 05 |
| missing module manifests | 06 |
| missing module activation guard | 06 |
| missing Timeweb client blueprint | 07 |
| no S3 client activation path | 07 |
| token cleanup ergonomics | 08 |
| duplicated analyzer risk | 08 |
| historical docs in active reading path | 09 |
| final exact-head re-proof | 09 |

---

# 7. ЧТО СОЗНАТЕЛЬНО НЕ ДЕЛАЕМ

Этот plan не является поводом добавить:

```text
Prisma
second ORM
Redis
broker
PostGIS
Elasticsearch
GraphQL/tRPC
second backend
custom auth
personal account
second UI library
second icon ecosystem
dedicated jobs runner
multi-runner same queue
universal page builder
S3 runtime dependency в demo starter
dual local/S3 storage runtime в starter
automatic destructive token pruning
speculative CRM routing DSL
```

Также не делаем redesign UI starter.

---

# 8. RELEASE / CLONE DECISION

После EPIC-09 возможны два разных решения.

## Starter clone readiness

Если final proof PASS:

```text
STARTER READY TO CLONE
```

Это означает:

```text
можно создать новый client repo
начать Design Intake
начать страницы/контент
подключать реальный feed
готовить Timeweb staging
```

## Client production readiness

Не следует автоматически из starter freeze.

Первый client production требует отдельно доказать:

```text
real Timeweb Managed PostgreSQL
real Timeweb S3
real client domain
real backup/restore
real selected lead channel
real retention policy
representative performance
live smoke
```

---

# 9. EXECUTION ORDER

```text
EPIC-01  GitHub primary cutover + manual gate bootstrap
→ GitHub merge main

EPIC-02  Canonical folder-form
→ GitHub merge main

EPIC-03  Unified env/runtime contract
→ GitHub merge main

EPIC-04  Identity + client readiness
→ GitHub merge main

EPIC-05  Lead delivery project policy
→ GitHub merge main

EPIC-06  Module manifests/governance
→ GitHub merge main

EPIC-07  Timeweb client blueprint
→ GitHub merge main

EPIC-08  Token report / clone UI cleanup
→ GitHub merge main

EPIC-09  Docs cleanup + exact-head proof + freeze
→ GitHub merge main
→ create GitHub tag starter-freeze-v1
→ STOP
→ create first client clone
```

Execution следует waves из §5. EPIC-03 и EPIC-06 могут идти параллельно после
EPIC-02. EPIC-05 не меняет shared jobs integration одновременно с EPIC-03, а
EPIC-08 не стартует до merge EPIC-06. Каждый поток сохраняет отдельные
branch/worktree/PR и проходит собственный exact-head Gate.

EPIC-09 начинается только после merge всех предшественников.

---

# 10. FINAL DEFINITION OF DONE

План считается завершённым только когда одновременно выполнено:

```text
[ ] GitHub is the only active primary
[ ] SourceCraft received no new writes after owner cutover decision
[ ] GitHub canonical main exact SHA зафиксирован
[ ] manual exact-head GitHub STANDARD/RISKY gate доступен
[ ] automatic deploy/production workflow отсутствует
[ ] canonical folder-form применён
[ ] src/payload old runtime tree отсутствует
[ ] root migrations являются единственным migration path
[ ] env contract имеет одного schema owner
[ ] runtime fail-closed rules имеют matrix tests
[ ] starter identity централизована
[ ] client placeholder identity mechanically rejected
[ ] clone topology contract однозначен
[ ] verify:client-readiness существует
[ ] lead retry policy project-configurable
[ ] module manifests существуют
[ ] module governance mechanical guard существует
[ ] Timeweb client blueprint существует
[ ] starter runtime не получил обязательную S3 dependency
[ ] token analyzer один
[ ] DEAD tokens = 0
[ ] active reading path очищен от historical execution noise
[ ] all required integration suites run with zero skip
[ ] final RISKY exact-head Gate PASS
[ ] P0 = 0
[ ] P1 = 0
[ ] final-starter-freeze.md создан
[ ] starter immutable freeze reference создан
```

После этого **не открывать новый общий hardening-plan для starter без нового конкретного production finding**.

Следующий шаг:

```text
FIRST CLIENT CLONE
→ real Design Intake
→ Timeweb staging
→ real feed
→ real media
→ real lead channels
→ production-like performance
→ feedback into starter only when finding is reusable across projects
```

---

# 11. EXTERNAL VERSION-SENSITIVE NOTES

Перед EPIC-02/07 implementation AI обязан перепроверить pinned versions и актуальную official documentation.

Plan-level verification: `PASS` на 2026-09-21 для Payload `3.89.0` и
архитектурных claims blueprint. Это не заменяет implementation proof.

Official sources:

- GitHub Actions workflow syntax: `https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax`;
- GitHub manual workflow runs: `https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow`;
- Payload migrations: `https://payloadcms.com/docs/database/migrations`;
- Payload storage adapters: `https://payloadcms.com/docs/upload/storage-adapters`;
- Timeweb S3 guide: `https://timeweb.cloud/docs/s3-storage/manage-storage/s3-guide`;
- Timeweb AWS SDK example: `https://timeweb.cloud/docs/s3-storage/sdk/javascript`;
- Timeweb DBaaS physical backups: `https://timeweb.cloud/docs/dbaas/dbaas-manage/backup`;
- Timeweb DBaaS logical backups: `https://timeweb.cloud/docs/dbaas/dbaas-manage/logical-backups`.

Подтверждено:

```text
GitHub Actions:
- workflow_dispatch принимает события только когда workflow file находится в default branch
- push branch filter ограничивает bootstrap run exact reserved branch
- поэтому EPIC-01 сначала использует reserved-branch push proof, а после merge — manual dispatch from main

Payload:
- migrationDir configurable
- root /migrations является поддерживаемой/common location
- @payloadcms/storage-s3 является official S3 adapter
- S3 adapter принимает S3ClientConfig
- conditional enabled поддерживается
- enabled S3 storage отключает local storage для configured collection

Timeweb Cloud:
- Object Storage предоставляет S3-compatible API
- credentials включают Access Key / Secret Key
- endpoint берётся из Timeweb configuration/docs
- Managed PostgreSQL является DBaaS
- DBaaS поддерживает provider backup/restore workflow
```

Эти факты не заменяют targeted proof на pinned project version и реальном first-client staging.

---

# 12. ASSEMBLY FINDING REGISTER

| ID | Severity | Finding | Result |
|---|---|---|---|
| MP6-A01 | MAJOR | документ был назван Plan №5 при отдельном файле Plan №6 | `RESOLVED`: Plan №6 |
| MP6-A02 | MAJOR | EPIC-14…21 продолжали номера закрытого плана | `RESOLVED`: scoped EPIC-01…08 in v1; expanded to EPIC-01…09 in v2 |
| MP6-A03 | MAJOR | EPIC-08 объявлялся независимым, хотя acceptance зависит от EPIC-06 | `RESOLVED`: contract dependency + serialization |
| MP6-A04 | MAJOR | EPIC-03 и EPIC-05 могли параллельно менять shared jobs/config composition | `RESOLVED`: SOFT serialization на integration task |
| MP6-A05 | MINOR | post-merge verify дублировал exact-head Gate без нового SHA | `RESOLVED`: только merge identity/evidence |
| MP6-A06 | MINOR | EPIC-07 повторял прямую и транзитивную dependency | `RESOLVED`: зависит только от EPIC-04 |
| MP6-A07 | MINOR | site identity owner оставался альтернативой между двумя файлами | `RESOLVED`: отдельный `site.config.ts` |
| MP6-A08 | MAJOR | active delivery был привязан к SourceCraft вопреки owner decision | `RESOLVED`: GitHub cutover EPIC-01, SourceCraft/production excluded |

Это assembly register, а не финальный четырёхпроходный audit scorecard.

# 13. OWNER DECISION REGISTER

## Before approval

Открытых решений нет. Рекомендованный delivery mode для всех EPIC:
`MERGE_AFTER_GATE` в GitHub; production исключён. Repository mode:
`GITHUB_PRIMARY`. SourceCraft полностью исключён из будущего delivery.

## Later / execution gate

Immutable reference: `starter-freeze-v1`. Если такой tag появится до EPIC-09,
task останавливается до безопасного выбора нового имени; это не блокирует
предшествующие implementation EPIC.

# 14. FINAL AUDIT FINDING REGISTER

| ID | Severity | Pass | Finding / evidence | Resolution |
|---|---|---|---|---|
| MP6-F01 | MAJOR | Architecture / Delivery | current `assert-exact-head.mjs` required `SOURCECRAFT_COMMIT_SHA`, so the proposed GitHub gate was not implementable as written | `RESOLVED` in v3: provider-neutral `EXPECTED_COMMIT_SHA + CI_COMMIT_SHA + checkout` contract and guard migration added to EPIC-01 |
| MP6-F02 | MAJOR | Executability | no explicit GitHub-only docs checkpoint existed between owner approval and Beads import | `RESOLVED` in v3: approval checkpoint/handoff boundary added; import is forbidden if GitHub push preflight fails |
| MP6-F03 | MINOR | Autonomy / Recovery | stop and recovery rules for several epics were implicit in global rules | `RESOLVED` in v3: deterministic stop/recovery matrix added for EPIC-01…09 |
| MP6-F04 | QUESTION | External prerequisite | GitHub write/PR/Actions permission cannot be proven by repository static audit without entering credential scope | `ACCEPTED LIMIT`: preflight is mandatory before checkpoint/import; fail-closed stop; no SourceCraft fallback |
| MP6-F05 | ALREADY_COVERED | Scope / Safety | risk of production entering implementation chain | `ALREADY_COVERED`: production excluded globally; EPIC-07 is static reference only; EPIC-09 creates tag, not rollout |

Open `BLOCKER`: `0`. Open `MAJOR`: `0`. `NEEDS_OWNER`: `0`.

# 15. MASTER PLAN AUDIT

```text
Logic / completeness
  blockers: 0
  major open: 0
  outcomes mapped to epics: 9/9
  scope creep: 0; production and live client infrastructure excluded

Architecture / data / security
  blockers: 0
  major open: 0
  data/schema owner conflict: 0 after EPIC-02/03 sequence
  security-sensitive contracts covered: env/secrets, lead PII, allowlists
  competing runtime topology: 0; demo remains local, client blueprint static

Dependency / autonomy
  cycles: 0
  HARD dependency rows: 5 (12 directed edges including EPIC-09 final fan-in)
  CONTRACT/SOFT relationships: 4
  independent execution waves: 6
  single blocking point: EPIC-01 GitHub cutover preflight
  shared-file conflicts: explicitly serialized

Executability / evidence
  epics with deterministic entry/exit: 9/9
  epics with acceptance: 9/9
  epics with verification/evidence tier: 9/9
  wired/live claims without reachable surface: 0
  static-only claim: EPIC-07, explicitly NOT PROVEN live
  production actions in implementation: 0

Owner decisions
  before approval open: 0
  later open: 0
```

Final audit result for exact `v3`: `PASS`.

# 16. NIGHT RUN READINESS

```text
Independent ready waves:
  A: EPIC-01
  B: EPIC-02
  C: EPIC-03 + EPIC-06
  D: EPIC-04 + EPIC-05 + EPIC-08
  E: EPIC-07
  F: EPIC-09

Critical path:
  EPIC-01 → EPIC-02 → EPIC-03 → EPIC-04 → EPIC-07 → EPIC-09

Single blocking points:
  GitHub write/PR/Actions permission before approval checkpoint/import
  EPIC-01 and EPIC-02 are intentionally sequential foundations

Hard dependencies:
  justified at minimum whole-epic/path/final-proof scope in §5.1

External prerequisites:
  GitHub permissions: preflight + fail-closed stop, no SourceCraft fallback
  isolated test DB: preflight + STANDARD/docs bypass where DAG permits
  official docs: fresh check + finding return, no guessed API
  tag permission: freeze-only stop; no production action

Owner decisions remaining: 0
Production-only stops: all live rollout remains outside Plan №6

Safe work if one epic blocks:
  after EPIC-02, independent ready work is selected by waves C/D;
  a blocked task is released and another ready task is claimed;
  EPIC-01 permission failure stops before Beads import because GitHub-only
  delivery is an explicit owner invariant and has no authorized fallback.

Expected stop conditions:
  changed baseline, changed proven SHA, skipped required suite, unsafe test DB,
  unresolved P0/P1, GitHub permission failure, tag conflict, production request.

Result: READY_WITH_LIMITS
Limit: the first GitHub permission preflight is an unavoidable external gate.
It cannot be softened without violating the owner's GitHub-only decision.
```

# 17. REVISION HISTORY

| Version | Status | Date | Input | Result |
|---|---|---|---|---|
| v0 | DRAFT | 2026-09-21 | owner-provided plan | исходная основа принята без readiness verdict |
| v1 | REVIEW | 2026-09-21 | MP6-R1: owner plan + repository evidence + official docs | Plan №6, EPIC-01…08, corrected dependencies/waves, external fallbacks, no cycles |
| v2 | REVIEW | 2026-09-21 | MP6-R2: explicit owner repository decision | GitHub primary, SourceCraft/production excluded, GitHub bootstrap EPIC-01 added, implementation renumbered EPIC-02…09 |
| v3 | APPROVED | 2026-09-21 | MP6-R3 final audit + explicit owner approval | provider-neutral GitHub exact-head gate, approval checkpoint, complete stop/recovery controls, scorecard PASS, `READY_WITH_LIMITS`; approved by owner at `2026-09-21T13:48:30+03:00` |

Следующий переход: GitHub-only docs checkpoint, clean Task Manager import and
automatic Developer handoff. Production remains forbidden.

---

**END — AMS MASTER PLAN №6 / STARTER FINAL FREEZE / CLIENT CLONE READINESS**

# AMS MASTER PLAN №7 — STARTER FINAL AUDIT CORRECTIONS / FREEZE v2

> Archive status: `EXECUTION_COMPLETE / EVIDENCE`. Не использовать как READY-граф.

**Plan ID:** `AMS-REALTY-BAZA-STARTER-AUDIT-CORRECTIONS-7`
**Version:** `v2`
**Status:** `APPROVED`
**Phase:** `APPROVAL_HANDOFF`
**Approved by:** owner
**Approved at:** `2026-09-21T21:28:39+03:00`
**Prepared:** `2026-09-21`
**Repository:** SourceCraft `integrator-p/ams-realty-baza-starter` — primary
**Mirror:** GitHub `neyro-level/ams-realty-baza-starter` — one-way mirror
**Audited canonical head:** `3d362992ed04c91ced42a71bf5567e101fc912dd`
**Current starter state:** `ADDITIONAL_VALIDATION / NOT_FROZEN`
**Core:** `AMS REALTY PLATFORM CORE STANDARD 5.5 — SOLO + AI`
**UI:** `AMS UI CORE v5.0`
**Profile:** `AMS_PROFILE=REALTY_BASE`
**Delivery:** `COMMERCIAL`
**Production:** `OUT OF SCOPE`
**Target result:** новый проверяемый candidate для `starter-freeze-v2`.

Version: v2
Status: APPROVED

---

# 0. ЦЕЛЬ ПЛАНА

Закрыть все подтверждённые дефекты, найденные:

1. независимым аудитом текущего `main`;
2. дополнительным аудитом владельца;
3. повторной сверкой кода с Core 5.5;
4. повторной сверкой UI с AMS UI CORE v5.0;
5. проверкой version-sensitive рисков Payload / Next.js на дату аудита.

План не является редизайном и не создаёт новую платформенную архитектуру.

Главная цель:

```text
current starter
→ устранить security blockers
→ устранить data-integrity blockers
→ устранить lead/compliance blockers
→ устранить source-of-truth drift
→ укрепить clone activation
→ очистить UI/API escape hatches
→ полный exact-head RISKY proof
→ owner approval
→ starter-freeze-v2
```

---

# 1. ЖЁСТКИЙ КОНТРАКТ PLAN №7

Во всех эпиках сохраняются следующие инварианты:

```text
Payload = единственный schema owner
PostgreSQL = единственная application DB
no Prisma
no second ORM
no second backend
production schema = migrations only
push=false in production

Public UI
→ Public Gateway
→ explicit access
→ DTO
→ reusable UI

overrideAccess:true
→ только approved System Gateway operations

configurable outbound HTTP
→ только Safe Outbound boundary

one project
→ one Design System

REUSE
→ VARIANT
→ CREATE

shadcn/ui
→ единственная primitive foundation

Server Components default
"use client"
→ только interactive leaf

secrets
-X→ Git
-X→ docs
-X→ logs
-X→ browser

lead
→ local DB commit
→ lead-delivery rows
→ asynchronous external delivery

bad/suspicious feed
≠
empty catalog

SourceCraft = primary
GitHub = one-way mirror

production actions
→ запрещены этим планом
```

---

# 2. DELIVERY CONTRACT

Каждый EPIC выполняется отдельно:

```text
canonical SourceCraft main
→ новая branch/worktree
→ только scope текущего EPIC
→ implementation
→ локальные targeted checks
→ commit
→ SourceCraft Pull Request
→ exact-head STANDARD или RISKY Gate
→ merge в main
→ зафиксировать merge SHA/evidence
→ удалить clean branch/worktree
→ fast-forward mirror SourceCraft main → GitHub main
→ следующий EPIC от нового main
```

Обязательно:

- один EPIC = один Pull Request;
- каждый новый EPIC начинается от свежего canonical `main`;
- никаких force-push/rewrite canonical history;
- одинаковый proof не повторять без изменившегося SHA или нового риска;
- красный required check = merge запрещён;
- изменения production не выполнять;
- secrets/PII не выводить в evidence;
- `RISKY` выполняется только с safe isolated `DATABASE_URI_TEST`;
- required integration suite не может быть `SKIPPED`;
- freeze tag создаётся только отдельной финальной командой владельца после EPIC-14.

---

# 3. СВОДКА FINDINGS

## 3.1 Подтверждённые блокеры

| ID | Severity | Finding | Статус |
|---|---|---|---|
| F-01 | P0 | Payload `3.89.0` предшествует security release `3.90.0`; security-patched baseline не применён | CONFIRMED |
| F-02 | P0 | Feed normalization допускает foreign currency, а ingest безусловно пишет `currency: "RUB"` | CONFIRMED |
| F-03 | P0 | JSON-LD вставляется через raw `JSON.stringify()` в `<script>` без HTML-safe escaping | CONFIRMED |
| F-04 | P1 | `consentVersion` и `consentedAt` принимаются от browser как authoritative evidence | CONFIRMED |
| F-05 | P1 | fallback lead idempotency не имеет границы одной попытки и может склеивать повторные реальные обращения | CONFIRMED |
| F-06 | P1 | `Leads`/`LeadDeliveries` access policy конфликтует с literal Core 5.5 owner-only contract | CONFIRMED CONTRACT CONFLICT |
| F-07 | P1 | accumulated XML text-node limit реализован некорректно | CONFIRMED |
| F-08 | P1 | starter demo `robots.ts` разрешает crawl при declared `noindex` contour | CONFIRMED |
| F-09 | P1 | live lead channels могут быть активированы при отсутствующей effective retention policy | CONFIRMED |
| F-10 | P1 | docs обещают server-authoritative consent и strict currency rejection, runtime этому не соответствует | CONFIRMED |
| F-11 | P2 | Safe Outbound проверяет DNS до `fetch`, но соединение не привязано к проверенному resolution | CONFIRMED HARDENING GAP |
| F-12 | P2 | application lead rate-limit принимает первый `X-Forwarded-For`, который может быть client-influenced | CONFIRMED DEFENSE-IN-DEPTH GAP |
| F-13 | P2 | UI `variant="plain"` позволяет обходить canonical primitive visual contract | CONFIRMED ARCHITECTURAL ESCAPE HATCH |
| F-14 | P2 | `GonePropertyPage` содержит локальный UI pattern вне canonical Section/Container/Button composition | CONFIRMED |
| F-15 | P2 | active docs расходятся с runtime по отдельным data/lead contracts | CONFIRMED |
| F-16 | P2 | clone несёт starter-only history/proofs/scripts без автоматического cleanup path | CONFIRMED |

---

# 4. РАЗБОР ДОПОЛНИТЕЛЬНОГО АУДИТА: ЧТО ПРИНЯТО, ЧТО СКОРРЕКТИРОВАНО

План №7 не переносит сторонние замечания механически. Каждый пункт повторно сопоставлен с текущим SHA.

## 4.1 Cache invalidator

Дополнительный аудит утверждал, что runtime объявляет `http`, но фактически всегда использует in-process invalidation.

Повторная проверка показала:

```text
src/project/jobs/tasks.ts
→ live import path вызывает postBatchedHttpRevalidate(...)
```

То есть production-like job path уже использует HTTP.

Одновременно существует:

```text
src/core/cache/invalidator.ts
→ unconditional invalidateInProcessCacheTargets(...)
```

но по текущему SHA он не является live caller path.

**Решение Plan №7:**

- не считать это P0 runtime failure;
- считать P1 source-of-truth / dead-boundary drift;
- удалить двусмысленность: должен остаться один canonical cache invalidation facade;
- не добавлять speculative `in-process` runtime mode без B1 proof.

## 4.2 `CACHE_INVALIDATION_MODE`

Дополнительный аудит предлагает расширить enum до:

```text
http | in-process
```

Core 5.5 разрешает `in-process` только после отдельного proof.

В текущем проекте:

```text
cacheInvalidationMode = http
cacheProofStatus = http
```

**Решение Plan №7:** не добавлять второй активный mode заранее. Сохранить `http` как единственный разрешённый starter mode. Если будущий client project проходит B1 proof, включение `in-process` — отдельный ADR/change, не часть базового starter freeze.

## 4.3 Robots

Finding принят.

Nginx demo contour ставит:

```text
X-Robots-Tag: noindex,nofollow
```

но `src/app/robots.ts` публикует:

```text
Allow: /
```

Это не означает, что текущий demo обязательно индексируется, потому что response header сильнее, но создаёт два разных источника политики и опасно для clone.

Исправляется в EPIC-07.

## 4.4 S3 adapter

Проблема clone activation реальна, но предложенное решение «dual local/S3 runtime в starter» конфликтует с уже принятым Plan №6:

```text
starter demo
= local PostgreSQL + MEDIA_DIR

client production
= Managed PostgreSQL + S3

dual runtime inside starter
= intentionally rejected
```

**Решение Plan №7:**

- starter runtime остаётся local-only;
- `@payloadcms/storage-s3` не становится обязательной runtime dependency demo;
- создаётся детерминированный client activation workflow/script, который применяет S3 adapter в clone и проверяет результат;
- manual surgery `payload.config.ts` заменяется reproducible activation step.

## 4.5 Atlas token vocabulary

Дополнительный аудит справедливо обнаруживает большой Atlas-derived vocabulary.

Но сам текущий starter является approved snapshot, а Design System cleanup уже определён как client Design Intake step.

**Решение Plan №7:**

- не выполнять массовое удаление live token/view системы вслепую;
- не ломать validated visual baseline;
- очистить реальные public API escape hatches;
- создать механический clone-cleanup/report path;
- удалять только доказанный DEAD;
- после Design Intake clone удаляет невостребованный donor UI.

Severity: `P2 PORTABILITY`, а не runtime P0.

## 4.6 `src/proxy.ts`

Finding как ошибка отклонён.

Для Next.js 16 `proxy.ts` — актуальная file convention; Next.js documentation использует именно Proxy.

Задача только документационная:

```text
pinned Next 16
→ proxy.ts intentional
→ middleware.ts не возвращать
```

## 4.7 `src/app/http/`

Finding как ошибка отклонён.

Текущий путь является частью доказанного 410 lifecycle:

```text
src/app/http/property-lifecycle/[slug]/route.ts
```

и существующий proof прямо фиксирует причину: page RSC не является HTTP 410 response boundary.

Переносить его в `/api/internal` запрещено, если это ломает public SEO lifecycle.

Нужно только сделать назначение видимым в active architecture docs.

## 4.8 Jobs autoRun cron

Изменение `* * * * *` на `*/5` / `*/15` **не выполнять**.

Core 5.5 сам фиксирует minute autoRun ticker отдельно от task schedule cron.

Следовательно:

```text
autoRun cron
= queue polling/execution capacity

task schedule cron
= schedule конкретного static task
```

Добавляется явное объяснение/guard, но runtime cadence не меняется без version-specific proof.

## 4.9 `lucide-react`

Предложение «откатить/поднять с 1.x на 0.4xx» отклонено как устаревшее.

На дату аудита Lucide уже имеет актуальную release-линейку `1.x`.

Задача Plan №7:

- не менять major/lineage по ошибочному предположению;
- проверить lockfile и compatibility;
- обновлять dependency только при отдельной обоснованной необходимости.

---

# 5. DEPENDENCY GRAPH

```text
READY IMPLEMENTATION POOL AFTER APPROVAL:
EPIC-01 Payload Security Upgrade               priority first
EPIC-02 Feed Integrity + Parser Safety
EPIC-03 Output / Outbound Security
EPIC-04 Cache Source-of-Truth
EPIC-05 Lead Consent + Idempotency + Retention
EPIC-06 Lead Access Contract
EPIC-07 Robots / Indexing Governance
EPIC-08 Client Storage Activation
EPIC-09 UI Core Tightening
EPIC-10 Clone Hygiene
EPIC-11 Version-Sensitive Architecture Docs

EPIC-01…11 merged
        ↓
EPIC-12 Canonical Docs Reconciliation
        ↓
EPIC-13 Full Validation / Clone Proof
        ↓
EPIC-14 Final Freeze Proof
```

EPIC-01 выполняется первым как security-priority, но не блокирует технически
независимые EPIC-02…11, если upgrade остановлен на своём stop condition. Один
Developer ведёт только один active writing stream; delivery каждого следующего
эпика начинается от свежего SourceCraft `main`. EPIC-12 является финальной
сверкой active Source of Truth и поэтому ждёт merge EPIC-01…11.

## 5.1 Dependency matrix

| Scope | Depends on | Type | Blocking scope | Bypass / reason |
|---|---|---|---|---|
| EPIC-01…11 | owner approval of exact Plan №7 v2 | OWNER | graph import/start only | до approval разрешён только read-only preflight |
| EPIC-01 | official Payload release and migration notes | EXTERNAL | upgrade epic | при несовместимой schema rewrite остановить EPIC-01; продолжать другие READY эпики |
| EPIC-02…11 | none between each other | SOFT delivery order | one active writer | брать следующий safe READY epic от свежего `main` |
| EPIC-12 | EPIC-01…11 merged | HARD | docs reconciliation | active docs должны описывать уже доставленный runtime exact main |
| EPIC-13 | EPIC-01…12 merged | HARD | full exact-head proof | доказывает итоговый candidate, а не промежуточные branches |
| EPIC-14 | EPIC-13 merged | HARD | freeze decision proof | tag остаётся отдельным OWNER gate вне Developer execution |

Cycles: `0`.

---

# EPIC-01 — PAYLOAD SECURITY BASELINE

**Severity:** `P0`
**Risk:** `RISKY`
**Finding:** F-01

## Цель

Убрать `Payload 3.89.0` из freeze baseline и перейти на security-patched `3.90.1` либо более новый patch той же подтверждённой 3.x линии, если к моменту исполнения официальный security release изменился.

На дату Plan №7:

```text
Payload 3.90.0
→ release содержит critical security fixes
Payload 3.90.1
→ latest patch release в линии на 2026-09-21
```

## TASK-01-01 — Version preflight

Перед изменением:

1. проверить official Payload release notes;
2. зафиксировать exact выбранную version;
3. проверить breaking/migration notes;
4. не переходить на новый major;
5. сохранить Next `16.3.5`, если отдельный security finding не требует иного.

Для каждого change note Payload `3.90.0` зафиксировать `APPLICABLE | N/A`:

- password reset / session revocation и relational migration;
- scheduled publish queued jobs;
- SVG/XML и client upload restrictions;
- external file trusted-origin behavior;
- polymorphic join `where` validation;
- API key reveal policy;
- custom Lexical features/direct dependencies.

## TASK-01-02 — Upgrade synchronized Payload packages

Одновременно обновить:

```text
payload
@payloadcms/next
@payloadcms/db-postgres
```

до одного exact compatible version.

Не допускать mix versions.

## TASK-01-03 — Regenerate Payload artifacts

Выполнить:

```bash
pnpm install
pnpm payload:generate:types
pnpm payload:generate:importmap
```

Проверить generated diff.

## TASK-01-04 — Security migration

Payload 3.90 security release требует relational migration для новых auth fields.

Создать migration:

```text
add-reset-password-requested-at
```

или эквивалентное имя по фактическому generated diff.

Требования:

- только migration;
- никакого `push=true`;
- migration проходит с нуля;
- migration проходит на существующей schema fixture.

## TASK-01-05 — Auth regression

Проверить:

- login;
- lockout;
- forgot password throttling;
- reset password;
- password change invalidates other sessions;
- Payload Admin login;
- `payload-token` cookie policy;
- raw REST boundary после upgrade.

## TASK-01-06 — Jobs regression

Payload 3.89 уже менял jobs access semantics, поэтому после 3.90 обязательны:

```text
queue registry
autoRun
concurrency control
payload-jobs inspection
emergency unstuck
import jobs
lead-delivery jobs
```

## TASK-01-07 — Upload regression

Проверить security-sensitive upload behavior:

- разрешённые MIME остаются allowlisted;
- SVG/XML не становятся разрешёнными случайно;
- overwrite protection media сохраняется;
- local MEDIA_DIR demo работает;
- anonymous Media raw REST остаётся закрыт.

## TASK-01-08 — Version evidence

Создать:

```text
docs/proofs/plan-7/epic-01-payload-security.md
```

Зафиксировать:

- old version;
- new version;
- official release source;
- migration;
- checks actually run;
- exact PR head SHA.

## Acceptance

```text
Payload 3.89.0 отсутствует в active dependency graph
all Payload packages aligned
migration exists
types generated
auth tests PASS
jobs tests PASS
upload boundary PASS
build PASS
required integration PASS
```

## Required checks

```bash
pnpm typecheck
pnpm lint
pnpm verify:schema
pnpm verify:security-boundaries
pnpm verify:jobs-config
pnpm verify:integration:required
pnpm build
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-02 — FEED DATA INTEGRITY + XML PARSER SAFETY

**Severity:** `P0/P1`
**Risk:** `RISKY`
**Findings:** F-02, F-07

## Цель

Исключить silent currency corruption и восстановить реальный parser structural limit.

## TASK-02-01 — Canonical currency contract

Для REALTY_BASE принять:

```text
RUB
→ accept

RUR
→ normalize to RUB

missing currency
→ использовать RUB только если это однозначно разрешено текущим YRL contract

USD / EUR / other
→ reject offer
→ import issue
→ no write
```

Не выполнять валютную конвертацию.

## TASK-02-02 — Tighten normalization schema

`NormalizedFeedOffer.currency` должен после normalization иметь literal contract:

```ts
currency: "RUB"
```

а не произвольный `string(3)`.

## TASK-02-03 — Remove silent overwrite

`buildFeedPropertyWriteData()` не должен скрывать unsupported source currency.

После TASK-02-02 допустимо:

```text
currency: offer.currency
```

при literal `"RUB"`.

Запрещено:

```text
foreign currency accepted upstream
→ forced RUB downstream
```

## TASK-02-04 — Currency import issues

Для unsupported currency:

```text
code: feed.offer_invalid
field: currency
messageRedacted: safe
```

Не логировать весь offer.

## TASK-02-05 — Currency regression suite

Добавить tests:

```text
RUB → accepted RUB
RUR → accepted RUB
USD → rejected
EUR → rejected
ABC → rejected
invalid length → rejected
unsupported currency → property not created/updated
```

## TASK-02-06 — Fix accumulated text-node limit

Исправить `appendText()`.

Текущая логика:

```text
currentText += value
if too large
→ appendText("")
→ no-op
```

должна быть заменена на явную branch:

```text
if currentText.length > maxTextNodeChars:
  if inside offer:
    issue + drop current offer
  else:
    criticalStructuralAnomaly = true
    stop parser
```

## TASK-02-07 — Chunk-boundary adversarial tests

Тестировать oversized node:

1. одним chunk;
2. множеством chunks по 8–16 KB;
3. рядом с `maxTextNodeChars`;
4. внутри `<description>`;
5. structural text вне offer.

Проверить, что segmentation входного stream не меняет security semantics.

## TASK-02-08 — Preserve global offer limit

Не ослаблять:

```text
maxOfferBytes
maxNestingDepth
maxAttributes
DTD deny
cancellation
```

## Acceptance

```text
unsupported currency never writes RUB value
no currency corruption
text-node limit works independent of stream chunking
bad offer isolated
critical structural anomaly fail-closed
catalog deactivation safety unchanged
```

## Required checks

```bash
pnpm verify:feed-parser
pnpm verify:feed-ingest
pnpm verify:feed-lifecycle
pnpm verify:manual-ownership
pnpm verify:integration:required
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-03 — JSON-LD / OUTBOUND / CLIENT-IP SECURITY HARDENING

**Severity:** `P0/P2`
**Risk:** `RISKY`
**Findings:** F-03, F-11, F-12

## TASK-03-01 — HTML-safe JSON-LD serializer

Создать единственную функцию:

```text
serializeJsonLdSafely(data)
```

Минимально escape:

```text
<
>
&
U+2028
U+2029
```

Запрещено повторять serializer по страницам.

## TASK-03-02 — Replace raw JSON.stringify injection

`JsonLdScript` использует только safe serializer.

`dangerouslySetInnerHTML` допускается исключительно с этим serializer.

## TASK-03-03 — Adversarial JSON-LD regression

Проверить external/feed strings:

```text
</script><script>alert(1)</script>
<&>
U+2028
U+2029
quotes
backslashes
```

Acceptance:

```text
rendered HTML не содержит attacker-controlled closing </script>
JSON-LD после decode остаётся валидным JSON
```

## TASK-03-04 — Safe Outbound DNS binding design

Сохранить:

```text
host allowlist
https default
approved http exception
private/link-local deny
redirect re-check
timeout
max bytes
```

Усилить boundary так, чтобы connection использовал уже проверенный resolution либо эквивалентный DNS-pinning mechanism.

Для Node 24 использовать version-verified supported `undici`/dispatcher lookup strategy либо другой проверенный механизм.

Не писать самодельный HTTP client.

## TASK-03-05 — DNS rebinding proof

Targeted tests:

```text
first resolution → public IP
second theoretical resolution → private IP
connection must not silently switch to unchecked private address

redirect → new host
→ full destination validation again
```

## TASK-03-06 — Trusted client IP boundary

Создать canonical helper:

```text
getTrustedClientAddress(request)
```

Для текущей topology:

```text
Internet
→ Nginx
→ Next
```

application не должен доверять произвольному первому client-supplied `X-Forwarded-For`.

Предпочтительно:

- Nginx перезаписывает trusted header;
- application использует `X-Real-IP` от known proxy;
- либо canonical trusted-proxy parser с явной topology.

## TASK-03-07 — Nginx templates

Синхронизировать:

```text
deploy/nginx/start-baza...
deploy/clients/timeweb/nginx/site.conf.example
```

Нельзя получить разные IP trust policies в demo и client blueprint.

## Acceptance

```text
JSON-LD injection regression PASS
Safe Outbound retains all existing protections
DNS rebinding proof PASS
lead application limiter uses trusted address
Nginx limiter remains active
```

## Required checks

```bash
pnpm verify:security-boundaries
pnpm verify:lead-intake
pnpm verify:seo-contracts
pnpm verify:integration:required
pnpm build
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-04 — CACHE INVALIDATION SOURCE OF TRUTH

**Severity:** `P1`
**Risk:** `RISKY`
**Findings:** дополнительный аудит cache + F-15

## Цель

Убрать двусмысленность между live HTTP path и существующим unconditional in-process facade.

## TASK-04-01 — Inventory all invalidation callers

Зафиксировать все:

```text
postBatchedHttpRevalidate
invalidateCacheTargets
invalidateInProcessCacheTargets
executeInternalRevalidation
```

Для каждого caller определить:

```text
live
test-only
dead
route-executor
```

## TASK-04-02 — One canonical public invalidation facade

После inventory выбрать один API:

```text
invalidatePublicCache(...)
```

Для starter:

```text
mode = http
```

Он вызывает:

```text
postBatchedHttpRevalidate
```

In-process executor остаётся внутренней реализацией authenticated Route Handler.

## TASK-04-03 — Remove misleading dead facade

Если `src/core/cache/invalidator.ts` не нужен live graph:

- удалить;
- либо превратить в canonical HTTP facade.

Запрещено оставлять функцию с названием общего invalidator, которая всегда делает in-process при active docs `mode=http`.

## TASK-04-04 — Do not add speculative in-process mode

Не расширять runtime config до `in-process`, пока нет:

```text
B1 proof
ADR
owner decision
```

Если будущий проект проходит proof — отдельная задача.

## TASK-04-05 — Cache warning propagation

Проверить:

```text
data commit success
+
HTTP invalidation failure
→ data success
→ cache warning
→ SLA tracking
→ alert after staleDataSlaMinutes
```

Cache failure не откатывает корректный inventory write.

## TASK-04-06 — Self-call proof

Проверить:

```text
job
→ POST internal revalidate
→ auth secret
→ rate limit not self-blocking
→ allowlisted target
→ Next in-process executor
→ fresh read
```

## Acceptance

```text
active docs = runtime
one canonical facade
no silent in-process fallback claim
warning/SLA path intact
```

## Required checks

```bash
pnpm verify:feed-ingest
pnpm verify:health-alerts
pnpm verify:security-boundaries
pnpm verify:integration
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-05 — LEAD CONSENT AUTHORITY + IDEMPOTENCY + RETENTION

**Severity:** `P1`
**Risk:** `RISKY`
**Findings:** F-04, F-05, F-09

## TASK-05-01 — Canonical legal consent config

Создать project-owned server config:

```text
currentConsentVersion
consentHref
consentRequired
```

Не размазывать `"pd-2026-01"` по DTO/routes/views.

Один source of truth.

## TASK-05-02 — Server authoritative consentVersion

Browser может отправлять displayed version как consistency signal, но server:

```text
clientVersion === currentServerVersion
→ accept

mismatch
→ reject safe code
```

Persisted value берётся из server config.

## TASK-05-03 — Server authoritative timestamp

`consentedAt` не принимать как legal authority из browser.

Сохранять:

```text
server time at accepted intake
```

Browser `submittedAt` допускается только для anti-spam/timing diagnostics, не как consent evidence.

## TASK-05-04 — sourcePage authority

Browser path:

- нормализовать;
- разрешать только internal canonical pathname;
- при property form сверять с trusted route/property context;
- external URL / protocol-relative input reject.

## TASK-05-05 — Property relation authority

Если formKind = property:

```text
property id
→ lookup published property
→ relation from server record
```

Не доверять client title/slug как persisted truth.

## TASK-05-06 — Separate retry idempotency from business deduplication

Удалить fallback semantics:

```text
phone + formKind + sourcePage + consentVersion
→ вечная identity
```

Ввести attempt identity.

Рекомендуемый contract:

```text
form render / submission attempt
→ UUID requestAttemptId

same HTTP retry / duplicate submit
→ same requestAttemptId
→ reuse

new deliberate submission
→ new requestAttemptId
→ new lead
```

## TASK-05-07 — Database idempotency

`idempotencyKey` остаётся unique.

Server строит:

```text
lead:<requestAttemptId>
```

либо безопасный deterministic equivalent, scoped одной submission attempt.

## TASK-05-08 — Regression: repeated real lead

Обязательный test:

```text
same phone
same sourcePage
same formKind

attempt A
→ lead A

exact retry A
→ reuse lead A

new attempt B later
→ lead B
→ new delivery rows
```

## TASK-05-09 — Effective retention policy source

Устранить duplication:

```text
projectConfig.leadRetentionDays = null
.env.example LEAD_RETENTION_DAYS
runtimeEnv.LEAD_RETENTION_DAYS
clientReadinessConfig.leadRetentionDays
```

Должен быть один canonical project policy и понятное deployment representation.

Для solo + AI предпочтительно:

```text
project/client readiness config
→ explicit versioned owner decision

runtime startup
→ validates effective policy
```

Не оставлять env variable, которую runtime cleanup фактически не использует.

## TASK-05-10 — Fail closed on live channels

Если:

```text
enabled lead channels > 0
AND effective leadRetentionDays is missing
```

production/client runtime readiness должна FAIL до приёма PII.

Starter demo может сохранять:

```text
channels disabled
retention = NEEDS_OWNER
```

## TASK-05-11 — Legal content readiness

Если public/client lead form active:

```text
legalContent != approved
→ client readiness FAIL
```

Fixture/demo может рендерить placeholder только при no-production/noindex contract.

## Acceptance

```text
client cannot choose arbitrary consent version
consent timestamp server-owned
new real submission never swallowed by old idempotency key
HTTP retry remains idempotent
live PII intake impossible without retention/legal readiness
```

## Required checks

```bash
pnpm verify:lead-intake
pnpm verify:lead-outbox
pnpm verify:lead-delivery-state
pnpm verify:client-readiness --mode=fixture-client
pnpm verify:integration:required
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-06 — LEADS / LEAD-DELIVERIES ACCESS CONTRACT

**Severity:** `P1`
**Risk:** `RISKY`
**Finding:** F-06

## Контрактный конфликт

Core 5.5 literal contract:

```text
leads:
read/update/delete = owner only

lead-deliveries:
read = owner only
create/update = system paths
```

Current runtime:

```text
owner + admin
```

Legacy Plan №5 отдельно разрешал owner/admin business workflow.

Это нельзя оставлять как скрытое расхождение.

## TASK-06-01 — Precedence resolution

По source priority Plan №7 применяет:

```text
current Core 5.5
>
legacy Plan №5
```

Default implementation:

```text
owner-only
```

Если во время реализации владелец отдельно изменит Core/ADR, исполнитель следует новому canonical contract.

## TASK-06-02 — Leads collection

Привести:

```text
read → owner
update → owner
delete → owner
```

Public create остаётся только через classified public lead endpoint/System Gateway.

## TASK-06-03 — PII field access

PII fields:

```text
name
phoneRaw
phoneE164
email
message
fraudFingerprint
```

не должны иметь более широкий access, чем collection owner contract.

## TASK-06-04 — Lead deliveries

Collection access:

```text
read → owner
create → system only
update → system only
delete → owner/system retention path as explicitly approved
```

Не использовать generic Admin mutation для delivery state machine.

## TASK-06-05 — Manual retry endpoint

Manual retry:

```text
owner only
```

если Core не изменён.

## TASK-06-06 — Real DB access matrix

Integration matrix:

```text
anonymous
editor
admin
owner
system
```

для:

```text
leads
lead-deliveries
PII fields
retry endpoint
```

## TASK-06-07 — Docs/ADR

Создать/обновить ADR:

```text
ADR-LEAD-ACCESS-MODEL.md
```

чтобы следующий AI не вернул admin access из legacy plan.

## Acceptance

```text
runtime
Core 5.5
ADR
access tests
```

дают одну и ту же матрицу.

## Required checks

```bash
pnpm verify:security-boundaries
pnpm verify:public-gateway
pnpm verify:lead-intake
pnpm verify:lead-outbox
pnpm verify:owner-operations
pnpm verify:integration:required
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-07 — ROBOTS / INDEXING GOVERNANCE

**Severity:** `P1`
**Risk:** `STANDARD`
**Finding:** F-08

## TASK-07-01 — Project indexing policy

В project/site config создать semantic policy:

```text
starter-demo → noindex
client → explicit owner decision:
  public
  noindex
```

Не определять indexing только по domain string.

## TASK-07-02 — robots.ts

Для noindex contour:

```text
User-agent: *
Disallow: /
```

Sitemap/host можно не рекламировать до public indexing.

Для public client:

```text
Allow: /
Disallow: /admin
Disallow: /api
```

## TASK-07-03 — Metadata robots

Root metadata должен согласовываться с indexing policy.

Для starter:

```text
index: false
follow: false
```

## TASK-07-04 — Nginx agreement

Nginx `X-Robots-Tag` должен соответствовать application indexing policy для starter demo.

Не иметь:

```text
robots allows
+
header noindex
```

как постоянный canonical state.

## TASK-07-05 — Client readiness

`productionIndexing=public` разрешается только если заполнены:

```text
domain
canonical URL
approved legal content
production projectKind
```

## TASK-07-06 — SEO regression

Проверить:

```text
starter robots
starter metadata
client-public fixture robots
client-noindex fixture robots
sitemap behavior
```

## Acceptance

Одна политика определяет:

```text
robots.txt
metadata robots
Nginx blueprint
client readiness
```

## Required checks

```bash
pnpm verify:seo-contracts
pnpm verify:client-readiness --mode=fixture-client
pnpm verify:production-topology
pnpm verify:merge-standard
```

**Delivery:** SourceCraft STANDARD PR → merge main.

---

# EPIC-08 — CLIENT STORAGE ACTIVATION WITHOUT DUAL-MODE STARTER

**Severity:** `P1 clone-readiness`
**Risk:** `RISKY`
**Источник:** дополнительный аудит P0-3, скорректирован Plan №7

## Цель

Первый client clone не должен требовать ручной импровизации `payload.config.ts`, но demo starter не должен получать постоянную dual local/S3 complexity.

## TASK-08-01 — Keep demo storage contract

Не менять:

```text
starter demo
→ MEDIA_DIR
→ local persistent media
```

## TASK-08-02 — Production activation template

Сделать `deploy/clients/timeweb/payload/s3-plugin.example.ts` полноценным version-pinned activation source.

Он должен содержать:

- exact compatible package requirement;
- `s3Storage` config;
- Timeweb S3 endpoint form;
- required env names;
- safe path/prefix policy;
- Media collection binding;
- no credentials in code.

## TASK-08-03 — Deterministic clone activation command

Создать:

```bash
pnpm clone:activate-timeweb-storage
```

Команда работает только в `projectKind=client`.

Она:

1. проверяет clean working tree;
2. добавляет compatible `@payloadcms/storage-s3`;
3. применяет deterministic config patch;
4. добавляет required env schema;
5. обновляет client readiness;
6. запускает targeted validation;
7. не трогает starter demo source автоматически.

## TASK-08-04 — Idempotent activation

Повторный запуск:

```text
already activated
→ no duplicate plugin
→ no duplicate dependency
→ safe no-op/report
```

## TASK-08-05 — Clone activation fixture

`verify:clone-readiness` создаёт temporary client clone и доказывает:

```text
activate S3
→ typecheck
→ config valid
→ client readiness recognizes S3
```

Реальный cloud upload остаётся staging proof, не local CI.

## TASK-08-06 — Documentation

`CLONE_ONBOARDING.md`:

```text
starter local
→ clone identity
→ clone:activate-timeweb-storage
→ Managed PostgreSQL config
→ staging
→ real S3 upload proof
```

## Acceptance

```text
starter demo dependency graph не содержит mandatory S3 runtime
client activation reproducible
manual payload.config surgery no longer required
```

## Required checks

```bash
pnpm verify:clone-readiness
pnpm verify:client-readiness --mode=fixture-client
pnpm typecheck
pnpm build
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-09 — UI CORE TIGHTENING / PORTABILITY

**Severity:** `P2/P1 drift prevention`
**Risk:** `RISKY`
**Findings:** F-13, F-14 + дополнительный UI audit

## Цель

Не редизайнить Atlas-derived validated baseline, а убрать обходы UI CORE и сделать clone cleanup механическим.

## TASK-09-01 — Inventory `variant="plain"`

Собрать все usages:

```text
Button plain
Input plain
Textarea plain
```

Классифицировать:

```text
A — genuinely unstyled behavior primitive
B — real repeated visual variant
C — one-off page-specific styling
```

## TASK-09-02 — Canonicalize repeated button variants

Если один и тот же visual/interaction pattern повторяется:

```text
plain + same class group
```

→ сделать semantic CVA variant canonical Button.

Примеры возможных ролей определять только по фактическому repetition.

Не создавать speculative variants.

## TASK-09-03 — Restrict plain escape hatch

`plain` остаётся только если:

- нужна behavior primitive without visual contract;
- usage явно justified;
- a11y/focus не теряются.

Guard/report должен показывать новые `plain` usages.

## TASK-09-04 — Package export boundary

Проверить фактические consumers:

```text
./components/*
./lib/*
```

Если public wildcard exports не нужны, закрыть их.

Target public API:

```text
.
./primitives
./views
./styles.css
```

Дополнительный export допускается только documented.

## TASK-09-05 — `home-articles.css`

Убрать page-specific stylesheet из public package export.

Если файл нужен:

```text
co-located internal import
```

если не нужен:

```text
delete
```

## TASK-09-06 — GonePropertyPage composition

Вынести 410 visual state в UI layer.

Использовать:

```text
Container
Section
canonical typography roles
Button asChild
```

Route остаётся lifecycle owner, не visual system owner.

## TASK-09-07 — Atlas token cleanup policy

Не удалять live token families только потому, что они Atlas-derived.

Алгоритм:

```text
tokens:report
→ prove DEAD
→ delete DEAD only
```

## TASK-09-08 — Clone Design Intake cleanup

Добавить report:

```bash
pnpm ui:clone-audit
```

который показывает:

- live donor views;
- live project-prefixed token families;
- dead tokens;
- plain primitive usages;
- public exports;
- page-specific styles.

Report-only.

## TASK-09-09 — Lucide verification

Никакого forced downgrade на `0.4xx`.

Проверить:

```text
lockfile version
React 19 compatibility
one icon ecosystem
bundle/build
```

Оставить 1.x line, если proof зелёный.

## Acceptance

```text
no new primitive foundation
no blind donor purge
plain escape hatch bounded
package public API intentional
410 page follows Design System
DEAD=0
```

## Required checks

```bash
pnpm quality:design-tokens
pnpm verify:ui-core
pnpm verify:drift
pnpm verify:a11y-starter
pnpm typecheck
pnpm build
pnpm verify:merge-risky
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-10 — CLONE HYGIENE / STARTER-ONLY CLEANUP

**Severity:** `P2`
**Risk:** `STANDARD`
**Finding:** F-16

## TASK-10-01 — Clone cleanup command

Создать:

```bash
pnpm clone:prepare
```

Работает только после явного `projectKind=client` либо `--client`.

## TASK-10-02 — Remove starter-only execution history

Из client clone разрешено удалить:

```text
docs/legacy/
starter Plan №2–№7 historical execution docs
starter proof artifacts
starter visual donor research
start-baza demo compose/nginx
starter-only generated inventories
```

Не удалять project docs и active contract docs.

## TASK-10-03 — Core standard handling

Не удалять Core 5.5 автоматически без доказанного replacement source.

Разрешённые варианты:

```text
A. retain pinned Core file in client repo
B. replace with verified global AMS skill reference + lock/version pointer
```

Default Plan №7:

```text
retain Core file
```

потому что docs-first clone должен быть воспроизводим без hidden external dependency.

## TASK-10-04 — Split scripts by lifecycle

Логически разделить:

```text
verify:starter:*
verify:client:*
verify:* shared
```

Без обязательного rename всех существующих команд, если это создаёт лишний churn.

Минимум:

- starter-only проверки не должны блокировать normal client lifecycle после clone cleanup;
- shared security/data checks остаются.

## TASK-10-05 — Strip donor visual proof commands

`visual:atlas-css-parity` после client Design Intake:

```text
starter-only
→ remove/disable during clone:prepare
```

если client не использует Atlas baseline как reference.

## TASK-10-06 — Keep clone audit trail

`clone:prepare` генерирует:

```text
docs/CLONE_PROVENANCE.md
```

с:

- source starter tag/SHA;
- removed starter-only groups;
- retained Core/UI versions;
- date;
- client project identity.

## TASK-10-07 — Idempotency

Повторный `clone:prepare` не ломает project и выдаёт safe report.

## Acceptance

```text
client repo не несёт ненужный execution history
canonical technical standards сохранены
shared verification сохранена
clone provenance существует
```

## Required checks

```bash
pnpm verify:clone-readiness
pnpm verify:client-readiness --mode=fixture-client
pnpm verify:daily
pnpm verify:merge-standard
```

**Delivery:** SourceCraft STANDARD PR → merge main.

---

# EPIC-11 — VERSION-SENSITIVE ARCHITECTURE CLARIFICATIONS

**Severity:** `P2`
**Risk:** `STANDARD`

## TASK-11-01 — Next 16 Proxy

Active docs должны прямо говорить:

```text
Next.js 16.3.5
→ src/proxy.ts intentional canonical framework file
→ src/middleware.ts запрещён
```

Ссылка на pinned official Next docs.

Не создавать ADR только ради ADR, если `03_ARCHITECTURE.md` достаточно.

## TASK-11-02 — Public 410 HTTP route

Active architecture описывает:

```text
src/app/http/property-lifecycle/[slug]/route.ts
```

как intentional HTTP status boundary.

Не переносить в internal API.

Зафиксировать:

```text
page.tsx
→ visual public page

route handler
→ actual 410 / redirect HTTP semantics
```

## TASK-11-03 — Jobs ticker vs schedule

Документировать:

```text
autoRun cron "* * * * *"
≠ business schedule

autoRun
→ queue polling/execution ticker

task registry cron
→ dispatchDueFeeds */5
→ maintenance */15
```

Не менять canonical ticker без Payload version proof.

## TASK-11-04 — Guard version-sensitive invariants

`verify:jobs-config` проверяет:

- static queue → `disableScheduling=false`;
- programmatic queue → `disableScheduling=true`;
- `enableConcurrencyControl=true`;
- current canonical autoRun ticker;
- documented registry schedules.

## TASK-11-05 — Lucide note

`DESIGN.md`:

```text
Lucide = only icon ecosystem
exact installed version = lockfile
```

Не утверждать старый `0.4xx` как canonical family.

## Acceptance

Version-sensitive intentional choices больше не выглядят как «ошибки структуры» для нового AI session.

## Required checks

```bash
pnpm verify:jobs-config
pnpm quality:guards
pnpm verify:daily
pnpm verify:merge-standard
```

**Delivery:** SourceCraft STANDARD PR → merge main.

---

# EPIC-12 — DOCS-FIRST SOURCE-OF-TRUTH RECONCILIATION

**Severity:** `P1`
**Risk:** `STANDARD`
**Findings:** F-10, F-15

## Цель

Active docs не должны давать AI инструкции, противоречащие runtime.

## TASK-12-01 — Consent contract

Исправить `CONTRACT_FEASIBILITY.md` после EPIC-05:

```text
consentVersion = server authoritative
consentedAt = server timestamp
client values = consistency/UX only
```

## TASK-12-02 — Currency contract

Зафиксировать:

```text
RUR/RUB only
unsupported currency → import issue + skip
no currency conversion
```

## TASK-12-03 — pricePerMeterMinor

Синхронизировать active docs с текущим Core 5.5/runtime.

Если canonical Core говорит:

```text
pricePerMeterMinor
= derived in ingest from priceMinor / totalArea
```

никакой active document не должен утверждать «только source field, не вычислять».

Legacy history можно сохранить как historical evidence, но active docs обязаны быть однозначны.

## TASK-12-04 — Lead access contract

После EPIC-06 синхронизировать:

```text
Core
PROJECT
ARCHITECTURE
ADR
collection code
access tests
```

## TASK-12-05 — Cache contract

После EPIC-04 убрать любые формулировки о live silent in-process mode.

## TASK-12-06 — Storage contract

Зафиксировать:

```text
starter demo = local MEDIA_DIR
client production = S3
activation = clone workflow
not runtime toggle in starter
```

## TASK-12-07 — Robots/indexing

Зафиксировать единый indexing policy.

## TASK-12-08 — Remove stale status language

Scan active docs на:

```text
starter-freeze-v1
READY_FOR_FREEZE
Plan №6 current execution
pending EPIC-09
GitHub primary
```

Оставлять historical wording только внутри explicit legacy/evidence context.

## TASK-12-09 — Active reading path

`docs/README.md` и `AGENTS.md`:

```text
Core 5.5
→ active PROJECT
→ ARCHITECTURE
→ DESIGN
→ OPERATIONS
→ current Plan №7
```

Legacy не участвует в normative reading path.

## Acceptance

Для каждой critical topic:

```text
one current source
no active contradiction
legacy clearly historical
```

## Required checks

```bash
git diff --check
pnpm contracts:check
pnpm quality:guards
pnpm verify:daily
pnpm verify:merge-standard
```

**Delivery:** SourceCraft STANDARD PR → merge main.

---

# EPIC-13 — FULL STARTER VALIDATION / CLIENT CLONE PROOF

**Severity:** `P0 freeze gate`
**Risk:** `RISKY`
**Depends on:** EPIC-01…12 merged

## Цель

Доказать не отдельные patches, а итоговый starter exact SHA.

## TASK-13-01 — Clean exact head

Перед proof:

```text
SourceCraft main clean
GitHub mirror not ahead
exact SHA recorded
no untracked contract artifacts
```

## TASK-13-02 — Dependency verification

Проверить:

```text
pnpm install --frozen-lockfile
no duplicate Payload versions
no second ORM
no second UI foundation
```

## TASK-13-03 — Full static suite

```bash
pnpm contracts:test
pnpm contracts:check
pnpm quality:architecture
pnpm quality:guards
pnpm verify:ui-core
pnpm verify:drift
pnpm verify:a11y-starter
pnpm verify:seo-contracts
pnpm typecheck
pnpm lint
```

## TASK-13-04 — Feed suites

```bash
pnpm verify:feed-parser
pnpm verify:feed-ingest
pnpm verify:feed-lifecycle
pnpm verify:manual-ownership
```

Обязательно присутствуют adversarial:

- foreign currency;
- oversized chunked text;
- malformed XML;
- suspicious feed;
- source isolation.

## TASK-13-05 — Lead suites

```bash
pnpm verify:lead-intake
pnpm verify:lead-outbox
pnpm verify:lead-delivery-state
pnpm verify:max-adapter
pnpm verify:custom-webhook-adapter
```

Обязательно:

- server consent;
- retry idempotency;
- new repeated lead;
- retention fail closed;
- access matrix.

## TASK-13-06 — Security suites

```bash
pnpm verify:security-boundaries
```

Плюс targeted:

```text
JSON-LD injection
DNS rebinding
trusted client IP
raw REST
secret redaction
```

## TASK-13-07 — Required DB integration

Safe test database only:

```bash
pnpm verify:integration:required
pnpm verify:schema
```

No skipped required suite.

## TASK-13-08 — Build

```bash
pnpm build
```

Build не требует production secrets.

## TASK-13-09 — Starter demo readiness

Проверить starter mode:

```text
projectKind=starter-demo
local PostgreSQL
MEDIA_DIR
noindex
lead channels disabled by default
no production claim
```

## TASK-13-10 — Temporary client clone

Из exact SHA создать temporary clone.

В clone:

```text
rename identity
projectKind=client
clone:prepare
activate Timeweb storage blueprint
set fixture client readiness values
run client readiness
run daily verification
build
```

Не обращаться к реальному Timeweb.

## TASK-13-11 — UI representative routes

Проверить:

```text
/
 /nedvizhimost
 /obekty/[slug]
 /uslugi
 404
 gone/410 visual state
```

Viewports:

```text
390×844
768×1024
1280×900
1440×1000
```

Проверить:

- one H1;
- keyboard;
- focus;
- mobile;
- form states;
- layout;
- no accidental dark mode;
- no missing image crash.

## TASK-13-12 — Final full command

```bash
pnpm verify
pnpm verify:merge-risky
```

## Evidence

Создать:

```text
docs/proofs/plan-7/final-validation.md
```

Только summary/evidence paths, без secrets и bulk screenshots.

## Acceptance

```text
P0 = 0
P1 = 0
required suites skipped = 0
build PASS
clone proof PASS
current docs consistent
production action = NONE
```

**Delivery:** SourceCraft RISKY PR → merge main.

---

# EPIC-14 — FINAL FREEZE v2 PROOF

**Severity:** `FINAL GATE`
**Risk:** `RISKY`
**Depends on:** EPIC-13 merged

## Цель

Подготовить, но не выполнять самовольный freeze.

## TASK-14-01 — Exact main

Зафиксировать:

```text
canonical SourceCraft main SHA
GitHub mirror SHA
```

Они должны совпадать после approved mirror.

## TASK-14-02 — Finding closure matrix

Создать таблицу:

```text
F-01 … F-16
→ CLOSED
→ evidence
→ owning EPIC
```

Ни одного `OPEN P0/P1`.

## TASK-14-03 — Not-proven register

Честно перечислить, что starter freeze не доказывает:

```text
real client domain
real client legal text
real client XML
real Timeweb Managed PostgreSQL
real Timeweb S3
real client CRM/messenger credentials
real production performance
real production backup
real production monitoring
```

Это client production gates, не starter clone gate.

## TASK-14-04 — Freeze decision document

Обновить:

```text
docs/proofs/final-starter-freeze.md
```

Статус до owner approval:

```text
READY_FOR_OWNER_FREEZE_DECISION
```

Не писать `FROZEN` заранее.

## TASK-14-05 — Final SourceCraft exact-head Gate

Один manual RISKY Gate на exact final PR head.

Если SHA изменился после gate:

```text
proof invalid
→ rerun
```

## TASK-14-06 — Merge

После PASS:

```text
merge PR
record canonical merge SHA
mirror GitHub
```

## TASK-14-07 — Owner handoff

Только после отдельной явной команды владельца:

```text
создать SourceCraft immutable tag:
starter-freeze-v2
```

GitHub tag создаётся только если repository policy отдельно требует; GitHub не становится primary.

## Acceptance

```text
implementation complete
all Plan №7 evidence closed
exact SHA known
owner approval pending/received explicitly
production action NONE
```

---

# 6. ПРИОРИТЕТ ИСПОЛНЕНИЯ

## Wave 1 — критические blockers

```text
EPIC-01 Payload Security
EPIC-02 Feed Integrity
EPIC-03 JSON-LD / Security
EPIC-05 Lead Consent / Idempotency / Retention
EPIC-06 Lead Access
```

## Wave 2 — source-of-truth / clone safety

```text
EPIC-04 Cache
EPIC-07 Robots
EPIC-08 Storage Activation
```

## Wave 3 — maintainability

```text
EPIC-09 UI Core Tightening
EPIC-10 Clone Hygiene
EPIC-11 Architecture Clarifications
EPIC-12 Docs Reconciliation
```

## Wave 4 — final proof

```text
EPIC-13 Full Validation
EPIC-14 Freeze v2
```

---

# 7. STOP CONDITIONS

Исполнитель обязан остановить конкретный EPIC и не merge:

- Payload upgrade требует undocumented incompatible schema rewrite;
- migration затрагивает production DB;
- required DB suite не может стартовать на safe test DB;
- current SourceCraft `main` drifted после branch creation и конфликт меняет scope;
- найден новый P0 security/data-loss issue;
- требуется owner secret/credential;
- S3 activation требует реальный bucket/credentials;
- legal retention value нужно придумать;
- нужно изменить Core 5.5 ради прохождения теста;
- нужно ослабить access/security guard;
- exact-head Gate выполнен не на текущем SHA.

Другие независимые READY эпики могут продолжаться.

---

# 8. FORBIDDEN SHORTCUTS

Запрещено:

```text
отключать test/guard ради green
добавлять catch-all fallback, скрывающий failure
принимать foreign currency как RUB
доверять browser legal evidence
использовать timestamp как единственный idempotency identity
открывать generic Payload create для public leads
давать admin системный delivery mutation без canonical decision
ослаблять outbound private-IP checks
массово удалять live UI tokens по имени prefix
добавлять dual-mode S3 complexity в starter demo
переносить 410 public route в internal API без proof
заменять proxy.ts на middleware.ts под Next 16
менять canonical jobs ticker из-за визуального сходства с task cron
создавать production resources
создавать freeze tag без owner approval
```

---

# 9. DEFINITION OF DONE PLAN №7

Plan №7 считается implementation-complete только если:

```text
Payload security baseline patched
currency corruption impossible
JSON-LD injection regression closed
parser structural limits proven
consent server-authoritative
lead repeat submission semantics correct
PII retention fail-closed
lead access contract reconciled
robots/indexing has one source of truth
cache invalidation has one source of truth
client S3 activation reproducible without dual-mode starter
UI primitive escape hatches bounded
client clone cleanup reproducible
active docs match runtime
full RISKY suite green
temporary client clone proof green
P0=0
P1=0
production action=NONE
```

Только после этого:

```text
READY_FOR_OWNER_FREEZE_DECISION
```

И только после отдельной owner-команды:

```text
starter-freeze-v2
```

---

# 10. SOURCES / EVIDENCE USED FOR PLAN №7

## Repository exact state

```text
GitHub mirror:
neyro-level/ams-realty-baza-starter

Audited head:
3d362992ed04c91ced42a71bf5567e101fc912dd
```

Key source files:

```text
AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md
AGENTS.md
package.json
payload.config.ts
src/project/env.ts
src/project/project.config.ts
src/project/site.config.ts
src/project/client-readiness.config.ts
src/project/collections/Leads.ts
src/project/collections/LeadDeliveries.ts
src/project/collections/Media.ts
src/project/jobs/queues.ts
src/project/jobs/registry.ts
src/core/ingest/feed-normalization.ts
src/core/ingest/feed-ingest.ts
src/core/ingest/yrl-parser.ts
src/core/leads/intake.ts
src/core/leads/outbox.ts
src/core/security/safe-outbound-client.ts
src/core/seo/structured-data.tsx
src/core/cache/invalidator.ts
src/core/cache/http-revalidate.ts
src/app/robots.ts
src/app/(site)/obekty/[slug]/page.tsx
src/app/http/property-lifecycle/[slug]/route.ts
src/proxy.ts
src/app/globals.css
packages/ui/components.json
packages/ui/package.json
docs/PROJECT.md
docs/03_ARCHITECTURE.md
docs/DESIGN.md
docs/OPERATIONS.md
docs/CONTRACT_FEASIBILITY.md
docs/CLONE_ONBOARDING.md
docs/AMS_MASTER_PLAN_6_STARTER_FINAL_FREEZE.md
```

## Additional audit

Owner-provided additional audit dated `2026-09-21`, reconciled in section 4 rather than copied blindly.

## UI constitution

```text
AMS UI CORE v5.0
```

Canonical rules applied:

```text
REUSE → VARIANT → CREATE
shadcn/ui = canonical primitive foundation
globals.css = design value source of truth
Server Components default
Design Drift Audit = report first
```

## Version-sensitive official evidence checked

Payload official releases:

```text
https://github.com/payloadcms/payload/releases
```

Payload `v3.90.0` release dated 2026-09-18 states that the release contains critical security fixes and recommends upgrading as soon as possible.

Next.js official Proxy documentation:

```text
https://nextjs.org/docs/app/api-reference/file-conventions/proxy
```

Lucide official releases:

```text
https://github.com/lucide-icons/lucide/releases
```

The active Lucide release line is `1.x`; do not downgrade based on an outdated `0.4xx` assumption.

---

# 11. FINAL FOUR-PASS AUDIT — EXACT v2

## Logic / Completeness

- Все F-01…F-16 имеют owning epic и observable acceptance.
- Plan №6 не переоткрывается; он используется только как baseline/evidence.
- Production и freeze tag исключены из Developer execution.
- `BLOCKER findings = 0`; orphan outcomes = `0`.

## Architecture / Data / Security

- Payload остаётся единственным schema/auth/migration owner; Prisma и второй backend не добавляются.
- Payload target `3.90.1` подтверждён official releases на `2026-09-21`;
  migration и applicability matrix обязательны в EPIC-01.
- Currency, XML parser, JSON-LD, consent/idempotency, access и outbound/IP findings
  подтверждены текущим source на exact audited head.
- Starter topology остаётся local PostgreSQL + `MEDIA_DIR`; client S3 activation
  выполняется только внутри clone workflow.

## Dependencies / Autonomy

- Cycles: `0`.
- EPIC-02…11 не имеют ложных HARD dependencies между собой.
- EPIC-12 ждёт runtime epics, EPIC-13 ждёт полный candidate, EPIC-14 ждёт final proof.
- Локально заблокированный EPIC освобождается; Developer выбирает другой READY epic.
- Один active writer исключает shared-file/worktree conflicts.

## Executability / Evidence / Delivery

- Все implementation epics имеют risk, acceptance, checks, delivery и stop conditions.
- Несуществующая команда `verify:safe-outbound` удалена; safe-outbound proof входит
  в существующий `verify:security-boundaries` command graph.
- COMMERCIAL delivery использует один exact-head SourceCraft STANDARD/RISKY Gate
  на epic PR head; GitHub остаётся mirror-only.
- Required DB suites fail closed на isolated `DATABASE_URI_TEST`; production DB запрещена.

# 12. FINDING REGISTER

| ID | Severity | Finding | Resolution |
|---|---|---|---|
| MP7-A01 | BLOCKER | v1 объявлял `READY FOR IMPLEMENTATION` без Architect readiness и owner approval | `RESOLVED`: v2 `READY_FOR_OWNER_APPROVAL`; import/handoff запрещены до точной owner phrase |
| MP7-A02 | MAJOR | graph показывал ложный EPIC-01 → EPIC-02 edge и одновременно называл EPIC-03…12 независимыми | `RESOLVED`: минимальный DAG и dependency matrix в §5 |
| MP7-A03 | MAJOR | финальная docs reconciliation не зависела явно от всех runtime epics | `RESOLVED`: EPIC-12 зависит от merge EPIC-01…11 |
| MP7-A04 | MAJOR | EPIC-03 требовал отсутствующий package script `verify:safe-outbound` | `RESOLVED`: существующий aggregated security command является canonical proof |
| MP7-A05 | MAJOR | Payload security upgrade не требовал applicability register всех official 3.90 change notes | `RESOLVED`: matrix добавлена в TASK-01-01 |
| MP7-A06 | MAJOR | отсутствовали final audit, owner register и Night Run Readiness | `RESOLVED`: §11–15 |

# 13. OWNER DECISION REGISTER

## Before approval

Открытых продуктовых решений: `0`.

Требуется только формальное утверждение exact Plan №7 v2 фразой
`План утверждён` / `План утвержден`. Оно разрешает APPROVED snapshot, Beads
import/reconcile и Developer handoff, но не production и не freeze tag.

## Later gates

- Реальные retention/legal/domain/storage credentials остаются client-project gates,
  а не решениями starter implementation.
- Создание `starter-freeze-v2` требует отдельной явной команды после EPIC-14.

# 14. MASTER PLAN AUDIT STATUS

```text
Exact version: v2
Logic/completeness: blockers 0; major open 0
Architecture/data/security: blockers 0; major open 0
Dependency/autonomy: cycles 0; independent implementation pool = EPIC-01…11
Executability/evidence: 14/14 epics have deterministic outcome/acceptance
Unknown critical prerequisites: 0
Owner decisions before approval: 0
Production actions in implementation: 0
Result: PASS — READY_FOR_OWNER_APPROVAL
```

# 15. NIGHT RUN READINESS

```text
Independent ready work after approval:
  EPIC-01…11; priority starts with EPIC-01, then P0/P1 security/data findings

Critical path:
  all implementation merges → EPIC-12 → EPIC-13 → EPIC-14

Single blocking points:
  EPIC-12/13/14 are intentionally final serial gates
  SourceCraft permission or exact-head Gate failure blocks only delivery of the current epic

Safe work if one epic blocks:
  release claim, record blocker, choose another EPIC-02…11 READY task

Expected stops:
  incompatible Payload schema rewrite, unsafe/missing test DB, new P0,
  secret/credential need, changed exact SHA, failed gate, production/freeze request

Result: READY_WITH_LIMITS
Limit: one Developer/one active worktree serializes actual writes even though the
dependency graph exposes independent READY work. Final docs and proof gates are
unavoidably sequential because they bind one merged exact SHA.
```

# 16. REVISION HISTORY

| Version | Status | Date | Input | Result |
|---|---|---|---|---|
| v1 | DRAFT | 2026-09-21 | owner-provided Plan №7 + additional audit | исходная основа принята; статус implementation не признан approval |
| v2 | APPROVED | 2026-09-21 | final four-pass audit, repository/source verification, official Payload releases, explicit owner approval | DAG исправлен, checks reconciled, Payload target `3.90.1`, audit PASS; Task Manager import and Developer handoff authorized |

# 17. APPROVAL AND FINAL HANDOFF TO CODEX / TASK MANAGER

Owner approval exact v2 получен `2026-09-21T21:28:39+03:00`.

```text
Task Manager import: AUTHORIZED
Developer handoff: AUTHORIZED AFTER CLEAN RECONCILIATION
production: NOT ALLOWED
freeze tag: NOT ALLOWED
```

После approval exact v2 Architect меняет статус на `APPROVED`, выполняет
Validate → Init → Import → Reconcile и запускает одну Codex goal для Developer.

Execution instruction:

```text
Read this Plan №7 as the current implementation plan.

Do not reopen completed Plan №6 history except as evidence.

Resume `in_progress`; иначе брать один safe READY epic. EPIC-01 имеет первый
priority. Если он blocked по собственному stop condition, продолжить другой
независимый EPIC-02…11. EPIC-12, EPIC-13 и EPIC-14 соблюдать как serial gates.

For each EPIC:
1. sync canonical SourceCraft main;
2. create a fresh branch/worktree;
3. implement only the EPIC scope;
4. run the listed checks;
5. fix all blockers;
6. commit;
7. create SourceCraft PR;
8. run exactly one required exact-head STANDARD/RISKY Gate;
9. merge only on PASS;
10. record merge SHA/evidence;
11. fast-forward GitHub mirror only after canonical SourceCraft merge;
12. continue from the new main.

Do not deploy production.
Do not create starter-freeze-v2.
Final freeze tag requires a separate explicit owner command after EPIC-14.
```

# AMS REALTBASE — PROJECT ARCHITECTURE & DEVELOPMENT PLAN

**Статус:** v1.0 — финальный проектный мастер-план  
**Продукт:** AMS RealtBase  
**Профиль:** `AMS_PROFILE=REALTY_BASE`  
**Архитектурный стандарт:** AMS Realty Platform Core Standard 5.5 — Solo + AI  
**Модель:** solo owner / project manager + AI  
**Primary repository:** SourceCraft  
**Назначение:** каноническая базовая платформа AMS для сайтов агентств недвижимости с каталогом, Payload Admin, безопасным multi-feed импортом и надёжной доставкой лидов.

## Delivery Profile

```text
DELIVERY_PROFILE = COMMERCIAL
```

Профиль выбран владельцем 2026-09-15. До merge обязателен один ручной exact-head SourceCraft Gate класса `STANDARD` или `RISKY` по фактическому риску изменения. Push и создание Pull Request не запускают CI автоматически; production выпускается только отдельной командой владельца.

---

# 0. Ключевое решение

AMS RealtBase не создаётся копированием Atlas Realty.

Atlas используется как:

```text
UI donor
UX reference
visual reference
source проверенных presentation patterns
source проверенного XML/YRL mapping и normalized data shapes
```

Техническая часть создаётся с чистого состояния по Core 5.5, но уже доказанные
Atlas contracts, XML/YRL mapping, parser behavior и tests используются как
обязательный implementation baseline. Повторно изобретать их запрещено.

Порядок:

```text
ATLAS UI
→ UI INVENTORY
→ VISUAL BASELINE
→ PRESENTATION CONTRACTS
→ UI PACKAGE
→ FIXTURE WEBSITE
→ CONTRACT FEASIBILITY REVIEW
→ CONTRACT FREEZE v1
→ PAYLOAD FOUNDATION FROM ZERO
→ PUBLIC GATEWAY
→ IMPORT / JOBS / LEADS
→ PRODUCTION
```

Основной принцип:

> backend реализует утверждённые presentation contracts; внутреннее устройство Payload не диктует форму UI.

---

# 1. Профиль продукта

Типовой проект:

```text
15–50 страниц
300–1 000 объектов типично
до ~2 000 active inventory records в REALTY_BASE
несколько XML/YRL feed sources
Payload Admin
1–2 admin users
формы заявок
MAX / Telegram / CRM integrations
Managed PostgreSQL
Timeweb S3
низкая/средняя посещаемость
```

Позже без переписывания foundation могут подключаться:

```text
новостройки
ЖК
корпуса
планировки
застройщики
шахматка
сотрудники
журнал
внутренняя аналитика
дополнительные lead channels
feed-image mirror
```

---

# 2. Что переносится из Atlas

## 2.1 Переносится

```text
layout
Header
Footer
navigation
commercial page compositions
catalog UI
filters
PropertyCard
property detail
forms
dialogs
gallery
responsive behavior
mobile patterns
accessibility patterns
shadcn primitives
presentation formatters
presentation DTO expectations
```

## 2.2 Не переносится автоматически

```text
Payload schema
Payload config
migrations
SiteEngine
Atlas jobs topology
Atlas worker topology
Atlas deployment scripts
50k-specific optimizations
prepared facet infrastructure
Atlas lead routing
tenant-specific data
demo data
legacy Core 4 docs
```

Atlas data-access не копируется целиком, но его public DTO mapping, query behavior
и field allowlists являются проверяемым baseline для соответствующих частей Base.
Отклонение допускается только если Core 5.5 требует более строгого решения или
если оно явно зафиксировано в feasibility map.

## 2.3 Atlas XML/YRL и data baseline

Канонический donor: SourceCraft `integrator-p/atlas-realty-starter`, exact
`main@4fc5d8a2cfcd29b1431ce9541db72ba0280a4cbe`.

До реализации schema/import/Public Gateway обязательно проверить и использовать:

```text
src/core/ingest/yrl-parser.ts
src/shared/types/feed-import.ts
src/project/ingest/registry.ts
src/payload/collections/Properties.ts
src/core/data-access/ingest/property-import.ts
src/core/data-access/public/queries.ts
src/core/query/public-selects.ts
tests/fixtures/yrl-secondary.xml
tests/fixtures/yrl-newbuild.xml
tests/unit/import-stage1.unit.spec.ts
tests/int/import-stage1.int.spec.ts
```

Порядок источников для формы XML-полей и mapping:

```text
Atlas exact donor implementation and fixtures
→ текущий CONTRACT_FEASIBILITY и Base DTO
→ официальный YRL как compatibility/validation reference
→ отложенное решение только для поля, которого действительно нет в Atlas и donor feed
```

Перенос «один в один» означает сохранение доказанного поведения и field mapping,
а не копирование всего repository. Security boundaries, Payload ownership и
REALTY_BASE capacity contract остаются по Core 5.5.

---

# 3. Визуальная стратегия

Цель:

```text
VISUAL PARITY WITH ATLAS
+
ARCHITECTURAL CLEANUP
```

Это не редизайн.

Допустимы только:

```text
owner-approved visual changes
```

Нормализация токенов, перенос в package form и очистка CSS сами по себе не дают права менять внешний вид.

---

# 4. Visual baseline

До extraction снимается visual baseline Atlas.

Representative routes:

```text
/
catalog
property detail
commercial service page
contacts
lead form / modal
```

Viewport baseline:

```text
mobile
tablet
desktop
wide desktop
```

Предпочтительный путь:

```text
local Atlas
→ isolated DB/env
→ deterministic seed/fixture
→ screenshots
```

Fallback, если локальный запуск Atlas неоправданно дорог:

```text
deployed Atlas reference environment
→ fixed exact release/SHA
→ screenshots
```

Выбор local/live фиксируется до начала EPIC 1.

Неподтверждённый visual diff считается regression.

---

# 5. Design System

Единственный source of truth design values:

```text
src/app/globals.css
```

Там находятся:

```text
colors
surfaces
typography scales
font weights
radii
containers
section rhythm
easing
shadcn mappings
fonts
```

Другие CSS-файлы допускаются для layout geometry:

```text
grid
flex
positioning
sizing relations
responsive composition
```

Но design values получают только через:

```css
var(--*)
```

Component-specific design literals вне `globals.css` запрещены.

---

# 6. Package architecture

Используется Package Form:

```text
packages/
  ui/
  contracts/
```

## 6.1 `packages/ui`

Содержит:

```text
shadcn primitives
layout
shared presentation
realty domain UI
page views
interactive leaves
presentation formatters
```

Не содержит dependencies:

```text
payload
@payloadcms/*
pg
ORM / DB clients
project persistence
```

## 6.2 `packages/contracts`

Содержит:

```text
DTO
serializable contracts
presentation enums
minimal validators
```

Не содержит:

```text
Payload types
DB types
project persistence
Next server runtime implementation
```

---

# 7. Workspace ownership

Корневой `package.json`:

```text
Next application
+
pnpm workspace root
```

Canonical shadcn owner:

```text
packages/ui/components.json
```

Второй независимый primitive tree не создаётся.

Root может иметь wrapper command:

```bash
pnpm ui:shadcn
```

но destination primitives остаётся `packages/ui`.

---

# 8. Tailwind 4 + workspace

Поскольку UI находится вне `src`, `src/app/globals.css` явно объявляет UI source:

```css
@import "tailwindcss";
@source "../../packages/ui/src";
```

Точный относительный путь проверяется по фактической структуре.

В `next.config.ts`:

```ts
transpilePackages: [
  '@ams/realtbase-ui',
  '@ams/realtbase-contracts',
]
```

Production build обязан доказать:

```text
Tailwind видит packages/ui
client boundaries packages/ui работают
классы UI не исчезают после build
```

---

# 9. Presentation contracts

Первый flow:

```text
Fixture Provider
→ Contracts
→ UI
```

После backend:

```text
Public Gateway
→ Contracts / DTO
→ UI
```

Переход fixture → Payload не меняет public UI API.

---

# 10. Contract freeze

Создаётся:

```text
packages/contracts/contracts.lock.json
```

Минимальный формат:

```json
{
  "schemaVersion": 1,
  "contractVersion": "1.0.0",
  "state": "frozen",
  "algorithm": "sha256",
  "files": [],
  "aggregateSha256": ""
}
```

`files` содержит отсортированные относительные пути и SHA-256.

Aggregate hash считается детерминированно по manifest.

---

# 11. Contract commands

```bash
pnpm contracts:check
pnpm contracts:lock
pnpm contracts:diff
pnpm contracts:freeze
```

`pnpm verify` обязательно вызывает:

```bash
pnpm contracts:check
```

Изменение frozen contract без version bump/ADR/lock update блокирует merge.

---

# 12. Contract lifecycle

До freeze:

```text
state = draft
version = 0.x
```

После acceptance fixture website:

```text
state = frozen
version = 1.0.0
tag = contracts-v1
```

После `contracts-v1`:

```text
owner decision
+ ADR
+ contract version bump
+ lock regeneration
+ compatibility review
```

Versioning:

```text
breaking shape change → major
backward-compatible addition → minor
implementation-only correction → patch
```

---

# 13. Contract feasibility gate

Контракты нельзя замораживать только потому, что UI отрендерился на fixtures.

До `contracts-v1` создаётся:

```text
docs/CONTRACT_FEASIBILITY.md
```

Для каждого DTO-поля:

| DTO | Field | Source | Computation | Query cost | Available in base schema? | Action |
|---|---|---|---|---|---|---|

Допустимые источники:

```text
direct property field
related base collection field
cheap deterministic computation
bounded aggregate
future module only
```

Freeze запрещён, если:

```text
у DTO field нет источника
или
источник требует ещё не принятую schema change
или
стоимость query неясна
или
field требует speculative infrastructure
```

Gateway EPIC реализует уже проверенную feasibility map.

---

# 14. Contracts v1

Base:

```text
PropertyCardDTO
PropertyDetailsDTO
PropertyListDTO
PropertyFilterDTO
MediaDTO
SiteHeaderDTO
SiteFooterDTO
BreadcrumbDTO
PageSEOContract
LeadFormContext
```

Journal не входит в `contracts-v1` автоматически.

Journal contracts живут отдельно:

```text
packages/contracts/src/journal/
```

и имеют собственное состояние:

```text
draft
```

до отдельного Journal fixture/module proof.

---

# 15. Facet decision gate

В EPIC 1 фиксируется:

```text
filters only
или
filters + counts
```

Если counts являются частью UX, они включаются в `PropertyFilterDTO` до freeze.

Для REALTY_BASE:

```text
bounded PostgreSQL/Payload aggregate queries
```

Не создаются заранее:

```text
facet-cache
Redis
search engine
prepared read model
```

---

# 16. Media strategy

Base policy:

```text
MANUAL / CMS MEDIA
→ Payload Media
→ Timeweb S3

FEED IMAGES
→ external URLs by default
```

Feed-image mirroring в S3 — отдельный future module.

---

# 17. MediaDTO

Presentation contract storage-neutral:

```ts
type MediaDTO = {
  kind: 'external' | 'managed'
  src: string
  alt: string
  width?: number
  height?: number
}
```

UI не знает, откуда физически пришло изображение.

---

# 18. External feed image contract

Каждый feed image URL:

```text
validated
→ HTTPS by default
→ host checked against approved EXTERNAL_IMAGE_HOSTS
```

Если host не разрешён:

```text
объект импортируется
конкретное изображение отбрасывается
import-issue:
  code = image_host_not_allowed
  severity = warning
```

Импорт целиком не падает из-за одной запрещённой картинки.

---

# 19. Next Image exception

`next/image` optimization внешнего URL делает outbound request внутри Next image optimizer.

Это отдельный approved transport exception:

```text
Safe Outbound Client rule
→ относится к application-controlled configurable outbound HTTP

Next image optimizer
→ допускается только через exact next/image remotePatterns
```

`remotePatterns` является allowlist boundary для image optimizer.

Wildcard hosts запрещены.

Guard обязан явно различать эти два случая и не маркировать `next/image` optimizer как нарушение Safe Outbound Client.

---

# 20. Image host deployment semantics

`remotePatterns` является build-time configuration.

Поэтому:

```text
изменение EXTERNAL_IMAGE_HOSTS
→ config review
→ application rebuild
→ release
```

Обычный restart недостаточен.

Новый feed с новым image host не считается полностью production-ready до release с обновлённым `remotePatterns`.

`PROJECT.md` фиксирует approved image hosts.

---

# 21. Feed image mirror module

Активируется только при trigger:

```text
нестабильный external image host
LCP proof не проходит
клиенту нужен media ownership
короткий TTL provider media
нужен watermark/processing
нужна guaranteed retention
```

Module определяет:

```text
download job
hash deduplication
S3 quota
reference tracking
archive retention
orphan cleanup
retry policy
```

---

# 22. Canonical public URL map

## Base

```text
/                                      главная
/nedvizhimost                          каталог
/obekty/[slug]                         объект

/uslugi                                услуги
/o-kompanii                            о компании
/ipoteka                               ипотека
/prodat                                продать
/sdat                                  сдать
/kontakty                              контакты

/politika-konfidencialnosti
/soglasie-na-obrabotku-personalnyh-dannyh
```

## Reserved newbuild

```text
/novostroyki
/novostroyki/[complexSlug]
/novostroyki/[complexSlug]/shahmatka
```

## Reserved employees

```text
/sotrudniki
/sotrudniki/[agentSlug]
```

## Reserved journal

```text
/journal
/journal/[slug]
/journal/*
```

Reserved namespace нельзя занимать unrelated route/CMS page.

---

# 23. Canonical stack

```text
Next.js App Router
React
TypeScript strict

Payload CMS
@payloadcms/db-postgres

PostgreSQL

Zod
pnpm

Tailwind CSS 4.x
shadcn/ui
Lucide

Payload Jobs
Timeweb S3

streaming SAX XML parser

Nginx
SourceCraft
```

Не используются без trigger:

```text
Redis
broker
PostGIS
Elasticsearch
отдельный backend
dedicated jobs runner
второй ORM
вторая UI library
```

---

# 24. Repository structure

```text
src/
  app/
    (site)/
    (payload)/
    api/
      public/
      internal/
    globals.css

  core/
    access/
    data-access/
      public/
      system/
      ingest/
    dto/
    query/
    cache/
    security/
      outbound-http/
      redaction/
    ingest/
      parsers/
    media/
    observability/
    lib/

  project/
    collections/
    globals/
    fields/
    ingest/
    modules/
    project.config.ts
    env.ts

packages/
  ui/
    components.json
    src/

  contracts/
    contracts.lock.json
    package.json
    src/

docs/
  PROJECT.md
  OPERATIONS.md
  DESIGN.md
  CONTRACT_FEASIBILITY.md
  adr/

migrations/
tests/
scripts/
```

---

# 25. Hosting model

## AMS RealtBase reference instance

```text
AMS VPS
+ internal domain
+ separate Managed PostgreSQL
+ separate S3
+ noindex
```

## Client default

```text
ONE CLIENT
=
ONE APPLICATION VPS
+
ONE MANAGED POSTGRESQL
+
ONE S3 BUCKET
+
OWN DOMAIN
+
OWN SECRETS
```

Shared VPS для нескольких клиентов не является baseline.

Допускается только после:

```text
capacity proof
CPU/RAM budget
process isolation
backup boundaries
monitoring
owner decision
```

---

# 26. Production topology

```text
Internet
↓
Nginx
↓
Next.js + Payload + Payload Jobs autoRun
↓
Timeweb Managed PostgreSQL

Payload Media
↓
Timeweb S3
```

REALTY_BASE:

```env
JOBS_AUTORUN=true
```

только у одного jobs owner.

---

# 26A. Managed PostgreSQL connection pool

Один REALTY_BASE runtime обслуживает одновременно:

```text
public requests
Payload Admin
autoRun system queue
imports
maintenance
lead deliveries
```

Поэтому размер pool не оставляется framework/provider default без решения.

`PROJECT.md` фиксирует:

```text
databasePoolMax
provider connection limit
reserved operational headroom
```

Стартовое значение выбирается после проверки лимита конкретного Timeweb Managed PostgreSQL instance.

Правило:

```text
application pool max
< provider hard connection limit
```

с запасом для migrations, diagnostics и provider operations.

Увеличение queue concurrency без пересмотра pool budget запрещено.

Production-like load proof включает отсутствие pool exhaustion при одновременном:

```text
public catalog requests
1 running import
maintenance activity
lead delivery
Admin read
```

---

# 27. Base collections

```text
users
pages

properties

feed-sources
import-runs
import-issues

media

leads
lead-deliveries

redirects
```

Не создаются заранее:

```text
residential-complexes
buildings
layouts
developers
agents
posts
```

---

# 28. Property model

```text
Identity
  feedSource
  externalId
  origin: feed | manual
  importHash
  firstSeenAt
  lastSeenAt
  lastImportRun

External grouping
  externalComplexId
  externalComplexName
  externalBuildingId
  externalLayoutId

Lifecycle
  status: active | archived
  deactivatedAt
  deactivatedByRun
  needsReview
  publishedAt
  contentPurgedAt
  slug

Classification
  market: secondary | newbuild
  category: apartment | house | land | commercial
  dealType: sale | rent

Money
  priceMinor
  currency
  pricePerMeterMinor

Parameters
  rooms
  totalArea
  livingArea
  kitchenArea
  floor
  floors

Location
  region
  locality
  district
  street
  house
  publicAddress
  lat
  lng

Content
  title
  description
  images

Manual ownership
  manualOverrides[]

Private
  unitNumber
  cadastralNumber
  internalComment
  ownerContact
```

---

# 29. Property identity constraint

Feed inventory обязательно защищён DB-level identity constraint:

```text
UNIQUE (feedSource, externalId)
WHERE origin = 'feed'
```

Ручной объект:

```text
origin = manual
feedSource = null
externalId = null допустим
```

Feed object:

```text
origin = feed
feedSource required
externalId required
```

Ingest не полагается только на application-level lookup.

Partial unique index не считается декларативно гарантированным Payload field config.

Для `@payloadcms/db-postgres` canonical implementation:

```sql
CREATE UNIQUE INDEX properties_feed_identity_uniq
ON properties (feed_source_id, external_id)
WHERE origin = 'feed';
```

Этот индекс создаётся явной reviewed migration и проверяется `pnpm verify:schema`. Codex не должен искать или изобретать несуществующий declarative Payload option для partial unique.

---

# 29A. Property slug policy

Slug является публичной identity страницы, а не производным полем, которое можно пересчитывать на каждом import.

Для `origin=feed` при первом создании:

```text
preferred slug base
= normalized semantic title/location where available

collision suffix
= stable short fragment derived from feedSource + externalId
```

Точный algorithm должен быть deterministic и покрыт тестами.

Инварианты:

```text
после первой публикации slug immutable by import
изменение title/address/feed text slug не ротирует
коллизии разных feeds дают разные stable slugs
```

Slug не входит в обычный `manualOverrides`, потому что после первой публикации он уже system-frozen.

Явное изменение published slug допускается только owner-действием:

```text
old slug
→ explicit redirect record
→ new slug
```

Без redirect published slug не изменяется.

---

# 30. Manual field ownership

`manualOverrides[]`:

```text
field
setAt
setBy
```

При ручной правке import-managed field:

```text
manualOverrides add/update field
```

При import:

```text
field in manualOverrides
→ incoming feed value ignored
```

Если incoming value отличается:

```text
import-issue:
  code = manual_override_conflict
```

Owner может явно вернуть поле под feed ownership.

---

# 31. Money policy

Для каждого проекта по умолчанию:

```text
ONE CURRENCY
```

Currency фиксируется в `PROJECT.md`.

Multi-currency каталог не является REALTY_BASE default и требует отдельного решения.

Money:

```text
integer minor units
```

`pricePerMeterMinor` не вычисляется из цены и площади. Поле заполняется только
из явно переданного source-поля совместимого feed adapter; для базового YRL без
такого значения остаётся `null` и не показывается в UI.

Округление:

```text
banker's rounding / round-half-to-even
```

UI и ingest price-per-meter не пересчитывают.

---

# 32. Newbuild readiness

Base хранит:

```text
market
externalComplexId
externalComplexName
externalBuildingId
externalLayoutId
```

с первого import, если feed их предоставляет.

Newbuild collections активируются позже expand migration.

---

# 33. Feed sources

```text
code
title
parser
market
feedUrlRef
enabled

refreshIntervalMinutes
nextDueAt

lastAttemptAt
lastSuccessfulRunAt
lastFullRunAt

consecutiveFailures

safetyThresholdPercent
maxDeactivationsPerRun
lastOfferCount

lastEtag
lastModified
lastFeedHash

deactivationApproval:
  runId
  approvedBy
  approvedAt
  expiresAt
  consumedAt
```

`market` authoritative для imported properties.

---

# 33A. Feed source lifecycle

Feed source не hard-delete'ится, пока существуют связанные imported properties.

Delete contract:

```text
feed source has related properties
→ beforeDelete blocks deletion
→ explicit operator error
```

DB relation не должна молча каскадно удалять inventory и не должна оставлять broken orphan relation.

Отключение:

```text
enabled=false
→ dispatcher больше не запускает source
→ существующие properties остаются как есть
→ никакая mass archive автоматически не выполняется
```

Если owner хочет снять весь inventory отключённого источника:

```text
explicit owner action
→ source-scoped deactivation plan
→ показать planned count
→ approval bound to concrete operation/run
→ применить те же absolute/safety gates
→ audit result
```

Отключение source само по себе никогда не означает «архивировать всё».

---

# 34. Feed failure retry policy

Dispatcher claim advance `nextDueAt` не должен заставлять ждать полный refresh interval после transient failure.

При `failed`:

```text
consecutiveFailures += 1
```

Если failure retryable и лимит consecutive failures не превышен:

```text
nextDueAt = now + min(refreshIntervalMinutes, 15 minutes)
```

Default immediate-recovery limit:

```text
3 consecutive retryable failures
```

После лимита:

```text
обычный interval scheduling
+
operational alert
```

Successful/unchanged run:

```text
consecutiveFailures = 0
```

Permanent configuration failure может сразу переходить в alert path без частого retry.

---

# 35. Import runs

Fields:

```text
feedSource

status:
  queued
  running
  success
  unchanged
  suspicious
  interrupted
  failed

queuedAt
jobId

startedAt
heartbeatAt
finishedAt

streamCompleted

offerCount

createdCount
updatedCount
unchangedCount
skippedCount

plannedDeactivationCount
deactivatedCount

feedHashObserved
etagObserved
lastModifiedObserved

deactivationDecision:
  not-applicable
  allowed
  blocked
  approved

approvalUsed

cacheInvalidationStatus:
  not-requested
  success
  warning
  failed

durationMs

errorCode
redactedSummary
```

---

# 36. Unchanged baseline rules

`unchanged` означает:

```text
304
или
200 + same lastFeedHash
```

При `unchanged` обновляются:

```text
lastAttemptAt
lastSuccessfulRunAt
lastEtag, если пришёл новый/валидный
lastModified, если пришёл новый/валидный
```

Не обновляются:

```text
lastOfferCount
lastFullRunAt
```

`lastFeedHash` не меняется на новый semantic baseline, если business content не менялся.

Safety baseline всегда происходит только от полного successful parsed run.

---

# 37. Import issues

```text
importRun
feedSource

severity:
  warning
  critical

code

externalId?
field?

occurrenceCount

sampleValueRedacted?
messageRedacted

createdAt
```

Raw XML fragments, PII, credentials не хранятся.

Repeated issue:

```text
same run + code + field
→ occurrenceCount
```

---

# 38. Import pipeline

```text
dispatcher
→ conditional feed claim
→ import-run queued
→ enqueue importFeed
→ Safe Outbound Client
→ conditional GET
→ streaming parser
→ Zod normalization
→ Ingest Gateway
→ safe deactivation
→ cache invalidation
→ import report
```

---

# 39. Safe deactivation

Разрешается только если:

```text
stream completed
no critical structural error
source enabled
identity valid
run not interrupted
source scope valid
count >= percentage threshold
plannedDeactivations <= maxDeactivationsPerRun
```

Первый full run:

```text
creates baseline
does not mass deactivate
```

Suspicious:

```text
no automatic deactivation
previous catalog remains
```

Approval:

```text
one run
one use
TTL
consumedAt
```

---

# 40. Import stale threshold

Для feed source используется выборка последних успешных полных runs.

Default sample:

```text
last 10 successful full runs
```

Observed duration:

```text
median(durationMs)
```

Stale threshold:

```text
max(
  15 minutes,
  3 × median(last 10 successful full durations)
)
```

Если успешной истории нет:

```text
15 minutes
```

Project может увеличить threshold для реально долгого feed.

---

# 41. Cache foundation

Создаётся до import engine:

```text
src/core/cache/invalidator.ts
```

Contract:

```ts
invalidate(targets: CacheTarget[]): Promise<void>
```

Base:

```text
HTTP
```

Optional:

```text
in-process
```

только после targeted proof.

---

# 42. HTTP invalidation

```text
job
→ POST internal revalidation endpoint
→ Next runtime
→ revalidateTag / revalidatePath
```

Required:

```text
REVALIDATE_SECRET
POST only
validated target allowlist
rate limit
secret-safe logs
```

Top-level `next/cache` запрещён внутри:

```text
core/cache
core/ingest
job handlers
```

---

# 43. Jobs configuration

Обязательно:

```ts
jobs: {
  enableConcurrencyControl: true,

  autoRun: [
    {
      cron: '* * * * *',
      queue: 'system',
      limit: 5,
      disableScheduling: false,
    },
    {
      cron: '* * * * *',
      queue: 'imports',
      limit: 1,
      disableScheduling: true,
    },
    {
      cron: '* * * * *',
      queue: 'maintenance',
      limit: 5,
      disableScheduling: false,
    },
    {
      cron: '* * * * *',
      queue: 'lead-deliveries',
      limit: 10,
      disableScheduling: true,
    },
  ],

  shouldAutoRun: async () =>
    process.env.JOBS_AUTORUN === 'true',
}
```

Для REALTY_BASE imports default:

```text
limit = 1
```

Увеличение до `2` допускается только после CPU/RAM/latency proof.

---

# 44. Queue ownership

```text
system
→ static schedules

maintenance
→ static schedules

imports
→ programmatic enqueue only

lead-deliveries
→ programmatic enqueue only
```

Одна queue не получает schedules одновременно из autoRun и CLI scheduler.

---

# 44A. Canonical task registry

Task slugs являются стабильными application contracts и не придумываются заново в каждом handler.

| Queue | Task slug | Trigger / schedule | Responsibility |
|---|---|---|---|
| `system` | `dispatchDueFeeds` | static, `*/5 * * * *` | найти due feeds, conditional claim, создать queued run, enqueue `importFeed` |
| `imports` | `importFeed` | programmatic | скачать/распарсить feed, ingest, safety gates, report, invalidate cache |
| `maintenance` | `jobsJanitor` | static, project-defined default every 5m | stale/orphan import inspection и trusted recovery |
| `maintenance` | `leadRetentionCleanup` | static, default daily | delete/anonymize expired leads + linked deliveries atomically/consistently |
| `maintenance` | `catalogLifecycle` | static, default daily | archive-retention evaluation, content purge, `contentPurgedAt`, redirect/410 lifecycle |
| `maintenance` | `recoverLeadDeliveries` | static, default every 5m | recover stale `sending` и orphan due `pending` deliveries |
| `lead-deliveries` | `deliverLead` | programmatic | claim one delivery, call adapter, record result/backoff/requeue |

Точные static cron values кроме dispatcher фиксируются в `PROJECT.md`; default выше используется для RealtBase reference implementation и может быть изменён проектом без смены архитектуры.

`catalogLifecycle` является единственным canonical owner перехода:

```text
archived within retention
→ full archived page

retention expired
→ explicit redirect exists ? redirect : purge heavy content
→ set contentPurgedAt
→ 410 when no redirect
```

`leadRetentionCleanup` является canonical owner исполнения lead retention.

---

# 45. Dispatcher

Default:

```text
dispatcher interval = 5 minutes
cron = */5 * * * *
queue = system
```

Due:

```text
enabled=true
AND nextDueAt <= now
```

Next due:

```text
max(
  now + refreshInterval,
  previousNextDueAt + refreshInterval
)
```

Missed intervals не догоняются storm-ом.

---

# 46. Import job

```text
queue = imports
retries = 0

concurrency:
  key = import:feed:<feedSourceId>
  exclusive = true
  supersedes = false
```

Input:

```text
feedSourceId
importRunId
```

---

# 47. Heartbeat / orphan recovery

Heartbeat обновляется вне ingest transaction.

Proof:

```text
long import
→ independent read sees heartbeat advancing
```

Queued orphan threshold:

```text
max(
  15 minutes,
  3 × dispatcherIntervalMinutes
)
```

Pending future `waitUntil` job orphan не считается.

---

# 48. Base indexes

Минимальный initial set определяется реальными queries.

## Feed dispatcher

```text
feed-sources(enabled, nextDueAt)
```

## Inventory identity

```text
partial UNIQUE(feedSource, externalId)
WHERE origin='feed'
```

## Catalog

Рассматриваются:

```text
status
market
category
dealType
priceMinor
rooms
district
externalComplexId
externalBuildingId
externalLayoutId
```

Composite indexes только по query-plan evidence.

## Lead delivery recovery

```text
lead-deliveries(status, nextAttemptAt)
lead-deliveries(status, heartbeatAt)
UNIQUE(lead, channelId)
UNIQUE(idempotencyKey)
```

## Import recovery

```text
import-runs(status, heartbeatAt)
import-runs(status, queuedAt)
```

`verify:schema` проверяет обязательные constraints/indexes.

---

# 49. Public Gateway

Каждая public function:

```text
server-only
overrideAccess=false
explicit depth
explicit select
explicit limit
publication predicate
validated input
DTO output
```

Raw Payload document UI не получает.

---

# 50. Raw Payload REST boundary

Access functions сами по себе не считаются достаточным механизмом различения Public Gateway Local API и anonymous REST.

Используются два эшелона.

## First boundary — edge / routing

На уровне Nginx и/или Next middleware:

```text
anonymous request
→ /api/<business-collection>/*
→ deny / 404
```

При этом сохраняются routes, реально необходимые Payload Admin и auth.

Allowlist определяется по pinned Payload version и фактическому proof.

## Second boundary — Payload access

Collections всё равно имеют explicit access rules:

```text
anonymous writes denied
private fields protected
owner/editor matrix explicit
```

Public website использует application-owned Public Gateway/API path, а не raw business collection REST.

---

# 51. REST boundary proof

До production:

```text
anonymous raw business collection REST → denied
public website → works

Payload Admin:
  login
  navigation
  list
  edit/save
  media upload
  preferences/access routes
→ works
```

Точный route allowlist сохраняется в tests/project security config.

Guard проверяет появление новой publicly reachable business collection route без explicit decision.

---

# 52. Facets

Если `PropertyFilterDTO` содержит counts:

```text
bounded aggregate queries
```

Если performance budget выполняется:

```text
no extra infrastructure
```

Facet cache только после measured bottleneck.

---

# 53. Leads model

`leads` — рабочая business collection и основной PII source системы.

Canonical fields:

```text
Contact
  name
  phoneRaw
  phoneE164
  email?
  message?

Context
  formKind
  sourcePage
  referrer?
  property?

Attribution
  utmSource?
  utmMedium?
  utmCampaign?
  utmContent?
  utmTerm?

Consent
  consentAccepted
  consentVersion
  consentedAt

Agency workflow
  status:
    new
    in_progress
    processed
    rejected

Technical
  idempotencyKey
  createdAt
  updatedAt
```

`phoneRaw` хранится только если он реально нужен для operator/audit UX; canonical integration/dedup representation — `phoneE164`.

При intake:

```text
raw phone
→ strict normalization
→ E.164
→ validation
→ persistence
```

Невалидный номер не создаёт lead/outbox transaction.

`status` отражает работу агентства с заявкой и не смешивается с состоянием доставки во внешние системы. Delivery state живёт только в `lead-deliveries`.

## PII technical metadata

По умолчанию AMS RealtBase **не хранит raw IP address и raw User-Agent в lead record**.

Для anti-spam/rate-limit допустим transient request context и, если действительно нужен устойчивый limiter/fraud marker, необратимый keyed/HMAC fingerprint с отдельным retention contract.

Raw IP/User-Agent начинают персиститься только по отдельному owner/legal decision с:

```text
purpose
retention
access policy
logging policy
```

и соответствующим обновлением `PROJECT.md`.

Lead public DTO запрещён. Read/update/delete — owner policy согласно project access matrix.

---

# 53A. Personal data consent persistence

Факт согласия является частью immutable intake evidence.

Каждая lead-form submission, которая собирает персональные данные, содержит:

```text
consentAccepted = true
consentVersion
consentedAt
```

`consentVersion` — стабильный ID опубликованной версии текста, например:

```text
pd-2026-01
```

Сам юридический текст не дублируется в каждом lead record; repository/content layer хранит versioned consent text source, а lead хранит ссылочную версию.

`LeadFormContext` в Base `contracts-v1` обязан включать:

```text
consentVersion
consentHref
consentRequired
```

Freeze contracts запрещён, пока consent presentation contract не отрендерен и не сопоставлен с persisted lead fields в `CONTRACT_FEASIBILITY.md`.

Изменение юридического текста:

```text
новая версия текста
→ новый consentVersion
```

Существующие leads сохраняют прежнюю версию.

Юридическое содержание текста и применимые основания утверждаются отдельно; архитектура лишь гарантирует versioned persistence факта согласия.

---

# 53B. Lead intake invariant

```text
local persistence first
external delivery async
```

Successful form response зависит от confirmed local lead + applicable delivery-record transaction, а не от MAX/CRM availability.

---

# 54. Anti-spam and lead intake security

Base lead endpoint использует:

```text
honeypot
minimum fill-time check
application rate limit
Nginx rate limit
idempotency key
server-side validation
```

Captcha:

```text
OFF by default
```

Включается только при доказанном abuse trigger.

Если anti-spam отклоняет запрос:

```text
lead transaction НЕ начинается
delivery records НЕ создаются
success response не выдаётся как будто lead сохранён
```

PII/raw form body не логируются.

---

# 55. Transactional outbox

Одна DB transaction:

```text
BEGIN
  insert lead
  insert one lead-delivery per applicable active channel
COMMIT
```

После commit:

```text
enqueue jobs
```

Crash между commit/enqueue:

```text
pending delivery remains
recoverLeadDeliveries requeues it
```

---

# 56. Lead delivery model

```text
lead

channelId
channelKind:
  messenger
  crm

status:
  pending
  sending
  delivered
  failed
  abandoned

attempts
nextAttemptAt
jobId

claimedAt
heartbeatAt
deliveredAt

idempotencyKey
externalRef

lastErrorKind:
  retryable
  permanent

lastErrorRedacted

abandonedReason:
  exhausted
  permanent
  manual

attemptLog[]
```

---

# 57. Delivery constraints

```text
UNIQUE(lead, channelId)
UNIQUE(idempotencyKey)
```

`channelId`:

```text
immutable
never reused for another destination
```

Удаление channel из config не меняет смысл уже созданных delivery rows.

---

# 58. Missing channel adapter policy

Если delivery row существует, но adapter для `channelId` отсутствует:

```text
не throw/retry loop
```

Вместо этого:

```text
lastErrorKind = permanent
status = abandoned
abandonedReason = permanent
append safe attemptLog
alert owner
```

---

# 59. Attempt log limit

Default:

```text
last 20 entries
```

При превышении старые entries compacted/trimmed.

Raw provider request/response не сохраняются.

---

# 60. Deliver lead job

```text
queue = lead-deliveries
retries = 0

concurrency:
  key = delivery:<leadId>:<channelId>
  exclusive = true
  supersedes = false
```

Retry контролируется AMS через `waitUntil`.

---

# 61. Delivery backoff

```text
attempt 1 → immediately
attempt 2 → +1m
attempt 3 → +5m
attempt 4 → +15m
attempt 5 → +60m
attempt 6 → +240m
```

Retryable failure:

```text
increment attempts
safe log
pending
nextAttemptAt
enqueue waitUntil
handler succeeds
```

---

# 62. Delivery idempotency

Canonical key:

```text
lead:<leadId>:channel:<channelId>
```

CRM:

```text
native idempotency where available
externalRef
destination duplicate lookup
```

Messenger timeout может означать:

```text
deliveryCertainty = unknown
```

Residual duplicate risk фиксируется в adapter docs/PROJECT.

---

# 63. Lead channels

Architecture supports:

```text
messenger:
  max
  telegram

crm:
  amocrm
  bitrix24
  custom-webhook
```

RealtBase v1 minimum:

```text
MAX
custom webhook
one production CRM adapter
```

---

# 64. amoCRM credential model

Static:

```text
AMOCRM_BASE_DOMAIN
AMOCRM_CLIENT_ID
AMOCRM_CLIENT_SECRET
AMOCRM_REDIRECT_URI
```

Rotating:

```text
access token
refresh token
expiresAt
```

не хранятся как immutable env-only state.

При amoCRM создаётся encrypted technical credential store.

Raw rotating tokens недоступны Admin.

Encryption key хранится только в secret storage.

Такой механизм требует ADR как encrypted-secret exception.

---

# 65. Bitrix24 / custom

Bitrix24:

```text
BITRIX24_WEBHOOK_URL
```

считается credential.

Custom:

```text
CUSTOM_CRM_WEBHOOK_URL
CUSTOM_CRM_HMAC_SECRET
```

Transport:

```text
HTTPS
HMAC
timestamp
replay window
idempotency key
```

---

# 66. Environment contract

```text
AMS_PROFILE
TZ
JOBS_AUTORUN

DATABASE_URI
DATABASE_POOL_MAX
PAYLOAD_SECRET
NEXT_PUBLIC_SERVER_URL

CACHE_INVALIDATION_MODE
REVALIDATE_SECRET
INTERNAL_REVALIDATE_BASE_URL

S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY

FEED_SOURCE_*
OUTBOUND_ALLOWED_HOSTS
EXTERNAL_IMAGE_HOSTS

LEAD_CHANNELS
LEAD_OUTBOUND_HOSTS

TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

MAX_BOT_TOKEN
MAX_CHAT_ID

CRM_KIND

AMOCRM_BASE_DOMAIN
AMOCRM_CLIENT_ID
AMOCRM_CLIENT_SECRET
AMOCRM_REDIRECT_URI

BITRIX24_WEBHOOK_URL

CUSTOM_CRM_WEBHOOK_URL
CUSTOM_CRM_HMAC_SECRET

INTEGRATION_CREDENTIALS_KEY

ARCHIVE_RETENTION_DAYS
LEAD_RETENTION_DAYS

ALERT_WEBHOOK_URL
```

Retention values обязательны и не имеют silent legal defaults.

---

# 67. Archived property / tombstone

Lifecycle:

```text
active
→ archived
```

Внутри retention:

```text
contentPurgedAt = null
HTTP 200
"не актуально"
noindex
removed from sitemap
alternatives
```

После retention и purge:

```text
contentPurgedAt = timestamp
```

Permanent redirect после archive/retention **не создаётся автоматически по similarity**.

Он существует только если owner или approved deterministic migration явно создал запись в `redirects` после проверки релевантности target.

По умолчанию:

```text
no explicit redirect record
→ 410 after purge
```

Если explicit relevant replacement зарегистрирован:

```text
redirect record
→ permanent redirect
```

Если redirect record отсутствует:

```text
archived
+
contentPurgedAt != null
→ 410 Gone
```

404:

```text
slug never existed / record absent
```

410 и обычный archive различимы по persisted state.

---

# 68. Retention semantics

`ARCHIVE_RETENTION_DAYS` является текущей project policy.

Изменение значения может изменить eligibility существующих archived rows для purge.

Это осознанное следствие и требует owner review.

Если позже понадобится исторически фиксированный срок per row, добавляется `retentionUntil` отдельной migration.

---

# 69. Payload Admin

Base:

```text
Объекты
Заявки
Доставки заявок
Источники фидов
Импорты
Ошибки импорта
Страницы
Медиа
Редиректы
Пользователи
```

Owner operations:

```text
manual import
feed disable/decommission procedure
suspicious approval
manual retry abandoned delivery
jobs diagnostics
```

---

# 70. Security contract

Production minimum:

```text
HTTPS
secure cookies
exact CORS/CSRF origins
CSP
HSTS
nosniff
Referrer-Policy
frame protection
login attempt limit / lockout
Nginx request rate limits
application lead rate limits
no wildcard remote image hosts
```

Secrets:

```text
no Git
no business DB plaintext
no logs
no docs
no browser bundle
```

Logs:

```text
no passwords
no tokens
no cookies
no auth headers
no raw forms
no lead PII
no owner contacts
no credential URLs
no raw integration payloads
```

Redaction centralized.

---

# 71. CSP + Payload Admin

Public routes и Admin могут иметь разные route-aware CSP.

```text
public
→ strict site CSP

/admin
→ pinned-Payload-compatible CSP
```

Глобальное ослабление CSP ради Admin запрещено.

Production-like proof обязателен.

---

# 72. SourceCraft CI enforcement

Локальный `pnpm verify` не является единственной точкой принуждения.

SourceCraft должен иметь exact-head merge gate.

Минимальный pipeline:

```text
checkout exact PR head SHA
→ pnpm install --frozen-lockfile
→ pnpm verify
→ pnpm verify:schema when relevant
→ contract governance check
```

RISKY changes дополнительно запускают targeted tests/proofs.

Push сам по себе не release.

`merge != release`.

Production release — отдельная owner command по exact main SHA.

---

# 73. Mechanical guards

`pnpm verify` и SourceCraft gate покрывают:

```text
1. contracts lock integrity
2. frozen contract governance
3. overrideAccess:true outside System Gateway
4. Local API without explicit access mode
5. raw DB outside approved paths
6. private fields in public DTO/select
7. wildcard CORS
8. configurable application fetch outside Safe Outbound Client
9. next/image optimizer exception only through exact remotePatterns
10. obvious secret exposure
11. top-level next/* in ingest/job/cache graph
12. persistence dependencies inside packages/ui
13. persistence dependencies inside packages/contracts
14. project-authored dark: when disabled
15. design literals outside globals.css
16. Tailwind package source discovery
17. shadcn ownership
18. duplicate primitive foundation
19. raw business REST route exposure regression
20. required DB identity/uniqueness constraints
```

---

# 74. Journal strategy

Journal contracts не входят в Base `contracts-v1`, если не отрендерены.

Default RealtBase v1:

```text
journal contracts = draft
separate journal namespace/version
```

При активации:

```text
fixture UI
→ feasibility map
→ journal contract freeze
→ module implementation
```

Альтернатива — добавить `/journal` и `/journal/[slug]` в fixture milestone до общей freeze, если будет принято owner decision включить Journal presentation в первую версию.

---

# 75. Journal module scope

```text
posts collection
listing
pagination
flat categories/tags
article template
author
related materials
OG image
Article structured data
BreadcrumbList
canonical
Open Graph
sitemap section
cache targets
journal blocks
```

Search и сложная taxonomy не входят в baseline.

Content migration оценивается отдельно от module development.

---

# 76. Module system

Modules:

```text
newbuild
chessboard
employees
journal
feed-image-mirror
analytics
```

Module может включать:

```text
collections
contracts
routes
domain UI
migrations
cache targets
```

Новый production component переводит вопрос в architecture/profile review.

---

# 77. Reverse-port rule

Reusable capability не должна навсегда оставаться только в client repo.

Workflow:

```text
client requirement
→ generic module design in RealtBase
→ contracts
→ implementation
→ tests
→ RealtBase merge/tag
→ activation in client repo
→ client-specific configuration
```

One-off client copy/branding/integration могут остаться только у клиента.

---

# 78. Analytics future module

Base создаёт только seam:

```text
AnalyticsProvider
```

Первый provider:

```text
Yandex Metrika API
```

Local data:

```text
leads
lead source
property relation
delivery state
timestamps
```

Custom analytics DB/backend заранее не создаётся.

---

# 79. Required documentation

```text
docs/PROJECT.md
docs/OPERATIONS.md
docs/DESIGN.md
docs/CONTRACT_FEASIBILITY.md
```

ADR только для труднообратимых решений.

---

# 80. PROJECT.md minimum

```text
project identity
domain
AMS_PROFILE
production / staging
hosting model
enabled modules
canonical URL map
reserved namespaces
feed sources
feed lifecycle/delete policy
parser mapping
refresh intervals
dispatcherIntervalMinutes = 5
feed failure retry policy
safetyThresholdPercent
maxDeactivationsPerRun
approval TTL
feed image policy
approved image hosts
currency
TZ
archiveRetentionDays
leadRetentionDays
consent current version/source
lead channels
channel IDs
routing
host allowlists
retry schedule
credential mapping
cache mode
cache proof
DB / S3
databasePoolMax + provider connection limit
backup / monitoring
Admin access
raw REST edge policy
CSP policy
extended triggers
```

---

# 81. OPERATIONS.md minimum

```text
deploy
rollback
migrations
backup
restore
manual import
suspicious approval
import stale/orphan recovery
payload-jobs diagnostics
catalogLifecycle / 410 purge procedure
leadRetentionCleanup
lead retry/recovery
missing channel adapter recovery
channel outage
amoCRM token recovery if enabled
raw REST allowlist verification
Payload Admin CSP verification
S3/media
staging
monitoring
incident procedure
```

---

# 82. DEVELOPMENT EPICS

## EPIC 0 — Repository & Governance Foundation

```text
create SourceCraft repo
Next.js
pnpm workspace
TypeScript strict
Tailwind 4
AGENTS.md
PROJECT.md
OPERATIONS.md
DESIGN.md
CONTRACT_FEASIBILITY.md
AMS_PROFILE=REALTY_BASE
hosting policy
canonical URL map
media policy
currency policy
packages/ui
packages/contracts
contract lock mechanism
contract commands
SourceCraft exact-head verify pipeline
initial architecture/security guards
raw REST boundary design
```

Acceptance:

```text
governance exists before UI extraction
CI enforces verify/contracts rules
```

## EPIC 1 — Atlas Inventory + Visual Baseline

Перед стартом выбрать local donor baseline или deployed donor baseline.

```text
screenshots
routes inventory
components
primitives
client leaves
CSS
tokens
media
DTO expectations
filters/facet counts
classification: BASE / MODULE / ATLAS-SPECIFIC / LEGACY / DROP
```

## EPIC 2 — Contracts Draft + Feasibility Map

Создать Base DTO draft и заполнить:

```text
DTO field
→ source
→ computation
→ query cost
→ schema availability
```

Отдельно до freeze проверить `LeadFormContext`:

```text
consentVersion
consentHref
consentRequired
formKind
property context where applicable
```

`CONTRACT_FEASIBILITY.md` обязан показать mapping consent UI → persisted `leads.consent*`.

Journal остаётся draft namespace.

## EPIC 3 — UI Package Extraction

```text
primitives
layout
shared
domain
views
interactive leaves
formatters
Tailwind @source
transpilePackages
components.json ownership
```

## EPIC 4 — Design System Normalization

```text
globals.css
token normalization
typography
Container
Section
SectionHeader
buttons
forms
media
motion
page CSS cleanup
```

Acceptance: visual parity, no unapproved drift.

## EPIC 5 — Fixture Website + Contract Freeze

Routes:

```text
/
catalog
property
services
about
mortgage
sell
rent
contacts
legal
404
```

Before freeze:

```text
visual proof
a11y
SEO semantics
facet decision
media decision
CONTRACT_FEASIBILITY no blockers
lead consent contract rendered + feasible
```

Then:

```text
contracts 1.0.0
contracts-v1
```

## EPIC 6 — Payload / Security / Cache Foundation

```text
Payload
PostgreSQL adapter
Users
roles
Admin
Media/S3
env validation
Public/System/Ingest boundaries
Safe Outbound Client
redaction
HTTP cache invalidator
internal revalidation route
REST edge boundary
Payload access second layer
security headers
route-aware CSP
GraphQL off
migration foundation
owner bootstrap
```

Proof:

```text
anonymous raw business REST denied
Admin works
public site path works
```

## EPIC 7 — Base Schema

```text
properties
feed-sources
import-runs
import-issues
leads
lead-deliveries
pages
redirects
```

Mandatory:

```text
origin enum
partial unique feed identity via explicit SQL migration
slug immutability policy
manualOverrides
newbuild identity
contentPurgedAt
full leads schema
E.164 phone normalization fields
consent persistence fields
delivery unique constraints
delivery error kind
required indexes
feed-source delete guard
```

## EPIC 8 — Public Gateway

Implement frozen Base contracts:

```text
queries
selects
predicates
DTO mapping
validation
facet aggregates if required
```

## EPIC 9 — Jobs Foundation

```text
enableConcurrencyControl
system
imports(limit=1)
maintenance
lead-deliveries
autoRun
shouldAutoRun
disableScheduling ownership
canonical task registry slugs
dispatcher
jobsJanitor
leadRetentionCleanup
catalogLifecycle
recoverLeadDeliveries
maintenance schedules
```

## EPIC 10 — Import System

```text
dispatcher
conditional claim
queued runs
importFeed
conditional GET
streaming parser
Zod normalization
image host validation
image_host_not_allowed issue
manual ownership
idempotent upsert
safe deactivation
failure retry policy
consecutiveFailures
feed disable/delete lifecycle
explicit source decommission action
heartbeat
janitor
issues
cache invalidation
```

Acceptance:

```text
heartbeat visibility
no catch-up storm
stale recovery
304 baseline rules
same-hash baseline rules
transient failure 15m retry policy
source isolation
manual override
image host rejection behavior
feed disable does not archive inventory
feed delete blocked while related properties exist
```

## EPIC 11 — Lead Outbox Core

```text
lead schema/workflow states
phone E.164 normalization
consent persistence
lead endpoint
validation
honeypot
fill-time
Nginx/app rate limit
transactional lead+deliveries
delivery state machine
unique constraints
retries=0
waitUntil retry
heartbeat
stale recovery
orphan recovery
missing adapter permanent policy
bounded attemptLog
retention
```

Acceptance:

```text
lead survives channel outage
form success after local commit
crash window recovery
retryable delivery
permanent config error does not loop
retention aligned
consent version persisted
agency lead status independent of delivery state
```

## EPIC 12 — Lead Adapters

Minimum:

```text
MAX
custom-webhook
one CRM
```

Then by demand:

```text
Telegram
amoCRM
Bitrix24
```

amoCRM requires OAuth + encrypted rotating token storage + ADR.

## EPIC 13 — SEO + Lifecycle

```text
metadata
canonical
OG
structured data
sitemap
robots
filter whitelist
archived 200/noindex
retention
contentPurgedAt
explicit owner-created replacement redirect only
default 410 tombstone when no redirect
```

## EPIC 14 — Admin + Observability

```text
feed health
imports
issues
lead deliveries
manual retry
approval
jobs diagnostics
healthz
alerts
```

## EPIC 15 — Full Drift / Security / Regression Audit

```text
contracts
architecture
schema
REST boundary
security
UI drift
design literals
workspace boundaries
indexes/constraints
```

## EPIC 16 — Internal Production RealtBase

```text
AMS VPS
Nginx
TLS
internal domain
Managed PostgreSQL
S3
JOBS_AUTORUN=true
CACHE_INVALIDATION_MODE=http
backup
restore
monitoring
live smoke
```

Noindex.

## EPIC 17 — Clone Workflow

```text
RealtBase tag/SHA
→ new SourceCraft repo
→ PROJECT.md
→ DESIGN.md
→ DB
→ S3
→ client VPS
→ domain
→ feeds
→ channels
→ staging
→ production
```

## EPIC 18 — Analytics Module

```text
AnalyticsProvider
Yandex Metrika provider
local conversion metrics
Payload dashboard
feed health
delivery health
```

---

# 83. Build order

```text
0  Governance / CI / repo
1  Atlas inventory + visual baseline
2  Contracts draft + feasibility
3  UI package
4  Design normalization
5  Fixture website + contracts-v1

----------------------------
PRESENTATION FOUNDATION FROZEN
----------------------------

6  Payload/security/cache/REST foundation
7  Base schema
8  Public Gateway
9  Jobs foundation
10 Import
11 Lead outbox
12 Integrations
13 SEO/lifecycle
14 Admin/observability
15 Full regression/audit
16 Internal production
17 Clone workflow
18 Analytics
```

---

# 84. Definition of success

AMS RealtBase готов, когда доказано:

```text
UI package не знает Payload
contracts locked + CI enforced
contract feasibility verified before freeze
Gateway implements contracts instead of reshaping them
fixture → Payload does not change UI API
visual parity accepted
Tailwind workspace scanning proven
workspace client boundaries proven
raw anonymous business REST denied at edge
Admin works on pinned Payload version
property feed identity protected by DB constraint
partial unique index created by migration and verified
feed-source deletion cannot orphan/delete inventory
feed disable does not mass archive
published slug remains stable across imports
multi-feed import works
bad feed does not clear catalog
transient feed failure retries early
304/unchanged does not move safety baseline
manual overrides survive import
disallowed feed image host is skipped + reported
import heartbeat/recovery proven
facet requirements work without speculative infrastructure
lead schema includes agency workflow status, source attribution and consent evidence
phone normalized to E.164
lead + deliveries commit transactionally
lead survives MAX/CRM outage
lead-delivery duplicate impossible at DB level
missing adapter becomes permanent abandoned, not retry loop
controlled waitUntil retry proven
anti-spam/rate limits proven
404 and 410 are distinguishable by persisted lifecycle state
redirect after retention is explicit; default is 410
Managed PostgreSQL works
connection pool budget proven without exhaustion
S3 works
backup/restore proven
SourceCraft exact-head merge guard enforced
production release reproducible
client clone does not require deleting half the platform
reusable client modules return to RealtBase
```

---

# 85. Final formula

```text
AMS REALTBASE

ATLAS
=
UI/UX DONOR
NOT BACKEND FOUNDATION

UI FIRST
→ CONTRACTS
→ FEASIBILITY
→ FREEZE
→ ENGINE

CONTRACTS
=
versioned
hashed
CI-enforced

DESIGN
=
Atlas visual parity
+
Core 5.5 implementation

MEDIA
=
manual → S3
feed → external by default
disallowed host → image skipped + issue
remotePatterns → build-time release boundary

PAYLOAD
=
schema owner
+
Admin

PUBLIC REST
=
edge deny for raw business APIs
+
Payload access as second layer

PUBLIC DATA
=
Gateway
→ DTO
→ UI

PROPERTY IDENTITY
=
origin feed|manual
+ explicit partial unique migration
+ immutable published slug

IMPORT
=
multi-feed
idempotent
source-isolated
manual-override safe
safe-deactivation protected
transient-failure retry
recoverable

LEADS
=
versioned consent evidence
+ E.164 normalized contact
+ agency workflow status
+ transactional outbox
+
DB-level uniqueness
+
controlled retry
+
bounded audit
+
no config-error loops

JOBS
=
stable task registry
+ enableConcurrencyControl
+
explicit queues
+
imports limit 1 default
+
one owner per queue

NEWBUILD
=
identity ready
collections later

LIFECYCLE
=
archived
→ retention
→ explicit redirect if owner approved
→ otherwise contentPurgedAt + 410

SECURITY
=
HTTPS
CSP
rate limits
REST edge boundary
secret/PII redaction

CLIENT
=
own repo
own VPS
own DB
own S3

MODULE
=
generic in RealtBase first
then activation in client

PRODUCTION
=
SourceCraft exact-head proof
+
immutable release
+
live proof
```

## Version status

После закрытия EPIC 0 prerequisites этот документ считается проектной спецификацией **AMS RealtBase Architecture v1.0**.

Дальнейшие уточнения, выявленные реализацией EPIC 0–1, вносятся как нормальные versioned изменения спецификации; они не являются основанием откладывать старт проекта, если не нарушают Hard Contract/Core 5.5.

---

> AMS RealtBase должен быть не максимально функциональной Realty-платформой, а самым чистым, предсказуемым и расширяемым фундаментом AMS для большинства клиентских проектов.

> Любая новая сложность должна иметь реальный trigger, понятную пользу, проверяемый contract и operational owner.

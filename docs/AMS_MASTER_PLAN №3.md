# AMS REALTBASE STARTER — FINAL HARDENING MASTER PLAN (EPIC 11–21)

```text
Plan ID: AMS-REALTBASE-CORRECTIONS
Version: v3
Status: APPROVED
Delivery profile: COMMERCIAL
Approved by: owner
Approved at: 2026-09-18T18:06:00+03:00
Predecessor: AMS-REALTBASE-HARDENING v2 APPROVED (closed)
Baseline branch: main
Baseline SHA: f39826c87a358e655d1227d40be71cc403acd61f
Profile: REALTY_BASE
Mode: BUILD
```

## 0. Статус документа

Назначение: довести starter до соответствия Core 5.5 + UI Core 5.0, убрать drift, затем **один** production release демо на AMS Server (`start-baza.ams24.ru`).

**Production только в EPIC-21**, после merge EPIC-20 в `main`. EPIC 11–20 production не трогают. Новый Timeweb VPS / Managed PostgreSQL / S3 не покупаем.

**Канонический Git (не меняется этим планом):**

```text
primary: SourceCraft integrator-p/ams-realty-baza-starter
mirror: GitHub neyro-level/ams-realty-baza-starter
```

Строка `neyro-level/ams-realty-baza-starter` в owner brief — зеркало, не primary.

**Нормативная база:**

- `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`
- AMS UI Core 5.0
- `docs/PROJECT.md`, `docs/OPERATIONS.md`, `docs/DESIGN.md`
- фактический код на baseline SHA

**Task Manager:** `Status: APPROVED` v3. Owner: «План утверждён». Import разрешён для этого exact snapshot.

---

# 1. Решения владельца и архитектора

## 1.1 ACCEPTED

- Цель — соответствие Hard Contract Core 5.5 + UI Core 5.0, не новый продукт.
- EPIC 11–20 строго по порядку; каждый EPIC = новая ветка от свежего `main` = один PR в `main`.
- Долгоживущая `hardening/realtbase-starter` не создаётся.
- `delivery_mode` EPIC 11–20: `MERGE_AFTER_GATE` в `main` (review + один COMMERCIAL exact-head Gate + merge). Эти эпики **не** деплоят.
- Gate: EPIC 11–18 и 20 = `RISKY`; EPIC 19 = `STANDARD`; EPIC 21 = `RISKY` (release).
- После EPIC-20: один production rollout на уже существующий AMS Server / `start-baza.ams24.ru` по `ams-production-deploy` + `OPERATIONS.md`. Это **входит в утверждённый план**, отдельная фраза «выпускаем production» после approval не нужна.
- EPIC 11–20 production не выполняют. Между эпиками 11–20 владельца не спрашивать.
- Owner-вопросы не задавать, если канон Core 5.5 однозначен. Business/legal/secret values — fail-closed + `NEEDS_OWNER`, EPIC не стопорить целиком и не стопорить программу.
- Этот экземпляр — **демо-шаблон** на AMS Server, не клиентский коммерческий сайт. Timeweb Managed PostgreSQL и Timeweb S3 **не покупаем** в этой программе.
- Канон **этого** starter runtime: AMS Server + local PostgreSQL + persistent `MEDIA_DIR`. Решение HARDENING v2 §1.1 **подтверждено** (owner 2026-09-18).
- Коммерческий клиентский clone позже сам выбирает Managed PostgreSQL / S3. Это clone-time decision, не задача EPIC 11–20 и не скрытая миграция starter.
- `DELIVERY_PROFILE` репозитория остаётся `COMMERCIAL`: планка merge/Gate для продукта-шаблона, не «купить managed DB».
- Public site: Public Gateway → explicit access → explicit select → DTO. Anonymous raw Payload business REST = deny.
- Public raw SQL / drizzle.execute на application path удаляется. Если representative p95 не проходит: Payload-first оставляем, evidence в `docs/proofs/epic-12/`, Optimized Read = `NEEDS_OWNER` вне этой программы. **Не останавливать EPIC 12 и не ждать владельца.**
- Retention: нет silent default дней. Число дней = `NEEDS_OWNER`. Runtime/readiness fail-closed без выдуманных значений; fixture/dev не ломает build. Программа идёт дальше.
- `overrideAccess` / `systemOverrideAccess` только через System Gateway whitelist.
- После каждого EPIC 11–20: проверки по классу риска → PR в `main` → Gate → merge → удалить epic-ветку → следующая ветка.
- После EPIC-21: live smoke на `start-baza.ams24.ru`, `main` чистый, локальные epic-ветки удалены.

## 1.2 Access evidence 2026-09-18 (не секреты)

```text
Secret Master: PASS
Project/env/path: ams-server/prod /
Values exposed: no
SSH Host aliases: ams, ams-deploy
SSH ams: hostname ams-market-virtual-claud, user root, systemd running
SSH ams-deploy: hostname ams-market-virtual-claud, user amsdeploy
Nginx: start-baza.ams24.ru.conf enabled, nginx -t ok
Env file: /etc/ams/realtbase/start-baza.env present (not read)
Docker: yes; container ams-realty-baza Up
psql: yes
Timeweb API token in ams-server/prod: present; list servers returned Bastion Cloud VPC
AMS VPS identity: SSH contour ams, not a new purchase
```

Отдельного Infisical project `realtbase` в локальной карте нет. Application runtime secrets сейчас на серверном env file. EPIC-21 не печатает values и не копирует `ams-server/prod` в app env. Если env file на месте — rollout идёт. Отдельный SM project для приложения = улучшение, не стоп.

## 1.3 REAFFIRMED (не SUPERSEDED)

Starter topology = AMS Server + local PostgreSQL + host `MEDIA_DIR` + один runtime `JOBS_AUTORUN=true`. ADR `ADR-LOCAL-STARTER-STORAGE.md` остаётся каноном **этого** demo/template. Он не утверждает, что клиентский clone обязан копировать эту topology.

## 1.4 REJECTED

- GitHub как canonical identity.
- Покупка Timeweb Managed PostgreSQL / S3 для демо-шаблона.
- Установка S3 adapter как обязательного production runtime этого репозитория.
- Смена stack, второй ORM, Redis, broker, PostGIS, Elasticsearch, новый backend.
- Новая primitive foundation / visual redesign.
- Ослабление tests/guards ради green.
- Переписывание соседней области «заодно».
- Production deploy **до** EPIC-21 или на чужой сервер.
- Остановка всего графа из-за отсутствующих owner-only значений или из-за p95 без SQL rollback.

## 1.5 Evidence на baseline (проверено по коду, не гипотеза)

| ID | Finding | Evidence |
|---|---|---|
| P0-01 | Anonymous `properties` read = publication predicate | `src/payload/collections/Properties.ts` `publicPropertyReadWhere` |
| P0-01b | Anonymous `pages` read = published predicate | `src/payload/collections/Pages.ts` |
| P0-01c | `media.read` = `() => true` | `src/payload/collections/Media.ts` |
| P0-01d | `redirects` / `leads` / `lead-deliveries` anonymous read уже deny | collection `adminsAndOwners`; тесты всё равно обязательны |
| P0-02 | Public drizzle SQL layer | `src/core/data-access/public/sql/index.ts`; consumers: `public-gateway/catalog.ts`, `provider.ts` |
| P0-03 | Local PG + MEDIA_DIR на AMS Server | **Не дефект starter.** Owner: демо-шаблон, managed DB/S3 не покупаем. EPIC-13 только сверяет docs/guards с этим каноном |
| P0-04 | Retention null | `project.config.ts` `leadRetentionDays` / `archiveRetentionDays` = null |
| P1-15 | Owner endpoint uses `systemOverrideAccess` | `Properties.ts` `/:id/return-to-feed` |
| P1-16 | `nextDueAt` not required | `FeedSources.ts` |
| P1-17 | Global `beforeChange` считает `pricePerMeterMinor`; null не записывается | `Properties.ts` hook `if (derived.pricePerMeterMinor != null)` |
| P1-18 | `PAYLOAD_DB_PUSH` configurable; CSP `img-src https:` | `payload.config.ts`, `src/payload/env.ts`, `next.config.ts` |

---

# 2. Цели и границы

## Цель

```text
Core 5.5 Hard Contract
+ UI Core 5.0
+ удалить остаточный drift
+ проверяемый starter для клонирования
+ один live demo release на AMS Server / start-baza.ams24.ru
```

## Non-goals

```text
покупка нового Timeweb VPS / Managed PostgreSQL / S3
production до EPIC-21
смена stack
второй ORM / Redis / broker / PostGIS / ES / новый backend
новая primitive foundation
ослабление guards
скрытый redesign
печать секретов
```

## Наследуемые инварианты

Payload = schema/Admin/auth/Local API owner. Public UI не импортирует Payload. Schema только migrations. Один jobs-active runtime. Секреты только Secret Master. Один stream = одна ветка = один PR.

---

# 3. Обязательный workflow каждого EPIC

После утверждения плана разработчик идёт **без паузы между эпиками**. Owner confirmation на merge не спрашивать: план уже задаёт `MERGE_AFTER_GATE`.

```text
обновить origin/main
→ working tree clean
→ новая branch только текущего EPIC
→ только scope текущего EPIC
→ tests / guards / docs этого scope
→ commit / push
→ PR → main
→ exact PR HEAD
→ review полного diff эпика
→ Gate по сложности: EPIC 11–18 и 20–21 = RISKY, EPIC 19 = STANDARD
→ merge в main
→ удалить remote epic-branch
→ удалить local epic-branch
→ git fetch + fast-forward local main
→ working tree clean на main
→ следующая branch
```

После EPIC-20: не деплоить; сразу ветка EPIC-21.

После EPIC-21:

```text
exact main SHA задеплоен на AMS Server
live smoke start-baza.ams24.ru
local main == origin/main
нет локальных hardening/epic-11…epic-21
```

Красный Gate / красный `pnpm verify` эпика чинится в **той же** ветке. Это не стоп программы и не повод ждать владельца, пока scope не вышел за эпик и нет нового секрета/production.

Ветки:

```text
hardening/epic-11-public-data-boundary
hardening/epic-12-remove-public-raw-sql
hardening/epic-13-production-topology
hardening/epic-14-retention-contract
hardening/epic-15-access-override-boundaries
hardening/epic-16-feed-source-invariants
hardening/epic-17-derived-fields
hardening/epic-18-security-hardening
hardening/epic-20-final-proof
hardening/epic-21-ams-server-release
```

Правило автономности: не спрашивать владельца, если Core 5.5 уже задаёт канон. Если нужен business/legal/secret value — fail-closed, пометить `NEEDS_OWNER`, закрыть остальной scope.

Запрещено до EPIC-21: production deploy. Запрещено всегда: смена stack; второй ORM; Redis; broker; PostGIS; Elasticsearch; новый backend; новая primitive foundation; ослабление tests/guards; удаление safety checks; переписывание работающей области «заодно».

---

# 4. Audit summary

## P0 — blocking / Hard Contract

### P0-01. Anonymous raw Payload business read

Сейчас anonymous `properties.read` отдаёт `status=active`, `publishedAt` exists, `contentPurgedAt` absent. Это raw Payload REST как public API. Нужно: deny + Public Gateway.

### P0-02. Public low-level SQL

`src/core/data-access/public/sql/index.ts` → `payload.db.drizzle.execute` для facets, sitemap, lifecycle, redirects. Для REALTY_BASE (~2 000) Optimized Read не доказан (Core §7.5).

### P0-03. Starter topology (не дефект)

Local PostgreSQL + `MEDIA_DIR` на AMS Server — **актуальный канон демо-шаблона**. Core 5.5 требует Managed PostgreSQL + S3 для коммерческого клиентского production; этот starter сознательно отклоняется. EPIC-13 не мигрирует на Timeweb managed services.

### P0-04. Retention contract

`leadRetentionDays` / `archiveRetentionDays` = null. Для PII intake production должен быть fail-closed; clone onboarding требует значение до запуска.

## P1

Access override shortcuts; `nextDueAt` для enabled source; derived fields ownership; `PAYLOAD_DB_PUSH` в production; CSP `https:`; conditional env; build-only secret fallback; Safe Outbound coverage; UI Core drift.

---

# EPIC-11 — PUBLIC DATA BOUNDARY

```text
branch: hardening/epic-11-public-data-boundary
severity: P0 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: none
```

## Цель

Запретить anonymous raw Payload business access. Публичный сайт только через Public Gateway → explicit access mode → explicit select → DTO.

## Задачи

### 11.1 Collection access inventory

Проверить: Properties, Pages, Redirects, Media, FeedSources, ImportRuns, ImportIssues, Leads, LeadDeliveries, Users, payload-jobs.

Matrix: anonymous / editor / admin / owner / system.

### 11.2 `properties` anonymous read = deny

Не переносить publication predicate в collection access как public API. Фильтрация остаётся в Public Gateway.

### 11.3 `pages`

Anonymous raw `pages` не public API. Public pages: route → Gateway → select → DTO.

### 11.4 `redirects`

Public resolution — application boundary, не generic anonymous Payload CRUD.

### 11.5 Media

Public file delivery допустим. Anonymous generic Payload REST read metadata — не public business API, если нет доказанной необходимости. Default: deny raw REST; storage/public URL отдельно.

### 11.6 Mechanical guard

Падает, если business collection получает anonymous generic read. Declarative allowlist, не одно имя `properties`. Default: business raw REST = deny.

### 11.7 Tests

```text
anonymous raw GET properties → denied
anonymous raw GET pages → denied
anonymous raw GET leads → denied
anonymous raw GET lead-deliveries → denied
public catalog gateway → works
public property gateway → works
public CMS page gateway → works
```

## DoD

Никакой business UI не зависит от anonymous Payload REST. Public Gateway — единственный public data boundary. DTO не менять без необходимости. Public routes работают.

## Проверки

```bash
pnpm verify:public-gateway
pnpm verify:security-boundaries
pnpm quality:architecture
pnpm quality:guards
pnpm typecheck
pnpm lint
pnpm build
pnpm verify
```

---

# EPIC-12 — REMOVE UNPROVEN PUBLIC RAW SQL

```text
branch: hardening/epic-12-remove-public-raw-sql
severity: P0/P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-11
```

## Цель

Вернуть REALTY_BASE к Payload-first read. Удалить default raw SQL из public path без measured bottleneck.

## Задачи

### 12.1 Catalog facets

`aggregatePublicCatalogFacets` → Payload application path. До ~2 000 объектов: простота, корректность, access consistency. Несколько bounded queries допустимы.

### 12.2 Sitemap

`count/list` properties и pages → Payload read/count. Сохранить explicit select, limit, publication predicates, bounded paging.

### 12.3 Lifecycle lookup

`findPublicPropertyLifecycleRow` → approved application read path.

### 12.4 Redirect lookup

`findPublicRedirectByFromPath`, `publicRedirectDestinationIsChain` → Payload read.

### 12.5 Удалить `src/core/data-access/public/sql`

Если consumers = 0. Не оставлять speculative code.

### 12.6 Architecture guard

`payload.db` / `db.drizzle` / `drizzle.execute` / raw SQL запрещены в public/read/application domain. Allowlist: approved ingest, migration, доказанный exception.

### 12.7 Performance proof

До и после — representative dataset. Не доказывать «Payload быстрее SQL». Доказать catalog внутри budget:

```text
catalog list data path p95 <= 300 ms
property detail p95 <= 200 ms
```

Если budget не проходит: **не** возвращать raw SQL и **не** останавливать программу. Записать evidence (benchmark, size, profile, bottleneck) в `docs/proofs/epic-12/`. Optimized Read Gateway = `NEEDS_OWNER` после этой программы. EPIC-12 закрывается на Payload-first + guard «public raw SQL = 0».

## DoD

public raw SQL = 0; low-level DB guard; catalog/facets/sitemap/lifecycle/redirect behavior preserved.

## Проверки

```bash
pnpm verify:public-gateway
pnpm verify:seo-contracts
pnpm verify:product-regression
pnpm quality:architecture
pnpm quality:guards
pnpm typecheck
pnpm build
pnpm verify
```

---

# EPIC-13 — STARTER TOPOLOGY CONTRACT

```text
branch: hardening/epic-13-production-topology
severity: P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-12
```

## Цель

Зафиксировать честный канон **демо-шаблона** и не тащить starter на купленные Timeweb Managed PostgreSQL / S3.

Canonical **этого** runtime:

```text
AMS Server / Timeweb VPS
→ Nginx
→ Next.js + Payload
→ local PostgreSQL on the same server
→ persistent MEDIA_DIR
→ Payload Jobs, JOBS_AUTORUN=true
```

**Provisioning / покупка managed DB / S3 / live deploy не выполнять.**

Клиентский clone: отдельное topology decision в clone onboarding docs. Не делать S3 обязательным adapter в этом репозитории.

## Задачи

### 13.1 Сверить docs с owner-каноном

`PROJECT.md`, `OPERATIONS.md`, `03_ARCHITECTURE.md`, `AGENTS.md`, `.env.example`, `deploy/*` описывают local PostgreSQL + `MEDIA_DIR`, не Managed PostgreSQL и не S3 как starter runtime.

### 13.2 Сохранить ADR

`ADR-LOCAL-STARTER-STORAGE.md` остаётся Accepted для demo/template. Явно: коммерческий clone не копирует эту topology автоматически.

### 13.3 Не ставить S3 adapter

Не добавлять `@payloadcms/storage-s3` как обязательную production зависимость. Не требовать `S3_*` для старта demo runtime.

### 13.4 Compose / deploy

Compose не поднимает Managed PostgreSQL. Media volume / `MEDIA_DIR` остаётся starter storage. `DATABASE_URI` указывает на local server Postgres.

### 13.5 Backup docs

DB dump local PostgreSQL + snapshot `MEDIA_DIR` + offsite copy + integrity check (уже HARDENING). Не переписывать на «managed backup + S3 versioning» как единственный канон этого starter.

### 13.6 Clone readiness

Clone checklist разделяет:

```text
этот starter / demo: local PG + MEDIA_DIR
будущий коммерческий клиент: своё решение (часто Managed PG + S3)
```

Не требовать S3 credentials, чтобы считать starter clone-ready как шаблон.

### 13.7 Guard

`verify:production-topology` **подтверждает** starter local topology. Падает, если production/starter contract снова требует S3 или Managed PostgreSQL как обязательный runtime этого репозитория.

## DoD

Репозиторий не утверждает покупку Timeweb managed services для демо. Local PG + MEDIA_DIR согласованы в docs, deploy, guards. S3 adapter не внедрён «на будущее».

## Проверки

```bash
pnpm verify:production-topology
pnpm verify:clone-readiness
pnpm verify:security-boundaries
pnpm verify:schema
pnpm typecheck
pnpm build
pnpm verify
```

---

# EPIC-14 — RETENTION CONTRACT

```text
branch: hardening/epic-14-retention-contract
severity: P0/P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-13
```

## Цель

Закрыть lifecycle PII и archived inventory без silent defaults.

## Задачи

### 14.1 Lead retention обязателен как deployment decision

`leadRetentionDays`. PII production intake без valid policy не стартует.

### 14.2 Fail-closed

Lead channel/intake активен + policy отсутствует → production readiness FAIL. Build fixture/dev может быть permissive. Разделить: build-time permissive / runtime production fail-closed.

### 14.3 Maintenance

expired lead → delete/anonymize; linked deliveries; diagnostics cleaned.

### 14.4 Archive retention

`archiveRetentionDays` — explicit decision перед production catalog lifecycle. Нет значения → никакого destructive cleanup + readiness warning/failure.

### 14.5 PROJECT.md

```text
leadRetentionDays = NEEDS_OWNER до project clone configuration
archiveRetentionDays = NEEDS_OWNER до production
```

Starter хранит placeholder contract и не притворяется production-ready.

### 14.6 Tests

```text
policy absent → production readiness fails
expired lead → processed
linked delivery → processed
non-expired lead → untouched
PII does not remain in diagnostics
```

## Проверки

```bash
pnpm verify:lead-outbox
pnpm verify:lead-delivery-state
pnpm verify:operational-recovery
pnpm verify:production-topology
pnpm verify
```

---

# EPIC-15 — LOCAL API / OVERRIDE ACCESS BOUNDARIES

```text
branch: hardening/epic-15-access-override-boundaries
severity: P0/P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-14
```

## Цель

Explicit access mode — системное правило, не соглашение.

Найденный пример: `Properties.ts` `/:id/return-to-feed` вызывает `systemOverrideAccess` при уже авторизованном owner/admin.

## Задачи

### 15.1 Inventory

Все `payload.find|findByID|count|create|update|delete`, `req.payload.*`, `payload.jobs.*`.

### 15.2 Классификация

user / public / system / ingest.

### 15.3 Убрать unnecessary override

Owner/admin path использует request access.

### 15.4 System Gateway

`overrideAccess: true` только whitelist system operations, перечисленных в одном месте.

### 15.5 FeedSources hooks

`beforeDelete` `req.payload.count` — однозначный access semantic.

### 15.6 Mechanical guard

Ловить helper/import, не только literal `overrideAccess: true`. `systemOverrideAccess` импортировать только из:

```text
src/core/data-access/system/**
src/server/system-gateway/**
```

(или один канонический System Gateway path). Ingest/jobs, которые уже лежат в system path, остаются, если операция действительно system.

### 15.7 Tests

owner works; admin allowed works; anonymous denied; system job works; business code cannot import override helper.

## Проверки

```bash
pnpm verify:security-boundaries
pnpm verify:owner-operations
pnpm quality:architecture
pnpm quality:guards
pnpm verify
```

---

# EPIC-16 — FEED SOURCE INVARIANTS

```text
branch: hardening/epic-16-feed-source-invariants
severity: P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-15
```

## Цель

Schema invariants вокруг scheduling. Для enabled source `nextDueAt` NOT NULL / normalized.

## Задачи

### 16.1–16.3

enabled=true → `nextDueAt` обязательно. Create enabled без значения → now. Transition disabled→enabled без valid nextDueAt → now.

### 16.4 Migration

Только если schema/data change реально требуется. Проверить существующие rows.

### 16.5 Dispatcher tests

enabled source не пропадает из dispatcher из-за `nextDueAt=null`; missed intervals не catch-up; one claim → one run.

### 16.6 Safety knobs

`safetyThresholdPercent`, `maxDeactivationsPerRun` не обходятся при manual import.

## Проверки

```bash
pnpm verify:jobs-config
pnpm verify:feed-lifecycle
pnpm verify:feed-ingest
pnpm verify:schema
pnpm verify
```

---

# EPIC-17 — DERIVED PROPERTY FIELDS

```text
branch: hardening/epic-17-derived-fields
severity: P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-16
```

## Цель

Calculation ownership по Core: `pricePerMeterMinor` считается в ingest.

## Задачи

### 17.1 Canonical owner

Feed: normalization/ingest → priceMinor → totalArea → banker's rounding → pricePerMeterMinor.

### 17.2 Убрать hidden global recalculation

Collection hook не второй owner нормализации.

### 17.3 Manual

`origin=manual`: shared domain function на explicit manual write boundary или controlled server-side operation. Не в UI.

### 17.4 Null semantics

```text
priceMinor == null → null
totalArea <= 0 → null
```

Stale derived не оставлять. Текущий hook не записывает null — исправить.

### 17.5 Banker's rounding

Deterministic tests для half cases.

### 17.6 Tests

feed; manual; price removed; area removed; zero area; unchanged hash; rounding boundaries.

## Проверки

```bash
pnpm verify:feed-ingest
pnpm verify:manual-ownership
pnpm verify:schema
pnpm verify
```

---

# EPIC-18 — SECURITY / CONFIG FAIL-CLOSED

```text
branch: hardening/epic-18-security-hardening
severity: P1 / RISKY
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-17
```

## Цель

Закрыть остаточные production-security ambiguities.

## Задачи

### 18.1 PAYLOAD_DB_PUSH

`NODE_ENV=production` AND `PAYLOAD_DB_PUSH=true` → startup error. Либо полностью убрать production-configurable push.

### 18.2 CSP image hosts

Собрать `img-src` из `'self'`, `data:`, `blob:`, exact `EXTERNAL_IMAGE_HOSTS`. Не использовать глобальный `https:`.

### 18.3 Conditional env

Примеры: `CACHE_INVALIDATION_MODE=http` → `REVALIDATE_SECRET`; active max channel → `MAX_*`; custom webhook → URL + HMAC; demo/starter production-like runtime → `DATABASE_URI`, `PAYLOAD_SECRET`. **Не требовать S3 settings** для этого starter.

### 18.4 Fake build credentials

Build fallback допустим только если production runtime fail-fast. Proof: production server cannot start with build-only fallback.

### 18.5 Safe Outbound Client targeted tests

localhost, 127.0.0.1, 0.0.0.0, RFC1918, link-local, IPv6 loopback, ULA, redirect public→private, redirect non-allowlisted, HTTP without approval, max response, timeout.

### 18.6 Secrets guard

`.env.example`, docs, tests, fixtures — без real tokens/credential URLs.

## Проверки

```bash
pnpm verify:security-boundaries
pnpm verify:production-topology
pnpm quality:guards
pnpm verify
```

---

# EPIC-19 — UI CORE 5.0 FINAL DRIFT PASS

```text
branch: hardening/epic-19-ui-drift
severity: P1/P2 / STANDARD
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-18
```

## Цель

Не редизайн. Только drift против UI Core 5.0.

`embla-carousel-react` и `yet-another-react-lightbox` — approved specialized deps в `DESIGN.md`, не удалять автоматически.

## Задачи

19.1 Component inventory по слоям; дубли кнопок/карточек/dialog/input/sections.  
19.2 `"use client"` только с browser reason; не поднимать большую server section.  
19.3 `globals.css` taxonomy CORE/SHADCN/PROJECT/MODULE-RESERVED/DEAD; удалять только dead/duplicate/obsolete. Не ломать Atlas parity ради строк.  
19.4 MODULE-RESERVED без documented module contract → удалить.  
19.5 Component CSS: geometry + `var(--*)`; запрет literal brand/type/radii/shadows/motion.  
19.6 `packages/ui/components.json` aliases реальны; stale `hooks` alias исправить.  
19.7 Page composition listed routes: thin `page.tsx`, one H1, hierarchy, no monolith.  
19.8 Один LeadForm; states default/validation/submitting/server error/success; field error text + aria-describedby.  
19.9 a11y на `/`, `/nedvizhimost`, `/obekty/[slug]`, `/uslugi`.  
19.10 Responsive 390×844 / 768×1024 / 1280×900 / 1440×1000.  
19.11 Performance: LCP ≤ 2.5 s, CLS ≤ 0.1 на representative local/fixture surface, не на live production. Live deploy не нужен.  
19.12 SEO page contract: title, description, canonical, OG, one H1, robots, sitemap, structured data from facts.

PR description: таблица `Severity | File | Finding | Rule | Resolution`.

## Проверки

```bash
pnpm quality:design-tokens
pnpm verify:a11y-starter
pnpm verify:seo-contracts
pnpm verify:product-regression
pnpm quality:architecture
pnpm quality:guards
pnpm typecheck
pnpm lint
pnpm build
pnpm verify
```

UI-изменения проверить в браузере по representative pages, не одним скриншотом.

---

# EPIC-20 — FINAL CONSTITUTION PROOF

```text
branch: hardening/epic-20-final-proof
severity: RISKY / FINAL
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-19
```

## Цель

Не добавлять функциональность. Закрыть соответствие доказательствами.

### 20.1 Hard Contract audit

Для каждого инварианта: PASS / FAIL / NOT PROVEN / N/A. PASS без evidence запрещён.

Payload schema owner; no second ORM; public gateway + DTO; explicit access; System Gateway whitelist; migrations only; safe import; source isolation; one jobs owner; UI isolation; design values single source; **starter topology = local PostgreSQL + MEDIA_DIR**; PII retention policy fail-closed without invented days; async lead delivery; destination allowlist. Managed PostgreSQL / S3 = clone-time option, N/A для этого runtime.

### 20.2 Mandatory integration suites

Import, Access, Leads, Migration, E2E — по owner brief (idempotency, REST deny, outbox/crash, clean+upgrade DB, catalog→property, admin publish, lead form→DB).

### 20.3 Core §18A targeted proofs

A heartbeat; B2 HTTP cache invalidation; C dispatcher no catch-up; D stale recovery; E retention; F outbox crash window; G retryable delivery.

Существующие `docs/proofs/**` можно переиспользовать, только если команда реально прогнана на exact EPIC-20 SHA. Старый PASS чужого SHA ≠ PASS.

### 20.4 Schema

`pnpm verify:schema`. Migrations = current schema. No production push. Constraints/indexes. Clean DB migrate succeeds.

### 20.5 Full verification

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

Красный command не ослаблять, не skip, не менять expected ради green.

### 20.6 Final drift audit

Backend: overrideAccess, implicit access, raw DB, direct configurable fetch, secret exposure, private DTO, top-level next/cache.  
UI: raw design values, duplicates, client boundaries, dead tokens, second primitives, CSS drift, a11y, SEO.

### 20.7 Final report

Создать `docs/FINAL_CORE_5_5_AUDIT.md`:

```text
Baseline SHA / Final SHA
Hard Contract, Architecture, Data Boundary, Import, Jobs, Leads,
Security, Starter topology (local PG + MEDIA_DIR), UI Core 5.0,
Accessibility, SEO, Performance, Verification actually run,
NOT PROVEN, Remaining owner decisions, Remaining risks
```

Запрещены формулировки FULLY VERIFIED / PRODUCTION READY / GREEN / DONE без реально запущенного proof.

### 20.8 После merge

Не выкатывать production из EPIC-20. Удалить ветку epic-20. Сразу открыть `hardening/epic-21-ams-server-release` от свежего `main`.

---

# EPIC-21 — AMS SERVER DEMO RELEASE

```text
branch: hardening/epic-21-ams-server-release
severity: RISKY / RELEASE
delivery_mode: MERGE_AFTER_GATE
depends_on: EPIC-20
allowed: production rollout of this starter to AMS Server
```

## Цель

Один production release демо-шаблона на уже существующий AMS Server.

```text
host: AMS Server (SSH ams / ams-deploy, hostname ams-market-virtual-claud)
domain: start-baza.ams24.ru
DB: local PostgreSQL on that server (ams_realtbase_prod)
media: MEDIA_DIR
jobs: exactly one JOBS_AUTORUN=true
index: noindex
```

Не покупать Timeweb Managed PostgreSQL, S3, новый VPS.

## Задачи

### 21.1 Docs/runbook, если drift

`OPERATIONS.md` сейчас `Skeleton / production not provisioned`, хотя контур уже живой (`ams-realty-baza` Up, nginx site enabled, env file present). Привести runbook к факту AMS Server без секретов.

Если код не нужен — минимальный docs PR, Gate RISKY, merge, затем rollout с **того же** итогового `main` SHA.

### 21.2 Artifact

Собрать immutable Docker image **вне** production host из exact `origin/main` SHA после EPIC-20 (+ docs 21.1 если были). Production host не делает `pnpm build`.

### 21.3 Rollout

По `ams-production-deploy` + `OPERATIONS.md`:

1. exact SHA
2. `pnpm release:manifest` локально
3. image tag = full SHA
4. Payload migrate from the same image against local AMS Postgres
5. recreate one runtime `JOBS_AUTORUN=true`
6. Nginx/TLS already routes `start-baza.ams24.ru`
7. healthz + live smoke `/`, `/nedvizhimost`, lead form path if public
8. previous image kept for rollback

Значения `/etc/ams/realtbase/start-baza.env` не печатать. Не подставлять секреты `ams-server/prod` как app credentials.

### 21.4 Live proof

```text
https://start-baza.ams24.ru отвечает
noindex сохранён
healthz без утечки секретов
контейнер ровно один jobs owner
```

### 21.5 Cleanup

Удалить epic-21 ветку. Local `main` = `origin/main`. Не оставлять worktree.

## DoD

Демо опубликовано на AMS Server с exact SHA программы. Rollback image известен. Production на другом сервере не выполнялся.

## Проверки

Release не повторяет весь `pnpm verify` на хосте. Использует green Gate exact SHA EPIC-20/21 + live smoke. Если `main` изменился после сборки image — пересобрать, не катить старый digest.

---

# 5. Owner-only items — не блокируют программу

```text
конкретный leadRetentionDays
конкретный archiveRetentionDays
реальные feed URLs / credentialRef
реальные lead channel credentials
реальный клиентский domain (не этот demo)
external uptime provider
подтверждение backup на AMS Server
```

Timeweb Managed PostgreSQL credentials и S3 bucket **не входят** в эту программу и не являются hidden TODO EPIC-13.

Код, validation, docs и readiness checks готовятся заранее. Отсутствие значений → fail-closed + `NEEDS_OWNER` в `PROJECT.md`, граф не останавливается.

---

# 6. Ожидаемое финальное состояние

```text
Payload = единственный schema/application owner
Public site = Gateway → explicit access → DTO
Raw Payload REST ≠ public business API
Public reads = Payload-first, без premature raw SQL
Import = streaming, idempotent, source-isolated, safe-deactivation
Jobs = Payload Jobs, one owner per queue
Leads = transactional outbox, async delivery, recovery, retention
Starter / demo runtime = local PostgreSQL + MEDIA_DIR on AMS Server
Commercial clone topology = отдельное решение, не в этом graph
UI = package-isolated, shadcn, Server-first, REUSE → VARIANT → CREATE
Design values = globals.css only
Security = fail-closed, exact allowlists, no secret/PII leakage
Live demo = start-baza.ams24.ru on AMS Server, exact SHA, noindex
```

---

# 7. Приоритет

```text
EPIC-11 Public Data Boundary
EPIC-12 Remove Public Raw SQL
EPIC-13 Starter Topology Contract
EPIC-14 Retention Contract
EPIC-15 Access / Override Boundaries
EPIC-16 Feed Source Invariants
EPIC-17 Derived Fields
EPIC-18 Security Hardening
EPIC-19 UI Drift
EPIC-20 Final Proof
EPIC-21 AMS Server demo release
```

`main` — checkpoint после EPIC 11–20. EPIC-21 — единственный production rollout. После merge ветка эпика удаляется.

---

# 8. Definition of Done программы

1. Все EPIC-11…EPIC-21 закрыты.
2. EPIC 11–20 влиты в `main` с green exact-head Gate.
3. `docs/FINAL_CORE_5_5_AUDIT.md` существует; NOT PROVEN честен.
4. Один live release на AMS Server / `start-baza.ams24.ru` с exact SHA.
5. Owner-only values остаются `NEEDS_OWNER`, но fail-closed checks на месте.
6. Нет public anonymous business REST и нет public raw SQL.
7. Local `main` чистый и равен `origin/main`; локальные epic-ветки удалены.

---

# 9. Антизатычки (continuous execution)

Проверено. В v1 были два реальных стопа — сняты в v2:

| Риск стопа | Было в v1 | Сейчас |
|---|---|---|
| EPIC-13 ждёт покупку Managed PG / S3 | да | нет: канон local PG + MEDIA_DIR |
| EPIC-12 p95 → ждать architecture decision | да | нет: evidence + NEEDS_OWNER, Payload-first, идём дальше |
| Retention days неизвестны | fail-closed, не стоп | без изменений, явно |
| S3 required в EPIC-18 env | да | нет |
| Merge ждать владельца после каждого EPIC | неявно | нет: MERGE_AFTER_GATE уже в плане |
| Production как скрытый шаг | v2 запрещал совсем | v3: только EPIC-21 на AMS Server |
| Красный test | чинить в той же ветке | без изменений |

Граф линейный EPIC-11→21. Delivery 11–20 = PR+Gate+merge+cleanup. EPIC-21 = runbook PR при необходимости + один rollout. Не ждать владельца между эпиками.

# 10. Риски

- Cyrillic Windows path может ломать encoding helper Task Manager — после approval явный Git root / UTF-8.
- Не импортировать закрытый HARDENING Beads graph.
- Live `start-baza.ams24.ru` уже существует (контейнер Up). EPIC-21 — смена image на SHA этой программы, не «первый сервер с нуля».
- Timeweb API token в `ams-server/prod` видит Bastion Cloud VPC, не AMS. Identity AMS = SSH `ams`, не этот API list. Не стоп.

# 11. Открытые решения

Нет блокирующих.

# 12. Проходы архитектора v3

## Completeness / traceability — PASS

EPIC-11…21. Production привязан к AMS Server + домену. Headings готовы к inventory.

## Architecture / data / security / dependencies — PASS

Local PG + MEDIA_DIR. App secrets не берутся из общего `ams-server/prod`. Artifact не собирается на host.

## Executability / testing / delivery / rollback — PASS

SSH/SM smoke 2026-09-18 PASS. Nginx site и env file есть. Между 11–20 паузы нет. EPIC-21 — один rollout + rollback image.

## External findings

Owner 2026-09-18: ACCEPTED local topology; ACCEPTED per-epic merge; ACCEPTED final production on AMS Server / start-baza.ams24.ru; REJECTED managed purchase и ранний deploy.

# 13. История ревизий

| Version | Status | Date | Что изменилось |
|---|---|---|---|
| v0 | DRAFT | 2026-09-18 | Пустой каркас. |
| v1 | REVIEW | 2026-09-18 | Owner brief EPIC 11–20. Ошибочно снял local topology. |
| v2 | REVIEW | 2026-09-18 | Local PG + MEDIA_DIR. Антизатычки. Per-epic merge. Production запрещён. |
| v3 | APPROVED | 2026-09-18 | Owner: «План утверждён». EPIC 11–21. Demo release на AMS Server в конце. |

**Task Manager import:** allowed for this APPROVED v3 snapshot.

# AMS REALTBASE STARTER — FINAL MASTER PLAN

```text
Plan ID: AMS-REALTBASE-HARDENING
Version: v2
Status: APPROVED
Delivery profile: COMMERCIAL
Approved by: owner
Approved at: 2026-09-18T00:03:00+03:00
```

## 0. Статус документа

**Назначение:** финальное техническое задание для последовательной доработки `ams-realty-baza-starter` через Codex / Cursor / Task Manager (Beads).

**Канонический Git:**

```text
primary: SourceCraft integrator-p/ams-realty-baza-starter
mirror: GitHub neyro-level/ams-realty-baza-starter
```

**Audit baseline (исторический снимок аудита, не рабочая база исполнения):**

```text
repository: integrator-p/ams-realty-baza-starter
branch: origin/main at plan approval
historical audit commit: 42de8f269d6344eb713a04a3640ce3d156d25b17
profile: REALTY_BASE
```

Исполнение начинается от актуального `origin/main` на момент старта EPIC 0, а не от исторического audit SHA.

**Delivery policy этой программы:**

```text
integration branch: hardening/realtbase-starter
epic PR target: hardening/realtbase-starter
checkpoint PR target: main
epic delivery_mode: MERGE_AFTER_GATE
owner command 2026-09-18: complete the plan epic-to-epic without pause
COMMERCIAL exact-head Gate: required before merge to main
Task Manager Code Reviewer: only on explicit owner trigger
production: forbidden unless separate owner command
```

Команда владельца закрыть весь план разрешает merge эпиков в `hardening/realtbase-starter` и checkpoint-merge в `main` после Gate. Production не выполняется.

**Решения архитектора v1:**

- ACCEPTED: starter topology = AMS Server + local PostgreSQL + local persistent media, без Managed PostgreSQL и без S3 runtime.
- ACCEPTED: storage boundary сохраняется; S3-compatible adapter остаётся будущей опцией клиентского clone.
- ACCEPTED: checkpoint в Task Manager — первая implementation-задача следующего эпика после закрытой волны, потому что у эпика ровно одна delivery-task.
- REJECTED: GitHub как canonical repository identity.
- ALREADY_COVERED: production только по отдельной команде владельца.

**Внешние findings v2 (все ACCEPTED):**

- 2.1 MAIN CHECKPOINT 1 и gates 2–4 приведены к единственной verification surface §3.4.
- 2.2 DoD 29 больше не предполагает глобальный private-network bypass.
- 2.3 `dispatchBatchSize` живёт только в `project.config.ts`.
- 2.4 §10.8 измеряет прямую facet-агрегацию, без cache refresh.
- 3.1–3.3 добавлены недостающие mechanical guards Core §18.4/§23.
- 3.2 явный модуль `src/core/data-access/system/jobs`.
- 3.4 controlled owner bootstrap и self-registration off.
- 3.5 media.read public при owner-only write + raw-rest classification.
- 3.6 automatic backup, rotation, offsite copy, integrity check.
- 3.7 матрица proofs §18A.
- 3.8 три обязательных теста §18.5.
- 3.9 `staleDataSlaMinutes` + alert cache invalidation failure.
- 3.10 Core performance budgets как PASS/FAIL.
- 4 UI closing report, drift audit после 8.3, запрет PII dump → staging, parser suspicious rule, DoD без дублей.

**Нормативная база:**

- AMS Realty Platform Core Standard 5.5 — Solo + AI;
- AMS UI Core 5.0;
- фактическое состояние проекта на baseline commit;
- решения владельца, зафиксированные в этом master plan.

**Главный принцип:**

> Не переписывать работающий фундамент. Закрыть runtime-разрывы, привести проект к одному понятному архитектурному контуру, сделать critical paths реально исполняемыми, а проверки — доказательными, а не декларативными.

---

# 1. Зафиксированные решения владельца

## 1.1 Starter живёт на одном AMS Server

Для этого starter **не использовать**:

- Timeweb Managed PostgreSQL;
- Timeweb S3;
- отдельную платную managed-инфраструктуру.

Целевая starter-topology:

```text
AMS Server / Timeweb VPS
├── Nginx
├── Next.js + Payload CMS
├── PostgreSQL local
├── Payload Jobs
└── local persistent media storage
```

Это **осознанное project-level deviation** от типовой commercial production topology Core 5.5.

Deviation должен быть явно зафиксирован в `PROJECT.md` и коротком ADR, чтобы будущие AI-агенты не пытались снова вернуть Managed PostgreSQL или S3.

Для будущих клиентских клонов инфраструктура определяется отдельно на уровне проекта.

---

## 1.2 Local PostgreSQL

Starter использует существующий PostgreSQL на AMS Server.

Обязательные условия:

- отдельная database;
- отдельный application role;
- PostgreSQL не публикуется наружу;
- migrations only;
- `PAYLOAD_DB_PUSH=false`;
- backup через `pg_dump`;
- restore rehearsal обязателен до freeze starter;
- schema ownership остаётся у Payload + migrations.

---

## 1.3 Local Media

Payload Media хранится локально на AMS Server.

Не использовать `@payloadcms/storage-s3`.

Файлы должны жить **в persistent host directory**, а не внутри disposable Docker filesystem.

Пример:

```text
/var/lib/ams/realtbase/media
```

Environment:

```text
MEDIA_DIR=/var/lib/ams/realtbase/media
```

Контейнер получает bind mount / persistent volume.

Media должен отдаваться Nginx напрямую через `alias`, а не копироваться в Next `/public`.

Обязательные свойства Nginx media location:

- read-only delivery;
- запрет исполнения;
- ограничение допустимых MIME/type policy;
- cache headers;
- безопасная обработка path traversal;
- уникальные имена файлов;
- overwrite существующего файла по тому же имени запрещён.

---

## 1.4 Storage Boundary

Несмотря на локальное хранение, доступ к media должен проходить через **одну storage boundary abstraction**.

Цель:

```text
Project UI / Payload
        ↓
Storage Boundary
        ↓
Local filesystem adapter (starter default)
```

В будущем клиентский clone должен иметь возможность вернуть S3-compatible storage заменой adapter/config, а не переписыванием всего media-кода.

---

## 1.5 Feed images

Feed/XML images по умолчанию остаются external URLs.

Не строить сейчас отдельный image-mirroring pipeline.

Обязательные правила:

- exact approved hosts;
- никакого wildcard;
- один общий source of truth approved image hosts;
- Safe Outbound Client и image rendering используют один и тот же host registry;
- локальное зеркалирование feed images — отдельный future trigger.

---

## 1.6 Timezone

Вся системная логика хранит и сравнивает даты в UTC.

Project timezone используется только для:

- отображения;
- UI;
- owner-facing schedules, если это явно требуется.

Retention, heartbeat, retry, stale thresholds, `nextDueAt` и operational timestamps считаются в UTC.

---

# 2. Git и execution workflow

## 2.1 Integration branch

Создать:

```text
hardening/realtbase-starter
```

Все эпики выполняются через отдельные epic branches.

Схема:

```text
hardening/realtbase-starter
        ↓
epic/N-name
        ↓
задачи
        ↓
targeted checks
        ↓
commit + push
        ↓
PR → hardening/realtbase-starter
        ↓
review
        ↓
merge
        ↓
auto-transition → следующий эпик
```

---

## 2.2 Автоматический переход, review и merge gate

Автоматизация может **только начинать следующий эпик после уже состоявшегося merge**. Она не имеет права автоматически сливать PR.

Каждый epic PR проходит diff review перед merge.

Для `RISKY`-эпика дополнительно обязательно:

- required proof выполнен на exact head SHA;
- артефакты лежат в `docs/proofs/epic-N/`;
- владелец/ревьюер явно подтвердил proof и merge;
- migration/security/access impact отмечен в closing report.

После одобренного merge можно автоматически начать следующий эпик без отдельного вопроса владельцу.

Автопереход останавливается при:

- destructive migration;
- новом production component;
- смене внешнего контракта продукта;
- действии с production;
- архитектурном blocker, который нельзя разрешить в рамках текущей конституции.

## 2.3 Merge в main

Не делать merge каждого эпика в `main`.

Использовать контрольные вехи:

```text
EPIC 0–1   → MAIN CHECKPOINT 1
EPIC 2–4   → MAIN CHECKPOINT 2
EPIC 5–7   → MAIN CHECKPOINT 3
EPIC 8–9   → MAIN CHECKPOINT 4
EPIC 10    → FINAL MAIN CHECKPOINT
```

После checkpoint:

1. PR `hardening/realtbase-starter → main`;
2. broader verification;
3. merge;
4. обновить integration branch от нового `main`;
5. продолжить следующий эпик.

---

## 2.4 Production

`merge → main` **не означает deploy**.

Production/deployment выполняется только по отдельной explicit owner command.

Ни один эпик не должен автоматически выполнять production deployment.

---

# 3. Testing policy

## 3.1 Обычная задача

Запускать только targeted check.

Не запускать полный `pnpm verify` после каждой задачи.

---

## 3.2 Обычный эпик

Запускать:

- relevant unit tests;
- relevant integration tests;
- affected typecheck;
- affected lint;
- guards, если менялись boundaries.

---

## 3.3 RISKY epic

Required proof является **жёстким gate**.

Без proof эпик нельзя считать завершённым и нельзя автоматически переходить к следующему.

Артефакты proof сохранять:

```text
docs/proofs/epic-N/
```

Минимум:

- команда запуска;
- exact commit SHA;
- краткий результат;
- relevant logs/output;
- PASS/FAIL;
- дата;
- известные ограничения.

Запрещено писать `CHECKED`, `GREEN`, `DONE`, если proof не запускался.

---

## 3.4 Каноническая command surface

Внешний verification-контракт проекта содержит ровно три канонические команды:

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

`typecheck`, `lint`, architecture/design/security guards, build и scoped test suites могут существовать как внутренние subcommands/scripts, но не образуют параллельный обязательный контракт.

### `verify:daily`

Используется для обычного ежедневного цикла и main checkpoints. Включает минимум:

- typecheck;
- lint;
- architecture/security/design guards;
- guard-baseline validation;
- быстрые targeted tests;
- build-smoke, если укладывается в daily budget.

### `verify`

Полный release-quality набор проекта: обязательные tests/guards/build, кроме DB-specific schema proof.

### `verify:schema`

Проверяет реальную PostgreSQL schema/invariants на выделенной БД.

---

## 3.5 Main checkpoint

Обязательно:

```bash
pnpm verify:daily
```

Плюс required proofs эпиков текущей вехи и `pnpm verify:schema`, если checkpoint содержит migration/schema change.

---

## 3.6 Final checkpoint

Обязательно:

```bash
pnpm verify
pnpm verify:schema
```

Плюс полный integration/E2E/security/visual/operations proof из EPIC 10.

---

## 3.7 Формат closing report каждого эпика

Каждый epic PR закрывается отчётом:

```text
СДЕЛАНО
ПРОВЕРЕНО ФАКТИЧЕСКИ
MIGRATION / SECURITY / ACCESS IMPACT
НЕ ПРОВЕРЕНО
РИСКИ / FOLLOW-UP
EXACT HEAD SHA
```

Нельзя подменять `ПРОВЕРЕНО ФАКТИЧЕСКИ` описанием того, что код «должен» делать.

Для UI-задач EPIC 8–9 closing report использует второй формат Core §20:

```text
REUSED / CREATED + OWNERSHIP
VARIANTS / NEW TOKENS + WHY
ARBITRARY VALUES + JUSTIFICATION
RESPONSIVE-STATES-A11Y
SEO
ПРОВЕРЕНО
НЕ ПРОВЕРЕНО
РИСКИ
```



# 4. Guard migration policy

## 4.1 Проблема

Новые строгие guards нельзя включить так, чтобы уже существующий legacy drift мгновенно сделал CI бесполезно красным.

## 4.2 Guard baseline

Создать:

```text
docs/guard-baseline.json
```

Каждая запись:

```json
{
  "rule": "GUARD_ID",
  "file": "path/to/file",
  "reason": "existing baseline violation",
  "removeByEpic": 5
}
```

Правила baseline:

1. baseline формируется один раз в EPIC 1;
2. добавить новое исключение после freeze baseline нельзя;
3. список может только сокращаться;
4. изменённая строка/новое нарушение не может маскироваться старым exception;
5. к EPIC 10 baseline обязан быть пуст;
6. `guard-baseline.json` пустой → файл можно удалить.

Это не warn-mode. Existing known debt разрешён временно, новый debt запрещён.

---

# EPIC 0 — SOURCE OF TRUTH, LOCAL TOPOLOGY, JOB OWNERSHIP

**Risk:** RISKY — topology, backup/recovery и jobs ownership относятся к production-impact changes.

**Цель:** сначала сделать документацию и topology правдивыми, прежде чем менять runtime.

## 0.1 Синхронизировать документы

Обновить:

- `docs/PROJECT.md`;
- `docs/OPERATIONS.md`;
- architecture docs;
- release checklist;
- `.env.example`;
- deploy docs.

Зафиксировать:

```text
starter runtime = AMS Server
DB = local PostgreSQL
CMS media = local persistent filesystem
S3 = not used by starter
Managed PostgreSQL = not used by starter
profile = REALTY_BASE
```

---

## 0.2 ADR: local infrastructure deviation

Создать короткий ADR:

```text
docs/adr/ADR-LOCAL-STARTER-STORAGE.md
```

Зафиксировать:

- почему starter использует local PostgreSQL;
- почему media local;
- почему это допустимо только для starter/reference contour;
- storage boundary сохраняется;
- client projects принимают собственное topology decision.

---

## 0.3 Удалить S3 runtime

Удалить из starter-runtime:

- `@payloadcms/storage-s3` dependency;
- `s3Storage()`;
- `S3_*` env;
- S3-specific topology checks;
- S3-specific starter docs.

Не удалять саму концепцию storage adapter boundary.

---

## 0.4 Local Media

Добавить local storage adapter/config.

Обязательные параметры:

- `MEDIA_DIR`;
- persistent mount;
- unique file naming;
- overwrite forbidden;
- safe extensions/MIME;
- media URL mapping.

Nginx отдаёт media через alias.

Payload Media access:

```text
read = public
create/update/delete = owner-only
```

`media` обязана иметь запись в `config/raw-rest-boundary.json`. Закрытый anonymous `read` не допускается: это ломает публичный рендер изображений.

---

## 0.5 Backup contract

Backup starter = согласованная пара:

```text
pg_dump + MEDIA_DIR snapshot/archive
```

Они должны сниматься в одном backup window.

Hard Contract 28: backup **automatic**, не только ручной rehearsal.

Обязательно зафиксировать в OPERATIONS:

- расписание (cron/systemd timer);
- ретенция копий;
- offsite / второй носитель вне диска AMS Server (DB, media и единственная backup-копия не могут жить только на одном volume);
- проверка целостности последней копии;
- alert «DB backup failure» / «media backup failure» из §7.9 при пропуске, порче или отсутствии offsite copy.

Restore rehearsal проверяет:

- database restored;
- media restored;
- references в DB не указывают на отсутствующие файлы;
- files не остаются orphan без metadata, где это проверяемо.

---

## 0.6 Disk monitoring

Так как DB и media живут на одном сервере, обязательно добавить monitoring свободного места.

Alert thresholds зафиксировать в OPERATIONS.

Disk-full должен считаться critical infrastructure condition.

---

## 0.7 Exactly one jobs runner

Зафиксировать hard invariant:

> В любой момент времени существует ровно один jobs-active application runtime.

Обязательное:

- только один container/runtime с `JOBS_AUTORUN=true`;
- остальные instance при rollout стартуют с `false`;
- handover documented;
- deploy/compose не должен случайно поднимать два jobs-active container;
- health/operations показывают jobs-owner identity.

Добавить mechanical/deploy guard, где возможно.

---

## 0.8 Version-sensitive verification

Перед реализацией следующих эпиков сверить актуальные official docs для pinned versions:

- Payload Local API access;
- Payload transactions;
- Payload Jobs;
- concurrency;
- `autoRun`;
- `disableScheduling`;
- Payload job claiming behavior;
- Next.js 16 proxy/status/rewrite behavior;
- `generateSitemaps`;
- image API.

Результат зафиксировать в:

```text
docs/proofs/epic-0/version-sensitive.md
```

---

## 0.9 Production-like staging contour

Для starter роль staging выполняет отдельный **production-like contour** с:

- отдельной PostgreSQL database;
- отдельным media directory;
- отдельными secrets;
- sanitized/test data;
- production-equivalent Nginx/Payload/Next settings там, где это безопасно;
- отдельным управлением `JOBS_AUTORUN`.

Перед migration/schema, parser/source-identity, auth/access, major upgrade и low-level claim/bulk SQL proof сначала проходит на staging contour.

`OPERATIONS.md` описывает создание, reset и использование staging.

Запрещено: `production PII dump → staging` (Core §16.6 / §23). Staging получает только sanitized/test data.

---

## 0.10 Project configuration source

Добавить/зафиксировать:

```text
src/project/project.config.ts
```

Это source of truth для project-level knobs, не являющихся секретами:

- `dispatcherIntervalMinutes`;
- `maintenanceIntervalMinutes`;
- `dispatchBatchSize`;
- `approvalTtlMinutes`;
- `leadRetentionDays`;
- `archiveRetentionDays`;
- `staleDataSlaMinutes`;
- routing policy;
- cache invalidation mode/proof status;
- reserved namespaces;
- extended-profile triggers;
- approved feature flags.

Env используется для environment/secrets. PROJECT.md документирует значения/политику. Не держать один knob в нескольких несогласованных местах. `dispatchBatchSize` не дублируется env-именем `DISPATCH_BATCH_SIZE`.

---

## 0.11 PROJECT.md mandatory minimum

До выхода из EPIC 0 в `PROJECT.md` явно определить минимум:

- profile;
- topology deviation;
- dispatcher interval;
- maintenance interval;
- safety threshold;
- max deactivations;
- approval TTL;
- lead/archive retention;
- lead channel routing policy;
- credentialRef mapping;
- outbound/image host policy;
- cache mode и cache proof status;
- `staleDataSlaMinutes`;
- reserved URL namespaces;
- extended-profile activation triggers;
- jobs runner ownership;
- staging policy;
- backup schedule, retention, offsite location, integrity check.

---

## 0.12 Canonical verification command surface

До MAIN CHECKPOINT 1 ввести и документировать единственную обязательную verification surface:

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

Внутренние `typecheck` / `lint` / `quality:*` / `build` остаются subcommands и не образуют параллельный gate-контракт.

---

## 0.13 §18A proof matrix

Создать живой файл:

```text
docs/proofs/18A-matrix.md
```

Строка на каждый пункт `A / B1 / B2 / C / D / E / F / G`: эпик → артефакт → `PASS` / `FAIL` / `NOT-CLAIMED`.

Для B1 явно:

```text
B1 = NOT-CLAIMED, mode=http
```

Иначе in-process cache формально остаётся незакрытым пунктом Core.

## Acceptance EPIC 0

- docs/runtime topology не противоречат друг другу;
- local DB и local media описаны как осознанный starter contract;
- S3 runtime отсутствует;
- media persistent;
- jobs owner = exactly one;
- backup contract: automatic + rotation + offsite + integrity;
- canonical `verify:*` commands существуют;
- §18A matrix создана, B1 = NOT-CLAIMED;
- version-sensitive assumptions проверены.

---

# EPIC 1 — CANONICAL STRUCTURE, CONTRACTS, GUARDS

**Risk:** RISKY — эпик меняет auth/access semantics и вводит approved low-level DB paths.

**Цель:** поставить архитектурную защиту до подключения опасного runtime.

## 1.1 Canonical structure

Привести структуру к смыслу Core 5.5 без ненужного косметического переименования сверх required boundaries.

Целевая схема:

```text
src/core/data-access/public
src/core/data-access/system
src/core/data-access/system/jobs
src/core/data-access/ingest

src/core/dto
src/core/security
src/core/seo
src/core/ingest
src/core/leads
src/core/cache
src/core/operations

src/project/collections
src/project/access
src/project/jobs
src/project/env
src/project/project.config.ts

packages/contracts
packages/ui
```

Если часть текущих путей оставляется — оформить ADR с причиной и доказать, что dependency boundaries сохраняются.

---

## 1.2 Один canonical contracts source

Сделать `packages/contracts` единственным source of truth для presentation/domain DTO contracts.

Убрать дублирующиеся DTO/contracts из `packages/ui/src/contracts/**`.

UI импортирует contracts из `packages/contracts`.

Добавить guard:

- запрещает persistence/runtime types в `packages/contracts`;
- запрещает duplicate DTO definitions внутри `packages/ui`.

---

## 1.3 Dependency direction

Механически запретить:

```text
packages/ui → Payload/DB/project persistence
packages/contracts → Next/Payload/DB
core domain → packages/ui
core → project persistence where not explicitly allowed
```

---

## 1.4 Approved low-level DB paths

Явно создать approved low-level data-access layer для операций, которым нужна настоящая PostgreSQL atomicity/bulk semantics.

Например:

```text
src/core/data-access/system/sql/
src/core/data-access/ingest/sql/
```

Разрешить low-level SQL только здесь и в migrations.

Причина:

- atomic claims;
- `UPDATE ... WHERE ... RETURNING`;
- `SELECT ... FOR UPDATE SKIP LOCKED` при необходимости;
- bounded bulk `lastSeenAt`;
- facet aggregation;
- schema-verification operations.

Весь остальной `db.execute`, `sql\`` и прямой `pg` запрещён guard-ом.

---

### Low-level SQL safety rules

Approved SQL layer обязан соблюдать:

- только параметризованные запросы;
- string interpolation SQL запрещена;
- raw значения из HTTP request не передаются в SQL layer;
- исключение — schema-validated IDs/enums/typed values после domain validation;
- dynamic identifiers только из compile-time allowlist;
- generic `query(sql: string)` наружу не экспортируется.

## 1.5 Local API guard

Любой Payload Local API call обязан иметь explicit access mode.

Public/user operations:

```text
overrideAccess: false
```

Privileged operation:

только через approved System Gateway.

Никаких implicit privileged calls в job handlers.

Mechanical guard Core §18.4 #1: `overrideAccess: true` вне System Gateway → красный CI.

---

## 1.6 Outbound guard

Запретить configurable outbound HTTP вне Safe Outbound Client / approved transport layer.

Guard должен ловить не наличие Safe Outbound Client, а фактический direct outbound usage.

---

## 1.7 Test fixture destinations без глобального SSRF bypass

Не вводить project/runtime флаг, который глобально разрешает private network.

Integration fixture-серверы регистрируются как **explicitly approved destinations** в test-only configuration, доступной только test harness.

Правила:

- production/project env не может включить это разрешение;
- test destination = exact host + port;
- прочие localhost/RFC1918/link-local адреса блокируются;
- production-like profile не читает test destination config.

Proof:

- зарегистрированный fixture destination разрешён только тестам;
- соседний localhost port запрещён;
- private RFC1918 запрещён в production profile.

## 1.8 Public field guard

Private/internal поля запрещены в:

- public select;
- DTO;
- client props;
- analytics output.

Список private fields должен жить централизованно или извлекаться из schema metadata.

---

## 1.9 Raw REST fail-closed classification

Каждая Payload collection должна быть явно классифицирована в `config/raw-rest-boundary.json`.

Новая collection без classification → красный CI.

Нельзя полагаться только на denylist существующих коллекций.

`media` классифицируется явно. Публичный jobs endpoint не создаётся: classification/guard API-маршрутов обязан падать, если появляется `/api/.../jobs` (или эквивалент) как public/application CRUD.

---

## 1.10 Raw REST auth semantics

Убрать доверие к простому наличию:

- `Authorization` header;
- строки `payload-token` в Cookie.

Fake auth signal не должен открывать business REST.

Проверить legit authenticated admin path отдельно.

---

## 1.11 UI guards

Усилить:

- один `components.json`;
- shadcn = один primitive foundation;
- duplicate controls запрещены;
- project `dark:` запрещён, пока dark theme disabled;
- raw design literals;
- duplicate contracts;
- persistence imports в UI;
- dead-token guard будет добавлен в EPIC 9.

---

## 1.16 Mechanical guards Core §18.4 / §23

Помимо уже названных #2, #3, #4, #6, #9, #10, #11 добавить и freeze в `docs/guard-baseline.json`:

```text
#1 overrideAccess:true вне System Gateway
#5 wildcard CORS
#7 obvious secret exposure
#8 top-level next/* внутри ingest / job-handler / cache graph
    (разрешён только lazy dynamic import в approved branch, Core §11.1)
generic application CRUD payload-jobs вне src/core/data-access/system/jobs
wildcard remote image hosts в next.config / image remotePatterns
public jobs endpoint
```

Обращения к `payload-jobs` вне `src/core/data-access/system/jobs` запрещены. Trusted inspection/recovery живёт только там (`overrideAccess: true` — whitelist System Gateway).

---

## 1.17 Owner bootstrap и self-registration

Core §16.1:

- self-registration выключена;
- первый owner создаётся только controlled bootstrap;
- bootstrap — whitelist System Gateway operation, не ручная правка БД и не открытая регистрация.

Зафиксировать script/runbook, тест «registration closed» и тест «bootstrap создаёт ровно одного owner». Клон без этого пути непригоден.

---

## 1.18 Media collection access

Проверить и исправить:

```text
media.read = public
media.create/update/delete = owner-only
media ∈ raw-rest-boundary.json
```

Proof: anonymous может получить разрешённый media URL/file; anonymous/editor без роли не может create/update/delete.

---

## 1.12 Guard baseline

Создать и freeze `docs/guard-baseline.json`.

Новые exceptions запрещены.

К EPIC 10 baseline = 0.

---

## 1.13 Field-level access как первый эшелон

DTO/select — второй эшелон. Приватные поля защищаются на уровне Payload field access.

Минимальный inventory:

- `properties.unitNumber`;
- `properties.cadastralNumber`;
- `properties.internalComment`;
- `properties.ownerContact`;
- import/internal ownership fields по policy;
- lead PII;
- delivery/internal diagnostics.

Добавить role/access test: поле недоступно authenticated user без достаточной роли даже через прямой collection/API path.

---

## 1.14 Base schema completeness audit

Проверить и при необходимости migration-only довести collections/schema:

- pages;
- properties;
- media;
- feed-sources;
- import-runs;
- import-issues;
- leads;
- lead-deliveries;
- redirects;
- users/jobs support collections Payload.

Imported inventory policy:

- versions = off;
- drafts = off;
- document locking = off, если Core не требует обратного для конкретной collection.

Feed source completeness:

- `nextDueAt` NOT NULL/default/normalization;
- `lastEtag`;
- `lastModified`;
- `lastFeedHash`;
- `lastOfferCount`;
- `lastSuccessfulRunAt`;
- `lastFullRunAt`;
- `safetyThresholdPercent`;
- `maxDeactivationsPerRun`;
- `deactivationApproval` group;
- refresh/scheduling fields.

Property completeness:

- newbuild-readiness identity fields;
- required indexes;
- `needsReview` operational flag;
- source/origin/ownership metadata.

Любое schema изменение проходит staging proof.

---

## 1.15 Reserved namespace guard

Зафиксировать reserved namespaces:

```text
/novostroyki/*
/komplex/[slug]
/journal/*
/journal/[slug]
```

Ни CMS page, ни unrelated static route не может занять reserved namespace. Добавить mechanical guard/router test.

## Acceptance EPIC 1

- guards работают;
- current known violations учтены только через frozen baseline;
- new violations не проходят;
- contracts source один;
- approved low-level SQL paths существуют;
- raw REST classification fail-closed, включая media и запрет public jobs endpoint;
- `src/core/data-access/system/jobs` — единственный payload-jobs path;
- owner bootstrap + self-registration off;
- media.read public / writes owner-only.

---

# MAIN CHECKPOINT 1

После EPIC 0–1:

```text
hardening/realtbase-starter → main
```

Gate:

```text
pnpm verify:daily
required proofs EPIC 0–1
pnpm verify:schema
```

`verify:schema` обязателен: §1.14 меняет схему. Команды из §0.12 уже существуют к этому checkpoint. Параллельный набор `typecheck` / `lint` / `quality:*` / `build` как отдельный gate запрещён.

Production не выполнять.

---

# EPIC 2 — SAFE FEED FETCH + STREAMING XML PARSER

**Risk:** RISKY

## 2.1 Safe feed fetch

Переписать production feed fetch поверх Safe Outbound Client.

Обязательные свойства:

- exact allowlist;
- HTTPS default;
- explicit approved HTTP exception;
- DNS resolution validation;
- private/link-local block;
- manual redirect validation;
- timeout;
- AbortSignal;
- maximum response bytes.

---

## 2.2 Conditional GET

Поддержать:

- ETag;
- Last-Modified;
- HTTP 304.

304:

```text
status = unchanged
inventory business writes = 0
```

---

## 2.3 Streaming hash

На HTTP 200 считать SHA-256 тела потока.

Не требовать второй полной загрузки body в память.

---

## 2.4 Настоящий streaming XML/SAX parser

Удалить regex-parser из production path.

Выбрать SAX/streaming XML library.

Зафиксировать выбор ADR.

Обязательные safety controls:

- DTD disabled;
- external entities disabled;
- max nesting depth;
- max attributes;
- max text node;
- max offer size;
- cancellation;
- malformed offer isolation;
- parser completion signal;
- critical structural anomaly → run = `suspicious` (Core §9.4), не silent skip всего файла как success.

Полный массив всех offers не должен требоваться в памяти.

---

## 2.5 Realty field mapping

Нормализовать минимум:

```text
externalId
category
dealType

title
description

priceMinor
rooms
totalArea
livingArea
kitchenArea
floor
floors

region
locality
district
street
house
publicAddress

lat
lng

externalComplexId
externalComplexName
externalBuildingId
externalLayoutId

images
```

---

### Market boundary

Parser/normalizer **не принимает `market` из feed payload**.

```text
feed-origin property.market = feedSource.market
manual-origin market = validated owner/editor input
```

Добавить unit + integration test, что XML/YRL не способен переопределить source market.

## 2.6 Areas

Все площади нормализовать в м².

Если feed использует иные units — выполнить явную конверсию.

Проверить фактический DB type и precision.

---

## 2.7 Money

Проверить реальный PostgreSQL type `priceMinor` / `pricePerMeterMinor`.

Исключить int32 overflow.

Зафиксировать rounding policy.

---

## 2.8 Shared derived-field calculator

Создать одну domain function, например:

```text
calculatePropertyDerivedFields()
```

Она используется:

- ingest;
- manual `beforeChange`;
- migration/recompute tools при необходимости.

Минимум вычисляет:

```text
pricePerMeterMinor
```

При manual change `priceMinor` или `totalArea` derived value пересчитывается автоматически.

Нельзя иметь отдельную формулу в ingest и отдельную в Admin hook.

---

## Required Proof EPIC 2

Сохранить в `docs/proofs/epic-2/`:

- normal real feed;
- large feed;
- truncated feed;
- malformed XML;
- `<!ENTITY>` / DTD fixture;
- 304;
- max-size abort;
- explicitly registered test fixture destination работает;
- незарегистрированный localhost/private destination блокируется;
- production profile не может включить test fixture allowance.

---

# EPIC 3 — REAL IMPORT RUNTIME

**Risk:** RISKY

## 3.1 Atomic dispatcher claim — конкретный механизм

Не использовать find-then-update.

Default approved implementation:

```sql
UPDATE feed_sources
SET ...
WHERE id = $id
  AND enabled = true
  AND next_due_at <= $now
RETURNING id;
```

Либо bounded SQL claim через `FOR UPDATE SKIP LOCKED`, если это лучше соответствует batch dispatcher.

Реализовать внутри approved low-level ingest data-access из EPIC 1.4.

Codex не должен самостоятельно подменять это Payload find/update без доказанной atomic semantics.

---

## 3.2 Exactly one jobs runner остаётся обязательным

Даже при domain-level atomic claim не полагаться на multi-runner Payload Jobs.

Runtime invariant:

```text
jobs-active instances = 1
```

---

## 3.3 Dispatcher bounded batch

Один tick может claim ограниченное число due sources.

Параметр:

```text
project.config.ts → dispatchBatchSize
```

Default фиксируется в PROJECT.md. Env-дубль `DISPATCH_BATCH_SIZE` не вводить.

Никакого catch-up storm.

---

## 3.4 `importFeed` handler

Удалить заглушку.

Pipeline:

```text
queued import-run
↓
atomic queued → running
↓
start heartbeat
↓
Safe Outbound fetch
↓
conditional GET/hash
↓
SAX parse
↓
normalize
↓
bounded ingest
↓
safe deactivation decision
↓
source baseline update
↓
cache invalidation
↓
terminal run
```

---

## 3.5 Atomic run transition

Default mechanism:

```sql
UPDATE import_runs
SET status='running', started_at=$now, heartbeat_at=$now
WHERE id=$id AND status='queued'
RETURNING id;
```

Если `RETURNING` пуст:

- handler прекращает работу;
- никаких inventory writes;
- никаких external side effects.

---

## 3.6 Heartbeat

Heartbeat обновляется вне длинной ingest transaction.

Интервал конфигурируемый, default зафиксировать.

Независимый DB reader должен видеть изменение heartbeat во время долгого импорта.

---

## 3.7 Feed identity DB guarantees

Сохранить/проверить unique index:

```text
(feedSource, externalId)
WHERE origin = feed
```

Дополнительно создать/проверить index для source-scoped bulk touch/deactivation, например комбинацию:

```text
feedSource + status + lastSeenAt
```

DB-level guarantee является частью isolation invariant.

---

## 3.8 PayloadFeedIngestRepository

Подключить pure-domain ingest к реальному persistence.

Требования:

- bounded batches;
- external HTTP вне transaction;
- source scoped;
- unique DB identity;
- no feed cross-write.

---

## 3.9 Idempotency

Сначала сравнивать business `importHash`.

Если hash равен:

- business fields не обновлять;
- record считается unchanged.

`lastSeenAt` не участвует в business diff.

---

## 3.10 Bulk lastSeenAt

Технический touch делать bounded low-level bulk update через approved SQL path.

Не выполнять тысячи отдельных Payload updates.

Bulk path обязан быть source scoped.

---

## 3.11 Derived fields

Использовать shared calculator EPIC 2.8.

---

## 3.12 Safe deactivation

Missing inventory определяется только внутри source scope.

Deactivation разрешена только если одновременно:

- run полностью дочитан;
- нет critical structural error;
- identity valid;
- run не interrupted;
- не first baseline run;
- safety threshold passed;
- `plannedDeactivations <= maxDeactivationsPerRun`;
- approval, если required, принадлежит этому run.

---

## 3.13 Suspicious approval

Approval:

- run-specific;
- single-use;
- TTL;
- `consumedAt` после применения;
- нельзя переносить на новый run.

---

## 3.14 Feed source baseline — точные state rules

- `lastAttemptAt` — каждый attempt до fetch;
- `lastSuccessfulRunAt` — на `success` и `unchanged`;
- `lastFullRunAt` — только после полностью дочитанного structurally valid run;
- `lastOfferCount` — только после полного successful run, прошедшего safety checks; `unchanged` его не меняет;
- `lastEtag` / `lastModified` — только по подтверждённой HTTP policy;
- `lastFeedHash` — после полного успешного 200-body processing;
- truncated/failed/interrupted/suspicious не портят baseline, кроме `lastAttemptAt` и разрешённых diagnostics.

Freshness alerts используют `lastSuccessfulRunAt`, поэтому 304/unchanged считается успешным контактом с источником.

## 3.15 Cache invalidation

После успешной записи данных.

Разделить:

```text
data result
cache invalidation result
```

Cache warning не превращает успешный data import в failed transaction.

Если инвалидация не довёл публичные ответы до свежести дольше `staleDataSlaMinutes` из `project.config.ts`, поднимается alert «cache invalidation failure» (§7.9).

---

## 3.16 Import issues

Записывать bounded/redacted issues и агрегированные counters.

Не складывать raw XML в operational tables.

---

## 3.17 Market ownership invariant

На write path:

```text
feed origin   → feedSource.market
manual origin → validated manual/admin input
```

Parser output `market` отсутствует/игнорируется. Guard/test: feed не может записать property в другой market.

---

## 3.18 Canonical Payload Jobs configuration

Проверить Hard Contract:

```text
enableConcurrencyControl = true
queue system          disableScheduling = false
queue maintenance     disableScheduling = false
queue imports         disableScheduling = true
queue lead-deliveries disableScheduling = true
```

Дополнительно:

- implicit `default` queue не используется;
- одна queue не планируется двумя механизмами одновременно;
- `autoRun` и `bin handle-schedules` не конкурируют за scheduling одной queue;
- import concurrency key = `import:feed:<feedId>`, `exclusive: true`;
- delivery concurrency key = `delivery:<leadId>:<channelId>`, `exclusive: true`;
- import/delivery tasks: `retries=0`;
- `autoRun.limit` не считается proof числа parallel workers;
- dispatcher formula: `nextDueAt = max(now + interval, previousNextDueAt + interval)`.

Required proof на pinned Payload version: одинаковый concurrency key реально сериализует задачи ожидаемым образом.

---

## 3.19 Maintenance static schedules

Зарегистрировать schedules:

- `jobsJanitor`;
- `leadRetentionCleanup`;
- `catalogLifecycle`;
- `recoverLeadDeliveries`.

Интервал = `maintenanceIntervalMinutes` из `project.config.ts` / PROJECT.md. Recovery thresholds считаются от documented interval.

---

## 3.20 HTTP cache invalidation proof path

Default starter mode:

```text
CACHE_INVALIDATION_MODE=http
cache proof status = http
in-process mode = not claimed
```

Требования:

- один batched POST на `INTERNAL_REVALIDATE_BASE_URL`;
- typed target constructors;
- no synchronous per-item revalidation;
- internal secret проверяется безопасно и не логируется;
- endpoint rate-limited;
- self-call не блокируется собственным Nginx rate limit;
- после POST публичный ответ реально свежий.

Proof §18A.B2: `docs/proofs/epic-3/cache-http-self-call.md`. Строка B2 в `docs/proofs/18A-matrix.md` = PASS после proof. B1 остаётся `NOT-CLAIMED, mode=http`.

---

## 3.21 Owner-facing import operations

Добавить controlled operations:

- manual import конкретного feed source;
- approve конкретного suspicious run;
- read-only jobs/import diagnostics;
- отображение attempt/success/full run/heartbeat/status.

Trusted inspection, orphan check и emergency unstuck `payload-jobs` выполняются только через `src/core/data-access/system/jobs`. `jobsCollectionOverrides` использовать только если pinned Payload version поддерживает безопасный read-only вариант; иначе read model поверх этого модуля. Emergency unstuck — только документированная operation в `OPERATIONS.md`, без arbitrary editing system fields и без generic application CRUD.

## Required Proof EPIC 3

- два одновременных dispatcher claim → один run;
- same feed → 0 business rewrites;
- Feed A не меняет Feed B;
- DB unique constraint rejects duplicate source identity;
- truncated feed → 0 mass deactivation;
- interrupted run → 0 deactivation;
- 304 → 0 business writes;
- first run → baseline only;
- approval single-use;
- heartbeat visible externally;
- crash → stale → interrupted → next import works;
- dispatcher не создаёт storm.

---

# EPIC 4 — MANUAL OWNERSHIP, LIFECYCLE, SEO DATA PATH

**Risk:** RISKY

## 4.1 Manual ownership writer — actor-aware

`beforeChange` не должен считать системный import ручным редактированием.

Ownership создаётся только если:

```text
req.user authenticated
AND req.context.source != "import"
AND req.context.source != "system"
```

Системные import calls обязаны выставлять явный context:

```text
req.context.source = "import"
```

---

## 4.2 Field-level ownership policy

Заранее определить список import-owned fields, для которых возможен manual override.

Отдельно определить semantics для:

- scalar fields;
- arrays;
- images;
- address groups;
- derived fields.

Нельзя маркировать весь object как manual из-за изменения одного поля.

---

## 4.3 Return field to feed

Добавить controlled operation:

```text
Return ownership to feed
```

Она удаляет соответствующий override marker.

Следующий import снова получает право обновлять поле.

---

## 4.4 Import не создаёт manual ownership

Обязательный integration proof:

```text
import #1
import #2
→ manualOverrides unchanged / empty
```

---

## 4.5 Manual edit + derived fields

При ручном изменении цены/площади использовать shared derived-field calculator.

`pricePerMeterMinor` не может остаться stale.

---

## 4.6 Slug policy

Slug остаётся immutable public identity после публикации.

Зафиксировать:

- deterministic transliteration/slugify;
- collision suffix policy;
- reuse externalId after archived record;
- feed reappearance semantics;
- old URL preservation.

Не создавать новый slug случайным образом при обычном re-import.

---

## 4.7 Property lifecycle

```text
active
↓
archived
↓ retention
explicit relevant redirect OR 410 Gone
```

Redirect на homepage запрещён.

---

## 4.8 410 mechanism — отдельное техническое решение

Не пытаться вернуть 410 обычным `page.tsx` без доказанной поддержки pinned Next.js.

В EPIC 0 version proof выбрать один supported mechanism:

### Preferred A

Route Handler, который возвращает `410` и корректную HTML/response semantics.

### Alternative B

Proxy/rewrite mechanism, только если pinned Next.js реально позволяет безопасно реализовать это без DB misuse в network boundary.

DB lookup внутри proxy не использовать без доказанного runtime support и архитектурного основания.

Зафиксировать:

- status;
- cache headers;
- noindex;
- redirect/410 lookup ownership;
- отсутствие redirect chains.

---

## 4.9 Redirect collection

Реально подключить `redirects` к public lifecycle path.

Убрать hardcoded `explicitRedirectPath: null`.

---

## 4.10 Sitemap completeness + sharding

Не использовать hard limit `1000`.

Реализовать bounded pagination.

Сразу поддержать sitemap sharding:

- не более 50 000 URL на sitemap;
- sitemap index / `generateSitemaps` или эквивалент pinned Next.js;
- generation cache TTL;
- робот не должен каждый запрос пересчитывать весь catalog.

Для REALTY_BASE фактически обычно будет один shard, но механизм должен быть корректным.

---

## 4.11 Facets

Сначала реализовать **прямую SQL-агрегацию** по всему matching public dataset с покрывающими индексами и тем же publication predicate, что listing.

Не создавать Optimized Read Gateway и persistent `facet-cache` до измеренного bottleneck.

Порядок:

1. корректная aggregate query;
2. indexes;
3. измерение на representative REALTY_BASE fixture в EPIC 10;
4. только при доказанном bottleneck — отдельное owner decision на optimized read path/cache.

Если нужен лёгкий non-persistent snapshot cache, он остаётся cache-layer detail. Новая persistent collection требует owner decision/ADR.

## 4.12 Empty states

Обязательные UI/data states:

- catalog = 0;
- featured property отсутствует;
- images отсутствуют;
- related отсутствуют.

Home никогда не возвращает пустой `null` только из-за отсутствия featured property.

---

## 4.13 Cross-feed field ownership

Зафиксировать priority chain:

```text
manual → explicit field owner → owning feed → empty
```

Для REALTY_BASE identity `(feedSource, externalId)` foreign-feed ownership является вырожденным случаем: другой feed не владеет той же source identity. Это фиксируется ADR/PROJECT.md.

---

## 4.14 Reserved URL namespaces

Проверить router/CMS против reserved namespaces из EPIC 1.15.

---

## 4.15 Full SEO contract

Для indexable route types проверить:

- unique title;
- description;
- canonical;
- Open Graph metadata;
- один логический H1 и корректную heading hierarchy;
- robots.txt;
- structured data только из фактических данных;
- BreadcrumbList при фактических breadcrumbs;
- Property/RealEstateListing schema без выдуманных значений.

---

## 4.16 Filter indexing whitelist

Filtered catalog URLs по умолчанию:

```text
noindex
canonical → base listing/approved canonical target
```

Индексируется только explicit whitelist, зафиксированный в project config/PROJECT.md. Произвольная комбинаторика query params не индексируется. Добавить canonical/noindex/whitelist tests.

## Required Proof EPIC 4

- import не создаёт manualOverrides;
- manual description survives import;
- return-to-feed operation работает;
- manual price/area recomputes derived price;
- archived → 200/noindex;
- expired archived → correct redirect или real 410;
- no redirect chain;
- sitemap содержит весь fixture dataset;
- shard/index contract работает;
- facets используют полный matching dataset и public predicate.

---

# MAIN CHECKPOINT 2

После EPIC 2–4:

```text
main = safe feed fetch + real import + ownership + lifecycle foundation
```

Gate:

```text
pnpm verify:daily
required proofs EPIC 2–4 (import, parser, ownership, lifecycle, SEO data)
pnpm verify:schema
```

Production не выполнять.

---

# EPIC 5 — PUBLIC LEAD INTAKE + TRANSACTIONAL OUTBOX

**Risk:** RISKY

## 5.1 Canonical public endpoint

Создать:

```text
POST /api/public/leads
```

Добавить route в explicit API classification.

---

## 5.2 Intake pipeline

```text
validation
↓
honeypot
↓
fill-time
↓
rate limit
↓
phone normalization
↓
consent
↓
idempotency
↓
DB transaction
```

---

### Rate limiting without Redis

Для single-runtime starter:

- первый эшелон — Nginx;
- второй эшелон допускается in-process limiter;
- он сбрасывается при restart и не является distributed guarantee;
- Redis не добавлять без отдельного trigger/измеренной необходимости.

## 5.3 Real outbox repository

Реализовать persistence adapter существующего `commitLeadOutbox()`.

Одна transaction создаёт:

```text
lead
+
all enabled lead-delivery rows
```

После commit не должно существовать lead без обязательных delivery rows.

---

## 5.4 Public create contract + privileged implementation ADR

Core `leads.create = public create-only endpoint` реализуется как специальный публичный endpoint, а **не** anonymous generic Payload collection create.

```text
public capability = POST /api/public/leads only
generic Payload leads create = not public
transaction implementation = System Gateway / approved repository
```

Это intentional strengthening boundary. Зафиксировать ADR + PROJECT.md + `raw-rest-boundary.json`, чтобы конституция, route classification и implementation не расходились.

## 5.5 Sweeper = primary delivery scheduler

Основная гарантия доставки:

```text
lead transaction creates pending deliveries
↓
recover/sweeper discovers due pending rows
↓
enqueues delivery jobs
```

Прямой enqueue сразу после commit допускается только как **ускорение**, а не как единственный механизм correctness.

Таким образом crash между commit и immediate enqueue не создаёт отдельный correctness path.

---

## 5.6 Direct enqueue optimization

Если immediate enqueue включён:

- ошибка enqueue не откатывает lead;
- pending delivery остаётся discoverable sweeper-ом;
- duplicate enqueue предотвращается claim/job identity logic.

---

## 5.7 Stable lead idempotency

Browser retry / double click не создаёт второй lead.

Idempotency key должен быть стабилен в пределах одной попытки пользователя.

Не использовать timestamp как единственную основу dedupe.

---

## 5.8 Fraud marker

Если используется — keyed HMAC.

Никакого raw IP/User-Agent persistence.

---

## 5.9 Env conditional validation

Если channel включён — обязательны его credential refs/config.

Secrets values не попадают в Git.

---

## Required Proof EPIC 5

- valid lead → one lead + correct delivery rows;
- duplicate submit → same logical lead;
- all external channels unavailable → form success after local commit;
- process killed after DB commit → sweeper всё равно доставляет;
- PII absent from job input/log output.

---

# EPIC 6 — REAL LEAD DELIVERY

**Risk:** RISKY

## 6.1 `deliverLead` handler

Удалить заглушку.

Pipeline:

```text
pending
↓ atomic claim
sending
↓ adapter
↓
delivered / retryable / permanent / unknown
```

---

## 6.2 Atomic delivery claim — конкретный механизм

Default:

```sql
UPDATE lead_deliveries
SET status='sending', claimed_at=$now, heartbeat_at=$now, attempts=attempts+1
WHERE id=$id
  AND status='pending'
  AND next_attempt_at <= $now
RETURNING id;
```

Реализовать через approved low-level system data-access.

Пустой `RETURNING` → никакого outbound HTTP.

---

## 6.3 Adapter contract

Adapter принимает только минимально нужный payload и stable delivery identity.

Обязательное поле:

```text
idempotencyKey
```

Если destination поддерживает `Idempotency-Key` или аналог — использовать его.

Delivery row хранит stable destination idempotency identity.

---

## 6.3A Delivery status mapping

Adapter outcome и persisted status — разные сущности.

Persisted statuses:

```text
pending | sending | delivered | failed | abandoned
```

Mapping:

- delivered → `delivered`;
- retryable/not-delivered → `pending` + `nextAttemptAt`;
- unknown/timeout → `pending` + conservative retry + certainty=`unknown`;
- permanent business/validation failure → `failed`;
- exhausted/owner-abandoned/unrecoverable terminal → `abandoned`.

State-machine tests фиксируют допустимые transitions.

## 6.4 Delivery certainty

Результаты:

```text
delivered
not-delivered
unknown
permanent
```

Timeout после отправки может означать `unknown`.

Unknown нельзя считать гарантированно failed.

---

## 6.5 Retry ladder

Зафиксировать explicit schedule, например Core default:

```text
0m
1m
5m
15m
60m
240m
```

Schedule зависит от attempt number.

---

## 6.6 Unknown retry policy

Для `unknown` использовать более осторожную задержку.

Residual duplicate risk документировать.

Если destination поддерживает idempotency — повтор безопаснее.

---

## 6.7 Max attempts

После лимита:

```text
status = abandoned
abandonedReason = exhausted
```

Retryable не может повторяться бесконечно.

---

## 6.8 Retryable handler semantics

Retryable failure:

- обновить delivery state;
- назначить `nextAttemptAt`;
- handler завершить штатно;
- не throw как platform retry mechanism.

Platform retries для этого task = 0, если сохраняется текущая архитектура state machine.

---

## 6.9 Working adapters

Для starter довести до рабочего baseline:

- MAX;
- custom webhook.

Не реализовывать сейчас все CRM connectors.

Adapter boundary должна позволять позднее добавить:

- amoCRM;
- Bitrix24;
- Telegram;
- custom CRM.

---

## 6.9A Custom webhook security contract

Custom webhook обязан иметь:

- HTTPS;
- HMAC signature;
- timestamp;
- bounded replay window;
- stable idempotency key;
- secret через credentialRef/env, не DB plaintext;
- документированную canonicalization signature input;
- sanitised/bounded response diagnostics.

Если channel активен, `CRM_HMAC_SECRET`/эквивалент обязателен conditional env validation.

Proof: valid signature accepted; tampered body, stale timestamp и replay rejected.

## 6.10 Safe outbound

Все configurable destinations идут через approved transport/Safe Outbound policy.

Per-channel host allowlist.

---

## 6.11 Recovery

Stale sending recovery очищает:

- `jobId`;
- `claimedAt`;
- `heartbeatAt`.

Возвращает row в recoverable pending state.

---

## 6.12 Orphan detection

Не использовать критерий только:

```text
jobId is null
```

Нужно проверять наличие **живого связанного job** только через `src/core/data-access/system/jobs`. Generic CRUD `payload-jobs` запрещён. Pending job с валидным будущим `waitUntil` не считается orphan.

---

## 6.13 Manual retry

Admin не редактирует state-machine произвольно.

Controlled operation:

- append audit entry;
- перевести в approved retry state;
- сохранить attempt history;
- создать максимум один новый job.

---

## Required Proof EPIC 6

- one atomic claim;
- duplicate worker cannot send twice concurrently;
- delivered;
- retryable;
- controlled waitUntil backoff;
- permanent;
- unknown timeout;
- destination idempotency key present;
- max attempts → abandoned;
- stale recovery;
- orphan recovery;
- hostile destination blocked;
- no secret/PII in diagnostics.

---

# EPIC 7 — RETENTION, MEDIA, RUNTIME HARDENING, OBSERVABILITY

**Risk:** RISKY

## 7.1 Lead retention modes

Реально поддержать:

```text
retentionMode = delete | anonymize
```

Не всегда anonymize.

---

## 7.2 Default retention policy

Project-level settings обязательны в `project.config.ts` / PROJECT.md:

```text
leadRetentionDays
archiveRetentionDays
```

Если policy отсутствует:

- destructive cleanup не выполнять;
- поднять operational alert;
- release readiness не считать complete.

Не использовать молчаливый arbitrary default.

---

## 7.3 Delivery diagnostics retention

При lead delete/anonymize согласованно очищать delivery diagnostics.

---

## 7.4 PII в Payload Jobs

Hard rule:

> Job input/output содержит только identifiers и безопасные operational values. Контактные данные лида в job payload запрещены.

Проверить:

- Payload jobs collection;
- job logs;
- failed job output;
- adapter diagnostics;
- webhook response snippets;
- versions/drafts, если где-либо включены для PII collections.

Retention должен учитывать operational job/log data, где PII потенциально могло появиться.

Добавить redaction tests.

---

## 7.5 Local Media finalization

Проверить:

- storage boundary;
- persistent path;
- unique names;
- overwrite disabled;
- Nginx alias;
- backup;
- restore.

---

## 7.6 Runtime env fail-fast без поломки build

Разделить:

### Build-time

`next build` должен проходить без production secret values.

### Migration-time

migration command получает только реально нужную DB конфигурацию.

### Runtime

production-like `start` fail-fast, если отсутствуют обязательные:

- `DATABASE_URI`;
- `PAYLOAD_SECRET`;
- `NEXT_PUBLIC_SERVER_URL`;
- `MEDIA_DIR`;
- internal secrets/config, активные в runtime.

Acceptance обязательно доказывает:

```text
build without secrets = PASS
migrate with migration-required env = PASS
runtime without required secrets = FAIL FAST
```

---

### Mandatory runtime/project env coverage

Проверить минимум:

- `AMS_PROFILE` — обязательный valid enum;
- `TZ` — обязательный;
- canonical database URL mapping;
- canonical public site URL mapping;
- `MEDIA_DIR`;
- runtime secrets;
- conditional lead-channel secrets.

Project knobs (`dispatchBatchSize`, retention days, `staleDataSlaMinutes` и др.) читаются из `project.config.ts`; PROJECT.md документирует политику. Env не дублирует эти knobs.

## 7.7 CORS/CSRF

Exact origins only.

Wildcard запрещён.

---

## 7.7A Security headers и login/admin hardening

Довести и проверить:

- CSP;
- HSTS;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- frame protection;
- secure/httpOnly/sameSite cookies по назначению;
- Nginx rate limits login/public lead/internal sensitive endpoints;
- login attempts/lockout или approved equivalent;
- Admin access policy из PROJECT.md (public+hardened / IP/private/VPN — выбрать и документировать).

Auth/access changes проходят staging proof.

## 7.8 Dynamic recovery thresholds

Развести thresholds:

### Import stale

```text
max(15m, 3 × observed successful duration)
```

### Queued import orphan

```text
max(15m, 3 × dispatcher interval)
```

### Pending delivery orphan

```text
max(5m, 2 × maintenance interval)
```

Не использовать одну универсальную константу.

---

## 7.9 Observability

Довести существующий alerts layer до operational baseline.

Минимум alerts:

- site unavailable;
- DB unavailable;
- disk low;
- overdue feeds;
- stale/interrupted imports;
- suspicious import;
- lead pending backlog;
- abandoned deliveries;
- media backup failure;
- DB backup failure;
- cache invalidation failure beyond `staleDataSlaMinutes`;
- critical outbound integration failure.

---

## 7.10 Independent alert channel

Канал operational alerts **не должен совпадать с единственным lead delivery channel**.

Иначе отказ messenger одновременно скрывает:

- лиды;
- уведомление о том, что лиды не доставляются.

Зафиксировать primary и fallback alert destination в OPERATIONS.

---

## 7.11 One jobs runner runtime proof

На production-like compose доказать:

```text
JOBS_AUTORUN=true exactly once
```

Добавить health/diagnostic evidence jobs-owner identity.

---

## 7.12 External uptime monitoring

Добавить внешний monitor, независимый от AMS Server, минимум для public homepage/health и TLS/HTTP availability.

Feed overdue threshold:

```text
max(2 hours, 3 × refreshIntervalMinutes)
```

Internal alerts остаются для feed/jobs/lead conditions, но server-down сигнал приходит с внешнего контура.

## Required Proof EPIC 7

- delete retention;
- anonymize retention;
- job payload without PII;
- logs redacted;
- build without runtime secrets;
- runtime fail-fast;
- media survives container recreate;
- DB+media restore pair;
- disk alert;
- alert channel independent;
- exactly one jobs runner.

---

# MAIN CHECKPOINT 3

После EPIC 5–7:

```text
main = functional backend baseline
catalog + import + leads + delivery + retention + local media
```

Gate:

```text
pnpm verify:daily
required proofs EPIC 5–7 (intake, delivery, retention, media, runtime, alerts)
pnpm verify:schema
```

Production не выполнять.

---

# EPIC 8 — ONE CANONICAL UI PATH

**Risk:** RISKY для 8.6–8.9 (image/media pipeline); остальные UI refactor tasks STANDARD.

## 8.1 Canonical UI owner

Единственный owner reusable presentation:

```text
packages/ui
```

Application path:

```text
src/app
↓
Public Gateway
↓
packages/contracts DTO
↓
packages/ui
```

---

## 8.2 Убрать production fixture presentation

Routes больше не импортируют production UI из:

```text
src/components/fixture/*
```

Перенести нужные components/sections в `packages/ui`.

Fixture может остаться только как explicit demo/test data mode.

---

## 8.3 Semantic sections

Разбить большие page components.

### Home

- Hero;
- Services;
- Featured;
- Process;
- Trust;
- Lead CTA.

### Catalog

- Hero;
- Filters;
- Result toolbar;
- Grid/List;
- Empty;
- Pagination;
- Supporting CTA.

### Property

- Gallery;
- Summary;
- Characteristics;
- Description;
- Actions;
- Related;
- Lead CTA/Form.

Page = composition, а не monolith.

---

### Base static page set

Starter обязан содержать production-ready composition для:

- главной;
- каталога;
- объекта;
- услуг;
- о компании;
- ипотеки;
- продать;
- сдать;
- контактов;
- legal/privacy/consent;
- 404/not-found;
- lifecycle 410 path, если выбран route-handler mechanism.

Клон не должен требовать изменения `packages/ui` ради этих типовых страниц.

После §8.3 выполнить Drift Audit **REPORT ONLY** (Core §19: после первой представительной страницы). Findings не чинить в том же PR, если это не P0 blocker текущей задачи.

## 8.4 Production-ready copy

Удалить из public UI тексты про:

- fixture;
- DTO;
- architecture;
- XML implementation;
- «подключится позже».

Starter должен выглядеть как реальный сайт агентства.

---

## 8.5 Canonical LeadForm

Одна форма.

Использовать shadcn primitives:

- Field;
- Label;
- Input;
- Textarea;
- Checkbox;
- Button.

States:

```text
default
validation error
submitting
server error
success
```

Accessibility:

- `aria-invalid`;
- `aria-describedby`;
- programmatic error association;
- focus management.

Подключить endpoint EPIC 5.

---

## 8.6 Images — shared approved host source

Approved image hosts не дублировать в двух config files.

Один canonical source генерирует/поставляет:

- ingest image validation;
- Safe Outbound image fetch rules при необходимости;
- Next image remote policy.

---

## 8.7 Feed image rendering strategy

На одном сервере не включать тяжёлую оптимизацию без решения.

В этом эпике измерить два варианта:

### Variant A

Next image optimizer с ограниченной нагрузкой/cache.

### Variant B

Feed images `unoptimized`, но обязательно:

- exact host allowlist;
- `sizes`;
- stable aspect ratio;
- explicit width/height or fill container;
- lazy below fold;
- explicit LCP candidate.

Выбрать по измерению CPU/LCP, зафиксировать в DESIGN/PROJECT.

Local CMS media можно оптимизировать отдельно.

---

## 8.8 Real PropertyCard media

Убрать текстовый placeholder.

Показывать реальные изображения либо production-quality fallback.

---

## 8.9 Gallery

Если `MediaGallery + Embla + lightbox` действительно используются — подключить на property page.

Если нет — удалить dependencies.

---

## 8.10 Primitive ownership

Устойчивые решения типа:

```text
home-btn-primary
shadow-[var(--shadow-card)]
raw input styles
```

перевести в canonical variants/CVA/primitives.

REUSE → VARIANT → CREATE.

---

## 8.11 Favorites / comparison scope

Baseline starter **не включает server-side favorites/comparison и не добавляет DB schema**.

Допустимый future implementation — client-only без persistence при отдельном project trigger. Зафиксировать out-of-scope в PROJECT.md.

## Acceptance EPIC 8

- routes не используют fixture presentation;
- contracts source остаётся `packages/contracts`;
- один LeadForm;
- реальное image rendering;
- no duplicate primitive foundation;
- public UI не содержит developer copy.

---

# EPIC 9 — DESIGN SYSTEM CLEANUP + VISUAL PROOF

**Risk:** STANDARD

## 9.1 Token inventory

Классифицировать все design tokens:

```text
CORE
SHADCN
PROJECT
MODULE-RESERVED
DEAD
```

---

## 9.2 Reserve-or-delete token policy

Каждый unused token классифицируется:

- `DEAD` → удалить;
- `RESERVED` → оставить только при явной документации будущего модуля в DESIGN.md;
- `ACTIVE` → имеет фактический usage.

Journal/module tokens: reserve-or-delete, а не безусловно удалить. Documented RESERVED token не считается dead.

Удалять accidental duplicate typography/leading/tracking, obsolete fixture roles и aliases без потребителя.

Допустимо заранее заморозить Journal DTO в `packages/contracts`: contract-only reservation не создаёт runtime component.

## 9.3 Typography normalization

Оставить ограниченные semantic roles.

Не создавать token на каждый donor-specific размер без реального использования.

---

## 9.4 Section rhythm

Повторяемые design spacing values → semantic tokens / Section variants.

Component CSS может хранить geometry:

- grid;
- flex;
- positioning;
- responsive relationships;
- intrinsic sizing.

Но reusable visual rhythm должен идти через tokens.

---

## 9.5 Design guard

Добавить:

- dead token detection;
- repeated design literal detection;
- second control pattern;
- unused CSS selectors;
- duplicate primitive;
- forbidden module token drift.

Mechanical DoD:

```text
design guard dead tokens = 0
```

---

## 9.6 Atlas/reference visual proof

Representative pages проверить минимум на:

```text
390×844
768×1024
1280×900
1440×1000
```

Зафиксировать approved visual deviations.

---

## 9.7 Baseline assets

Не хранить десятки мегабайт screenshots в каждом будущем clone.

В starter оставить:

- manifest;
- provenance;
- required minimal proof;
- ссылку на external/reference storage при необходимости.

---

## 9.8 DESIGN.md completion

DESIGN.md обязан содержать:

- visual character;
- anti-goals;
- ACTIVE/RESERVED/DEAD taxonomy;
- page-level CSS policy;
- geometry vs design-values boundary;
- approved exceptions;
- module-reserved tokens/triggers;
- representative pages/viewports;
- visual baseline provenance;
- allowed specialized UI dependencies.

## Acceptance EPIC 9

- design guard = green;
- dead tokens = 0;
- representative visual proof сохранён;
- responsive states проверены;
- baseline assets не раздувают clone.

---

# MAIN CHECKPOINT 4

После EPIC 8–9:

```text
main = functional backend + one canonical UI + cleaned design system
```

Gate:

```text
pnpm verify:daily
required proofs EPIC 8–9 (canonical UI, design system, visual)
pnpm verify:schema, если в волне была schema/migration; иначе schema proof переиспользуется с последнего schema checkpoint
```

Production не выполнять.

---

# EPIC 10 — REAL SYSTEM VERIFICATION + STARTER FREEZE

**Risk:** RISKY — финальный gate включает migrations, access/security proof и release-quality verification.

## 10.1 Test infrastructure

Создать отдельную integration test infrastructure.

Обязательное:

### PostgreSQL

- dedicated test database или Testcontainers;
- clean database lifecycle;
- migrations from zero.

### Deterministic time

Для heartbeat/stale/backoff/retention использовать injectable clock или fake time abstraction.

Тесты не должны ждать реальные 15/60/240 минут.

### Fixture servers

Локальные HTTP fixture servers для:

- XML feeds;
- redirects;
- slow response;
- timeout;
- webhook destination;
- destination idempotency.

Fixture destinations разрешаются через explicit test-only approved destination registry; глобального private-network bypass нет.

---

## 10.2 Unit + integration distinction

Pure-function tests сохранить.

Но green unit tests не считаются proof runtime.

Critical tests должны проходить через:

- real job handler;
- real repository;
- real PostgreSQL;
- real HTTP fixture server.

---

## 10.3 Import integration suite

Проверить:

- normal import;
- unchanged/idempotent;
- source isolation;
- concurrent dispatcher;
- concurrent import claim;
- 304;
- malformed/truncated feed;
- suspicious threshold;
- max deactivation;
- first-run baseline;
- approval single-use;
- heartbeat;
- crash/stale recovery;
- interrupted run ≠ deactivation;
- bulk `lastSeenAt`;
- manual override survival;
- parser cannot override `feedSource.market`;
- canonical jobs config/concurrency-key serialization;
- exact feed baseline state rules.

---

## 10.4 Lead integration suite

Проверить:

- public intake;
- transaction;
- duplicate submit;
- crash after commit;
- sweeper pickup;
- immediate enqueue duplicate protection;
- retryable;
- controlled waitUntil backoff: job поставлен с `waitUntil=nextAttemptAt`, pending с будущим waitUntil не orphan;
- unknown;
- permanent;
- abandoned;
- stale recovery;
- destination idempotency;
- retention.

---

## 10.5 Security suite

Проверить:

- anonymous raw REST denied;
- fake Authorization denied;
- fake payload cookie denied;
- new unclassified collection makes guard fail;
- private DTO fields unavailable;
- Local API implicit access guard;
- SSRF localhost/private blocked in production profile;
- redirect SSRF protection;
- secrets redacted;
- PII absent from jobs/logs;
- field-level access matrix owner/admin/editor/anonymous;
- `leads` недоступны публично;
- `lead-deliveries` недоступны публично;
- owner bootstrap controlled; self-registration off;
- media.read public, media writes owner-only;
- no public jobs endpoint;
- no wildcard remote image hosts;
- security headers/login hardening;
- reserved namespace guard.

---

## 10.6 Migration proof

На пустой DB:

```text
empty PostgreSQL
↓
all migrations
↓
verify:schema
↓
seed/demo
↓
app start
```

Проверить:

- unique `(feedSource, externalId)`;
- delivery unique constraints;
- source indexes;
- bulk touch indexes;
- data preservation on later migration;
- base collections completeness;
- `nextDueAt` NOT NULL/default/backfill;
- newbuild-readiness fields backfill/default/indexes;
- `needsReview` default/backfill semantics.

---

## 10.7 Local media proof

```text
upload
↓
file appears in MEDIA_DIR
↓
Nginx public delivery
↓
container recreate
↓
file remains
↓
backup
↓
restore
↓
DB references resolve to files
```

---

## 10.8 Performance budgets

Production-like build.

PASS/FAIL по Core §13.9 / data-path targets:

```text
mobile LCP ≤ 2.5 s
CLS ≤ 0.1
catalog list data path p95 ≤ 300 ms
property detail data path p95 ≤ 200 ms
```

Не PASS, если бюджет Core не выполнен. «Зафиксировать по факту» разрешено только для:

- facet aggregation latency на representative REALTY_BASE fixture (прямая SQL-агрегация, без cache refresh);
- import duration для representative inventory;
- CPU overlap image-heavy page + import.

Acceptance фасетов:

```text
representative REALTY_BASE fixture
full facet aggregation within documented baseline threshold
```

---

## 10.9 Accessibility

Проверить:

- keyboard navigation;
- visible focus;
- form labels/errors;
- dialogs focus trap/return;
- reduced motion;
- logical H1;
- alt/fallback media;
- controls semantics.

---

## 10.10 Clone readiness test

Создать test clone starter.

Изменить только project-level configuration/content:

- agency name;
- contacts;
- domain;
- brand tokens;
- feeds;
- lead channels;
- legal;
- retention;
- secrets refs.

После bootstrap:

```text
git diff src/core = 0
git diff packages = 0
```

Это mechanical DoD reusable starter.

Если для нового агентства приходится менять `src/core` или `packages/*`, starter freeze не проходит.

---

## 10.11 Guard baseline zero

`docs/guard-baseline.json` должен стать пустым.

Acceptance:

```text
existing exceptions = 0
new exceptions = 0
```

---

## 10.12 Observability verification

Проверить delivery operational alerts по каждому critical condition.

Основной lead channel нельзя использовать как единственный alert channel.

---

## 10.13 E2E golden paths

1. catalog → property detail;
2. Payload Admin → edit property/page → publish/save → public result;
3. manual property edit → next import preserves owned field;
4. public lead form → local commit → pending delivery → terminal delivery state;
5. archived property → retention → redirect/410;
6. media upload → public render.

---

## 10.14 HTTP self-call cache proof

На production-like topology доказать batch revalidation через фактический Nginx/runtime path: secret accepted, not logged, no self-throttle, public response fresh, no per-item sync calls.

---

## 10.15 Documentation completeness gate

### PROJECT.md

Все knobs/policies из EPIC 0.11, feature scope, reserved namespaces, cache proof status, credential mappings.

### OPERATIONS.md

Jobs handover, staging, manual import, suspicious approval, emergency unstuck, manual delivery retry, channel outage, backup/restore, disk-full response, external uptime, release/deploy separation.

### DESIGN.md

Соответствует EPIC 9.8.

---

## 10.16 Epic/PR report conformance

Каждый эпик имеет Core-format closing report и, для RISKY, proof artifacts exact merged SHA.

---

## 10.17 Canonical command contract

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

Все три команды существуют, документированы и являются единственной обязательной verification surface.

## 10.18 Full Drift Audit — REPORT ONLY

Промежуточный REPORT ONLY уже выполнен после §8.3. Здесь — полный pre-freeze audit.

Severity:

```text
P0 = Hard Contract / security / silent failure
P1 = systematic architecture/UI drift
P2 = local cleanup
```

Сначала REPORT ONLY.

Исправлять только подтверждённые findings.

---

# FINAL MAIN CHECKPOINT

После завершения EPIC 10:

1. freeze integration branch;
2. clean working tree;
3. зафиксировать exact SHA;
4. clean test DB;
5. migrations from zero;
6. `pnpm verify`;
7. `pnpm verify:schema`;
8. import integration suite;
9. lead integration suite;
10. security suite;
11. media proof;
12. E2E;
13. visual proof;
14. accessibility;
15. performance measurements;
16. clone readiness test;
17. full Drift Audit REPORT ONLY;
18. исправить blocking findings;
19. повторить exact-head verification;
20. PR `hardening/realtbase-starter → main`;
21. merge;
22. повторно зафиксировать exact `main` SHA;
23. production НЕ выполнять.

После этого статус:

```text
STARTER = FROZEN / READY TO CLONE
```

---

## Final release procedure additions

Перед merge final PR:

1. staging production-like proof complete;
2. `pnpm verify:daily`;
3. `pnpm verify`;
4. `pnpm verify:schema`;
5. RISKY proofs matched exact head SHA;
6. docs completeness gate green;
7. owner/reviewer approves merge;
8. после merge exact-head smoke/diff review повторяется на фактическом `main` SHA.

# 5. Definition of Done

Starter считается готовым только если одновременно выполнено всё ниже.

## Architecture / Runtime

1. `importFeed` выполняет настоящий runtime import.
2. `deliverLead` выполняет настоящий runtime delivery.
3. Public Lead Intake работает.
4. Lead + delivery rows создаются transactional outbox.
5. Sweeper гарантирует pickup pending deliveries независимо от immediate enqueue.
6. Feed dispatcher claim atomic через approved DB mechanism.
7. Import-run claim atomic.
8. Delivery claim atomic.
9. Exactly one jobs-active runner доказан.
10. Heartbeat виден независимому DB reader.
11. Stale/orphan recovery доказан.

## Import correctness

12. Same feed не создаёт business rewrites.
13. `lastSeenAt` обновляется bulk/source-scoped.
14. Feed A не меняет Feed B.
15. DB unique identity `(feedSource, externalId)` активна.
16. Truncated или interrupted feed не деактивирует каталог.
17. Suspicious approval single-use.
18. First run создаёт baseline без mass deactivation.
19. Full Realty field mapping работает.
20. Derived fields используют одну shared formula.

## Manual ownership

21. Import не создаёт manual ownership.
22. Manual change переживает import.
23. Field можно вернуть feed ownership.
24. Manual price/area recomputes derived fields.
25. Slug policy deterministic и collision-safe.

## Security

26. Local API access mode explicit везде.
27. Privileged access только через approved system paths.
28. Configurable outbound идёт через Safe Outbound Client.
29. Глобального private-network bypass не существует; разрешены только explicit approved fixture destinations, недоступные production-профилю.
30. Fake Authorization не открывает raw REST.
31. Fake cookie не открывает raw REST.
32. Новая unclassified Payload collection ломает CI.
33. Private fields не попадают в public DTO.
34. PII не попадает в job inputs/logs/diagnostics.
35. Secrets redacted.

## Leads

36. Duplicate browser submit не создаёт второй logical lead.
37. External outage не отменяет local success.
38. Destination idempotency key поддерживается adapter contract.
39. Retry ladder зависит от attempt.
40. Unknown delivery state обрабатывается отдельно.
41. Max attempts → abandoned.
42. Manual retry controlled и audited.

## Lifecycle / SEO

43. Archived property имеет корректный 200/noindex retention state.
44. Expired property получает relevant redirect или настоящий 410.
45. Redirect chains отсутствуют.
46. Sitemap completeness: весь inventory, корректный sharding/index, generation не пересчитывает весь catalog на каждый crawler request.
47. Facets используют полный matching public dataset.
48. Automatic backup: расписание, ретенция, offsite/второй носитель, integrity check последней копии.
49. `media.read` публичный; create/update/delete — owner-only; collection классифицирована в raw-rest-boundary.

## Storage / Infrastructure

50. Starter использует local PostgreSQL.
51. Starter не требует Managed PostgreSQL.
52. Starter не использует S3 runtime.
53. Payload Media хранится в persistent `MEDIA_DIR`.
54. Nginx безопасно отдаёт media.
55. Media filenames unique, overwrite forbidden.
56. DB + media backup — согласованная automatic пара с offsite copy.
57. Restore rehearsal проходит.
58. Disk space monitoring работает.
59. Storage Boundary позволяет позднее заменить local adapter без переписывания app.

## UI

60. Production routes не используют fixture presentation.
61. `packages/ui` — один canonical UI owner.
62. `packages/contracts` — один canonical contract source.
63. Нет второго primitive foundation.
64. Один canonical LeadForm.
65. LeadForm имеет default/error/submitting/server-error/success states.
66. Реальные property images отображаются.
67. Image hosts используют общий approved-host source.
68. Image strategy измерена и зафиксирована.
69. Gallery либо реально используется, либо тяжёлые dependencies удалены.
70. Public UI не содержит developer/fixture copy.

## Design System

71. `globals.css` остаётся единственным source of truth design values.
72. Design guard возвращает `dead tokens = 0`.
73. Duplicate visual controls отсутствуют.
74. Representative visual proof пройден.

## Verification / Reusability

75. `docs/guard-baseline.json` пуст.
76. Clean DB migration proof проходит.
77. Import runtime integration suite проходит.
78. Lead runtime integration suite проходит.
79. Security integration suite проходит.
80. Media persistence/restore proof проходит.
81. E2E golden paths проходят.
82. Performance PASS по Core: mobile LCP ≤ 2.5 s, CLS ≤ 0.1, catalog p95 ≤ 300 ms, detail p95 ≤ 200 ms; facet/import — documented baseline.
83. Accessibility minimum проходит.
84. Test clone меняет только project-level files.
85. `git diff src/core = 0` в test clone.
86. `git diff packages = 0` в test clone.
87. Full final `pnpm verify` проходит на exact `main` SHA.
88. Production остаётся отдельной explicit owner command.

---

## Core hard-contract completion

89. `enableConcurrencyControl=true` доказан на pinned Payload version.
90. Queue map/`disableScheduling` соответствуют Core; implicit `default` queue не используется.
91. Import key = `import:feed:<id>`, delivery key = `delivery:<leadId>:<channelId>`, оба exclusive.
92. Import/delivery jobs используют `retries=0` и application retry contract.
93. Static schedules зарегистрированы для `jobsJanitor`, `leadRetentionCleanup`, `catalogLifecycle`, `recoverLeadDeliveries`.
94. `nextDueAt = max(now + interval, previousNextDueAt + interval)`.
95. Feed-origin `market` всегда из `feedSource.market`; parser не может его переопределить.
96. Public lead capability только через canonical create-only endpoint; privileged implementation зафиксирован ADR/PROJECT.md.
97. HTTP cache self-call proof проходит; self-throttle отсутствует; cache proof status = `http`.
98. Typed cache target constructors используются; synchronous per-item revalidation отсутствует.
99. Reserved namespaces защищены guard-ом.
100. SEO metadata/canonical/OG/H1/robots/structured-data contract выполнен.
101. Filtered catalog URLs default noindex; индексируется только explicit whitelist.
102. Security headers, secure cookies, login hardening и Admin access policy доказаны.
103. Field-level access защищает private fields независимо от DTO.
104. Base collections/schema completeness подтверждены.
105. Imported inventory versions/drafts/locking policy соответствует Core.
106. Feed-source baseline/deactivation approval/newbuild-readiness/needsReview присутствуют и мигрированы.
107. Базовый набор страниц starter готов без изменения `packages/ui`.
108. Manual import, suspicious approval, read-only diagnostics и emergency unstuck доступны/документированы.
109. Production-like staging используется перед migration/parser/source-identity/auth/access/major-upgrade changes.
110. External uptime monitor независим от AMS Server.
111. Feed overdue alert = `max(2h, 3 × refreshIntervalMinutes)`.
112. Custom webhook = HTTPS + HMAC + timestamp + replay window + idempotency key.
113. Role/access matrix owner/admin/editor/anonymous проверена; `leads` и `lead-deliveries` публично недоступны.
114. PROJECT.md, OPERATIONS.md, DESIGN.md проходят completeness gate.
115. Каждый epic PR имеет closing report (для EPIC 8–9 — UI-формат Core §20); RISKY merge подтверждён proof на exact SHA.
116. `verify:daily`, `verify`, `verify:schema` — единственная обязательная verification surface.
117. Глобального private-network bypass нет; test outbound — только explicit approved fixture destinations, недоступные production-профилю.
118. Facets сначала используют direct indexed aggregation; cache/read optimization только после измеренного bottleneck и owner decision.
119. Baseline timestamps/counts обновляются по точным state rules, включая `unchanged`.
120. Token policy reserve-or-delete отражена в DESIGN.md; documented RESERVED tokens не считаются dead (см. DoD 72).
121. Cross-feed ownership degeneration REALTY_BASE зафиксирована ADR/PROJECT.md.
122. `AMS_PROFILE` и `TZ` обязательны; env mapping имеет один source of truth.
123. Adapter outcomes однозначно маппятся в `pending|sending|delivered|failed|abandoned`.
124. Low-level SQL параметризован; raw HTTP input не проходит без typed validation.
125. Lead rate limiting: Nginx first-line + documented in-process second-line; Redis не требуется baseline.
126. Favorites/comparison out-of-scope baseline и не создают server persistence/schema.
127. Первый owner — controlled bootstrap; self-registration off.
128. E2E включает `Payload Admin → edit/publish → public result`.
129. `docs/proofs/18A-matrix.md`: A/B2/C/D/E/F/G = PASS; B1 = NOT-CLAIMED, mode=http.
130. Cache invalidation failure поднимает alert при превышении `staleDataSlaMinutes`.

# 6. Запреты для AI-исполнителя

Во время выполнения master plan запрещено:

- переписывать проект целиком;
- добавлять Redis, broker, отдельный jobs service, search engine или новый backend без trigger;
- добавлять Managed PostgreSQL/S3 обратно в starter без owner decision;
- выполнять production deploy;
- считать unit test proof runtime integration;
- оставлять временный security bypass после теста;
- добавлять новое исключение в frozen `guard-baseline.json`;
- ослаблять Safe Outbound ради integration tests;
- использовать find-then-update как «atomic claim»;
- хранить PII в job input;
- логировать raw webhook response/body с PII;
- открывать anonymous raw Payload business REST;
- generic application CRUD `payload-jobs`;
- production PII dump → staging;
- глобальный private-network bypass / SSRF allow-all;
- создавать второй contracts/UI foundation;
- вводить новый production component без архитектурного trigger;
- писать `DONE`, `GREEN`, `CHECKED` без фактического proof.

---

# 7. Приоритет выполнения

Жёсткий порядок:

```text
EPIC 0  Source of Truth / Local Topology
   ↓
EPIC 1  Structure / Contracts / Guards
   ↓
MAIN CHECKPOINT 1
   ↓
EPIC 2  Safe Fetch / SAX Parser
   ↓
EPIC 3  Real Import Runtime
   ↓
EPIC 4  Manual Ownership / Lifecycle / SEO Data
   ↓
MAIN CHECKPOINT 2
   ↓
EPIC 5  Lead Intake / Transactional Outbox
   ↓
EPIC 6  Real Lead Delivery
   ↓
EPIC 7  Retention / Media / Runtime / Alerts
   ↓
MAIN CHECKPOINT 3
   ↓
EPIC 8  Canonical UI
   ↓
EPIC 9  Design System / Visual Proof
   ↓
MAIN CHECKPOINT 4
   ↓
EPIC 10 Real System Verification / Freeze
   ↓
FINAL MAIN CHECKPOINT
   ↓
STOP
```

Production только отдельной командой владельца.


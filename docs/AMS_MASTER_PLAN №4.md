# AMS REALTBASE STARTER — CORE ALIGN MASTER PLAN

```text
Plan ID: AMS-REALTBASE-CORE-ALIGN
Version: v1
Status: APPROVED
Delivery profile: COMMERCIAL
Approved by: owner
Approved at: 2026-09-18T22:47:00+03:00
Predecessor: AMS-REALTBASE-CORRECTIONS v3 APPROVED (closed on main)
Baseline branch: main
Baseline SHA: 14e9bf532d7a0d3503b0e6515299ff1396361050
Profile: REALTY_BASE
Mode: BUILD
```

## 0. Статус документа

Назначение: закрыть **реальные** расхождения этого **демо-проекта** с раскладкой/security/UI Core, не повторяя EPIC 11–21.

Это не клиентский production и не повод покупать базу. Runtime этого репозитория навсегда: **local PostgreSQL + MEDIA_DIR** на AMS Server. Timeweb Managed PostgreSQL, S3 и любые закупки **забыть**: их нет в scope, в эпиках, в DoD и в stop conditions.

Production rollout в этот план **не входит**. Live demo уже на `start-baza.ams24.ru`. Graph: код/docs/proofs → SourceCraft `main`. **GitHub в этой программе не трогать** (не mirror, не Actions, не `gh`).

**Канонический Git:**

```text
primary: SourceCraft integrator-p/ams-realty-baza-starter
this plan: SourceCraft only
```

**Нормативная база:** Core 5.5, UI Core 5.0, `docs/PROJECT.md`, `docs/OPERATIONS.md`, `docs/DESIGN.md`, фактический код на baseline SHA.

**Аудит-вход:** owner packet «полный технический аудит» (HTTPS-crawler, без локальных `pnpm verify`). Architect сверил claims с Windows checkout `14e9bf53`.

---

# 1. Решения (чтобы ночь не стопорилась)

## 1.1 ACCEPTED (делаем)

- Один независимый stream = одна ветка от свежего `main` = один PR = `MERGE_AFTER_GATE` = удалить ветку.
- Gate: RISKY для security/layout/env/cache/proofs; STANDARD для docs/UI composition/ISR/cleanup.
- Owner-вопросы не задавать, если канон + уже принятые ADR однозначны.
- Business/legal values (`leadRetentionDays`, реальные channel credentials) — fail-closed + `NEEDS_OWNER`, EPIC не стопорить.
- Public Gateway / System Gateway / security helpers выравниваем к `src/core/...` **переносом существующего кода**, пустые canonical папки не создаём.
- Next 16 file convention остаётся `src/proxy.ts` + `export function proxy` ([official Next 16 proxy](https://nextjs.org/docs/messages/middleware-to-proxy), checked 2026-09-18). Переименовать в `middleware.ts` **запрещено**.
- Этот репозиторий = демо. База = уже существующий local PostgreSQL. Адаптер S3, Managed PG, GitHub — не делать.
- UI: живой home уже на Tailwind/`Button` в `StarterPages.tsx`. Гигантский `home-page.css` **не импортируется** runtime `styles.css`. Чистим мёртвый CSS / guards, не перерисовываем Atlas за ночь.
- Platform proofs §18A наращиваем **существующими** `verify:*` / integration suites, без нового test runner.
- `force-dynamic` снимаем только со статических marketing pages; catalog/detail — evidence, не стоп p95.
- Production deploy / GitHub / закупки — вне графа.

## 1.2 REJECTED (ложные или опасные стопоры аудита)

| Claim | Вердикт | Почему |
|---|---|---|
| P0-1/P0-2 купить Managed PG + S3 | REJECTED permanently for this repo | Это демо. Local PostgreSQL + MEDIA_DIR — канон проекта. Тема закрыта. |
| P1-2 / AMS-COR-003: `proxy.ts` не middleware → REST открыт | REJECTED rename | Official Next 16: `middleware.ts` deprecated → `proxy.ts`. Нужен **proof**, не откат. |
| P0-7 создать пустые `src/core/dto`, `query`, `observability`, `media` | REJECTED | Canonical: не создавать пустые директории. `src/project/` уже есть. DTO живут в `packages/contracts`. Access — `src/payload/access` (Payload-owned). |
| P1-9 lucide `^1.21.0` = typo / не lucide | REJECTED | `pnpm-lock.yaml`: `lucide-react@1.46.0`. В 2026 линия 1.x реальна. Документируем, не даунгрейдим вслепую. |
| AMS-COR-006 семь новых `tests/platform-proofs/*.spec.ts` + «CI» | REJECTED as new harness | Уже есть `verify:feed-ingest`, `verify:lead-outbox`, `verify:integration`, `verify:jobs-config`. Расширяем их. |
| UI-003: `home-page.css` ≤ 10 KB как живой visual rewrite | REJECTED this night | Файл не в runtime import. Полный Tailwind-перенос 26 KB сломает atlas-parity и визуал. |
| Telegram/AMOCRM/Bitrix required keys всегда | REJECTED | Starter channels: `max` / `custom-webhook` (уже conditional в `runtime-env.ts`). CRM отложен. |
| GitHub Actions / зеркало / `gh` | REJECTED | Этот план работает только в SourceCraft. |

## 1.3 ALREADY_COVERED (не эпики)

- `enableConcurrencyControl`, jobs queues, outbox, deactivationApproval, package-form UI without persistence.
- Maintenance tasks: `jobsJanitor`, `leadRetentionCleanup`, `catalogLifecycle`, `recoverLeadDeliveries` в `tasks.ts`.
- Retry ladder `leadDeliveryRetryLadderMinutes = [0, 1, 5, 15, 60, 240]`.
- `attemptLog` capped: `slice(-maxAttemptLogEntries)` (`20`).
- `CACHE_INVALIDATION_MODE=http` only; lazy `import("next/cache")`.
- `.env.example` уже содержит `LEAD_CHANNELS`, `AMS_PROFILE`, `TZ`.
- shadcn `Button` установлен; home CTAs уже `<Button asChild>`.
- `src/proxy.ts` matcher `/api/:path*` + anonymous deny helper.
- Journal reserved URLs не заняты.

## 1.4 NEEDS_OWNER (не стопят ночь)

- Конкретные `leadRetentionDays` / `archiveRetentionDays`.
- Включать CRM / telegram на demo.

---

# 2. Сопоставление аудита с кодом (evidence)

```text
Docs status: PASS (Next 16 proxy convention)
Question: Is src/proxy.ts a dead middleware?
Installed: next 16.3.5
Official: https://nextjs.org/docs/messages/middleware-to-proxy (2026-09-18)
Decision: keep proxy(); add deny proof
```

| Аудит | Факт на `14e9bf53` |
|---|---|
| Нет `src/project/` | Есть `src/project/project.config.ts` |
| Public Gateway не canonical | Живёт в `src/server/public-gateway/` (реально; **перенос** в EPIC-03) |
| System Gateway two-tree | Да: `src/server/system-gateway` + `src/core/data-access/system` |
| `overrideAccess:true` | Guard: только `src/server/system-gateway/` |
| home-page.css 26 KB live | **Не импортируется** `packages/ui/src/styles.css` (только shell/modal/footer + atlas parity script) |
| Home монолит | `HomePageView` в `StarterPages.tsx` уже с `<section id="section-home-hero">` + Button; page.tsx ещё вызывает один view |
| Env conditional | `evaluateRuntimeEnv` уже требует REVALIDATE_SECRET, MAX_*, webhook HMAC в runtime |
| empty NEXT_PUBLIC_SERVER_URL | required в runtime mode; optional в Zod parse для build |
| lucide | lock `1.46.0` |
| imports.limit=1 | сознательно ≠ Core example `5`; документируем, не меняем без trigger |

---

# 3. Delivery

```text
EPIC-01 docs topology     STANDARD
EPIC-02 proxy REST proof  RISKY
EPIC-03 gateway layout    RISKY
EPIC-04 env schema        RISKY
EPIC-05 cache + 18A       RISKY
EPIC-06 UI composition    STANDARD
EPIC-07 drift/css guards  STANDARD
EPIC-08 ISR + leftover    STANDARD
```

Порядок **строго линейный**. Параллелить нельзя: EPIC-03 двигает импорты, EPIC-05/07 читают те же guards.

Ветки:

```text
hardening/align-01-topology-docs
hardening/align-02-proxy-rest-proof
hardening/align-03-gateway-layout
hardening/align-04-env-schema
hardening/align-05-cache-18a
hardening/align-06-ui-composition
hardening/align-07-drift-guards
hardening/align-08-isr-cleanup
```

После каждого: PR → Gate → squash merge `main` → delete branch → следующая от нового `main`.

Независимый Code Reviewer — только по явной команде владельца.

---

# 4. Эпики

## EPIC-01 — Demo topology is the project canon

```text
severity: STANDARD
delivery_mode: MERGE_AFTER_GATE
depends_on: none
```

**Цель:** в docs явно: это демо, local PostgreSQL + MEDIA_DIR — норма, не «временный костыль до покупки базы».

1. `PROJECT.md` / `OPERATIONS.md` / ADR: формулировки без «надо купить Managed PG/S3».
2. Не добавлять S3 adapter, env S3_*, GitHub workflows, mirror scripts.
3. `pnpm verify:production-topology` / `verify:clone-readiness` остаются на local PG + MEDIA_DIR.

**DoD:** Документы не толкают закупку. Код storage не меняется.

---

## EPIC-02 — Next 16 proxy + anonymous REST proof

```text
severity: RISKY
depends_on: EPIC-01
```

**Цель:** доказать, что `src/proxy.ts` реально режет anonymous Payload REST.

1. Не переименовывать в `middleware.ts`.
2. Расширить `verify:security-boundaries` / integration: HTTP к `/api/leads`, `/api/properties`, `/api/users`, payload-jobs path без cookie → 404 (как сейчас JSON `notFound`).
3. Если harness без `next start` — минимальный route-unit + document Next 16 convention в `PROJECT.md` / ADR-CANONICAL-BOUNDARIES. Live `curl` против `start-baza.ams24.ru` **желателен**, не blocker (cookie/health secret не печатать).
4. Комментарий в `Leads.ts`: public create только `POST /api/public/leads` + System Gateway; collection `create` ≠ public.

**DoD:** Тест/скрипт красный, если deny helper или proxy export исчезнут. `pnpm verify:security-boundaries` PASS.

**Антизатычка:** отсутствие live demo curl ≠ стоп графа.

---

## EPIC-03 — Gateway layout Core §5/§7

```text
severity: RISKY
depends_on: EPIC-02
```

**Цель:** один Public Gateway и один System Gateway в `src/core/data-access/*`.

1. `src/server/public-gateway/` → `src/core/data-access/public/` (включая DTO/policy/reads).
2. Слить `src/server/system-gateway/` в `src/core/data-access/system/` (рядом с jobs sql). Единственное место `overrideAccess: true`.
3. `src/server/security/` → `src/core/security/` (если ещё не там).
4. `src/server/seo/` → `src/core/seo/`.
5. `src/server/http/` → `src/core/http/` (gone response). `src/app/http/property-lifecycle` оставить App Router route **или** перенести в `src/app/api/internal/` только если URL контракт не публичный SEO; не ломать 410.
6. `src/server/ingest-gateway/` влить в `src/core/data-access/ingest/` (сейчас тонкий policy-файл).
7. Обновить architecture-guard whitelist, dependency-cruiser, verify scripts, docs ADR-CANONICAL-BOUNDARIES.
8. `src/proxy.ts` импортирует новый security path.

**Не делать:** пустые `dto/query/observability`; не трогать `src/payload/access`.

**DoD:** Нет `src/server/public-gateway` и `src/server/system-gateway`. `pnpm quality:architecture` + `pnpm verify:public-gateway` + `pnpm verify:security-boundaries` + typecheck.

---

## EPIC-04 — Env schema honesty

```text
severity: RISKY
depends_on: EPIC-03
```

1. Свести Zod `src/payload/env.ts` и `evaluateRuntimeEnv`: production runtime fail-fast на пустой `NEXT_PUBLIC_SERVER_URL` (уже required list — убрать optionalUrl дыру, **не ломая** `next build` через `NEXT_PHASE`).
2. Conditional: уже max + custom-webhook; добавить явный fail, если `LEAD_CHANNELS` содержит неизвестный id.
3. Таблица mapping в `PROJECT.md` (canonical ↔ starter names). Нет legacy rename ради стиля.
4. Не добавлять AmoCRM/Bitrix/Telegram, пока каналы не включены.

**DoD:** Unit/script: runtime + `LEAD_CHANNELS=max` без `MAX_BOT_TOKEN` → throw. Build phase без DATABASE_URI → не throw. `pnpm verify:health-alerts` / owner-operations по scope.

---

## EPIC-05 — Cache split + runnable §18A

```text
severity: RISKY
depends_on: EPIC-04
```

1. Разделить `invalidator.ts`: http adapter / in-process adapter / facade. Guard: top-level `next/cache` запрещён; lazy только in-process file.
2. HTTP mode **не** импортирует `next/cache`.
3. Расширить существующие verify/integration:
   - A heartbeat: уже `verify:feed-ingest` — добавить assert «heartbeat вне ingest tx» если ещё слабо.
   - B2: contract HTTP revalidate route + jobs-config; live self-call если `DATABASE_URI_TEST`, иначе честный NOT PROVEN в proof file **без стопа**.
   - C–G: опираться на `verify:feed-lifecycle`, `verify:operational-recovery`, `verify:health-alerts`, `verify:lead-outbox`, `verify:lead-delivery-state`, `verify:integration`.
4. `docs/proofs/18A-matrix.md` обновить SHA этого эпика.
5. `pnpm verify:daily` включает обновлённые скрипты, не новый npm test framework.

**Антизатычка:** live HTTP self-call на AMS Server не обязателен для merge.

---

## EPIC-06 — UI composition без redesign

```text
severity: STANDARD
depends_on: EPIC-05
```

1. `src/app/(site)/page.tsx`: composition из секций, экспортированных из `StarterPages` / `views/home` (Hero, Services, …). Без смены визуала.
2. `layout.tsx`: Header + main + Footer composition, если `SiteShellView` ещё монолит-обёртка.
3. Мёртвый `home-page.css`: либо перестать экспортировать в package.json и убрать из atlas-parity **или** оставить только `prefers-reduced-motion` в globals и починить a11y/parity scripts.
4. `DESIGN.md`: `Dark theme: DISABLED`. `--surface-dark-*` = lightbox/overlay tokens в light theme, не dark mode class на `html`.
5. Не удалять embla/yarl (нужны gallery). ADR в EPIC-08, если не успеет сюда.

**DoD:** Home page.tsx без единственного `<HomePageView />` как единственного дерева. `pnpm quality:design-tokens` + `verify:a11y-starter`. Visual: не трогать pixel atlas, если CSS file удаляется — обновить parity script.

---

## EPIC-07 — Drift automation

```text
severity: STANDARD
depends_on: EPIC-06
```

1. `scripts/quality/drift-audit.mjs`: checks из UI Core §18, которые **исполняемы статически** (duplicate button class, persistence in UI, second token file, site-primary-action в runtime CSS imports).
2. Guard размера: FAIL только для **imported** `packages/ui/src/styles/*.css` > 10 KB (`shell.css`/`request-modal.css`/`site-footer.css` измерить; не применять 10 KB к неимпортированному atlas dump).
3. `pnpm verify:drift` в `verify:daily`.
4. Baseline `docs/guard-baseline.json` обновить после факта.

**DoD:** `pnpm verify:drift` PASS. Регрессия duplicate primitive в imported CSS — FAIL.

---

## EPIC-08 — ISR + leftovers + ADRs

```text
severity: STANDARD
depends_on: EPIC-07
```

1. Снять `force-dynamic` с marketing: `/uslugi`, `/o-kompanii`, `/ipoteka`, `/kontakty`, legal; home — ISR/`revalidate` + tags если не ломает lead fixture. Catalog + property detail: оставить dynamic **или** ISR с `generateStaticParams` top-N **без** требования живого p95.
2. Перенести/удалить `src/components/fixture` → `packages/ui` fixture path (уже есть LeadForm reuse).
3. `src/demo-data/` → `scripts/demo/` если не ломает import atlas script.
4. `src/app/(site)/_lib/` → `src/core/lib/` только если файлы есть.
5. ADR: `ADR-EMBLA-CAROUSEL.md`, `ADR-YARL-LIGHTBOX.md`; DESIGN.md icon ecosystem = lucide-react 1.x.
6. `imports.limit = 1` объяснить в OPERATIONS (один import owner).
7. Финальный `docs/proofs/align/CORE_ALIGN_AUDIT.md`: честный NOT PROVEN (live LCP, catalog p95).

**DoD:** `pnpm verify:daily` + `pnpm verify:seo-contracts`. Нет требования «PRODUCTION READY».

---

# 5. Definition of Done программы

1. Все EPIC-01…08 закрыты merge в `main`.
2. Public/System gateway paths canonical; architecture-guard зелёный.
3. `proxy.ts` доказан, не откатан.
4. Docs называют этот runtime демо с local PostgreSQL + MEDIA_DIR, без закупки БД.
5. Env runtime fail-fast без поломки build.
6. §18A матрица на exact SHA; live B2 может остаться NOT PROVEN.
7. Home composition; мёртвый page CSS не выдаётся за live design system.
8. Local `main` = `origin/main`; epic-ветки удалены.
9. Нет production deploy в этом плане.

---

# 6. Антизатычки

| Риск | Правило ночи |
|---|---|
| Аудитор: купить базу/S3 | запрещено навсегда в этом репо |
| GitHub | не трогать |
| Аудитор: middleware.ts | нет; Next 16 proxy |
| p95 не измерен | evidence NOT_MEASURED, идём |
| live curl demo down | локальный verify harness |
| retention days | NEEDS_OWNER, fail-closed |
| CSS 10 KB на dead file | guard только imported CSS |
| новый Jest/Playwright | запрещён |
| empty core folders | запрещены |
| visual redesign Atlas | запрещён |
| production | запрещён |

---

# 7. Night Run Readiness

```text
READY_WITH_LIMITS
Limits:
- demo + local PostgreSQL only
- no GitHub
- no live RUM/p95 gate
- CRM/telegram out of scope
- visual atlas rewrite out of scope
```

Blockers: 0. Cycles: 0. Before-approval owner decisions: 0.

---

# 8. Revision history

| Version | Status | Date | Notes |
|---|---|---|---|
| v1 | APPROVED | 2026-09-18 | Owner: «План утверждён». Демо, без закупки БД, без GitHub. EPIC-01…08. |

**Task Manager import:** allowed for this APPROVED v1 snapshot.

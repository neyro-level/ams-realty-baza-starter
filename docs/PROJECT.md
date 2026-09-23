# Project — AMS Realty Baza Starter

Статус: `Demo / REALTY_BASE`. Текущий starter runtime: local PostgreSQL +
`MEDIA_DIR` на AMS Server. Он проверяет шаблон, но не задаёт production-топологию
клиентского клона. Закупка клиентской инфраструктуры **не входит в этот план**.

## Зафиксировано

| Параметр | Решение |
|---|---|
| Project identity | `AMS Realty Baza Starter` |
| Product line | `AMS RealtBase` |
| Profile | `AMS_PROFILE=REALTY_BASE` |
| Delivery | `COMMERCIAL` |
| Git platform | SourceCraft primary: `integrator-p/ams-realty-baza-starter`; GitHub one-way mirror: `neyro-level/ams-realty-baza-starter` |
| Time zone | `Europe/Moscow` / timestamps UTC in system logic |
| Currency | `RUB`, integer minor units |
| Starter topology | AMS Server + Nginx + Next/Payload + local PostgreSQL + local `MEDIA_DIR` |
| Managed PostgreSQL | не используется и не закупается в этом репозитории |
| S3 runtime | не используется и не закупается; см. `docs/adr/ADR-LOCAL-STARTER-STORAGE.md` |
| Client clone topology | Core 5.5 default: Timeweb VPS/approved runtime + Managed PostgreSQL + S3; deviation требует owner decision и ADR, если его требует Core |
| Secrets | Secret Master `https://infisical.ams24.ru` |
| Env mapping | Canonical knobs → starter env (no CRM / telegram keys): `DATABASE` → `DATABASE_URI`; public origin → `NEXT_PUBLIC_SERVER_URL`; media → `MEDIA_DIR`; Payload secret → `PAYLOAD_SECRET`; ISR secret → `REVALIDATE_SECRET`; lead channels → `LEAD_CHANNELS` (`max`, `custom-webhook` only) |
| Demo domain | `start-baza.ams24.ru`, `noindex` |
| Indexing policy | `src/project/indexing-policy.ts`: `starter-demo` всегда `noindex`; client обязан выбрать `productionIndexing = public | noindex`, причём `public` разрешён только при production `projectKind`, совпадающих domain/canonical origin и approved legal content |
| Jobs owner | exactly one runtime with `JOBS_AUTORUN=true` |
| Dispatcher interval | `project.config.ts` → `dispatcherIntervalMinutes = 5` |
| Maintenance interval | `maintenanceIntervalMinutes = 15` |
| Dispatch batch | `dispatchBatchSize = 3` (не env) |
| Ingest batch | `ingestBatchSize = 100` (не env); parser awaits every full batch before reading more input |
| Currency | только `RUR/RUB` → canonical `RUB`; unsupported currency создаёт import issue и пропускает offer; конвертации нет |
| Price per m² | `pricePerMeterMinor` вычисляется на ingest/manual write boundary из `priceMinor / totalArea` с banker rounding; invalid input → `null` |
| Import heartbeat | `importHeartbeatIntervalMs = 15000`, вне ingest transaction |
| Approval TTL | `approvalTtlMinutes = 240` |
| Safety threshold | `safetyThresholdPercent = 30` until first real feed onboarding |
| Max deactivations | `maxDeactivationsPerRun = 50` until first real feed onboarding |
| Lead/archive retention | `client-readiness.config.ts` owns both versioned decisions: `leadRetentionDays = NEEDS_OWNER` until project clone configuration; `archiveRetentionDays = NEEDS_OWNER` until production; `projectConfig` only projects them into runtime; starter keeps `null` placeholders and is not production-ready for PII |
| Stale-data SLA | `staleDataSlaMinutes = 30` |
| Cache | mode `http`, proof status `http`, in-process not claimed |
| Feed images | external HTTPS, exact hosts from `EXTERNAL_IMAGE_HOSTS` via `src/core/ingest/image-hosts.ts`; Variant B: feed `unoptimized` + `sizes` + aspect ratio; local CMS media may use Next optimizer |
| Lead routing/access | public intake `POST /api/public/leads` only; generic `leads` create and `lead-deliveries` create/update are system-only; lead/PII read-update-delete and delivery read/delete/manual retry are owner-only; `admin` has no lead capability; see `docs/adr/ADR-LEAD-ACCESS-MODEL.md` |
| Consent authority | server selects current `consentVersion` and writes `consentedAt`; submitted browser values are consistency/UX signals only |
| Lead delivery policy | `project.config.ts` → one validated `leadDelivery` policy; routing is `all-enabled`, max attempts derive from retry ladder length |
| Channel capability risk | MAX sends an idempotency header but native provider idempotency and external lookup are unproven; custom webhook uses required HMAC + idempotency header with receiver registry; both may return unknown delivery certainty after transport failure |
| Indexed catalog filters | `category`, `dealType`, `city`, `district`, `rooms` in `project.config.ts`; other query params are `noindex` |
| Sitemap | shards of 50_000 URLs, `generateSitemaps`, generation `revalidate` 3600s |
| Staging | client: separate Managed PostgreSQL + S3 + secrets; no production PII dump. Starter demo остаётся на local PG + MEDIA_DIR |
| Backup | starter: automatic `pg_dump` + `MEDIA_DIR` snapshot; client: automatic managed DB + object-storage backup, rotation, integrity check |
| Admin access | public+hardened until owner sets IP/VPN |
| Field ownership | `manual → field override → owning feed`; foreign-feed identity is degenerate for REALTY_BASE |
| Favorites / comparison | out of scope for starter; no DB schema; client-only later only with a separate project trigger |
| Public font | Manrope via `next/font/google`; variable `--font-manrope`, Cyrillic + Latin, `display: swap`, SIL OFL 1.1; system fallback only |

## Optional modules

`PROJECT.md` is the owner of module activation state. A manifest documents how a
module may be activated; it does not activate runtime code or collections.

<!-- MODULE_GOVERNANCE_BEGIN -->
| Module | State | Manifest |
|---|---|---|
| `novostroyki` | `disabled` | `docs/modules/novostroyki.md` |
| `journal` | `disabled` | `docs/modules/journal.md` |
| `agents` | `disabled` | `docs/modules/agents.md` |
<!-- MODULE_GOVERNANCE_END -->

Next.js `16.3.5` edge: intentional canonical
[`src/proxy.ts`](https://nextjs.org/docs/16/app/api-reference/file-conventions/proxy)
with `export function proxy`; `src/middleware.ts` is forbidden. Anonymous
`/api/{collection}` for deny-list and system-only slugs returns JSON
`{ error: "notFound" }` 404 unless a Payload session cookie is present. Public
lead create remains `POST /api/public/leads`. The visual property page stays in
`src/app/(site)/obekty/[slug]/page.tsx`; the intentional public status boundary
`src/app/http/property-lifecycle/[slug]/route.ts` owns actual 410/redirect HTTP
semantics and is not an internal API.

Canonical URL map: `02_PRODUCT_STRUCTURE.md`. Knobs source: `src/project/project.config.ts`.
Identity source: `src/project/site.config.ts`. Client staging/release decisions:
`src/project/client-readiness.config.ts` and `docs/CLONE_ONBOARDING.md`.

## Verification

Обязательные поверхности разделены по риску:

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
pnpm verify:integration:required
pnpm verify:merge-standard
pnpm verify:merge-risky
pnpm verify:ui-core
pnpm verify:client-readiness
```

`verify:merge-standard` не запускает PostgreSQL suite. `verify:merge-risky`
требует явный `RISK_SCOPE` и добавляет только proof выбранного риска. Scope
`schema-data`, `auth-pii-leads` и `ingest-jobs` требуют `DATABASE_URI_TEST` на
loopback (`127.0.0.1`/`localhost`) с именем базы `*_test`; build выполняется
только для `dependency-runtime`. `ci-governance` не поднимает DB и не делает build.
`verify:integration:required` использует тот же fail-closed DB prerequisite и не
допускает `SKIPPED`. `verify:ui-core` агрегирует UI ownership, design-token,
accessibility и SEO contracts; visual matrix остаётся отдельным evidence при UI
изменениях.
Production-looking имена (`prod`, `production`, `live`) и fallback к
`DATABASE_URI` запрещены до любой мутации. Локальный контур использует native
PostgreSQL; Docker/WSL не запускаются автоматически.

Секретные значения не записываются в этот документ.

# Project — AMS Realty Baza Starter

Статус: `Demo / REALTY_BASE`. Этот репозиторий — демо-проект. Runtime навсегда: local PostgreSQL + `MEDIA_DIR` на AMS Server. Закупка базы, S3 и любой платной инфраструктурной замены **не входит в проект**.

## Зафиксировано

| Параметр | Решение |
|---|---|
| Project identity | `AMS Realty Baza Starter` |
| Product line | `AMS RealtBase` |
| Profile | `AMS_PROFILE=REALTY_BASE` |
| Delivery | `COMMERCIAL` |
| Time zone | `Europe/Moscow` / timestamps UTC in system logic |
| Currency | `RUB`, integer minor units |
| Starter topology | AMS Server + Nginx + Next/Payload + local PostgreSQL + local `MEDIA_DIR` |
| Managed PostgreSQL | не используется и не закупается в этом репозитории |
| S3 runtime | не используется и не закупается; см. `docs/adr/ADR-LOCAL-STARTER-STORAGE.md` |
| Client clone topology | вне этого демо-репозитория; здесь не планируется |
| Secrets | Secret Master `https://infisical.ams24.ru` |
| Demo domain | `start-baza.ams24.ru`, `noindex` |
| Jobs owner | exactly one runtime with `JOBS_AUTORUN=true` |
| Dispatcher interval | `project.config.ts` → `dispatcherIntervalMinutes = 5` |
| Maintenance interval | `maintenanceIntervalMinutes = 15` |
| Dispatch batch | `dispatchBatchSize = 3` (не env) |
| Import heartbeat | `importHeartbeatIntervalMs = 15000`, вне ingest transaction |
| Approval TTL | `approvalTtlMinutes = 240` |
| Safety threshold | `safetyThresholdPercent = 30` until first real feed onboarding |
| Max deactivations | `maxDeactivationsPerRun = 50` until first real feed onboarding |
| Lead/archive retention | `leadRetentionDays = NEEDS_OWNER` until project clone configuration; `archiveRetentionDays = NEEDS_OWNER` until production; starter keeps `null` placeholders and is not production-ready for PII |
| Stale-data SLA | `staleDataSlaMinutes = 30` |
| Cache | mode `http`, proof status `http`, in-process not claimed |
| Feed images | external HTTPS, exact hosts from `EXTERNAL_IMAGE_HOSTS` via `src/core/ingest/image-hosts.ts`; Variant B: feed `unoptimized` + `sizes` + aspect ratio; local CMS media may use Next optimizer |
| Lead routing | public intake `POST /api/public/leads` only; generic Payload `leads` create is not public; live channels require credentialRef + `LEAD_OUTBOUND_HOSTS` |
| Indexed catalog filters | `category`, `dealType`, `city`, `district`, `rooms` in `project.config.ts`; other query params are `noindex` |
| Sitemap | shards of 50_000 URLs, `generateSitemaps`, generation `revalidate` 3600s |
| Staging | separate DB + MEDIA_DIR + secrets; no production PII dump |
| Backup | automatic `pg_dump` + `MEDIA_DIR` snapshot, rotation, offsite copy, integrity check |
| Admin access | public+hardened until owner sets IP/VPN |
| Field ownership | `manual → field override → owning feed`; foreign-feed identity is degenerate for REALTY_BASE |
| Favorites / comparison | out of scope for starter; no DB schema; client-only later only with a separate project trigger |

Next.js 16 edge: `src/proxy.ts` + `export function proxy` (not `middleware.ts`). Anonymous `/api/{collection}` for deny-list and system-only slugs returns JSON `{ error: "notFound" }` 404 unless a Payload session cookie is present. Public lead create remains `POST /api/public/leads`.

Canonical URL map: `02_PRODUCT_STRUCTURE.md`. Knobs source: `src/project/project.config.ts`.

## Verification

Единственная обязательная поверхность:

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

Секретные значения не записываются в этот документ.

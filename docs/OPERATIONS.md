# Operations

Статус: `Skeleton / production not provisioned`.

Этот файл хранит только проектные runbooks. Архитектурные инварианты находятся в `03_ARCHITECTURE.md`, а release gates — в `05_RELEASE_CHECKLIST.md`.

## Deploy и rollback

Internal production target:

```text
domain: start-baza.ams24.ru
provider: Timeweb / AMS server contour
runtime: one application runtime, immutable artifact only
database: local PostgreSQL 18 on AMS Server for this owner-approved starter deployment
storage: persistent MEDIA_DIR, no S3 runtime
secrets: isolated project-specific Secret Master scope
indexing: noindex until owner explicitly promotes the instance
```

Immutable artifact format: full Next.js Docker image built from `Dockerfile` outside the production host. Server runtime uses `deploy/compose/start-baza.compose.yml`; public proxy uses `deploy/nginx/start-baza.ams24.ru.conf`. Release identity is recorded by `pnpm release:manifest`; generated `.release/` files are local evidence and are not committed. Обязательные границы: отдельная команда владельца, clean SourceCraft `main`, exact SHA, отсутствие build на production host, один rollout и live smoke. Известный рабочий artifact сохраняется для rollback.

Owner decision for the starter project: use the existing local PostgreSQL 18 on AMS Server instead of buying a separate Timeweb Managed PostgreSQL instance. Runtime database identity:

```text
database: ams_realtbase_prod
role: ams_realtbase_app
env file: /etc/ams/realtbase/start-baza.env
backup rehearsal: pg_dump custom format -> temporary restore database -> migration count check
```

Release sequence:

1. Confirm clean canonical SourceCraft `main` and exact full SHA.
2. Run `pnpm release:manifest` for local release identity evidence.
3. Build one Docker image from the exact SHA outside the production host and tag it with the full SHA.
4. Run Payload migrations from the same image against the local AMS Server PostgreSQL database.
5. Start/recreate exactly one application runtime with `JOBS_AUTORUN=true`; no parallel jobs owner is allowed.
6. Route `start-baza.ams24.ru` through Nginx/TLS to this runtime with `noindex` preserved.
7. Check `/api/internal/healthz` with the configured health secret and run the changed live smoke.
8. Keep the previous image tag and env snapshot available for rollback.

При handover jobs сначала новый runtime стартует с `JOBS_AUTORUN=false`; старый jobs owner выключается до controlled restart нового с `true`. Два jobs-active runtime недопустимы.

## Migrations

`schema change -> dev proof -> migration -> verify:schema -> staging when RISKY -> production`. Payload `push` в production запрещён.

## Backup и restore

Starter backup = согласованная пара в одном window: `pg_dump -Fc` + archive `MEDIA_DIR`.

Это канон **этого** demo runtime. Не заменять его единственным правилом «managed PostgreSQL backup + S3 versioning».

`DATABASE_URI` в `/etc/ams/realtbase/start-baza.env` указывает на local PostgreSQL того же AMS Server (`ams_realtbase_prod`), не на Timeweb Managed PostgreSQL.

Обязательно: автоматическое расписание, ретенция минимум 7 daily, offsite/второй носитель вне диска AMS Server, проверка целостности последней копии, alert при backup failure. Restore rehearsal проверяет DB + media references. Disk-full — critical; backup только на том же диске недостаточен.

## Staging contour

Отдельная PostgreSQL database, отдельный `MEDIA_DIR`, отдельные secrets. Production PII dump → staging запрещён.

## Disk monitoring

Warning при <20% free, critical при <10% на data volume.

## Secrets и доступы

Secret Master, self-hosted Infisical `https://infisical.ams24.ru`, является canonical source of truth для секретов и доступов AMS RealBaza. Все новые пароли, API tokens, SSH keys, database credentials и service credentials создаются и хранятся там. Doppler считается только legacy/import source, если старые секреты ещё не перенесены.

Операционное правило: значения секретов не выводить в чат, markdown, логи или git. Для работы с секретами использовать trigger `подключись к секрет мастеру`. Для Git-доступов SourceCraft/GitHub использовать trigger `подключись к гид-сервису`. SourceCraft — основной Git-сервис; GitHub — зеркало, если проект явно не говорит обратное.

Runtime secret scope for this application should be project-specific in Secret Master when the starter project is promoted beyond the current owner-operated AMS Server deployment. Current runtime values are materialized in `/etc/ams/realtbase/start-baza.env` with root-only permissions; values must not be printed to chat, markdown, logs or git. `ams-server/prod` may identify the shared AMS server access contour, but it is not a fallback for application `DATABASE_URI`, Payload secret, S3 credentials, revalidation secret, health secret or lead channel credentials.

## Import operations

- Manual import: owner/admin вызывает controlled endpoint `POST /api/feed-sources/:id/manual-import`. Он создаёт queued `import-run` и ставит `importFeed` в queue `imports`. `feedUrlRef` хранит только ссылку на secret/config, не credential URL.
- Suspicious approval: если import run получил `status=suspicious`, каталог не деактивируется автоматически. Оператор проверяет `import-runs` и `import-issues`, затем вызывает `POST /api/feed-sources/:id/approve-deactivation` с `{ "importRunId": "<id>" }`. Approval run-specific, TTL `approvalTtlMinutes`, single-use (`consumedAt`). Raw XML, PII, feed credentials и токены в approval не записываются.
- Stale/orphan recovery: `jobsJanitor` переводит stale `running` или orphan `queued` import runs в `interrupted` с redacted diagnostic. После устранения причины owner/admin создаёт новый run; старый run не переписывается задним числом.
- Retry: повторный import выполняется новым run/job для того же `feedSource`. Bad/truncated feed и suspicious run не деактивируют каталог.
- Изменение source identity или parser mapping проходит staging.
- Новый image host требует config review, rebuild и release.

## Payload Jobs inspection and emergency unstuck

Read-only inspection of `payload-jobs` goes through `src/core/data-access/system/jobs` (`inspectPayloadJob`, `listStalePayloadJobs`). Generic Admin CRUD for `payload-jobs` is not enabled.

Emergency unstuck of a stuck `processing=true` job is the documented operation `emergencyUnstuckPayloadJob`. It only clears the processing flag and writes a redacted error. Do not edit queue/system fields from generic Admin or application CRUD.

## Lead operations

- Delivery retry: owner/admin работает с `lead-deliveries`; safe manual retry — `status=pending`, `nextAttemptAt` в безопасное время, stale claim/job fields очищаются только при доказанном orphan/stale состоянии. Raw payload/response, PII и secrets не пишутся в diagnostics.
- Delivery recovery: `recoverLeadDeliveries` возвращает stale `sending` в `pending` и ставит redacted diagnostic; due pending delivery без `jobId` ставится в queue `lead-deliveries`.
- Missing adapter/channel outage: delivery остаётся в delivery state machine как retryable/permanent; успешный HTTP intake лида не откатывается после сохранения лида и delivery rows в собственной БД.
- CRM token recovery не выполняется до подключения CRM adapter. CRM adapter отложен владельцем; текущие recovery flows покрывают messenger/custom webhook и общий delivery state.
- PII и секреты не пишутся в обычные logs.

## Catalog lifecycle operations

- `catalogLifecycle` применяет retention к archived properties только если `archiveRetentionDays` задан в `project.config.ts`; иначе destructive cleanup не выполняется и поднимается alert.
- Public gateway различает active 200, retained archived 200/noindex, purged 410/noindex и redirect только при explicit redirect path.
- Lifecycle recovery: если content purge выполнен ошибочно, восстановление допускается только из backup/source-of-truth и отдельной owner-approved recovery task; автоматический similarity redirect запрещён.

## Диагностика и инцидент

До release должны быть проверяемые health/alerts для site, DB, overdue feed, interrupted import, lead backlog/abandoned, backup failure и critical integration failure. Incident procedure: зафиксировать SHA и симптомы, остановить опасный mutating path, сохранить evidence, выполнить approved recovery/rollback и подтвердить live state.

Backup failure alerts (`backup_db_failure`, `backup_media_failure`) читают `BACKUP_STATUS_PATH` JSON: `lastSuccessAt`, `integrityOk`, `offsiteCopyPresent` для db и media. Пропуск, порча, отсутствие offsite copy или неизвестный статус в production поднимают critical alert. Cache invalidation failure поднимается, если после неуспешной инвалидации публичные ответы остаются stale дольше `staleDataSlaMinutes`.

## Independent alert channel

Primary operational alerts: `ALERT_WEBHOOK_URL` (Secret Master).  
Fallback: owner email / AMS operations inbox, not a messenger used for lead delivery.

`ALERT_WEBHOOK_URL` must not share host with `CUSTOM_WEBHOOK_URL` or the live MAX lead adapter. Otherwise a messenger outage hides both leads and the alert that leads are not delivering.

## Dynamic recovery thresholds

Не использовать одну универсальную константу:

- import stale (running heartbeat): `max(15m, 3 × observed successful duration)`;
- queued import orphan: `max(15m, 3 × dispatcherIntervalMinutes)`;
- pending/sending delivery orphan: `max(5m, 2 × maintenanceIntervalMinutes)`.

## External uptime monitoring

External monitor is independent of AMS Server and watches public homepage, `/api/internal/healthz` availability from outside, and TLS/HTTP. Feed overdue on the external contour uses `max(2 hours, 3 × refreshIntervalMinutes)`. Internal healthz remains the source for feed/jobs/lead condition alerts.

## Payload Jobs, media, CSP и raw REST

- Jobs owner: ровно один runtime с `JOBS_AUTORUN=true`; compose `deploy/compose/start-baza.compose.yml` pins `JOBS_AUTORUN: "true"` on that single service. Healthz reports `jobs.ownerIdentity` + `jobs.ownerPid`. При handover новый runtime сначала стартует с `false`.
- Media: persistent `MEDIA_DIR`, Nginx `location /media/` alias на `/var/lib/ams/realtbase/media/`, unique filenames, overwrite disabled, не S3. Compose mounts the same host path.
- Cookies: Payload session `payload-token` is httpOnly; production `secure` + `sameSite=Lax`.
- Login lockout: 5 attempts / 10 minutes; Nginx `limit_req` on `/admin/login`, `/api/users/login`, `/api/public/leads`, `/api/internal/`.
- Admin access: public+hardened until owner sets IP/VPN (`docs/PROJECT.md`).
- Health endpoint: `GET /api/internal/healthz` требует `x-ams-health-secret`.
- Raw REST boundary: `config/raw-rest-boundary.json`.

## Canonical verification

Единственная обязательная поверхность (не дробить на дополнительные gate):

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

# Operations

Статус: `Skeleton / production not provisioned`.

Этот файл хранит только проектные runbooks. Архитектурные инварианты находятся в `03_ARCHITECTURE.md`, а release gates — в `05_RELEASE_CHECKLIST.md`.

## Deploy и rollback

Internal production target:

```text
domain: start-baza.ams24.ru
provider: Timeweb / AMS server contour
runtime: one application runtime, immutable artifact only
database: Timeweb Managed PostgreSQL, separate from app server
storage: Timeweb S3 bucket for Payload Media
secrets: isolated project-specific Secret Master scope
indexing: noindex until owner explicitly promotes the instance
```

`TODO: оформить после выбора exact Timeweb runtime и immutable artifact format.` Обязательные границы: отдельная команда владельца, clean SourceCraft `main`, exact SHA, отсутствие build на production host, один rollout и live smoke. Известный рабочий artifact сохраняется для rollback.

При handover jobs сначала новый runtime стартует с `JOBS_AUTORUN=false`; старый jobs owner выключается до controlled restart нового с `true`. Два jobs-active runtime недопустимы.

## Migrations

`schema change -> dev proof -> migration -> verify:schema -> staging when RISKY -> production`. Payload `push` в production запрещён.

## Backup и restore

`TODO: после provisioning.` Требуются automatic Managed PostgreSQL backup, S3 versioning/backup policy и фактическая restore rehearsal до первого production release.

## Secrets и доступы

Secret Master, self-hosted Infisical `https://infisical.ams24.ru`, является canonical source of truth для секретов и доступов AMS RealBaza. Все новые пароли, API tokens, SSH keys, database credentials и service credentials создаются и хранятся там. Doppler считается только legacy/import source, если старые секреты ещё не перенесены.

Операционное правило: значения секретов не выводить в чат, markdown, логи или git. Для работы с секретами использовать trigger `подключись к секрет мастеру`. Для Git-доступов SourceCraft/GitHub использовать trigger `подключись к гид-сервису`. SourceCraft — основной Git-сервис; GitHub — зеркало, если проект явно не говорит обратное.

Runtime secret scope for this application must be project-specific. `ams-server/prod` may identify the shared AMS server access contour, but it is not a fallback for application `DATABASE_URI`, Payload secret, S3 credentials, revalidation secret, health secret or lead channel credentials. If the project scope does not exist yet, provisioning it is a separate owner-authorized Secret Master mutation.

## Import operations

- Manual import: owner/admin включает `feed-sources.enabled`, проверяет `nextDueAt`, `feedUrlRef`, `safetyThresholdPercent`, `maxDeactivationsPerRun` и запускает dispatch через jobs owner. `feedUrlRef` хранит только ссылку на secret/config, не credential URL.
- Suspicious approval: если import run получил `status=suspicious`, каталог не деактивируется автоматически. Оператор проверяет `import-runs` и `import-issues`, затем заполняет `feed-sources.deactivationApproval` только metadata: `runId`, `approvedBy`, `approvedAt`, `expiresAt`. Raw XML, PII, feed credentials и токены в approval не записываются.
- Stale/orphan recovery: `jobsJanitor` переводит stale `running` или orphan `queued` import runs в `interrupted` с redacted diagnostic. После устранения причины owner/admin создаёт новый run; старый run не переписывается задним числом.
- Retry: повторный import выполняется новым run/job для того же `feedSource`. Bad/truncated feed и suspicious run не деактивируют каталог.
- Изменение source identity или parser mapping проходит staging.
- Новый image host требует config review, rebuild и release.

## Lead operations

- Delivery retry: owner/admin работает с `lead-deliveries`; safe manual retry — `status=pending`, `nextAttemptAt` в безопасное время, stale claim/job fields очищаются только при доказанном orphan/stale состоянии. Raw payload/response, PII и secrets не пишутся в diagnostics.
- Delivery recovery: `recoverLeadDeliveries` возвращает stale `sending` в `pending` и ставит redacted diagnostic; due pending delivery без `jobId` ставится в queue `lead-deliveries`.
- Missing adapter/channel outage: delivery остаётся в delivery state machine как retryable/permanent; успешный HTTP intake лида не откатывается после сохранения лида и delivery rows в собственной БД.
- CRM token recovery не выполняется до подключения CRM adapter. CRM adapter отложен владельцем; текущие recovery flows покрывают messenger/custom webhook и общий delivery state.
- PII и секреты не пишутся в обычные logs.

## Catalog lifecycle operations

- `catalogLifecycle` применяет retention к archived properties: после `ARCHIVE_RETENTION_DAYS` очищает публичный content (`description`, `images`) и ставит `contentPurgedAt`.
- Public gateway различает active 200, retained archived 200/noindex, purged 410/noindex и redirect только при explicit redirect path.
- Lifecycle recovery: если content purge выполнен ошибочно, восстановление допускается только из backup/source-of-truth и отдельной owner-approved recovery task; автоматический similarity redirect запрещён.

## Диагностика и инцидент

До release должны быть проверяемые health/alerts для site, DB, overdue feed, interrupted import, lead backlog/abandoned, backup failure и critical integration failure. Incident procedure: зафиксировать SHA и симптомы, остановить опасный mutating path, сохранить evidence, выполнить approved recovery/rollback и подтвердить live state.

## Payload Jobs, S3, CSP и raw REST

- Jobs owner: ровно один runtime с `JOBS_AUTORUN=true`; при handover новый runtime сначала стартует с `false`.
- Health endpoint: `GET /api/internal/healthz` требует `x-ams-health-secret`, возвращает app/database/storage/jobs components и redacted alerts.
- Raw REST boundary: каждый app API route включается в `config/raw-rest-boundary.json`; anonymous business REST остаётся denied by default.

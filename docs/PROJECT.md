# Project — AMS Realty Baza Starter

Статус: `Foundation`.

## Зафиксировано

| Параметр | Решение |
|---|---|
| Project identity | `AMS Realty Baza Starter` |
| Product line | `AMS RealtBase` |
| Profile | `AMS_PROFILE=REALTY_BASE` |
| Delivery | `COMMERCIAL` |
| Time zone | `Europe/Moscow` / `TZ=Europe/Moscow` |
| Currency | `RUB`, одна валюта, integer minor units |
| Production hosting | один client = один Timeweb VPS + один Timeweb Managed PostgreSQL + один Timeweb S3 bucket + свой домен + свой secrets scope |
| Secrets source of truth | Secret Master, self-hosted Infisical: `https://infisical.ams24.ru` |
| Legacy secret source | Doppler только как legacy/import source до миграции старых секретов |
| Reference environment | AMS VPS + internal domain + отдельные Managed PostgreSQL/S3 + `noindex` |
| Internal production domain | `start-baza.ams24.ru` |
| Runtime Secret Master scope | `TODO: provision project-specific Secret Master scope`; do not reuse `ams-server/prod` for app runtime secrets |
| Jobs owner | один application runtime; production `JOBS_AUTORUN=true` только у него |
| Dispatcher interval | `5` минут |
| Manual/CMS media | Payload Media -> Timeweb S3 |
| Feed images | external HTTPS URLs по exact host allowlist; mirror только по отдельному trigger |
| Cache | `http` default; `in-process` только после proof |
| Enabled modules | только REALTY_BASE foundation; extended modules выключены |

Canonical URL map и reserved namespaces: `02_PRODUCT_STRUCTURE.md`.

## Требует решения до интеграции или production

| Параметр | Статус |
|---|---|
| Internal production domain | `start-baza.ams24.ru`; `noindex` до отдельного решения владельца |
| Public/client production and staging domains | `TODO: owner decision` |
| Feed sources, parser mapping и refresh intervals | `TODO: source onboarding` |
| Feed lifecycle/delete policy | `TODO: before first feed` |
| safety threshold, max deactivations, approval TTL | `TODO: before first import` |
| Approved external image hosts | `TODO: before first feed`; wildcard запрещён |
| Lead channels, IDs, routing и host allowlists | `TODO: before first live form` |
| Delivery retry schedule | `TODO: before first lead channel activation` |
| Channel `credentialRef` mapping | `TODO: before first lead channel activation`; только ссылки, без secret values |
| Consent version/source | `TODO: legal approval before first live form` |
| archiveRetentionDays и leadRetentionDays | `TODO: legal/owner decision`; silent default запрещён |
| DATABASE_POOL_MAX и provider connection limit | `TODO: after Managed PostgreSQL plan selection` |
| S3 bucket/region and DB region | `TODO: infrastructure provisioning` |
| Runtime Secret Master project/env/path | `TODO: provision isolated project scope`; required names are documented in `.env.example`, values never in git |
| Backup, restore and monitoring targets | `TODO: before release readiness` |
| Admin access policy | `TODO: before Payload Admin activation` |
| CSP and raw REST edge allowlist | `TODO: before Payload foundation verification` |
| `INTERNAL_REVALIDATE_BASE_URL` and cache proof status | `TODO: before cache activation`; current status `NOT VERIFIED` |
| Extended-profile triggers | `TODO: evaluate only after measured capacity/topology need`; current profile remains `REALTY_BASE` |

Секретные значения принадлежат Secret Master и никогда не записываются в этот документ, markdown, логи или git. Новые пароли, API tokens, SSH keys, database credentials и service credentials создаются и хранятся в Secret Master. Doppler больше не является canonical для AMS RealBaza и используется только как legacy/import source, если старые секреты ещё не перенесены. Для доступа к секретам использовать trigger `подключись к секрет мастеру`; для Git-доступов SourceCraft/GitHub — trigger `подключись к гид-сервису`.

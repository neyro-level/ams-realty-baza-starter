# Clone onboarding

Этот репозиторий — **демо-шаблон** AMS Realty Baza, не готовый коммерческий сайт клиента.

## Этот starter / demo

```text
host: AMS Server
database: local PostgreSQL on the same server
storage: persistent MEDIA_DIR
jobs: one runtime, JOBS_AUTORUN=true
S3: not used
Timeweb Managed PostgreSQL: not used
S3 credentials: not required to treat the template as clone-ready
```

Канон: `docs/adr/ADR-LOCAL-STARTER-STORAGE.md`, `docs/PROJECT.md`, `docs/OPERATIONS.md`.

## Будущий коммерческий клиент

Клиентский clone принимает **собственное** topology decision. Часто это Managed PostgreSQL + S3, отдельный VPS, домен и секреты. Это решение clone-time, не скрытая миграция starter и не обязательный adapter в этом репозитории.

Не копировать local PG + MEDIA_DIR автоматически только потому, что так устроен demo.

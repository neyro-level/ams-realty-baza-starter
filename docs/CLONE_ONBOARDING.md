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

## Вне этого демо-репозитория

Если когда-нибудь появится отдельный клиентский контур, он принимает **собственное** topology decision. Это не задача и не закупка внутри данного репозитория и не обязательный adapter здесь.

Не копировать local PG + MEDIA_DIR автоматически только потому, что так устроен demo. Не трактовать demo-канон как «надо купить Managed PG/S3».

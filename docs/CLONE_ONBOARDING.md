# Clone onboarding

Этот репозиторий — демо-шаблон AMS Realty Baza, а не готовый коммерческий
сайт клиента. Переход между стадиями выполняется явно; demo-топология не
становится клиентской по умолчанию.

## A. Starter demo

```text
projectKind: starter-demo
host: AMS Server
database: local PostgreSQL on the same server
storage: persistent MEDIA_DIR
jobs: one runtime, JOBS_AUTORUN=true
domain: start-baza.ams24.ru, noindex
```

Это owner-operated verification contour. Его Nginx/Compose и локальное
хранилище относятся только к starter demo.

## B. Client development

Plan №8 принят, но tag `starter-v2.0.0` ещё не создан. Его создаёт владелец
отдельной командой после проверки canonical `main`. До появления этого
immutable tag клиентский clone не начинать.

1. Создать отдельный client repository из exact tag `starter-v2.0.0`.
2. Скопировать `docs/CLONE_PRESET.example.json` во временный утверждаемый preset
   вне Git и заполнить `projectId`, package/brand/domain, один из режимов
   `MIXED | NEWBUILD_FIRST | SECONDARY_FIRST`, `SINGLE_GEO | MULTI_GEO`,
   морфологию каждого geo, NAP-контакты, indexing decision, logo/tokens, feed и
   development Excel readiness.
3. В clean checkout выполнить:

   ```bash
   pnpm clone:prepare --preset-file=C:/secure/client-preset.json --source-tag=starter-v2.0.0
   pnpm verify:clone-bootstrap
   ```

   Команда fail-closed проверяет, что checkout чистый и `HEAD` совпадает с
   immutable tag. Затем она генерирует project SiteProfile, client identity и
   `docs/CLIENT_BOOTSTRAP.json`, очищает demo fixture runtime и starter-only
   evidence, но не меняет `src/core/**`, `packages/**`, migrations или guards.
   Повтор с тем же preset — no-op; другой preset требует новый чистый clone.
4. Проверить и закоммитить generated client bootstrap. Затем заполнить
   `src/project/client-readiness.config.ts`: retention, legal approval,
   allowlists, deployment/database/media topology и lead channels.
5. Создать geo/district data по утверждённой морфологии, заполнить SEO registry,
   установить brand tokens/logo, подключить feed и development Excel по
   `docs/CLIENT_BOOTSTRAP.json`. В client mode отсутствие Payload data означает
   пустой каталог: starter demo fixture не используется как fallback.
6. Использовать отдельные локальные PostgreSQL и секреты; секреты хранить только
   в Secret Master.
7. После отдельного topology decision выполнить
   `pnpm clone:activate-timeweb-storage`. Команда добавляет точно совместимый
   `@payloadcms/storage-s3@3.90.1`, подключает Media к Timeweb S3, добавляет
   client-only env schema и выполняет typecheck. Она не входит в
   `clone:prepare`; повторный запуск — безопасный no-op.
8. Выполнить `pnpm install --frozen-lockfile`, `pnpm verify:daily` и
   `pnpm verify:client-readiness`. До production дополнительно пройти release
   gates раздела D.

После Design Intake нового клиента UI cleanup выполняется отдельно:

```text
удалить неиспользуемые starter views
→ pnpm tokens:report --dead-only
→ вручную проверить и удалить только доказанный DEAD-набор
→ pnpm quality:design-tokens
→ pnpm verify:drift
→ проверить representative pages
→ pnpm verify:ui-core
```

Команда отчёта ничего не удаляет. Atlas-derived vocabulary не вычищается
механически до появления утверждённой Design System клиента.

## C. Client Timeweb staging

Статический reference package: `deploy/clients/timeweb/README.md`. Его файлы
нужно скопировать и адаптировать в client clone; они не являются вторым runtime
starter и не доказывают доступ к реальному Timeweb.

- отдельный Timeweb VPS или другой явно одобренный runtime;
- отдельная Timeweb Managed PostgreSQL;
- отдельный Timeweb S3-compatible Object Storage;
- Payload media подключена командой `pnpm clone:activate-timeweb-storage`;
- изображения фидов остаются внешними URL, если нет отдельного решения;
- ровно один jobs-active runtime;
- Nginx, отдельный staging-домен и staging-секреты;
- staging закрыт от индексации явным решением проекта;
- настроены автоматический backup и внешнее наблюдение.

Перед staging: заполнить runtime env и выполнить
`pnpm verify:client-readiness`.

До первого реального feed отдельно выбрать parser и host, зафиксировать
`EXTERNAL_IMAGE_HOSTS`, refresh interval, safety threshold и maximum
deactivations. Первый полный staging import создаёт baseline и не должен
массово деактивировать записи.

## D. Client Timeweb production

Client production default follows Core 5.5:
Timeweb Managed PostgreSQL + Timeweb S3-compatible Object Storage.
Deviation requires explicit owner decision + ADR where Core requires it.

Production требует клиентский домен, утверждённые правовые тексты, явное
решение об индексации, retention для лидов/архива, точные host allowlists,
один jobs-active runtime, Nginx, automatic backup и external monitoring.
Решение записывается как `productionIndexing = public | noindex`; для `public`
domain обязан совпадать с canonical runtime origin, а legal content иметь статус
`approved`. Client Nginx placeholder `__INDEXING_X_ROBOTS_TAG__` заменяется на
noindex header либо удаляется для public-контура.
Starter `start-baza` Compose/Nginx и `MEDIA_DIR` не являются клиентским
production target/source of truth.

Перед release обязателен `pnpm verify:client-readiness`. Сам release и любая
закупка инфраструктуры выполняются только отдельной командой владельца.

До client production дополнительно доказать: real S3 upload, Managed PostgreSQL
migrations, restore drill, PII retention, выбранные lead channels, одного jobs
owner, frozen URL schema, осознанное indexing decision, performance baseline,
immutable artifact exact SHA и rollback point.

Канон starter demo: `docs/adr/ADR-LOCAL-STARTER-STORAGE.md`,
`docs/PROJECT.md`, `docs/OPERATIONS.md`.

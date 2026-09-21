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

1. Создать client repository из immutable starter tag `starter-freeze-v1`.
2. Переименовать package/project identity.
3. Изменить identity в `src/project/site.config.ts` и установить
   `projectKind: "client"`.
4. Заполнить `docs/PROJECT.md` и `src/project/client-readiness.config.ts`:
   client domain, retention, allowlists и enabled lead channels.
5. Использовать отдельные локальные PostgreSQL, секреты и media-каталог;
   секреты хранить только в Secret Master.
6. Заменить fixture-контент, контакты и правовые тексты.
7. Выполнить `pnpm install --frozen-lockfile`, `pnpm verify:daily` и
   `pnpm verify:client-readiness --mode=fixture-client`.

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
- Payload media вручную подключена к S3 adapter;
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

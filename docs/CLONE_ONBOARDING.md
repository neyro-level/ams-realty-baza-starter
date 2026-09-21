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

1. Изменить identity в `src/project/site.config.ts` и установить
   `projectKind: "client"`.
2. Заполнить `src/project/client-readiness.config.ts` решениями клиента.
3. Использовать отдельные локальные PostgreSQL, секреты и media-каталог.
4. Заменить fixture-контент, контакты и правовые тексты.
5. Выполнить `pnpm verify:clone-readiness` и обычные локальные проверки.

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

Канон starter demo: `docs/adr/ADR-LOCAL-STARTER-STORAGE.md`,
`docs/PROJECT.md`, `docs/OPERATIONS.md`.

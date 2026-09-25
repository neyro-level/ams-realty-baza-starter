# P8-18 Navigation evidence

Дата: 2026-09-25. Scope: безопасная навигация, breadcrumbs и перелинковка до cutover.

## Контракт

- Единственный источник `href` — канонический `UrlGrammar.buildUrl(PageKey)`.
- Меню и перелинковка допускают только `ACTIVE`-поверхность с Content Gate `200 / index / follow / includeInSitemap` и self-canonical URL.
- `NOINDEX_AUTO`, `PREPARED_OFF`, `OUT`, 404, redirect и canonical mismatch fail closed: ссылка не создаётся.
- Недоступный географический родитель сохраняется в breadcrumbs как текст, но не становится ссылкой.
- Текущая страница — единственный элемент breadcrumbs с `aria-current="page"`.
- Query URL не является навигационной целью: builder принимает только `PageKey`.

## Проверки

- `pnpm verify:navigation`: четыре профильные конфигурации и fixture crawl без ссылок на 404/redirect/query URL.
- `pnpm verify:ui-core`: существующие UI, responsive fixtures, design tokens, drift, accessibility и SEO contracts.
- `pnpm typecheck` и `pnpm lint`.

Визуальная основа — 20 проверенных снимков P8-17 для пяти views на
390/768/1280/1440. P8-18 не меняет CSS или layout; свежий `verify:ui-core`
подтвердил отсутствие UI/design drift. Попытка повторного browser capture в
изолированном worktree не засчитана: локальный Next dev не открыл proof-port,
поэтому новых снимков нет. Видимое изменение ограничено удалением ссылок,
которые не прошли Gate; это доказано resolver-crawl и a11y-проверкой.

Новые App Router routes не включены. Production, release, tag, mirror и секреты не затронуты.

# Product Structure

Статус: `Plan 8 canonical runtime cutover + post-cutover cleanup implemented`.

## Текущий публичный runtime

P8-23A переключает динамический public runtime на canonical resolver. Статические
маршруты остаются explicit; два реально публичных legacy donor URL сохранены
как redirect-only compatibility adapters без прежнего presentation/runtime.

| Назначение | Текущий URL |
|---|---|
| Главная | `/` |
| Каталог | `/{category}/`, `/{geo}/{category}/`, bounded district/facet routes |
| Карточка объекта | `/{category}/{semantic}-{publicUrlId}/` |
| Geo hub | `/{geo}/` |
| Застройщики | `/zastroyshchiki/`, `/zastroyshchiki/{slug}/`, `/{geo}/zastroyshchiki/` |
| Проекты | `/novostroyki/zhk-{slug}/`, `/kottedzhnye-poselki/kp-{slug}/` |
| Услуги | `/uslugi` |
| О компании | `/o-kompanii` |
| Ипотека | `/ipoteka` |
| Продать | `/prodat` |
| Сдать | `/sdat` |
| Контакты | `/kontakty` |
| Политика конфиденциальности | `/politika-konfidencialnosti` |
| Согласие на обработку данных | `/soglasie-na-obrabotku-personalnyh-dannyh` |

## Зарезервированные пространства

- `/novostroyki/**` — новостройки и шахматка;
- `/sotrudniki/**` — сотрудники;
- `/journal/**` — журнал.

Их нельзя использовать для несвязанных страниц. Активация модулей фиксируется в `PROJECT.md` до появления маршрутов.

## Владение контентом и данными

- статические маркетинговые страницы остаются в коде, пока для редактирования нет доказанного требования;
- Payload владеет application schema и управляемым контентом;
- публичный UI получает только DTO через Public Gateway;
- избранное и сравнение допустимы без кабинета через localStorage/URL;
- feed/manual identity и lifecycle объекта реализуются по мастер-плану до публичного каталога.

## Каталог: facet UX

Для базового профиля выбран режим `filters only`: общий результат и число найденных объектов показываются, per-option facet counts в presentation contract не входят. Если approved UX потребует counts до contract freeze, они добавляются отдельным решением и только через bounded aggregate queries.

Финальные SEO index/canonical/redirect решения добавляются сюда при реализации соответствующих маршрутов.

## Approved target: geo-catalog platform

Reusable target-контракт: `platform/GEO_CATALOG_CONTRACT.md`. Он фиксирует
PageKey, URL grammar, resolution order, status/profile model и lifecycle
семантику. Реализация выполняется по Plan №8; atomic public cutover принадлежит
только P8-23A.

| Target surface | Canonical grammar | Текущий статус |
|---|---|---|
| Главная | `/` | live |
| Geo hub | `/{geo}/` | live via resolver |
| Категория по geo | `/{geo}/{category}/` | live via resolver |
| Район или whitelist facet | `/{geo}/{category}/{sub}/` | live via resolver |
| Root-категория | `/{category}/` | live via resolver |
| Объект | `/{category}/{semantic}-{publicUrlId}/` | live via resolver |
| Застройщики geo | `/{geo}/zastroyshchiki/` | live via resolver |
| Застройщики root/detail | `/zastroyshchiki/`, `/zastroyshchiki/{slug}/` | live via resolver |
| ЖК | `/novostroyki/zhk-{slug}/` | live via resolver |
| Коттеджный посёлок | `/kottedzhnye-poselki/kp-{slug}/` | live via resolver |
| Project static routes | explicit declarations from project profile | live, explicit routes preserved |

Инварианты target-грамматики: не более трёх сегментов, lowercase, canonical
trailing slash, property URL не содержит geo, parent района не входит в URL.
Legacy `/nedvizhimost` и `/obekty/[slug]` делают один прямой `308` на canonical
URL. Отдельная proof-only lifecycle HTTP boundary удалена в P8-23B: реальные
canonical `301/410` обслуживает bounded preflight в `src/proxy.ts`. Raw legacy
geo/source fields и history redirects не удалялись.

## Current vs target ownership

- **Current runtime:** explicit static routes + один catch-all dispatcher,
  общий resolver для HTML и metadata, canonical lifecycle preflight в proxy.
- **Target contract:** `platform/GEO_CATALOG_CONTRACT.md`.
- **Target implementation:** schema, profile, grammar, resolver, Gate, UI и
  discovery epics Plan №8.
- **Cutover owner:** P8-23A; implementation evidence —
  `docs/plan8/S8_23A_RUNTIME_CUTOVER_EVIDENCE.md`.
- **Cleanup owner:** P8-23B; evidence —
  `docs/plan8/S8_23B_POST_CUTOVER_CLEANUP_EVIDENCE.md`. Raw legacy geo/source
  data сохранены.

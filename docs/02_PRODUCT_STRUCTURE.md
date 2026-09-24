# Product Structure

Статус: `Current runtime + approved Plan 8 target`.

## Текущий публичный runtime

Эта таблица описывает реально существующие маршруты до P8-23A. Target-контракт
ниже не объявляет новые URL реализованными.

| Назначение | Текущий URL |
|---|---|
| Главная | `/` |
| Каталог | `/nedvizhimost` |
| Карточка объекта | `/obekty/[slug]` |
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
| Geo hub | `/{geo}/` | target, not live |
| Категория по geo | `/{geo}/{category}/` | target, not live |
| Район или whitelist facet | `/{geo}/{category}/{sub}/` | target, not live |
| Root-категория | `/{category}/` | target, not live |
| Объект | `/{category}/{semantic}-{publicUrlId}/` | target, not live |
| Застройщики geo | `/{geo}/zastroyshchiki/` | target, not live |
| Застройщики root/detail | `/zastroyshchiki/`, `/zastroyshchiki/{slug}/` | target, not live |
| ЖК | `/novostroyki/zhk-{slug}/` | target, not live |
| Коттеджный посёлок | `/kottedzhnye-poselki/kp-{slug}/` | target, not live |
| Project static routes | explicit declarations from project profile | current routes stay live through cutover |

Инварианты target-грамматики: не более трёх сегментов, lowercase, canonical
trailing slash, property URL не содержит geo, parent района не входит в URL.
Legacy `/nedvizhimost`, `/obekty/[slug]` и lifecycle boundary сохраняются до
проверенного cutover и удаляются только по P8-23B evidence.

## Current vs target ownership

- **Current runtime:** перечисленные выше App Router routes и их существующая
  query SEO/lifecycle/cache логика.
- **Target contract:** `platform/GEO_CATALOG_CONTRACT.md`.
- **Target implementation:** schema, profile, grammar, resolver, Gate, UI и
  discovery epics Plan №8.
- **Cutover owner:** только P8-23A; до него target routes не становятся public.
- **Cleanup owner:** P8-23B после принятого cutover proof; raw legacy geo/source
  data не удаляется транзакцией cutover.

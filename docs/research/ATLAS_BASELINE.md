# Atlas visual baseline evidence

Статус: `SOURCE FIXED / CAPTURE PENDING`.

## Donor identity

| Параметр | Значение |
|---|---|
| Source | local Atlas checkout |
| Canonical repository | SourceCraft `integrator-p/atlas-realty-starter` |
| Branch | `main` |
| Exact commit | `4fc5d8a2cfcd29b1431ce9541db72ba0280a4cbe` |
| Проверка | local `HEAD` равен `origin/main`, tracked state clean |
| Режим данных | deterministic `SITE_ENGINE=fixture` |
| Locale / theme / motion | `ru-RU` / light / reduced motion |

Donor фиксируется как visual/UX reference и источник presentation patterns. Его Payload schema, migrations, data access, jobs, deployment и tenant-specific данные не переносятся.

## Viewports

| Роль | Размер |
|---|---|
| mobile | `390 × 844` |
| tablet | `768 × 1024` |
| desktop | `1280 × 900` |
| wide desktop | `1440 × 1000` |

Размеры совпадают с `playwright.visual.config.ts` exact donor commit.

## Representative capture contract

| Сценарий | Donor route / state |
|---|---|
| Главная | `/` |
| Каталог | `/nedvizhimost` |
| Карточка объекта | `/obekty/svetlaya-kvartira-v-centre` |
| Коммерческая страница | `/promo/stroitelstvo-domov` |
| Контакты | `/kontakty` |
| Lead modal | `/`, открыть canonical request modal и показать validation state |

Дополнительные Atlas visual tests могут использоваться как evidence, но не расширяют обязательный набор без отдельного решения.

## Reproduction contract

1. Использовать только exact commit из таблицы.
2. Запускать donor в fixture mode через его `playwright.visual.config.ts`; production или client DB не использовать.
3. Перед capture подтверждать clean tracked state и равенство `HEAD = origin/main` для зафиксированного commit.
4. Снимать все обязательные сценарии во всех четырёх viewport.
5. Хранить screenshot manifest с route, viewport, donor SHA и временем capture.

## Граница текущей задачи

Источник, identity, data mode, routes и viewport зафиксированы. Фактический UI inventory и новый комплект screenshots выполняются следующими задачами EPIC 1.

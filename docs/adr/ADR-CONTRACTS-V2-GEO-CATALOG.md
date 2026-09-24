# ADR-CONTRACTS-V2-GEO-CATALOG

Статус: Accepted

Дата: 2026-09-24

Authority: `AMS-REALTY-BAZA-STARTER-GEO-CATALOG-8`, v6, `APPROVED`, P8-12.

## Контекст

Контракты Base были переведены P8-05 из frozen `1.0.0` в draft major
`2.0.0`, чтобы добавить NAP без обхода guarded lifecycle. Geo-catalog требует
закончить тот же major: зафиксировать географию, застройщиков, проекты,
категорийные объекты, listings, SEO и breadcrumbs до реализации новых Gateway
methods и UI views.

## Решение

- Base contract `2.0.0` становится единственным presentation contract для
  geo-catalog; journal namespace не меняется.
- `PageKeyDTO` повторяет сериализуемую форму pure URL grammar, но contracts
  package не импортирует runtime core. На project composition boundary
  `PageKeyDTO` передаётся в `buildUrl`; DTO хранит и key, и полученный href.
- `PropertyCardDTO` получает стабильный `publicUrlId`, `pageKey` и
  discriminated `categoryDetails`. Неиспользуемая категория `other` удаляется:
  persisted domain допускает только шесть категорий Plan 8.
- Добавляются `RegionDTO`, `CityDTO`, `DistrictDTO`, `GeoHubDTO`,
  `DeveloperCardDTO/DeveloperDetailsDTO`,
  `DevelopmentCardDTO/DevelopmentDetailsDTO`, `SeoMetaDTO`, расширенные
  breadcrumbs и `ListingPageDTO`.
- `ListingPageDTO` явно содержит page key, H1, intro, items, total, pagination,
  sublinks, nearby links, robots и canonical.
- Contract fixtures строят все internal hrefs действующей project URL grammar и
  проверяются отдельным deterministic verifier.

## Границы

- P8-12 не добавляет Public Gateway methods, новые UI views или route cutover:
  это P8-13, P8-17 и P8-23A.
- DTO не импортируют Payload, Next.js, project config или database types.
- Отсутствующие optional business values не вычисляются и не выдумываются.
- Старый `/obekty/[slug]` не является canonical href v2. Canonical property URL
  строится по category surface, semantic slug и immutable `publicUrlId`.

## Совместимость и rollback

Изменение намеренно breaking и поэтому оформлено major `2.0.0`. Все текущие
consumers и fixtures мигрируются в одной волне. При красном consumer/fixture
proof, несовпадении approved ADR или lock metadata контракт не замораживается;
до merge откатывается вся волна P8-12, а не отдельные поля.

## Проверка

- expected `contracts:diff` до lock;
- approved base lock и freeze только с точным ADR/authority;
- contract fixtures и canonical PageKey href proof;
- typecheck/lint, architecture guards, full daily suite;
- dependency-runtime RISKY gate, включая production build.

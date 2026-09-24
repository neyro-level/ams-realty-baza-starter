# P8-13 — Public Gateway evidence

Статус: `IMPLEMENTED_LOCAL`; delivery evidence заполняется после SourceCraft Gate.

Дата: 2026-09-25

Authority: Plan 8 v6 `APPROVED`, P8-13.

## Implemented boundary

- Добавлены `getGeoBySlug`, `getGeoHub`, `getListing`,
  `getPropertyByPublicUrlId`, `getDevelopment`, `listDevelopments`,
  `getDeveloper`, `listGeoDevelopers`, `getNearby` и `countInventory`.
- Все публичные чтения используют классифицированный anonymous Public Gateway
  context с `overrideAccess: false`; прямой anonymous Local API остаётся закрыт.
- Выборки имеют явные `select`, `depth`, `limit`, status/publication predicates и
  bounded aggregates. Gateway не выбирает lead/user/internal feed поля.
- Listing всегда требует явный geo slug. Город по умолчанию не выводится из
  `siteProfile` или URL-контекста.
- Property listing ограничен `cityRef` и optional `districtRef`; development
  listing/count ограничены relations `city`/`district`.
- Nearby строится только по канонической agglomeration relation и дополнительно
  исключает города, отсутствующие в активном routing profile.
- Frozen presentation contracts `2.0.0` не изменены. Runtime routes остаются на
  прежнем provider до атомарного P8-23A cutover.

## Query budget

| Method | Maximum queries in covered path |
|---|---:|
| `getGeoBySlug` | 1 |
| `getPropertyByPublicUrlId` | 1 |
| `getListing` without district | 2: city + one paginated collection query |
| `getListing` with district | 3: city + district + one paginated collection query |
| `getNearby` | 2: city + one bounded agglomeration query |
| `countInventory` without district | 2: city + one bounded count |
| `countInventory` with district | 3: city + district + one bounded count |

Card mapping performs no persistence calls, so the budgets do not grow with item
count and do not create N+1 queries.

## Local acceptance

| Proof | Result |
|---|---|
| Static Public Gateway contract | PASS |
| TypeScript consumer compatibility | PASS |
| Isolated PostgreSQL 18 Payload integration | PASS |
| Primary/secondary cross-city isolation | PASS: `zarechnyy` property is directly reachable by immutable public URL id and absent from `primorsk` listing |
| Query observation | PASS: listing, details, geo, nearby and count remain within the fixed budgets above |
| Development/developer Gateway | PASS: details, city lists and city-scoped aggregate on real Payload records |

## Delivery

SourceCraft PR, exact-head RISKY `auth-pii-leads` run, merge SHA and main
reconciliation are intentionally left blank until delivery completes.

No production, public route cutover, freeze tag or GitHub mirror is part of P8-13.

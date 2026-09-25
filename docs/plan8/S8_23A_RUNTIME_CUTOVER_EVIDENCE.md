# P8-23A — Runtime route cutover evidence

Статус: implementation complete; production не выполнялся.

## Что переключено

- один `src/app/(site)/[...segments]/page.tsx` dispatches canonical PageKey;
- HTML и `generateMetadata` используют один cached runtime resolver;
- explicit static routes, Payload Admin/API и anonymous API denial сохранены;
- canonical entity lifecycle transport даёт `301`/`410` до React render;
- `/nedvizhimost` и `/obekty/[slug]` ведут одним `308` на final canonical URL;
- trailing slash включён по установленному Next.js `16.3.5` contract;
- shell использует canonical menu + Payload NAP, discovery generators подключены;
- IndexNow остаётся change-driven Payload Job без deploy-wide submission.

## Проверки

- `verify:runtime-cutover`: 52 PageKey/profile cases, pure resolver p95 0.56 ms;
- resolver/navigation/lifecycle/discovery/IndexNow/feed guards: PASS;
- typecheck, lint: PASS; 19 существующих warnings, новых errors нет;
- production build без runtime secrets: PASS;
- live fixture HTTP: canonical geo/listing/developer/development/property `200`,
  unknown route `404`, syntax and legacy direct redirects `308`;
- robots and empty starter sitemap: `200`, starter indexing fail-closed;
- anonymous Payload REST and GraphQL: `404`; public leads GET: `405`;
- visual smoke: catalog desktop/mobile and development mobile rendered.

## Ограничение локального DB-proof

Локальная shared dev DB отстаёт от repository schema. Migration rehearsal
остановился на `20260919_120900`: legacy `properties.total_area` нарушает
numeric invariant; следующие 12 migrations не применены. Успешно применённый
перед ошибкой `20260918_193000` откатан, status возвращён к исходному snapshot.
Поэтому DB-backed live `301/410` и current-schema Admin не заявляются; pure и
integration lifecycle gates остаются зелёными. Исправление legacy данных или
создание отдельной test DB — отдельный owner/data decision, не hidden cutover.

## Recovery

Один switchback commit удаляет catch-all wiring, возвращает donor pages и
отключает `trailingSlash`; additive schema/data, lifecycle records и redirects
не удаляются.

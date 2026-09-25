# P8-22 Starter fixture evidence

Дата: 2026-09-25. Scope: единый синтетический starter dataset, seed, Excel sample и тестовые consumers.

## Requirement map

| Plan requirement | Canonical source / proof |
|---|---|
| Два города | `starter-dataset.ts`: Приморск и Заречный |
| Четыре района | два administrative, один parentless microdistrict и один child microdistrict |
| Два застройщика | Строй Инвест и Приморский дом |
| Три проекта A/B/C | ЖК Северный берег, ЖК Солнечный и КП Заречье |
| Secondary apartment/house/land | три отдельные synthetic property records |
| Newbuild lots | два synthetic property records, связанные с developments |
| SEO seed | registry seed использует дату и morphology канонического dataset |
| Demo Excel | `fixtures/starter/developments.xlsx`, генерируется из того же dataset |
| Idempotent seed | повторный in-memory seed: `0 created / 0 updated / 17 unchanged`; Payload adapter не пишет unchanged records |
| Starter noindex | dataset фиксирует `noindex`; CLI отказывает при `NEXT_PUBLIC_INDEXABLE=true`; SEO rows остаются `noindex,follow` |
| Integration consumers | geo hierarchy, development Excel integration, SEO registry и presentation geo fixture используют один dataset |

## Operations and recovery

- `pnpm fixture:excel:generate` воспроизводит committed Excel sample.
- `pnpm payload:seed:starter-fixture` выполняет relation-aware upsert по стабильным identity.
- `pnpm payload:seed:starter-fixture -- --reset --confirm=p8-22` удаляет только 10 записей с точной fixture ownership-меткой в порядке properties → developments → developers.
- Region/cities/districts reset намеренно сохраняет: это общие canonical geo records без fixture ownership field. Их удаление этим recovery path запрещено.

## Verification

- PASS: `pnpm verify:starter-fixture`.
- PASS: `pnpm verify:development-excel`.
- PASS: `pnpm verify:geo-hierarchy`.
- PASS: `pnpm verify:seo-registry`.
- PASS: `pnpm verify:content-gate`.
- PASS: `pnpm quality:architecture`.
- PASS: `pnpm typecheck`.
- PASS: `pnpm lint` с 19 существующими warnings и без errors.
- Local DB identity PASS: native PostgreSQL 18, loopback-only endpoint, Docker/WSL не использовались.
- DB integration attempt STOP до test execution: project role не имеет `CREATE DATABASE` для нового isolated `ams_realtbase_p8_22_test`. Чужая mutable test DB не переиспользовалась и права не расширялись.

Production, release, tag, mirror и индексируемый runtime не затронуты.

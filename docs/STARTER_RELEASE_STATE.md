# Starter Release State

Статус документа: `ACTIVE`

Срез проверен: `2026-09-30`

Контур: reusable AMS Realty starter; SourceCraft — primary, GitHub — mirror-only.

Этот файл — единственная краткая authority-сводка текущего release state. Код,
Git, migrations и runtime-конфигурация остаются фактическими техническими
источниками. Исторические планы и evidence не переписываются задним числом.

## Current state

| Поле | Текущее значение | Доказательство |
|---|---|---|
| Canonical SourceCraft repository | `integrator-p/ams-realty-baza-starter` | `origin` |
| Plan №12 implementation checkpoint | `47afbde798c77d10725681e9401dee78e471d7d5` | SourceCraft PR `!191`; содержит все delivery PR `!182–!191` |
| Current canonical branch | SourceCraft `main`; exact SHA разрешается live и обязан содержать checkpoint выше | Не хранить самоссылочный SHA документационного merge как release identity |
| GitHub mirror snapshot | `main@47afbde798c77d10725681e9401dee78e471d7d5`, public, one-way | Отдельная owner-команда `2026-09-30`; на момент проверки равен SourceCraft checkpoint |
| AMS Realty Platform Core | `5.5` | `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` |
| AMS UI Core | `v5.0` | Plan №12 v4 architecture header; `docs/DESIGN.md` acceptance matrix |
| Runtime versions | Node `>=24.20.0 <25`; pnpm `11.5.1`; Next.js `16.3.5`; React `19.2.8`; Payload `3.90.1` | `package.json` and lockfile |
| Ownership manifest | `starter-owned.json`, `schemaVersion: 2` | committed manifest on accepted `main` |
| Current released starter tag | `starter-freeze` → `ca1b884d43e808d17e1eb18b05bad70ea358dd1c` (`HISTORICAL`) | SourceCraft tag refs; no current `starter-v2.*` release exists |
| Last exact-head Gate | `PASS`, `merge-risky`, run `512`, scope `dependency-runtime`, exact head `da7c4932da2f8a7d6a97eb337a12d4de70542e1e` | SourceCraft CI run `512`; merged as checkpoint `47afbde798c77d10725681e9401dee78e471d7d5` |
| Clone matrix | `PASS` for five approved profiles and final client-clone guard | Plan №12 EPIC‑10 exact head `da7c4932da2f8a7d6a97eb337a12d4de70542e1e`; Gate run `512` |
| Upgrade propagation proof | `PASS` on exact head `3888adc9b9c1561d1282d432d5fad50df7a62bdd` | Plan №12 EPIC‑08: immutable old-client fixture, conflict/generated-drift guards, non-empty PostgreSQL 18 migration, frozen install, client readiness and build |
| Plan №12 execution | `EXECUTION_COMPLETE`; `103/103` closed, `0` open/READY/in-progress | Task Manager + `evidence/plan12/FINAL_REPORT.md` |
| Open P0 | `0` known | Plan №12 final reconciliation and Gate run `512` |
| Open P1 | `0` known | Plan №12 final reconciliation and Gate run `512` |
| Open P2 | `0` known | Plan №12 final reconciliation and Gate run `512` |
| Production/live proof | `NOT RUN / NOT AUTHORIZED` for this candidate | Plan №12 excluded production and release tag; mirror sync is not live proof |

## Release boundary

The Plan №12 implementation checkpoint is not an immutable commercial starter release. The
historical `starter-freeze` tag must not be used as proof of the current
candidate. A new tag must follow `starter-v2.MINOR.PATCH`, point to the final
accepted SourceCraft `main`, and be created only by the separate owner-triggered
post-implementation release gate after EPIC‑01…10 are closed and `P0=P1=0`.

Client project plans must pin both the immutable released starter tag and its
exact SourceCraft SHA. A moving `main` is not an accepted clone baseline.

## Update rule

Update this document in the same change that alters an accepted release-state
fact: canonical `main`, Core/UI/runtime versions, ownership schema, released
tag, exact-head Gate, clone matrix, upgrade proof, open severity status or
production/live proof. Historical evidence keeps its original status.

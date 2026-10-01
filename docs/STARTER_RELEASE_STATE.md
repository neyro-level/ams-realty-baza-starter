# Starter Release State

Статус документа: `ACTIVE`

Срез проверен: `2026-10-01`

Контур: reusable AMS Realty starter; SourceCraft — primary, GitHub — mirror-only.

Этот файл — единственная краткая authority-сводка текущего release state. Код,
Git, migrations и runtime-конфигурация остаются фактическими техническими
источниками. Исторические планы и evidence не переписываются задним числом.

## Current state

| Поле | Текущее значение | Доказательство |
|---|---|---|
| Canonical SourceCraft repository | `integrator-p/ams-realty-baza-starter` | `origin` |
| Repository main SHA | `3efc6844c0fe44301b604c2b2049aa45600f66d1` | SourceCraft `main` after EPIC-05 squash merge |
| Accepted implementation SHA | `3efc6844c0fe44301b604c2b2049aa45600f66d1` | Accepted `main` includes EPIC-00…05 delivery state |
| Last fully verified SHA | `c8ca568d9c047e4bcb503b58d50b20ed5ca48b4d` | EPIC-06 local `pnpm verify` PASS on exact candidate SHA; SourceCraft Gate pending |
| Final commercial-freeze candidate SHA | `c8ca568d9c047e4bcb503b58d50b20ed5ca48b4d` | EPIC-06 local final freeze proof complete; SourceCraft PR/Gate/merge pending |
| Plan №12 implementation checkpoint | `47afbde798c77d10725681e9401dee78e471d7d5` | SourceCraft PR `!191`; содержит все delivery PR `!182–!191` |
| Current canonical branch | SourceCraft `main` at repository SHA above | Moving `main` is repository state, not an immutable released clone baseline |
| GitHub mirror snapshot | `main@47afbde798c77d10725681e9401dee78e471d7d5`, public, one-way, `STALE` versus current SourceCraft main | Отдельная owner-команда `2026-09-30`; mirror sync requires separate owner command |
| AMS Realty Platform Core | `5.5` | `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` |
| AMS UI Core | `v5.0` | Plan №12 v4 architecture header; `docs/DESIGN.md` acceptance matrix |
| Runtime versions | Node `>=24.20.0 <25`; pnpm `11.28.2`; Next.js `16.3.8`; React `19.2.8`; Payload `3.90.2`; `@payloadcms/db-postgres` `3.90.2`; `@payloadcms/next` `3.90.2` | `package.json` and `pnpm-lock.yaml` |
| Ownership manifest | `starter-owned.json`, `schemaVersion: 2` | committed manifest on accepted `main` |
| Current immutable released starter tag | `NOT CREATED` | No current `starter-v2.MINOR.PATCH` release exists |
| Released tag SHA | `NOT CREATED` | Release tag creation requires a separate owner release command |
| Historical starter-freeze tag | `starter-freeze` → `ca1b884d43e808d17e1eb18b05bad70ea358dd1c` (`HISTORICAL`) | Historical SourceCraft tag refs; must not be used as current clone baseline |
| Last SourceCraft Gate | `PASS`, `merge-risky`, run `531`, scope `ci-governance`, exact head `5ac3c3007a57f6e89d9d1757dde9114835903c6f` | Last SourceCraft Gate before EPIC-06; EPIC-06 SourceCraft Gate pending |
| Clone matrix | `PASS` for five approved profiles and final client-clone guard | EPIC-06 `pnpm verify` on exact candidate `c8ca568d9c047e4bcb503b58d50b20ed5ca48b4d`; Docker runtime proof skipped because Docker daemon unavailable |
| Upgrade propagation proof | `PASS` on exact candidate `c8ca568d9c047e4bcb503b58d50b20ed5ca48b4d` | Old-client fixture `950901f2`, manifest `894972ec0750`, source `f8a1f4d83e89`, upgrade `11ae28559ad9`; includes local PostgreSQL 18 migration-safety fixture |
| Plan №12 execution | `EXECUTION_COMPLETE`; `103/103` closed, `0` open/READY/in-progress | Task Manager + `evidence/plan12/FINAL_REPORT.md` |
| Open P0 | `0` known | `docs/04_BACKLOG.md` active blocker registry |
| Open P1 | `0` known | `docs/04_BACKLOG.md` active blocker registry |
| Open P2 | `0` known | `docs/04_BACKLOG.md` active blocker registry |
| Production/live proof | `NOT RUN / NOT AUTHORIZED` for the current candidate | Production, release tag and live proof require separate owner command |

## Release boundary

The Plan №12 implementation checkpoint and current moving SourceCraft `main` are
not immutable commercial starter releases. The historical `starter-freeze` tag
must not be used as proof of the current candidate. A new tag must follow
`starter-v2.MINOR.PATCH`, point to the final accepted SourceCraft `main`, and be
created only by the separate owner-triggered post-implementation release gate
after the approved freeze graph is closed and `P0=P1=0`.

Client project plans must pin both the immutable released starter tag and its
exact SourceCraft SHA. A moving `main` is not an accepted clone baseline.

## Update rule

Update this document in the same change that alters an accepted release-state
fact: canonical `main`, Core/UI/runtime versions, ownership schema, released
tag, exact-head Gate, clone matrix, upgrade proof, open severity status or
production/live proof. Historical evidence keeps its original status.

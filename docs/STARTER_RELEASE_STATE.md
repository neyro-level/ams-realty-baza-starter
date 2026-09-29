# Starter Release State

Статус документа: `ACTIVE`

Срез проверен: `2026-09-29`

Контур: reusable AMS Realty starter; SourceCraft — primary, GitHub — mirror-only.

Этот файл — единственная краткая authority-сводка текущего release state. Код,
Git, migrations и runtime-конфигурация остаются фактическими техническими
источниками. Исторические планы и evidence не переписываются задним числом.

## Current state

| Поле | Текущее значение | Доказательство |
|---|---|---|
| Canonical SourceCraft repository | `integrator-p/ams-realty-baza-starter` | `origin` |
| Accepted `main` SHA | `ade28db6241fa70f9c631d8cb55eb0b462ccfdef` | SourceCraft PR `!189`, post-merge fetch |
| AMS Realty Platform Core | `5.5` | `AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md` |
| AMS UI Core | `v5.0` | Plan №12 v4 architecture header; `docs/DESIGN.md` acceptance matrix |
| Runtime versions | Node `>=24.20.0 <25`; pnpm `11.5.1`; Next.js `16.3.5`; React `19.2.8`; Payload `3.90.1` | `package.json` and lockfile |
| Ownership manifest | `starter-owned.json`, `schemaVersion: 2` | committed manifest on accepted `main` |
| Current released starter tag | `starter-freeze` → `ca1b884d43e808d17e1eb18b05bad70ea358dd1c` (`HISTORICAL`) | SourceCraft tag refs; no current `starter-v2.*` release exists |
| Last exact-head Gate | `PASS`, `merge-risky`, run `485`, scope `dependency-runtime`, exact head `3888adc9b9c1561d1282d432d5fad50df7a62bdd` | SourceCraft CI run `485`; merged as `ade28db6241fa70f9c631d8cb55eb0b462ccfdef` |
| Clone matrix | `PASS` for Souz, NEWBUILD_FIRST, SECONDARY_FIRST, MULTI_GEO and districts+legacy | Plan №11 B4 candidate `4f2c7b2102a841b41491f7e58331ca3f17db0692`; delivery Gate run `388`; merge `84666f93af270b30b5e778e4b6a429de4949c391` |
| Upgrade propagation proof | `PASS` on exact head `3888adc9b9c1561d1282d432d5fad50df7a62bdd` | Plan №12 EPIC‑08: immutable old-client fixture, conflict/generated-drift guards, non-empty PostgreSQL 18 migration, frozen install, client readiness and build |
| Open P0 | `0` known | APPROVED Plan №12 v4 / Task Manager reconciliation |
| Open P1 | Plan №12 EPIC‑09 and EPIC‑10 execution remains open | Task Manager: 18 managed issues open/in-progress immediately after EPIC‑08 delivery |
| Open P2 | `0` known | APPROVED Plan №12 v4 / Task Manager reconciliation |
| Production/live proof | `NOT RUN / NOT AUTHORIZED` for this candidate | Plan №12 excludes production, release tag and GitHub mirror |

## Release boundary

The accepted `main` SHA is not an immutable commercial starter release. The
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

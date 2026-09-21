# EPIC 9 visual proof

Final re-check: 2026-09-21

Starter base: SourceCraft `main@2fb19d104bf30ce024c91acd6fcf1ffe695ee606`.

Atlas donor: `integrator-p/atlas-realty-starter` `main@4fc5d8a2cfcd29b1431ce9541db72ba0280a4cbe`.

PNG screenshots are **not** stored in this clone (EPIC 9.7). Hashes and viewport matrix live here; optional captures go to gitignored `docs/proofs/epic-9/captures/`.

## Matrix

| Route | 390×844 | 768×1024 | 1280×900 | 1440×1000 |
|---|---|---|---|---|
| `/` | PASS | PASS | PASS | PASS |
| `/nedvizhimost` | PASS | PASS | PASS | PASS |
| `/o-kompanii` | PASS | PASS | PASS | PASS |
| property `/obekty/[slug]` | NOT PROVEN | NOT PROVEN | NOT PROVEN | NOT PROVEN |

Для трёх доказанных маршрутов на каждом viewport: HTTP page не является 404,
`main` присутствует, ровно один `h1`, horizontal overflow отсутствует. Captures
проверены визуально и оставлены вне git. Property detail не заявляется: чистый
starter fallback не содержит representative published record. Это обязательный
proof первого client clone, а не скрытый PASS.

## Responsive contract (checked in source)

- `Container` / `Section` variants own gutters and vertical rhythm (`--section-space-*`, `--container-*-max`).
- Starter cards use `aspect-[3/2]` / gallery `aspect-[16/9]`.
- Header/footer stay in `SiteShellView`; one `h1` per page view.

## Approved deviations vs Atlas

Starter public UI is a DTO-driven composition, not Atlas HomeHero/SiteHeader.
Cards use CVA elevation. These deviations are approved for REALTY_BASE starter,
not a donor pixel match. Живой keyboard/dialog session и performance metrics в
эту статическую матрицу не входят.

## How to capture hashes locally

```text
STARTER_VISUAL_BASE_URL=http://127.0.0.1:3000 node scripts/capture-starter-visual-proof.mjs
```

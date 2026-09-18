# EPIC 9 visual proof

Checked: 2026-09-18  
Starter SHA at capture planning: `c5023af7da57697dad19758ad40845a7f0813c82` (`origin/main` EPIC 8 checkpoint).  
Atlas donor: `integrator-p/atlas-realty-starter` `main@4fc5d8a2cfcd29b1431ce9541db72ba0280a4cbe`.

PNG screenshots are **not** stored in this clone (EPIC 9.7). Hashes and viewport matrix live here; optional captures go to gitignored `docs/proofs/epic-9/captures/`.

## Matrix

| Route | 390×844 | 768×1024 | 1280×900 | 1440×1000 |
|---|---|---|---|---|
| `/` | required | required | required | required |
| `/nedvizhimost` | required | required | required | required |
| `/uslugi` | required | required | required | required |
| property `/obekty/[slug]` | required | required | required | required |

## Responsive contract (checked in source)

- `Container` / `Section` variants own gutters and vertical rhythm (`--section-space-*`, `--container-*-max`).
- Starter cards use `aspect-[3/2]` / gallery `aspect-[16/9]`.
- Header/footer stay in `SiteShellView`; one `h1` per page view.

## Approved deviations vs Atlas

Starter public UI is a DTO-driven composition, not Atlas HomeHero/SiteHeader. Copy is production-ready. Cards use CVA elevation. These deviations are approved for REALTY_BASE starter, not a donor pixel match.

## How to capture hashes locally

```text
STARTER_VISUAL_BASE_URL=http://127.0.0.1:3000 node scripts/capture-starter-visual-proof.mjs
```

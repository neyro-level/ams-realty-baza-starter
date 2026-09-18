# EPIC 8.6–8.10 — images, gallery, primitives

Checked: 2026-09-18  
HEAD at implementation: `epic/8-canonical-ui`

## Shared host source (8.6)

`src/core/ingest/image-hosts.ts` is the only parser. Ingest (`parseImageHostEnv` → `parseAllowedImageHosts`), Next `images.remotePatterns` (`toNextImageRemotePatterns`), and outbound helper `getApprovedImageOutboundHosts` all use it. `EXTERNAL_IMAGE_HOSTS` wildcards are dropped.

## Rendering (8.7)

Variant B selected for the single AMS Server starter: feed images unoptimized, sizes + 3:2 / 16:9 aspect, lazy except LCP. Documented in `docs/DESIGN.md` and `docs/PROJECT.md`.

## Cards and gallery (8.8–8.9)

Starter cards render real `primaryMedia` or a visual `MediaFallback` (no text «Фото объекта»). Property page uses `MediaGallery` + Embla + lightbox.

## Primitives (8.10)

Card `elevation="raised"` CVA owns `--shadow-card`. Button `hero` variant replaces `home-btn-primary` on Atlas home CTA and request modal submit.

# CORE ALIGN audit note

Plan: `AMS-REALTBASE-CORE-ALIGN` v1 APPROVED. Demo starter. SourceCraft `main` only. GitHub and production are out of graph.

## Proven in-repo

- Demo topology: local PostgreSQL + `MEDIA_DIR`. No purchase of Managed PostgreSQL/S3.
- Next 16 `src/proxy.ts` anonymous REST deny.
- Public/System gateways under `src/core/data-access`.
- Runtime env fail-fast; Next build phase does not require `DATABASE_URI`.
- HTTP vs in-process cache split; §18A live B2 self-call NOT PROVEN.
- Home/shell composition; `home-page.css` is not a live export.
- `pnpm verify:drift` on imported CSS only.
- Marketing/legal/home ISR (`revalidate = 3600`). Catalog and property detail stay `force-dynamic`.
- Leftovers: no `src/components/fixture`, `src/demo-data`, `src/app/(site)/_lib`.
- ADRs: Embla, YARL, local starter storage. Icons: lucide-react 1.x.

## Honest NOT PROVEN

- Live LCP on `start-baza.ams24.ru`
- Catalog p95
- Live HTTP cache self-call (B2) without `DATABASE_URI_TEST`
- Production readiness / PII retention days (`NEEDS_OWNER`)

This note does not claim PRODUCTION READY.

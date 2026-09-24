# P8-21A — canonical HTTP transport proof

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Decision

- The Next.js 16 Node Proxy is bounded by constant matchers to `/api/:path*`
  and the current canonical property path `/obekty/:slug`.
- The preflight parser accepts exactly one lowercase property slug segment. It
  cannot intercept Admin, API business logic, media, `_next` or public assets.
- Lifecycle state is read through one dedicated server-only Payload port. The
  existing indexed property-slug and redirect-from lookups are reused; Proxy
  contains no SQL and performs no recursive HTTP self-fetch.
- Purged property with a direct replacement returns HTTP 301. Purged property
  without replacement returns HTTP 410 before page render. Other states pass
  to the existing page.
- The internal lifecycle header is always overwritten. RSC and router headers
  are preserved unchanged.
- The previous `/http/property-lifecycle/[slug]` route remains as the rollback
  boundary until P8-21B proves generalized entity lifecycle.

## Local live proof

Environment: Next.js `16.3.5` development server on loopback, native PostgreSQL
18, isolated database `ams_realtbase_p8_05_test`; no Docker, WSL, production,
tag or GitHub mirror.

| Scenario | Observed result |
|---|---|
| canonical property with direct replacement | `301`, `Location: /nedvizhimost` |
| canonical purged property without replacement | `410`, HTML, `X-Robots-Tag: noindex, follow` |
| same redirect request with RSC/router headers | `301` |
| same gone request with RSC/router headers and spoofed internal header | `410` |
| anonymous `/api/properties` | existing JSON `404` preserved |
| `_next/static` missing asset | ordinary text `404`; no lifecycle response |

Warm sequential RSC-header sample, 40 requests per outcome after five warmups:

| Outcome | p95 | max | Budget |
|---|---:|---:|---:|
| 301 | 29.36 ms | 34.82 ms | <= 200 ms |
| 410 | 27.27 ms | 34.04 ms | <= 200 ms |

The first development-only Turbopack compilation loaded the Payload dependency
graph and is intentionally excluded from warm request latency. The production
build remains a required RISKY Gate check.

## Recovery

Revert the P8-21A commit. The previous lifecycle route and page-level behavior
remain in place, so removing the Proxy preflight restores the prior boundary.

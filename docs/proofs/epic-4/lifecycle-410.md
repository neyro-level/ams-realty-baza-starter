# EPIC 4 — 410 / redirect mechanism

Checked: 2026-09-18  
Pinned Next.js: 16.3.5  
Chosen mechanism: Preferred A, Route Handler.

## Contract

| Rule | Evidence |
| --- | --- |
| Public 410 body + status | `src/core/http/property-gone-response.ts` returns `410`, `X-Robots-Tag: noindex, follow`, `Cache-Control: public, max-age=300, must-revalidate` |
| Route Handler ownership | `src/app/http/property-lifecycle/[slug]/route.ts` |
| Public page for gone | `src/app/(site)/obekty/[slug]/page.tsx` renders gone HTML + noindex. Pinned Next 16.3.5 `AppPageConfig` rejects `Response` from `page.tsx`, so HTTP 410 is not returned from the RSC page. |
| Redirect lookup | `redirects` collection via `findPublicRedirectByFromPath`; hardcoded `explicitRedirectPath: null` removed |
| No homepage redirect | `sanitizeExplicitRedirectPath("/")` → `null` → 410 |
| No redirect chains | `publicRedirectDestinationIsChain` drops destination if `to` is another `from` |
| Lookup not in proxy | `src/proxy.ts` matcher stays `/api/:path*` |

Purged rows are read by approved public SQL (`findPublicPropertyLifecycleRow`), because Payload public access hides archived/purged documents and would collapse 410 into 404.

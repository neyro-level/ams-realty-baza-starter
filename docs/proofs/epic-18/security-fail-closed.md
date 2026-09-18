# EPIC-18 security / config fail-closed

- Production `PAYLOAD_DB_PUSH=true` is a runtime fail-fast key; Payload `push` is forced off when `NODE_ENV=production`.
- CSP `img-src` is `'self' data: blob:` plus exact `EXTERNAL_IMAGE_HOSTS`; no global `https:`.
- Runtime requires `REVALIDATE_SECRET` for HTTP cache invalidation, Max/custom webhook credentials when those channels are listed, and never S3 for this starter.
- Build-only Payload secret fallback remains for compile; `instrumentation` + `evaluateRuntimeEnv` reject production start without real `PAYLOAD_SECRET`.
- Targeted Safe Outbound Client tests cover loopback, RFC1918, link-local, IPv6, redirect-to-private, HTTP, size and timeout.

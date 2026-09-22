# Plan 7 final validation

Status: **PASS**  
Validated implementation SHA: `80845c6919412d98ef39928d49f28a4d738b6cfa`  
Base SHA: `9de2601c43b8b50b57754c1c48ab62be34d92d3f`  
Date: 2026-09-21  
Scope: local validation only; production and live provider resources were not touched.

## Result

- P0 findings after remediation: **0**.
- P1 findings after remediation: **0**.
- Required integration skips: **0**.
- Production build: **PASS**.
- Exact-SHA temporary client clone: **PASS**.
- Representative desktop/mobile UI routes: **PASS**.

## Automated evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Full RISKY validation | PASS | `pnpm verify:merge-risky` on `80845c6919412d98ef39928d49f28a4d738b6cfa` |
| Required database integration | PASS, no skip | isolated native PostgreSQL 18.6 on loopback; `verify:integration:required` and the required integration inside `verify:merge-risky` |
| Schema/runtime integration | PASS | Payload integration suite, including public gateway, feed, lead, jobs, auth, storage, security and lifecycle coverage |
| Build | PASS | Next.js 16.3.5 webpack production build; all 17 static pages generated and dynamic routes collected |
| Client clone proof | PASS | `pnpm verify:client-clone-proof` from exact SHA `80845c6919412d98ef39928d49f28a4d738b6cfa` |
| Clone preparation | PASS | renamed client identity, `clone:prepare`, starter-only history/proofs removed, provenance created |
| Client storage activation | PASS | Timeweb S3 adapter 3.90.1 activated with a non-secret test-only configuration; no provider access |
| Client readiness | PASS | client topology decisions populated; readiness, daily checks and production build pass in the temporary clone |

The full RISKY run covered contracts, dependency boundaries, architecture guards, feed parsing/ingest/lifecycle, manual ownership, lead intake/outbox/delivery/adapters, SEO, owner operations, health alerts, recovery, security boundaries, product regression, production topology, release artifact, required database integration, clone readiness, accessibility, drift, typecheck, lint and build.

## Live UI evidence

Local runtime: production build on `http://127.0.0.1:3213`, backed only by the isolated test database.

| Viewport | Route/state | Result |
| --- | --- | --- |
| Desktop, 1444 px | `/` | HTTP 200, one H1, no console errors, no horizontal overflow |
| Desktop, 1444 px | `/nedvizhimost` | HTTP 200, one published fixture visible, one H1, no console errors, no horizontal overflow |
| Desktop, 1444 px | `/uslugi` | HTTP 200, one H1, no console errors, no horizontal overflow |
| Desktop, 1444 px | `/obekty/integration-public-property-1790042370492` | HTTP 200, lifecycle endpoint 204, one H1, no console errors, no horizontal overflow |
| Desktop, 1444 px | `/missing-plan7-route` | expected HTTP 404, dedicated Russian 404 screen, no horizontal overflow |
| Mobile, 390x844 | `/` | one H1, responsive navigation/content, no console errors, no horizontal overflow |
| Mobile, 390x844 | `/nedvizhimost` | published fixture and filters render, no console errors, no horizontal overflow |
| Mobile, 390x844 | active property | one H1, lead form present, no console errors, no horizontal overflow |
| Mobile, 390x844 | purged property | dedicated gone screen, `noindex, follow`, lifecycle endpoint returns HTTP 410, no horizontal overflow |

The browser console only reported the expected failed network entries for deliberate 404 and 410 requests.

## Blocking defects found and closed

1. The property page returned HTTP 500 because a server component passed image-renderer and optimization functions into the client media gallery. The adapter and predicate now live behind a serializable client boundary. A production build and desktop/mobile property route both pass.
2. A purged published property returned 404 because the ordinary Public Gateway access predicate hid the row before lifecycle resolution. A narrow anonymous `property-lifecycle-read` mode now exposes only lifecycle lookup fields while normal public content remains unavailable. Security checks, an integration regression and live HTTP 410 proof pass.
3. The jobs configuration verifier depended on formatting-specific line breaks. It now checks the same contract semantically and remains fail-closed.

## Non-blocking observations

- Biome completes successfully with 19 existing warnings in generated migrations, generated Payload types and intentional accessibility/responsive CSS overrides. They are not new P0/P1 findings.
- Client S3 validation used fixture values and did not contact Timeweb. Live provider readiness remains a release/onboarding responsibility, not a Plan 7 validation claim.
- Production release and freeze tag are outside this epic and were not executed.

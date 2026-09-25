# P8-23B — post-cutover contract cleanup evidence

Status: `IMPLEMENTED`, delivery evidence is recorded by Task Manager.

Base: accepted P8-23A `main@06eadb86c08a613ea50dba03269f0ededd25555b`.

## Disposition reconciliation

| Previous owner | P8-23B decision | Evidence |
|---|---|---|
| `/nedvizhimost` | retain only direct compatibility redirect to `/kvartiry/` | route has no old catalog loader, metadata or view |
| `/obekty/[slug]` | retain only bounded legacy lookup and direct canonical redirect | route uses `resolveLegacyPropertyRoute`; no visual gone page or old metadata owner |
| `/http/property-lifecycle/[slug]` | remove proof-only boundary | canonical `301/410` is owned by `src/proxy.ts` and entity lifecycle preflight |
| old query catalog SEO | remove superseded generator/tests | PageKey grammar, registry and Content Gate own canonical SEO |
| old catalog / gone-property views | remove dead presentation | catch-all dispatches `ListingView` and `PropertyPageView`; proxy owns gone response |
| unrouted HTML sitemap views | remove dead presentation | XML discovery groups are runtime owner; no App Router consumer existed |
| lead property source URL | adapt to canonical DTO href | server derives `sourcePage` from published property and stable `publicUrlId` |
| visual proof scenarios | adapt | catalog/property captures use canonical PageKey URLs |
| raw `region/locality/district` and source data | keep | collection fields and migrations are unchanged |

## Guard and recovery

`verify:post-cutover-cleanup` and the architecture guard reject restoration of
the removed files, require redirect-only compatibility adapters, require the
canonical proxy lifecycle boundary and assert that raw geo fields remain.

No migration, collection field removal, data mutation, production action, tag
or mirror action belongs to this task. Recovery is a normal revert of the
cleanup PR; P8-23A canonical data remains intact.

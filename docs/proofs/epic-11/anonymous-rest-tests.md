# EPIC-11 TASK-11-02 evidence

Anonymous generic business REST is deny for every `anonymousDenyCollections` slug, not only `properties`.

## Mechanical guard

- `config/raw-rest-boundary.json` denylist is the allowlist-of-denied collections.
- `src/server/security/anonymous-raw-rest.ts` classifies `/api/:collection` paths.
- `src/proxy.ts` returns 404 `notFound` without a Payload session cookie.
- Collection `access.read` for deny-anonymous files is `adminsAndOwners` / `ownersOnly`; `read: () => true` fails `verify:security-boundaries` and `quality:guards`.

## Tests

| Case | Evidence |
|---|---|
| anonymous GET properties | `isAnonymousDeniedRawRestPath("/api/properties")` + Local API `payload.find` overrideAccess false |
| anonymous GET pages | `/api/pages` + Local API |
| anonymous GET leads | `/api/leads` + Local API |
| anonymous GET lead-deliveries | `/api/lead-deliveries` + Local API |
| public catalog gateway | `findPublicCatalogProperties` |
| public property gateway | `findPublicPropertyBySlug` |
| public CMS page gateway | `findPublicPage` |

Commands: `pnpm verify:security-boundaries`, `pnpm verify:public-gateway`, `pnpm quality:guards`, `pnpm verify:integration` (payload-suites when DATABASE_URI present).

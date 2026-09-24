# P8-04 — URL grammar evidence

Status: `IMPLEMENTED / AWAITING DELIVERY`

## Requirement map

| Plan 8 requirement | Implementation evidence | Verification |
|---|---|---|
| complete PageKey union | `src/core/routing/url-grammar.ts` | every discriminant round-trips |
| canonical builder | grammar-owned `buildUrl` | lowercase and trailing-slash assertions |
| syntax-only parser | grammar-owned `parseUrl`; no Payload/Next imports | architecture check + matrix |
| at most three segments | request segment guard | four-segment rejection |
| stable property URL without geo | property PageKey and numeric `publicUrlId` | exact parse/build assertion |
| development prefixes | kind-owned `zhk-` and `kp-` grammar | both kinds + wrong-prefix rejection |
| explicit static routes | project composition from `projectStaticRoutes` | static PageKey round-trip |
| reserved namespace | platform, surface, developer and static roots | geo/static/entity collision tests |
| district/facet disambiguation | injected project-owned slug matrices | collision fails grammar creation |
| transliteration baseline | deterministic Russian-to-ASCII helper | required letters and phrase fixtures |
| four profile fixtures | project grammar composed from each SiteProfile | all PageKey/profile round-trips |
| uppercase/slash normalization | parser normalizes case; builder owns canonical form | uppercase/no-slash fixture |

## Recovery

Revert the P8-04 commit. The module is not wired to public Next.js routes;
current URLs and production behavior remain unchanged until the atomic cutover.

# Plan 8 — baseline and impact inventory

Status: `P8-00 IMPLEMENTATION EVIDENCE`

Plan: `AMS-REALTY-BAZA-STARTER-GEO-CATALOG-8`, exact approved version `v6`

Inventory base: `06a68a260761b18e9da12b9044b23958fb2e1153`

Delivery profile / risk: `COMMERCIAL / STANDARD`

Captured: `2026-09-24`, Windows 11

## 1. Scope and dependency reconciliation

P8-00 is documentation-only. It records the current implementation and assigns
every known legacy dependency to a later Plan 8 owner. It does not change route,
schema, data, cache, SEO, UI or production behaviour.

`pnpm install --frozen-lockfile` completed successfully from this exact base.
The installed dependency tree now agrees with `package.json` and `pnpm-lock.yaml`;
the stale neighbouring Payload `3.89.0` install is not used as evidence.

| Runtime/tool | Exact resolved baseline |
|---|---|
| Node.js | `24.20.0` (`>=24.20.0 <25`) |
| pnpm | `11.5.1` |
| Next.js | `16.3.5` |
| React / React DOM | `19.2.8` / `19.2.8` |
| Payload / Payload Next / PostgreSQL adapter | `3.90.1` / `3.90.1` / `3.90.1` |
| TypeScript | `5.9.3` |
| Biome | `2.5.13` |
| Dependency Cruiser | `18.2.0` |
| Tailwind CSS | `4.3.3` |
| Zod | `4.6.5` |

## 2. App Router inventory

Route groups do not contribute URL segments.

| Live URL or framework surface | Current owner | Current composition | Plan 8 disposition / owner |
|---|---|---|---|
| `/` | `src/app/(site)/page.tsx` | Public data gateway + home view | `ADAPT` — P8-13, P8-17, P8-18; wiring only in P8-23A |
| `/nedvizhimost` | `src/app/(site)/nedvizhimost/page.tsx` | Public catalog gateway + catalog view + query SEO | `REPLACE` — grammar P8-04, resolver P8-16, route cutover P8-23A |
| `/obekty/[slug]` | `src/app/(site)/obekty/[slug]/page.tsx` | Public property gateway + property/gone views | `REPLACE` — identity P8-08, lifecycle P8-21B, cutover P8-23A |
| `/uslugi` | `src/app/(site)/uslugi/page.tsx` | Project marketing page | `KEEP` — declaration moves under P8-02; consumed by P8-18/P8-23A |
| `/sdat` | `src/app/(site)/sdat/page.tsx` | Project marketing page | `KEEP` — declaration moves under P8-02; consumed by P8-18/P8-23A |
| `/prodat` | `src/app/(site)/prodat/page.tsx` | Project marketing page | `KEEP` — P8-02 static-route ownership, P8-18 navigation |
| `/ipoteka` | `src/app/(site)/ipoteka/page.tsx` | Project mortgage page | `KEEP` — P8-02 static-route ownership, P8-18 navigation |
| `/o-kompanii` | `src/app/(site)/o-kompanii/page.tsx` | Project company page | `KEEP` — P8-02 static-route ownership, P8-18 navigation |
| `/kontakty` | `src/app/(site)/kontakty/page.tsx` | Project contact page | `KEEP` — P8-02 static-route ownership, P8-05 NAP, P8-18 navigation |
| `/politika-konfidencialnosti` | matching page | Legal view | `KEEP` — P8-02 declaration, P8-18 navigation |
| `/soglasie-na-obrabotku-personalnyh-dannyh` | matching page | Legal view | `KEEP` — P8-02 declaration, P8-19 lead context |
| `/api/public/leads` | `src/app/api/public/leads/route.ts` | Public lead intake | `ADAPT` — P8-19; final wiring P8-23A |
| `/api/internal/healthz` | `src/app/api/internal/healthz/route.ts` | Internal health endpoint | `KEEP` — verify unchanged during P8-23A/P8-24 |
| `/api/internal/revalidate` | `src/app/api/internal/revalidate/route.ts` | Authenticated HTTP cache invalidation | `ADAPT` — P8-21B; final wiring P8-23A |
| `/http/property-lifecycle/[slug]` | matching route | Separate public 301/410 lifecycle transport | `ADAPT`, then `REMOVE_LATER` — proof P8-21A, replacement P8-21B/P8-23A, cleanup P8-23B |
| `/admin/[[...segments]]` | Payload admin page/layout/not-found | Native Payload Admin | `KEEP` — schema owners extend it; P8-23A must preserve it |
| `/api/[[...slug]]` | Payload REST route | Payload Local/REST boundary | `KEEP` — P8-23A regression proof |
| `/api/graphql`, `/api/graphql-playground` | Payload route files | Routes exist, GraphQL is disabled in `payload.config.ts` | `KEEP` as framework-owned disabled surfaces; verify no accidental enablement |
| `/robots.txt` | `src/app/robots.ts` | Current robots generator | `REPLACE` — P8-20, wired only by P8-23A |
| `/sitemap.xml` and shards | `src/app/sitemap.ts` | Current `generateSitemaps`, 50k shard contract | `ADAPT` — P8-20, wired only by P8-23A |
| root/site layouts and root `not-found` | `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/not-found.tsx` | Site shell and global fallback | `ADAPT` — P8-17/P8-18; P8-23A owns route cutover |
| request interception | `src/proxy.ts` | Current Next.js proxy boundary | `ADAPT` — bounded transport spike/proof P8-21A; no broad data lookup |

## 3. UI view inventory

The reusable presentation surface is `packages/ui/src/views`: **73 files**.
It owns presentation only; app composition and data access remain outside it.

- `catalog` (8): `CatalogControlsView`, `CatalogHeroView`,
  `CatalogMapFrameView`, `CatalogMobileFeatureGridView`,
  `CatalogMortgageHelpCardView`, `CatalogNewBuildingSelectionCardView`,
  `HouseProjectPreviewView`, `StarterCatalogPageView`.
- `corporate` (14): `AboutCompanyDirectorView`, `AboutCompanyTeamView`,
  `CorporateFormSectionViews`, `CorporateRelatedArticlesView`,
  `CorporateRelatedServicesView`, `MortgageBrokerSupportView`,
  `MortgageCalculatorView`, `MortgageProgramsView`, `SaleFinalCtaView`,
  `SaleNegotiationView`, `SalePreparationView`, `SalePricingPrinciplesView`,
  `SalePromotionView`, `SaleReportingView`.
- `home` (9): `HomeArticlesPreviewView`, `HomeCarouselScrollHintView`,
  `HomeHeroView`, `HomeInterestView`, `HomeNewBuildingsView`,
  `HomePreFooterView`, `HomeServicesView`, `HomeWhyChooseView`,
  `StarterHomePageView`.
- `legal` (3): `LegalDocumentModalView`, `LegalDocumentView`, `LegalHubView`.
- `marketing` (1): `StarterMarketingPageView`.
- `property` (21): `GonePropertyPageView`, `MediaGallery`, `MediaLightbox`,
  `PropertyCardGridLayout`, `PropertyCardListLayout`, `PropertyCardView`,
  `PropertyChatView`, `PropertyDetailSectionsView`, `PropertyGalleryView`,
  `PropertyMobileTopBarView`, `PropertyPageActionsView`,
  `PropertyRelatedView`, `PropertySidebarView`, `PropertyViewingRequestView`,
  `StarterPropertyCardView`, `StarterPropertyMediaGallery`,
  `StarterPropertyPageView`, plus `media-gallery.types`,
  `property-card-layout.types`, `property-card-support`, `property-card.types`.
- `shared` (3): `HtmlSitemapListingView`, `HtmlSitemapView`,
  `MobileStickyConversionView`.
- `site-shell` (11): `CitySwitcherView`, `CookieNoticeView`,
  `DesktopSiteNavView`, `ExpertRequestModalView`, `LeadSuccessNoticeView`,
  `MobileMenuView`, `PhoneRevealView`, `RequestModalView`, `SiteFooterView`,
  `SiteHeaderView`, `site-header.types`.
- `starter` (3): `LeadFormView`, `MediaFallback`, `SiteShellView`.

Plan 8 UI ownership: DTO freeze P8-12, public gateway P8-13, reusable views
P8-17, navigation P8-18, lead interactions P8-19 and atomic composition/cutover
P8-23A. No earlier epic may take public route ownership from P8-23A.

## 4. Payload and persistence inventory

`payload.config.ts` is the runtime source. Payload is the only backend/data
owner; there is no Prisma or second auth/backend.

| Kind | Current items | Plan 8 owner |
|---|---|---|
| Collections | `users`, `pages`, `properties`, `feed-sources`, `import-runs`, `import-issues`, `leads`, `lead-deliveries`, `media`, `redirects` | Existing owners stay; additive schema work is sequential in P8-06/07/08/09/11/19/21B |
| Globals | **None configured** | P8-05 introduces canonical public NAP/site settings with migration and access proof |
| Job queues | `system`, `imports`, `maintenance`, `lead-deliveries` | P8-20 and P8-21B must declare shared registry/cache ownership |
| Job tasks | `dispatchDueFeeds`, `importFeed`, `jobsJanitor`, `leadRetentionCleanup`, `catalogLifecycle`, `recoverLeadDeliveries`, `deliverLead` | P8-10/11 ingest, P8-19 leads, P8-20 discovery, P8-21B lifecycle |
| Migrations | 10 timestamped `.ts` migrations plus 5 paired JSON snapshots; registry `migrations/index.ts` | Each schema epic rebases on latest `main`, proves clean and non-empty data, and merges sequentially |

Current `properties` already owns market/deal/category/area and raw textual geo
data. P8-07 is additive: references and backfill reporting are added without
guessing identity or deleting raw text. P8-08 expands stable public identity; it
does not re-declare existing fields.

## 5. SEO, lifecycle, sitemap, cache and fixture dependencies

| Legacy dependency | Current evidence | Decision | Owning epic(s) and exit |
|---|---|---|---|
| `/nedvizhimost` | Page route, `getPublicCatalog`, `CatalogPageView`, base canonical in `src/core/seo/catalog.ts` | `REPLACE` | P8-04/14/15/16 prepare; P8-23A alone cuts over; P8-23B removes dead wiring after proof |
| `/obekty/[slug]` | Property page and legacy slug lookup | `REPLACE` | P8-08 stable identity; P8-21B lifecycle; P8-23A cutover; P8-23B dead-code cleanup |
| `/uslugi` | Project marketing route and fixture entry | `KEEP` | P8-02 `static-routes` owner; P8-18 navigation; P8-23A regression proof |
| `/sdat` | Project marketing route and fixture entry | `KEEP` | P8-02 `static-routes` owner; P8-18 navigation; P8-23A regression proof |
| Query SEO | Indexed keys `category`, `dealType`, `city`, `district`, `rooms`; control/non-index filters canonicalize or noindex | `ADAPT` | P8-04 path grammar, P8-14 registry/templates, P8-15 one indexability decision, P8-23A legacy-query canonical handling |
| Text geo | Raw city/district/address fields used by current catalog/import | `ADAPT` | P8-06 hierarchy + P8-07 additive refs/backfill; raw text retained; removal is not authorized in Plan 8 |
| Lifecycle route | `/http/property-lifecycle/[slug]` owns real redirect/410 while visual page remains separate | `ADAPT`, `REMOVE_LATER` | P8-21A proves canonical transport; P8-21B generalizes store; P8-23A switches; P8-23B removes only with evidence |
| Sitemap | `src/app/sitemap.ts`, `generateSitemaps`, 50k shards, current property URLs | `ADAPT` | P8-20 canonical generators and lastmod/key proof; P8-23A wiring |
| Robots | `src/app/robots.ts` | `REPLACE` | P8-20 generator, P8-23A wiring |
| Cache tags/paths | Allowed tags `site`, `properties`, `property`, `media`; ingest emits `properties`; executor owns `revalidatePath`/`revalidateTag` | `ADAPT` | P8-21B bounded facade/invalidation matrix; P8-23A wiring |
| Fixture provider | `src/fixture/provider.ts`, `SITE_ENGINE=fixture`; current home/catalog/property/marketing/legal synthetic DTOs | `ADAPT` | P8-03 profile fixtures, P8-16 fixture resolver, P8-22 one canonical dataset; P8-23B removes only superseded runtime fixtures |
| HTTP/proof route | lifecycle route above is the only dedicated public proof boundary found | `REMOVE_LATER` | P8-21A evidence first, P8-23A replacement proof, P8-23B cleanup |
| Visual proof tooling | `capture-atlas-visual-proof.mjs`, `verify-atlas-css-parity.mjs`, 24 baseline PNGs + manifest | `KEEP` | Reused by P8-17/18/23A/25 as evidence; it is not production routing |
| Existing proof corpus | `docs/proofs/**` for prior plans/platform gates | `KEEP` | Historical evidence only; new epics append scoped evidence and do not rewrite old proof |
| Guard fixtures | `scripts/quality/fixtures/**` and architecture self-test | `ADAPT` | P8-02 adds new positive/negative boundary fixtures; enforcement changes only at declared cutover |

## 6. Quality and package verification map

Primary local gates:

- `pnpm typecheck` — Next type generation plus TypeScript no-emit.
- `pnpm lint` — Biome lint.
- `pnpm quality:architecture` — Dependency Cruiser boundary check.
- `pnpm quality:guards` — architecture, Local API, design-token, module,
  SourceCraft-policy and UI-core guards.
- `pnpm contracts:test`, `contracts:check`, `contracts:diff`,
  `contracts:freeze`, `contracts:lock` — contract line endings, drift and locks.
- `pnpm verify:daily` / `pnpm verify:merge-standard` — STANDARD exact-head
  local/SourceCraft suite.
- `pnpm verify:merge-risky` — targeted high-risk selector, never a substitute
  for the exact risk-specific proof.
- `pnpm verify` / `verify:foundation` — full foundation suite ending in build.

Domain verification commands currently registered:

- Runtime/data: `verify:schema`, `verify:jobs-config`, `verify:public-gateway`,
  `verify:integration`, `verify:integration:required`.
- Feed/import: `verify:feed-parser`, `verify:feed-ingest`,
  `verify:feed-lifecycle`, `verify:manual-ownership`.
- Leads: `verify:lead-intake`, `verify:lead-outbox`,
  `verify:lead-delivery-state`, `verify:max-adapter`,
  `verify:custom-webhook-adapter`.
- SEO/UI: `verify:seo-contracts`, `verify:a11y-starter`, `verify:ui-core`,
  `verify:drift`, `ui:clone-audit`, `visual:atlas-css-parity`.
- Operations/security: `verify:owner-operations`, `verify:health-alerts`,
  `verify:operational-recovery`, `verify:security-boundaries`,
  `verify:product-regression`, `verify:production-topology`.
- Clone/release evidence: `verify:clone-readiness`, `verify:clone-prepare`,
  `verify:client-readiness` (alias `verify:client:readiness`),
  `verify:starter:clone-readiness`, `verify:client-clone-proof`,
  `verify:release-artifact`, `release:manifest`.
- Payload operations: `payload:generate:types`, `payload:generate:importmap`,
  `payload:migrate`, `payload:migrate:create`, `payload:bootstrap-owner`,
  `payload:import:atlas-demo`, `payload:verify:atlas-demo`.

SourceCraft has exactly two manual exact-head workflows:
`merge-standard` and `merge-risky`. Empty path filters are the explicit
zero-automatic-CI sentinel; neither workflow is evidence until manually started
for the current immutable head SHA.

## 7. Shared ownership and implementation hazards

- P8-02 owns project static-route declarations and boundary guards, but does not
  change public routing.
- P8-05/06/07/08/09/11/19/21B are sequential schema owners. No concurrent
  migration merge is safe.
- P8-20 and P8-21B overlap Payload Jobs/cache/redirect registries; they must
  declare ownership before code and merge sequentially on shared files.
- P8-21A is an early bounded transport proof, not the final route cutover.
- P8-23A is the sole public route cutover owner. P8-23B may remove old runtime
  only after P8-23A acceptance and must not delete retained legacy data.
- Payload Admin, REST API, lead intake, health endpoint and existing static/legal
  routes are required regression surfaces during cutover.
- Production, release, freeze tag, GitHub mirror and optional live-demo rollout
  are outside P8-00 and outside the approved implementation authority.

## 8. Acceptance reconciliation

- [x] Exact base SHA and resolved Node/pnpm/Next/React/Payload versions recorded.
- [x] All current App Router route files and framework surfaces inventoried.
- [x] All 73 reusable UI view/type/support files inventoried by group.
- [x] Payload collections, zero Globals, queues, tasks and migrations recorded.
- [x] Quality scripts and package verification commands mapped.
- [x] Required legacy dependencies each have `KEEP`, `ADAPT`, `REPLACE` or
  `REMOVE_LATER` plus an owning epic.
- [x] Current and target states are distinguished; no target route is claimed live.
- [x] Recovery is a docs-only revert; no runtime or persistent data changed.

P8-00 exit is satisfied when this exact document passes `pnpm typecheck`,
`pnpm lint`, diff review, one STANDARD exact-head SourceCraft gate and merge.

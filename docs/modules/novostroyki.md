# Module manifest: novostroyki

## Status

`PREPARED`. The private Payload schema exists, but no public route, navigation,
sitemap, Gateway reader or indexing behavior is active.

## Prerequisites

The source must provide a market, `externalComplexId`, `externalComplexName`,
`externalBuildingId`, and `externalLayoutId` where available. A layout is not a
unit. Source identity wins; fallback grouping may use complex/building, rooms,
area and source-specific attributes. Ambiguity becomes `needsReview`; area alone
must never auto-merge records.

## Enabled flag owner

The `novostroyki` entry in validated `src/project/site-profile.config.ts`;
`docs/PROJECT.md` mirrors it for operators.

## Reserved URLs

Client-specific residential-complex, building, layout and developer namespaces
are reserved only during activation after the canonical URL map is updated.

## Collections to add

Unified `developments` with `kind = residential_complex | cottage_village`,
plus `developers`. Layouts remain kind-specific child data; inventory units stay
in `properties` through an optional `development` relation.

## Migration contract

Use an expand migration, validate the new schema, then activate readers. No
schema push and no semantic rewrite of existing migrations.

## Backfill contract

Backfill only real source identities. Ambiguous rows remain reviewable and are
not merged by area alone.

## Gateway/DTO additions

Add explicit Public Gateway selects and project DTOs before public UI access.
Raw Payload documents remain private.

## Feed identity requirements

Persist complex, building and layout source identifiers with source scope.
Cross-source ownership and deactivation rules remain unchanged.

## Cache targets

Register only activated complex, building, layout and developer page/list
targets in the existing cache registry.

## UI composition

Compose pages from the project design system. A layout and an inventory unit
remain different domain concepts.

## SEO contract

Freeze URLs, canonicals, metadata, sitemap ownership and redirect requirements
before indexing any new namespace.

## Verification

Migration/schema proof, identity fixtures, Gateway/DTO tests, cache invalidation,
SEO contract checks and representative page verification are required.

## Non-goals

No chessboard module, search service, broker, second backend or speculative
relations are introduced by this manifest.

## Trigger to REALTY_EXTENDED

Only a proven topology or capacity trigger from Core section 22 can change the
profile; collection and page activation alone does not.

## Rollback/deactivation notes

Disable public routes and readers first, preserve data for review, then revert
module-specific code. Never use deactivation to destructively drop client data.

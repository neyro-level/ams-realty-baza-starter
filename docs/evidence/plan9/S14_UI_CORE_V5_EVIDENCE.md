# S14 UI Core v5 Evidence

## Delivered surfaces

- `ListingView` exposes deterministic empty/filtered state, reset action and
  pagination while retaining project-owned presentation contracts.
- `DevelopmentDetailsView` exposes price, layout, progress and FAQ anchors,
  hides stale prices, and renders an explicit sales-ended state.
- Listing, development and lead surfaces emit typed non-PII analytics data
  attributes. Personal form values are never included in analytics dimensions.
- Public navigation emits only registered category roots. Fixture breadcrumbs
  omit links for unresolved district and category-root candidates.

## Browser and accessibility acceptance

The deterministic browser matrix is stored in
`S14_UI_CORE_V5_BROWSER_MATRIX.json`.

- Five representative routes were exercised at mobile, tablet, desktop and
  wide viewports: 20 runs total.
- Every run returned one logical `h1`, zero horizontal overflow and zero
  unnamed interactive accessibility controls.
- All 13 visible internal links resolved directly with HTTP 200. No visible
  404 or redirect links remained.
- Filtered listing, listing/development analytics events and the development
  price anchor were detected in the rendered pages.
- Manual visual inspection covered the mobile home, desktop filtered listing,
  mobile and desktop development views and tablet services form. No clipping,
  overlap or responsive blocker was found. Fixture media absence uses the
  expected placeholder state.

The first browser pass found category-root 404 links, one consent-link redirect
and unresolved fixture breadcrumb targets. The owners were corrected and the
fresh runtime matrix passed after clearing only the generated `.next` cache.

## Read-only UI drift audit

- Clone audit: PASS.
- Approved plain uses: 46/46; no new plain-use drift.
- Token inventory: Core 30, shadcn 180, project active 408, project dead 0.
- No raw color literals in the target views.
- The lead form remains the only required client boundary in the audited target
  views; no persistence or backend imports enter `packages/ui`.
- No P0, P1 or P2 findings and no UI drift blockers.

## Verification

- `pnpm verify:ui-browser` — PASS on the local fixture contour.
- `pnpm verify:navigation` — PASS for five profiles and seven fixture links.
- `pnpm ui:clone-audit` — PASS.
- `pnpm verify:development-presentation` — PASS.
- `pnpm verify:ui-core` — PASS.
- `pnpm verify:merge-standard` — PASS in 444 seconds; lint completed with the
  existing 19-warning baseline and zero errors.

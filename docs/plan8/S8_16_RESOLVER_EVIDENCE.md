# P8-16 — pure resolver evidence

Статус: `IMPLEMENTED_LOCAL`; delivery evidence заполняется после SourceCraft Gate.

Дата: 2026-09-25

Authority: Plan 8 v6 `APPROVED`, P8-16.

## Boundary

- `createRouteResolver` зависит только от injected `ResolverDataPort`,
  `SiteProfile` и pure URL grammar.
- В resolver нет импортов Next.js, Payload или project composition.
- Fixture adapter реализует тот же port in-memory и не активирует public routes.
- Результат ограничен `page | redirect | notFound | gone`; transport mapping
  остаётся scope P8-23A/P8-21A.

## Decisions

- `PREPARED_OFF`, `OUT`, unpublished/unknown geo и недостаточный inventory для
  `NOINDEX_AUTO` возвращают `404`.
- Archived entity остаётся `200 noindex,follow`, purged entity без replacement
  возвращает `410`, с replacement — прямой canonical `308`.
- Category/semantic mismatch перенаправляется на canonical PageKey.
- Redirect принимается только когда destination является конечной доступной
  page; loops и redirect chains fail closed в `404`.
- SINGLE_GEO category/developer roots остаются `200 noindex,follow` по platform
  contract. Newbuild lot также всегда noindex.

## Local acceptance

| Proof | Result |
|---|---|
| Four profiles | PASS: single, multi, newbuild-first, secondary-first |
| Result matrix | PASS: page, canonical/stored redirect, notFound, gone |
| Negative grammar | PASS: category-first inversion, four segments, combined district+facet, unknown path |
| Status/profile matrix | PASS: PREPARED_OFF and low-inventory NOINDEX_AUTO fail closed |
| Canonical safety | PASS: semantic/category mismatch redirects directly; loop/chain rejected |
| Dependency boundary | PASS: no Next/Payload/project import in resolver |

Recovery: revert the pure resolver, fixture adapter, verifier and evidence file.
Frozen DTOs and public runtime wiring remain unchanged.

No production, tag, GitHub mirror or public route cutover is part of P8-16.

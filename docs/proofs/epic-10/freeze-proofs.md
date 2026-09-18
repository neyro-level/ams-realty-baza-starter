# EPIC 10.7–10.17 freeze proofs

Checked: 2026-09-18  
HEAD: `epic/10-checkpoint-4`

## 10.7 Local media

Contract path is documented, not a live production recreate:

- upload target: `MEDIA_DIR` via `src/core/storage/local-fs.ts`;
- public Nginx: `deploy/nginx/start-baza.ams24.ru.conf` `location /media/`;
- compose volume `/var/lib/ams/realtbase/media` (`docs/proofs/epic-7/runtime-hardening.md`);
- backup/restore pair: `pg_dump -Fc` + `MEDIA_DIR` archive (`docs/OPERATIONS.md`).

Live container recreate on AMS Server is not executed in this stream (production forbidden).

## 10.8 Performance

Verdict: **FAIL** (documented).

No production-like RUM/Lighthouse against `start-baza.ams24.ru` or a warmed local `next start` was collected in this task. Core budgets therefore cannot be marked PASS:

```text
mobile LCP ≤ 2.5 s
CLS ≤ 0.1
catalog list data path p95 ≤ 300 ms
property detail data path p95 ≤ 200 ms
```

Blocker for a later PASS: exact-SHA measurement on a running production-like topology (Nginx + `next start` + representative catalog). Allowed-by-plan “по факту” items (facet SQL, import duration, CPU overlap) are not a substitute for LCP/CLS.

Facet aggregation remains the SQL path in `docs/proofs/epic-4/facets-sql.md`.

## 10.9 Accessibility

Source contract checked by `pnpm verify:a11y-starter`: labels/errors/focus return on `LeadFormView`, starter `h1` set, `prefers-reduced-motion` in Atlas home CSS, `focus-visible` on Button, visual `MediaFallback` is `aria-hidden`. Live keyboard/dialog audit of a running browser session was not executed.

## 10.10 Clone readiness

`pnpm verify:clone-readiness` applies project-level overlay (`src/project/project.config.ts`, `docs/PROJECT.md`) on a detached git worktree.

```text
git diff src/core = 0
git diff packages = 0
```

## 10.11 Guard baseline

`docs/guard-baseline.json` `knownExceptions` length is 0. Architecture guard requires the array to stay empty.

## 10.12 Observability

`pnpm verify:health-alerts` covers overdue/suspicious/stale feeds, delivery stale/abandoned, media dir, backup JSON, cache stale SLA. Independent alert channel: `ALERT_WEBHOOK_URL` must not share host with lead webhooks (`docs/OPERATIONS.md`, `verify:health-alerts`).

## 10.13 E2E golden paths

Live six-path browser E2E is **FAIL** in this stream (no production-like running instance). Source mapping:

1. catalog → property: starter routes `/nedvizhimost`, `/obekty/[slug]`;
2. Admin edit/publish: Payload Admin, not rewritten;
3. manual ownership: `pnpm verify:manual-ownership`;
4. lead form → outbox: `LeadFormView` + `POST /api/public/leads` + EPIC 5/6 proofs;
5. archived → 410: `docs/proofs/epic-4/lifecycle-410.md`;
6. media public render: Nginx `/media/` + Media DTO.

## 10.14 HTTP cache

Reuse `docs/proofs/epic-3/cache-http-self-call.md`. Mode `http`. In-process B1 not claimed.

## 10.15 Documentation

`PROJECT.md` records knobs, reserved namespaces, cache status, credential mappings (no secret values). `OPERATIONS.md` covers jobs handover, import, approval, unstuck, delivery retry, backup, disk-full, independent alerts, release/deploy split. `DESIGN.md` matches EPIC 9.8 taxonomy.

## 10.16 Epic reports

Closing proofs exist under `docs/proofs/epic-0` … `epic-10` and main checkpoints 1–4. RISKY import/leads/runtime proofs keep exact SHA in their epic files / merge commits.

## 10.17 Canonical commands

Only mandatory verification surface:

```bash
pnpm verify:daily
pnpm verify
pnpm verify:schema
```

All three exist in `package.json`. Helpers (`verify:integration`, `verify:clone-readiness`, `verify:a11y-starter`) are nested inside `verify` / `verify:daily` and are not a second gate.

Production was not touched.

# EPIC 7 runtime hardening proof

Checked: 2026-09-18  
Branch: `epic/7-runtime-hardening`

## Media

- Storage boundary: `src/core/storage/local-fs.ts` (`MEDIA_DIR`, unique names, overwrite disabled).
- Compose volume: `/var/lib/ams/realtbase/media`.
- Nginx alias: `location /media/` → `/var/lib/ams/realtbase/media/`.
- Restore pair remains `pg_dump -Fc` + `MEDIA_DIR` archive (`docs/OPERATIONS.md`).

## Runtime env

`evaluateRuntimeEnv` / `instrumentation.ts`:

- `build` without production secrets = no throw.
- `migrate` requires `DATABASE_URI` + `PAYLOAD_SECRET`.
- production `runtime` without required secrets = fail-fast.

## Headers / CORS / login

- Next security headers in `next.config.ts`.
- Payload CORS/CSRF exact `NEXT_PUBLIC_SERVER_URL`.
- Users: `maxLoginAttempts=5`, `lockTime=10m`, production secure Lax cookies.
- Nginx rate limits on login, public leads, internal.

## Alerts

- `cache_invalidation_failure` after `staleDataSlaMinutes`.
- `backup_db_failure` / `backup_media_failure`.
- Independent alert channel documented; runtime rejects shared host with lead webhooks.

## JOBS_AUTORUN exactly once

- `project.config.ts` `jobsAutorunExactlyOne: true`.
- Compose single `app` service `JOBS_AUTORUN: "true"`.
- `shouldAutoRun` gated by `runtimeEnv.JOBS_AUTORUN`.
- Healthz exposes `jobs.ownerIdentity` and `jobs.ownerPid`.

Verdict: PASS for TASK-07-02 scope.

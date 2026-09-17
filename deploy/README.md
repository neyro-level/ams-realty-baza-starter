# Internal production deploy

Target: `start-baza.ams24.ru`.

This folder contains only non-secret deployment templates. Runtime values must be
materialized from the project-specific Secret Master scope into
`/etc/ams/realtbase/start-baza.env` on the server. Do not commit or paste secret
values.

Release shape:

1. Build immutable image from exact SourceCraft `main` SHA outside the production
   host.
2. Run Payload migrations from the same image before rollout.
3. Start one runtime through `deploy/compose/start-baza.compose.yml`.
4. Keep `JOBS_AUTORUN=false` during initial smoke; enable exactly one jobs owner
   only after the old owner is confirmed inactive.
5. Proxy `start-baza.ams24.ru` through the Nginx template with `X-Robots-Tag:
   noindex, nofollow` until the owner promotes the instance.

Rollback: switch `AMS_REALTBASE_IMAGE` back to the previous known-good immutable
tag and restart the compose project. Database rollback is separate and requires
restore evidence before destructive changes.

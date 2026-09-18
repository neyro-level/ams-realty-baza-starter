# EPIC-11 collection access inventory

Baseline: `hardening/epic-11-public-data-boundary`. Anonymous raw Payload business REST is deny. Public website uses Public Gateway with explicit `public-read` Local API access and publication filters in the gateway, not collection `access.read`.

| Collection | anonymous | editor | admin | owner | system / public-gateway |
|---|---|---|---|---|---|
| properties | deny | deny | allow | allow | public-read + publication where |
| pages | deny | deny | allow | allow | public-read + published where |
| redirects | deny | deny | allow | allow | application SQL/Payload path in later epics |
| media | deny REST/metadata | deny | deny write except owner | allow | files via `/media/` nginx, not REST list |
| feed-sources | deny | deny | allow | allow | ingest system-job |
| import-runs | deny | deny | allow | allow | ingest system-job |
| import-issues | deny | deny | allow | allow | ingest system-job |
| leads | deny | deny | allow | allow | intake/outbox system-job |
| lead-deliveries | deny | deny | allow | allow | delivery system-job |
| users | deny (auth allowlist login) | n/a | allow | allow | bootstrap |
| payload-jobs | deny | deny | deny | deny | system-only inspect |

Edge: `config/raw-rest-boundary.json` `anonymousDenyCollections` + `src/proxy.ts`.

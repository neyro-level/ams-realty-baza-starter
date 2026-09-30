# EPIC-02 Dependency Baseline Evidence

Status: `ACTIVE EVIDENCE`
Checked: 2026-10-01
Plan task: `afz-e02-t1`
Risk scope: `dependency-runtime`

## Selected patch baseline

| Package | Previous | Selected | Reason |
|---|---:|---:|---|
| pnpm | `11.5.1` | `11.28.2` | Latest stable `latest-11` dist-tag; `11.28.3` is `next-11`, so it is not selected for the commercial baseline. |
| Next.js | `16.3.5` | `16.3.8` | Latest stable `16.3.x` on npm after September security patches; no major/canary move. |
| payload | `3.90.1` | `3.90.2` | Latest stable Payload 3.x release; keeps Payload package family aligned. |
| `@payloadcms/next` | `3.90.1` | `3.90.2` | Same Payload family version as `payload`. |
| `@payloadcms/db-postgres` | `3.90.1` | `3.90.2` | Same Payload family version as `payload`. |
| `@payloadcms/storage-s3` client activation pin | `3.90.1` | `3.90.2` | Optional client activation peer follows the Payload runtime family exactly. |
| undici | `7.29.0` | `7.30.0` | Latest stable 7.x channel; enforced through direct dependency and pnpm override so transitive Payload usage does not retain `7.29.0`. Undici 8.x is intentionally out of scope. |

Major upgrades: none. React, React DOM, Sharp, Zod, Tailwind, Biome, TypeScript and other unrelated packages are intentionally unchanged.

Security exceptions: none.

## Official sources checked

- npm registry via `pnpm view pnpm version dist-tags --json`: `latest-11=11.28.2`, `latest=12.8.1`.
- npm registry via `pnpm view next version dist-tags --json`: `latest=16.3.8`, `canary=16.4.0-canary.53`.
- Next.js official blog: September 2026 security posts require patching from `16.3.5` to at least `16.3.6` and announce the `16.3.7` security release line; npm registry shows `16.3.8` as the current stable patch.
- GitHub Payload releases: `v3.90.2` is the latest stable 3.x release and `v3.90.0` contains critical security fixes inherited by the newer patch line.
- npm registry via `pnpm view payload @payloadcms/next @payloadcms/db-postgres version dist-tags --json`: all stable `latest=3.90.2`.
- npm registry via `pnpm view undici version dist-tags --json`: `seven=7.30.0`, `latest=8.11.2`.
- GitHub Advisory / Undici release context: the approved 7.x line includes fixes after the 7.29.1 floor; 8.x remains outside this task.

## Verification contract

`pnpm verify:dependency-security` checks:

- exact package manager and runtime package pins;
- Payload package family alignment;
- pnpm `undici` override removes older transitive `7.29.0` entries from the lockfile;
- no accidental unrelated direct runtime dependency bump for React, React DOM, Sharp, Zod or Tailwind;
- lockfile contains the selected versions and no obsolete direct baseline entries;
- this evidence file records date, versions, no major upgrades and no security exceptions.

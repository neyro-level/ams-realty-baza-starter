# S8-25 — Final execution report

Status: `EXECUTION_COMPLETE / EVIDENCE`

Checked: 2026-09-25

Plan: `AMS-REALTY-BAZA-STARTER-GEO-CATALOG-8`, version `v6`, source status
`APPROVED`.

Production action: `NONE`

Freeze tag action: `NONE`

GitHub mirror action: `NONE`

## Exact accepted implementation

- Canonical primary: SourceCraft `integrator-p/ams-realty-baza-starter`.
- Exact implementation `main` accepted by this report:
  `bd570ee40db9e25f73a24013be836dd3876282ac`.
- Parent before the final discovered blocker fix:
  `a6f6d0a7826022782172165a9fd601f407dcc2cd`.
- Final blocker fix: PR `155`, accepted head
  `33786ceb1be4d0d35305bdfb3e6113f67923a697`, RISKY
  `auth-pii-leads` run `243` PASS, squash merge
  `bd570ee40db9e25f73a24013be836dd3876282ac`.
- The merge tree equals the accepted PR head tree; its first parent is the
  recorded P8-24 `main`.

The blocker was found by the required PostgreSQL suite: canonical property
pages submitted a trailing-slash URL while lead intake stored the normalized
path. The shared normalizer now governs both comparison and persistence. A
real canonical request passes, exact retry remains idempotent, and forged
property context remains rejected with `rawPiiIncluded=false`.

## Final implementation-main proof

The accepted proof ran on exact
`main@bd570ee40db9e25f73a24013be836dd3876282ac` with native loopback
PostgreSQL 18 and a project-owned isolated test database.

| Proof | Result | Evidence |
|---|---|---|
| Full relevant suite | PASS | `pnpm verify`, exit `0`, 547 seconds |
| PostgreSQL/Payload | PASS | geo, property geo, lead, lifecycle and remaining integration suites; integration was required, not skipped |
| Security/access/PII | PASS | security boundaries, safe outbound, secrets guard, public gateway, lead rejection and PII-free analytics |
| IndexNow/discovery | PASS | four profiles, sitemap groups/shards/lastmod, robots, same-host/key/retry/secret-safe job payload |
| Architecture | PASS | Dependency Cruiser: 497 modules / 1,556 dependencies, zero violations; architecture and module guards PASS |
| Clone readiness | PASS | S3 activation contract, typecheck, idempotence, preset preparation and empty client runtime |
| Type/lint/build | PASS | typecheck PASS; lint exit `0` with 19 pre-existing warnings; Next.js 16.3.5 webpack production build PASS |
| Reconciliation | PASS | Task Manager `CLEAN`, declared coverage `28/28`, no missing IDs, drift or cycles |

An earlier non-accepted preflight passed every suite through lint but exposed a
test-runner environment mistake at build: the temporary integration database
URL was also visible to static generation after the integration cleanup. The
accepted run kept `DATABASE_URI_TEST` for integration and omitted runtime
`DATABASE_URI`, so the build used the intended fixture mode. No product code
or production data changed because of that preflight.

## Second-city and clone proof

- `pnpm verify:site-profile` — PASS for four fixtures plus the invalid matrix,
  including `MULTI_GEO`.
- The accepted full suite proves the two-city fixture data, geo hierarchy,
  URL grammar and SEO Registry contracts.
- `pnpm verify:client-clone-proof` — PASS for:
  `MIXED / SINGLE_GEO`, `NEWBUILD_FIRST / MULTI_GEO`, and
  `SECONDARY_FIRST / MULTI_GEO`.
- Second-city activation is therefore profile/data/registry-driven. The clone
  proof reports zero diff in `src/core/**`, `packages/**`, migrations and
  `scripts/quality/**`; an additional exact worktree check reports zero
  protected-surface diff.

## Epic delivery ledger

Every row is a SourceCraft squash merge to canonical `main` after one
exact-head STANDARD or RISKY Gate.

| Epic | PR | Accepted head | Gate run | Merge SHA |
|---|---:|---|---|---|
| P8-00 | 128 | `7f4baf92731b75cf069436d362bb92fe418f1fd9` | STANDARD 152 | `eb618988ec8e5be9712aceec1e2ae8c90772a5ff` |
| P8-01 | 129 | `0f4db7f5a9efb398fa5b049d7d620216fb58b7c8` | STANDARD 155 | `67cbd854757d0bbef27af7d5dcf40da3ccf7bb12` |
| P8-02 | 130 | `f265c2d6697ac20656c6251b67bddcd7cfebcbb7` | STANDARD 159 | `1d2ea540cffba03205d45580c2bca53395c82862` |
| P8-03 | 132 | `35d302570049e3f2090ecab7fe3b0135a1a294cc` | STANDARD 169 | `8612d3e86d401352b00dee598ab7eb8c115868c4` |
| P8-04 | 133 | `22faddc473fb67da4ea137c1923d0fa57c46ff31` | STANDARD 172 | `5670385c1b020c5ae127aa490ab1a8efb85fe2a6` |
| P8-05 | 131 | `6aeb0f32693bc7c9f8fe1d43e52de7c28cbdc7e7` | RISKY 166 | `2616137a8de744bdb10fe2e163ae92078b138034` |
| P8-06 | 135 | `7c00c8a561dcded88db7a587e50ae648f092ae9a` | RISKY 178 | `cb21987631b6cc43ce89cbf16df6b41963d2a99f` |
| P8-07 | 136 | `70dba6e30d4ed9f8f18848deaafb80b51d506468` | RISKY 181 | `ab9ddd1a22665e7ac5d64ba4b4529a2ab03f9bc3` |
| P8-08 | 137 | `e268ec529e7a1e683d17e0cd19f613094ecb0425` | RISKY 184 | `5af90f08ed74054571b31c76770f2d267f3badf8` |
| P8-09 | 138 | `88a2c29bb62de7e2bd662e266407f3fda0112d18` | RISKY 187 | `765fcea2937152d489c8d935a3f60bbf44b6a41d` |
| P8-10 | 140 | `e2dcafb921b5d3707989431bca1fbebf97d02483` | RISKY 193 | `81f8ce7458c88c165e4c515d4977fbee16df61c1` |
| P8-11 | 142 | `7a2e6c6f03f5fc4fc6ab306666fdca7696557785` | RISKY 199 | `f58952e1702f931558de3ee84ed1143691755833` |
| P8-12 | 141 | `850cfd78ad64fe2912cd1509b9504dd778701198` | RISKY 196 | `880301a0a20722136d26e2735da1c795d5213b9b` |
| P8-13 | 144 | `48a5bb3997b8a4aadb41603dbf3f27dea46a2a9c` | RISKY 207 | `71cb9ea03dbd2159f1bf83ff614cefe05f47b4ce` |
| P8-14 | 147 | `4e8cac5a88fdd8541e95d72649f4ed7b6d6e3cda` | STANDARD 216 | `6d9bbfa0584601e7585a51933b2ca6f07da0e811` |
| P8-15 | 148 | `8ec4058811ad620ef2fcd3771bb47aca26d79fcb` | STANDARD 219 | `52b695632892a73073b42bbef882fd058db8e6a0` |
| P8-16 | 145 | `d881038be799e992d4db7940c4281d8fbf42e7e7` | STANDARD 210 | `b21ed420d3512e5b9702f48395b69778385862f1` |
| P8-17 | 146 | `25dcaadc578a7b50ad18b7c9b5a11af3cbf6ae20` | STANDARD 213 | `a46c07a1726d6e918a904aae1e4398ae4f2929ed` |
| P8-18 | 150 | `6976b54895ac4e50b16111d5f9634c10db68e752` | STANDARD 226 | `81fbd8c037613d958a3c370aaa02c9d82fed2d97` |
| P8-19 | 143 | `49853420ae8aa5e5c85872533a25eee9794ff749` | RISKY 202 | `7887f9e2e26aaedbe60abbd99e935a1ff9575c4f` |
| P8-20 | 149 | `defaddf3e8958b04276043f999677a33194c937a` | RISKY 223 | `c1f0e69bb219d623e692fae8406dd0ae031429d8` |
| P8-21A | 134 | `a42b36b1c6cd94f83647b5b87a8b93f3e855e1bf` | RISKY 175 | `04d5c8eacd8d8ad561ec6e33efa21a3d4a8b2a0c` |
| P8-21B | 139 | `50b56dda268f5f9f5ec8dc4f0257e03c6e8d3e7e` | RISKY 190 | `3a9983893014396071daad88e06c3108dea47184` |
| P8-22 | 151 | `30f68a29e2fa5e4220082628c942c948bfe2239f` | STANDARD 230 | `09cb49b2d13a5d5e5ecc9e554de7c082abb3d21a` |
| P8-23A | 152 | `d56186b47845ddec97a90b2bf20a08d03a045f67` | RISKY 233 | `06eadb86c08a613ea50dba03269f0ededd25555b` |
| P8-23B | 153 | `a7ad7c8fb516680ced4aa6d8d94c18ced41df622` | RISKY 237 | `671a3f1fcf6564eb57f509916528f5cc7b243a81` |
| P8-24 | 154 | `3fbf8b11351a1ac16b85b87a635b41d53aac0acf` | RISKY 240 | `a6f6d0a7826022782172165a9fd601f407dcc2cd` |

P8-25 evidence delivery: SourceCraft PR `156`, accepted head
`40ecd20520a062e843a2b4e3980cc35066eaea11`, STANDARD Gate `246`, squash merge
`c5803cfbac5d2c1817451fdee6aa96e3b975934e`. The implementation SHA remains
`bd570ee40db9e25f73a24013be836dd3876282ac`; the later SHA is docs-only
reconciliation.

## Limitations and owner gates

- Timeweb client topology proof is a static blueprint contract; live provider
  state is not proven and is not required for the starter implementation.
- The 19 lint warnings are pre-existing generated migration/UI/type warnings;
  lint exits `0` and this evidence PR does not change those files.
- No live demo rollout, production smoke, DNS, remote database migration or
  external delivery channel was executed.
- `starter-v2.0.0` and `start-baza.ams24.ru` rollout remain separate explicit
  owner actions. GitHub mirror is an operational copy action, not production.

## Recovery and final reconciliation contract

The evidence PR was docs-only. Final reconciliation proved:

1. its first parent is
   `bd570ee40db9e25f73a24013be836dd3876282ac`;
2. the only changed path is this accepted report;
3. Task Manager remains `CLEAN` with coverage `28/28` and all P8-25 tasks
   closed;
4. the full suite was not repeated on the docs-only merge.

Rollback is the revert of the evidence PR only. The accepted implementation
remains at `bd570ee40db9e25f73a24013be836dd3876282ac`.

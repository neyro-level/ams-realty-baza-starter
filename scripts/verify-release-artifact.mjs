import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const dockerfile = read("Dockerfile");
const compose = read("deploy/compose/start-baza.compose.yml");
const nginx = read("deploy/nginx/start-baza.ams24.ru.conf");
const operations = read("docs/OPERATIONS.md");
const releaseManifest = read("scripts/release-manifest.mjs");
const pnpmWorkspace = read("pnpm-workspace.yaml");

for (const expected of [
	"node:24.20.0-bookworm-slim",
	"pnpm install --frozen-lockfile",
	"pnpm exec next build --webpack",
	'"pnpm", "start"',
]) {
	assert.ok(dockerfile.includes(expected), `Dockerfile must include ${expected}.`);
}

assert.ok(!dockerfile.includes("DATABASE_URI="), "Dockerfile must not embed database credentials.");
assert.ok(!compose.includes("DATABASE_URI="), "Compose template must not embed database credentials.");
assert.ok(compose.includes("AMS_REALTBASE_IMAGE"), "Compose template must require an immutable image tag.");
assert.ok(
	compose.includes("/etc/ams/realtbase/start-baza.env"),
	"Compose template must load runtime env from the server secret materialization path.",
);
assert.ok(compose.includes('PAYLOAD_DB_PUSH: "false"'), "Production compose must keep Payload db push disabled.");
assert.ok(nginx.includes("start-baza.ams24.ru"), "Nginx template must target the internal production domain.");
assert.ok(nginx.includes("noindex, nofollow"), "Nginx template must preserve internal noindex policy.");
assert.ok(operations.includes("immutable artifact"), "Operations must preserve immutable artifact rule.");
assert.ok(releaseManifest.includes(".release"), "Release manifest must write local uncommitted evidence.");
assert.ok(pnpmWorkspace.includes("confirmModulesPurge: false"), "Workspace must support non-interactive Docker builds.");
assert.ok(
	releaseManifest.includes("next-start-full-image"),
	"Release manifest must record the full-image Next.js runtime shape.",
);

console.log("release artifact contract ok");

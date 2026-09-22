import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const fixture = mkdtempSync(join(tmpdir(), "ams-clone-prepare-"));
try {
	for (const path of ["src/project", "docs/legacy", "docs/proofs", "docs/orchestration", "docs/research", "deploy/compose", "deploy/nginx", "scripts"])
		mkdirSync(join(fixture, path), { recursive: true });
	writeFileSync(join(fixture, "src/project/site.config.ts"), 'export const siteConfig = { brandName: "Client Test", projectKind: "client" };\n');
	writeFileSync(join(fixture, "AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md"), "CORE 5.5\n");
	for (const path of ["docs/legacy/a.md", "docs/proofs/a.md", "docs/orchestration/a.json", "docs/research/ATLAS_BASELINE.md", "deploy/compose/start-baza.compose.yml", "deploy/nginx/start-baza.ams24.ru.conf", "scripts/verify-atlas-css-parity.mjs"])
		writeFileSync(join(fixture, path), "starter only\n");
	writeFileSync(join(fixture, "package.json"), JSON.stringify({ scripts: { "clone:prepare": "node scripts/clone-prepare.mjs", "visual:atlas-css-parity": "node scripts/verify-atlas-css-parity.mjs", "verify:starter:clone-readiness": "x", "verify:daily": "pnpm verify:clone-readiness && pnpm typecheck", verify: "pnpm verify:clone-readiness && pnpm build" } }, null, 2));
	cpSync(join(root, "scripts/clone-prepare.mjs"), join(fixture, "scripts/clone-prepare.mjs"));
	const run = () => execFileSync(process.execPath, [join(root, "scripts/clone-prepare.mjs"), `--root=${fixture}`, "--client", "--project-id=Client Test", "--source-sha=0123456789012345678901234567890123456789", "--source-tag=starter-freeze-v1", "--date=2026-09-21T00:00:00.000Z"], { encoding: "utf8" });
	assert.match(run(), /prepared Client Test/);
	assert.ok(!existsSync(join(fixture, "docs/legacy")));
	assert.ok(!existsSync(join(fixture, "deploy/compose/start-baza.compose.yml")));
	assert.ok(existsSync(join(fixture, "AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md")));
	const packageJson = JSON.parse(readFileSync(join(fixture, "package.json"), "utf8"));
	assert.ok(!packageJson.scripts["visual:atlas-css-parity"]);
	assert.match(packageJson.scripts["verify:daily"], /verify:client-readiness/);
	const provenance = readFileSync(join(fixture, "docs/CLONE_PROVENANCE.md"), "utf8");
	assert.match(provenance, /Client Test/);
	assert.match(provenance, /0123456789012345678901234567890123456789/);
	assert.match(run(), /already prepared; no changes/);
	assert.equal(readFileSync(join(fixture, "docs/CLONE_PROVENANCE.md"), "utf8"), provenance);
	console.log("verify:clone-prepare: ok");
} finally {
	rmSync(fixture, { recursive: true, force: true });
}

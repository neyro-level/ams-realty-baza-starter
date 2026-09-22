import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const clone = mkdtempSync(join(tmpdir(), "ams-plan7-client-clone-"));
const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error("Run client clone proof through pnpm.");
const run = (file, args, options = {}) => execFileSync(file, args, { cwd: clone, stdio: "inherit", ...options });
const pnpm = (args, env = {}) => run(process.execPath, [pnpmCli, ...args], { env: { ...process.env, ...env } });
const git = (args, stdio = "pipe") => execFileSync("git", args, { cwd: clone, stdio, encoding: "utf8" });
const commit = (message) => {
	git(["add", "-A"]);
	git(["-c", "user.name=AMS Client Clone Proof", "-c", "user.email=clone-proof@localhost", "commit", "-m", message]);
};

try {
	execFileSync("git", ["worktree", "add", "--detach", clone, "HEAD"], { cwd: root, stdio: "pipe" });
	const packagePath = join(clone, "package.json");
	const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
	packageJson.name = "plan7-client-clone-proof";
	writeFileSync(packagePath, `${JSON.stringify(packageJson, null, "\t")}\n`);

	const sitePath = join(clone, "src/project/site.config.ts");
	writeFileSync(sitePath, readFileSync(sitePath, "utf8").replaceAll("AMS Realty Baza Starter", "Plan 7 Client Proof").replace('projectKind: "starter-demo"', 'projectKind: "client"'));

	commit("test: establish client clone identity");

	pnpm(["clone:prepare"]);
	assert.ok(readFileSync(join(clone, "docs/CLONE_PROVENANCE.md"), "utf8").includes("Plan 7 Client Proof"));
	commit("test: prepare client clone");
	pnpm(["clone:activate-timeweb-storage"]);
	const readinessPath = join(clone, "src/project/client-readiness.config.ts");
	let readiness = readFileSync(readinessPath, "utf8");
	for (const [from, to] of [
		["domain: null", 'domain: "client-proof.local"'],
		["deploymentTarget: null", 'deploymentTarget: "timeweb-vps"'],
		["database: null", 'database: "timeweb-managed-postgresql"'],
		["feedImageSource: null", 'feedImageSource: "external-urls"'],
		["jobsActiveRuntimeCount: null", "jobsActiveRuntimeCount: 1"],
		["leadRetentionDays: null", "leadRetentionDays: 180"],
		["archiveRetentionDays: null", "archiveRetentionDays: 90"],
		['legalContent: "placeholder"', 'legalContent: "approved"'],
		["productionIndexing: null", 'productionIndexing: "noindex"'],
		["outbound: []", 'outbound: ["api.client-proof.local"]'],
		["externalImages: []", 'externalImages: ["images.client-proof.local"]'],
		["leadOutbound: []", 'leadOutbound: ["crm.client-proof.local"]'],
		["nginx: false", "nginx: true"],
		["automaticBackup: false", "automaticBackup: true"],
		["externalMonitoring: false", "externalMonitoring: true"],
	]) {
		assert.ok(readiness.includes(from), `client readiness fixture marker missing: ${from}`);
		readiness = readiness.replace(from, to);
	}
	writeFileSync(readinessPath, readiness);
	commit("test: activate client object storage");

	const env = {
		NEXT_PUBLIC_SERVER_URL: "https://client-proof.local",
		S3_ENDPOINT: "https://s3.client-proof.local",
		S3_REGION: "ru-1",
		S3_BUCKET: "client-proof",
		S3_ACCESS_KEY_ID: "client-proof-access-key",
		S3_SECRET_ACCESS_KEY: "client-proof-secret-key",
		S3_PREFIX: "media",
	};
	pnpm(["verify:client-readiness"], env);
	pnpm(["verify:daily"], env);
	pnpm(["build"], env);
	console.log("verify:client-clone-proof: PASS (temporary exact-head clone, no provider access)");
} finally {
	try { execFileSync("git", ["worktree", "remove", "--force", clone], { cwd: root, stdio: "pipe" }); }
	catch { rmSync(clone, { recursive: true, force: true }); }
}

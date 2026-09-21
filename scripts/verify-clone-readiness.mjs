import assert from "node:assert/strict";
import {
	copyFileSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const dir = mkdtempSync(path.join(tmpdir(), "rbs-clone-"));

function git(args, cwd = dir) {
	return execFileSync("git", args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function pnpm(args) {
	const cli = process.env.npm_execpath;
	if (!cli) throw new Error("pnpm CLI path is unavailable; run this through pnpm.");
	return execFileSync(process.execPath, [cli, ...args], {
		cwd: dir,
		stdio: "inherit",
	});
}

try {
	execFileSync("git", ["worktree", "add", "--detach", dir, "HEAD"], {
		cwd: root,
		stdio: "pipe",
	});
	for (const relativePath of [
		"package.json",
		"scripts/clone-activate-timeweb-storage.mjs",
		"scripts/verify-timeweb-blueprint.mjs",
		"deploy/clients/timeweb/README.md",
		"deploy/clients/timeweb/env.client.example",
		"deploy/clients/timeweb/payload/activation.patch.md",
		"deploy/clients/timeweb/payload/s3-plugin.example.ts",
	]) {
		copyFileSync(path.join(root, relativePath), path.join(dir, relativePath));
	}

	const configPath = path.join(dir, "src", "project", "site.config.ts");
	const projectPath = path.join(dir, "docs", "PROJECT.md");
	const config = readFileSync(configPath, "utf8");
	const project = readFileSync(projectPath, "utf8");
	assert.ok(config.includes('projectKind: "starter-demo"'));
	writeFileSync(
		configPath,
		config
			.replaceAll("AMS Realty Baza Starter", "Clone Agency")
			.replace('projectKind: "starter-demo"', 'projectKind: "client"'),
	);
	writeFileSync(
		projectPath,
		project.replaceAll("AMS Realty Baza Starter", "Clone Agency"),
	);
	git([
		"add",
		"--",
		"package.json",
		"scripts/clone-activate-timeweb-storage.mjs",
		"scripts/verify-timeweb-blueprint.mjs",
		"deploy/clients/timeweb/README.md",
		"deploy/clients/timeweb/env.client.example",
		"deploy/clients/timeweb/payload/activation.patch.md",
		"deploy/clients/timeweb/payload/s3-plugin.example.ts",
		"src/project/site.config.ts",
		"docs/PROJECT.md",
	]);
	git([
		"-c",
		"user.name=AMS Clone Verification",
		"-c",
		"user.email=clone-verification@localhost",
		"commit",
		"-m",
		"test: establish client clone identity",
	]);

	pnpm(["clone:activate-timeweb-storage"]);
	const firstActivationDiff = git(["diff", "--stat"]);
	assert.match(firstActivationDiff, /payload\.config\.ts/);
	assert.match(firstActivationDiff, /pnpm-lock\.yaml/);
	assert.equal(
		JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
			.dependencies["@payloadcms/storage-s3"],
		"3.90.1",
	);
	assert.ok(
		readFileSync(path.join(dir, "payload.config.ts"), "utf8").includes(
			"plugins: [timewebS3Plugin]",
		),
	);
	assert.ok(
		readFileSync(
			path.join(dir, "src", "project", "client-readiness.config.ts"),
			"utf8",
		).includes('mediaStorage: "timeweb-s3"'),
	);

	const beforeRepeat = git(["diff"]);
	pnpm(["clone:activate-timeweb-storage"]);
	assert.equal(git(["diff"]), beforeRepeat, "repeat activation must be a no-op");

	const cloneDocs = readFileSync(path.join(root, "docs", "CLONE_ONBOARDING.md"), "utf8");
	assert.ok(cloneDocs.includes("local PostgreSQL"));
	assert.ok(cloneDocs.includes("Timeweb Managed PostgreSQL"));
	assert.ok(cloneDocs.includes("Timeweb S3-compatible Object Storage"));
	assert.ok(cloneDocs.includes("Deviation requires explicit owner decision"));

	assert.equal(git(["diff", "--", "src/core"]).trim(), "");
	assert.equal(git(["diff", "--", "packages"]).trim(), "");
	assert.notEqual(git(["diff", "--", "src/project"]).trim(), "");
	assert.equal(git(["diff", "--", "docs/PROJECT.md"]).trim(), "");
} finally {
	try {
		execFileSync("git", ["worktree", "remove", "--force", dir], {
			cwd: root,
			stdio: "pipe",
		});
	} catch {
		rmSync(dir, { recursive: true, force: true });
	}
}

console.log(
	"verify:clone-readiness: client S3 activation + typecheck + idempotence PASS; core/packages diff = 0",
);

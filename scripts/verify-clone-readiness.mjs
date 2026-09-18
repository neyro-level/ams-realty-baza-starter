import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

try {
	execFileSync("git", ["worktree", "add", "--detach", dir, "HEAD"], {
		cwd: root,
		stdio: "pipe",
	});

	const configPath = path.join(dir, "src", "project", "project.config.ts");
	const projectPath = path.join(dir, "docs", "PROJECT.md");
	const config = readFileSync(configPath, "utf8");
	const project = readFileSync(projectPath, "utf8");
	assert.ok(config.includes("dispatchBatchSize: 3"));
	writeFileSync(
		configPath,
		config.replace("dispatchBatchSize: 3", "dispatchBatchSize: 2"),
	);
	writeFileSync(
		projectPath,
		project.replaceAll("AMS Realty Baza Starter", "Clone Agency"),
	);

	const cloneDocs = readFileSync(path.join(root, "docs", "CLONE_ONBOARDING.md"), "utf8");
	assert.ok(cloneDocs.includes("local PostgreSQL"));
	assert.ok(cloneDocs.includes("MEDIA_DIR"));
	assert.ok(cloneDocs.includes("собственное") || cloneDocs.includes("own"));
	assert.ok(!cloneDocs.includes("S3 credentials: required"));

	assert.equal(git(["diff", "--", "src/core"]).trim(), "");
	assert.equal(git(["diff", "--", "packages"]).trim(), "");
	assert.notEqual(git(["diff", "--", "src/project"]).trim(), "");
	assert.notEqual(git(["diff", "--", "docs/PROJECT.md"]).trim(), "");
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

console.log("verify:clone-readiness: git diff src/core = 0; git diff packages = 0");

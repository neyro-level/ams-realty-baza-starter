import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const reportPath = "docs/evidence/plan11/FINAL_REPORT.md";
assert.ok(existsSync(reportPath), "Plan 11 final report is missing.");
const report = readFileSync(reportPath, "utf8");
const candidate = report.match(/Candidate commit: `([a-f0-9]{40})`/)?.[1];
const candidateTree = report.match(/Candidate tree: `([a-f0-9]{40})`/)?.[1];
assert.ok(candidate && candidateTree, "Report candidate commit/tree is missing.");

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
assert.equal(git("rev-parse", `${candidate}^{tree}`), candidateTree, "Report candidate tree mismatch.");
const head = git("rev-parse", "HEAD");
if (head !== candidate) {
	execFileSync("git", ["merge-base", "--is-ancestor", candidate, head], { stdio: "ignore" });
	const allowed = new Set([
		"docs/evidence/plan11/FINAL_REPORT.md",
		"package.json",
		"scripts/verify-plan11-final-report.mjs",
		"starter-owned.json",
	]);
	const changed = git("diff", "--name-only", `${candidate}..${head}`).split(/\r?\n/).filter(Boolean);
	for (const file of changed) assert.ok(allowed.has(file), `Implementation changed after reported candidate: ${file}`);
}

for (const marker of [
	"`pnpm verify` | PASS",
	"Required DB suites | PASS",
	"`pnpm verify:clone-matrix` | PASS",
	"`pnpm verify:souz-parity` | PASS",
	"Containers `0`; profile temp directories `0`; temporary profile worktrees `0`",
	"Real Timeweb Managed PostgreSQL TLS/restore: `NOT RUN`",
	"Production release or deployment: `NOT RUN`",
	"`starter-v2.2.0` tag/release creation: `NOT RUN`",
	"SourceCraft-to-GitHub mirror: `NOT RUN`",
]) {
	assert.ok(report.includes(marker), `Plan 11 report marker is missing: ${marker}`);
}
assert.doesNotMatch(report, /\|\s*SKIPPED\s*\|/i);
assert.doesNotMatch(report, /(?:production|Timeweb|mirror|tag)[^\n]{0,80}`PASS`/i);

const sourceHash = createHash("sha256")
	.update(readFileSync("docs/AMS_MASTER_PLAN_11_CLONE_FACTORY_2_2.md"))
	.digest("hex");
assert.ok(report.includes(`Plan source SHA-256: \`${sourceHash}\``));
console.log(`verify:plan11-final-report: PASS (candidate ${candidate})`);

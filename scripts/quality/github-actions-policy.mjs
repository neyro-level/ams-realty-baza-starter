import { existsSync, readFileSync } from "node:fs";

const workflowPath = ".github/workflows/manual-gate.yml";
const exactHeadPath = "scripts/ci/assert-exact-head.mjs";
const workflow = readFileSync(workflowPath, "utf8");
const exactHead = readFileSync(exactHeadPath, "utf8");

const requiredWorkflow = [
	"workflow_dispatch:",
	"expected_commit_sha:",
	"gate:",
	"codex/github-primary-bootstrap",
	"CI_COMMIT_SHA:",
	"assert-exact-head.mjs",
	"pnpm verify:merge-standard",
	"pnpm verify:merge-risky",
	"DATABASE_URI_TEST:",
];
const missingWorkflow = requiredWorkflow.filter(
	(value) => !workflow.includes(value),
);
const forbiddenTriggers = [/^\s*pull_request\s*:/m, /^\s*schedule\s*:/m];
const forbiddenDelivery = [
	/^\s*(?:deploy|deployment|publish|environment)\s*:/m,
	/\b(?:docker\s+push|npm\s+publish|pnpm\s+publish)\b/i,
];
const pushTriggers = workflow.match(/^\s*push\s*:/gm) ?? [];
const exactHeadRequired = [
	"EXPECTED_COMMIT_SHA",
	"CI_COMMIT_SHA",
	'git", ["rev-parse", "HEAD"]',
];
const missingExactHead = exactHeadRequired.filter(
	(value) => !exactHead.includes(value),
);

const failures = [];
if (missingWorkflow.length)
	failures.push(`workflow missing=${missingWorkflow.join(",")}`);
if (forbiddenTriggers.some((pattern) => pattern.test(workflow)))
	failures.push("automatic pull_request/schedule trigger");
if (pushTriggers.length !== 1)
	failures.push(`push trigger count=${pushTriggers.length}`);
if (forbiddenDelivery.some((pattern) => pattern.test(workflow)))
	failures.push("deploy/publish/production delivery surface");
if (existsSync(".sourcecraft/ci.yaml"))
	failures.push("active .sourcecraft/ci.yaml exists");
if (missingExactHead.length)
	failures.push(`exact-head missing=${missingExactHead.join(",")}`);
if (exactHead.includes("SOURCECRAFT_COMMIT_SHA"))
	failures.push("exact-head still requires SOURCECRAFT_COMMIT_SHA");

if (failures.length) {
	console.error(`GitHub Actions policy FAIL; ${failures.join("; ")}`);
	process.exit(1);
}

console.log(
	"GitHub Actions policy: PASS (manual exact-head gates + reserved bootstrap only)",
);

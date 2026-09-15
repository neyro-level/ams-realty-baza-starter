import { readFileSync } from "node:fs";

const config = readFileSync(".sourcecraft/ci.yaml", "utf8");
const required = [
	"merge-standard:",
	"merge-risky:",
	"expected_commit_sha",
	"assert-exact-head.mjs",
	"pnpm verify",
];
const forbidden = [
	/^\s*push\s*:/m,
	/^\s*pull_request\s*:/m,
	/^\s*schedule\s*:/m,
];
const missing = required.filter((value) => !config.includes(value));
const automatic = forbidden.filter((pattern) => pattern.test(config));

if (missing.length || automatic.length) {
	console.error(
		`SourceCraft policy FAIL; missing=${missing.join(",") || "none"}; automatic=${automatic.length}`,
	);
	process.exit(1);
}
console.log("SourceCraft policy: PASS (manual exact-head only)");

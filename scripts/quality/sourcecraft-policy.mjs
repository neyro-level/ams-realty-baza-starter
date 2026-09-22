import { readFileSync } from "node:fs";

const config = readFileSync(".sourcecraft/ci.yaml", "utf8");
const required = [
	"merge-standard:",
	"merge-risky:",
	"expected_commit_sha",
	"assert-exact-head.mjs",
	"pnpm verify:merge-standard",
	"pnpm verify:merge-risky",
	"DATABASE_URI_TEST",
];
const forbidden = [/^\s*pull_request\s*:/m, /^\s*schedule\s*:/m];
const neverTriggerSentinel = /on:\s*\r?\n\s*push:\s*\r?\n\s*-\s*workflows:\s*\[merge-standard,\s*merge-risky\]\s*\r?\n\s*filter:\s*\r?\n\s*paths:\s*\[\]/m;
const missing = required.filter((value) => !config.includes(value));
const automatic = forbidden.filter((pattern) => pattern.test(config));
const pushKeys = config.match(/^\s*push\s*:/gm) ?? [];

if (
	missing.length ||
	automatic.length ||
	pushKeys.length !== 1 ||
	!neverTriggerSentinel.test(config)
) {
	console.error(
		`SourceCraft policy FAIL; missing=${missing.join(",") || "none"}; automatic=${automatic.length}; pushKeys=${pushKeys.length}; sentinel=${neverTriggerSentinel.test(config)}`,
	);
	process.exit(1);
}
console.log("SourceCraft policy: PASS (explicit zero-trigger, manual exact-head only)");

import { execFileSync } from "node:child_process";

const expected = process.env.EXPECTED_COMMIT_SHA;
const ciCommit = process.env.CI_COMMIT_SHA;
const checkout = execFileSync("git", ["rev-parse", "HEAD"], {
	encoding: "utf8",
}).trim();
const fullSha = /^[0-9a-f]{40}$/;

if (!expected || !fullSha.test(expected))
	throw new Error("EXPECTED_COMMIT_SHA must be a full SHA");
if (!ciCommit || !fullSha.test(ciCommit))
	throw new Error("CI_COMMIT_SHA must be a full SHA");
if (expected !== ciCommit || expected !== checkout) {
	throw new Error(
		`exact-head mismatch: expected=${expected} ci=${ciCommit} checkout=${checkout}`,
	);
}
console.log(`exact-head: PASS ${expected}`);

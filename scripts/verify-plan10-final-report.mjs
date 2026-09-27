import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const report = readFileSync("docs/evidence/plan10/FINAL_REPORT.md", "utf8");
for (const required of [
	"AMS-REALTY-BAZA-CLONE-READY-2-1-10",
	"Plan version: `v4 / APPROVED`",
	"| `pnpm verify` | `LOCAL PASS` |",
	"| `pnpm verify:clone-matrix` | `LOCAL PASS` |",
	"LIVE PROOFS: `NOT RUN`",
	"B3 SourceCraft Gate: `PENDING B3-D`",
	"Production: `NOT RUN`",
	"Release tag: `NOT CREATED`",
	"Mirror: `NOT RUN`",
]) {
	assert.ok(
		report.includes(required),
		`Final report must include: ${required}`,
	);
}
assert.ok(
	!report.includes("LIVE PASS"),
	"Final report must not claim an unexecuted live PASS.",
);
assert.ok(
	report.includes("8c590ca12a7669628ace01dc3363ce5df19b6cdf"),
	"Final report must identify the pre-report B3 implementation candidate.",
);
console.log("verify:plan10-report PASS");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { payloadJobTaskSlugs } from "../src/payload/jobs/registry.ts";

const operations = readFileSync("docs/OPERATIONS.md", "utf8");
const jobs = readFileSync("src/payload/jobs/tasks.ts", "utf8");
const feedSources = readFileSync(
	"src/payload/collections/FeedSources.ts",
	"utf8",
);
const leadDeliveries = readFileSync(
	"src/payload/collections/LeadDeliveries.ts",
	"utf8",
);

for (const required of [
	"Manual import",
	"Suspicious approval",
	"Stale/orphan recovery",
	"Delivery retry",
	"Delivery recovery",
	"Catalog lifecycle operations",
	"GET /api/internal/healthz",
]) {
	assert.ok(operations.includes(required), `OPERATIONS.md missing ${required}`);
}

assert.equal(payloadJobTaskSlugs.jobsJanitor, "jobsJanitor");
assert.equal(
	payloadJobTaskSlugs.recoverLeadDeliveries,
	"recoverLeadDeliveries",
);
assert.equal(payloadJobTaskSlugs.catalogLifecycle, "catalogLifecycle");

for (const required of [
	"Recovered by jobsJanitor",
	"Recovered by recoverLeadDeliveries",
	"contentPurgedAt: purgedAt",
	'status: "interrupted"',
	'status: "pending"',
]) {
	assert.ok(jobs.includes(required), `jobs implementation missing ${required}`);
}

assert.ok(
	feedSources.includes("deactivationApproval"),
	"feed source approval metadata is required for suspicious import approval",
);
assert.ok(
	leadDeliveries.includes("Manual retry"),
	"lead deliveries admin guidance is required for manual retry",
);

for (const forbidden of ["Raw XML", "PII", "credentials", "токены"]) {
	assert.ok(
		operations.includes(forbidden),
		`runbook must explicitly forbid ${forbidden}`,
	);
}

console.log("verify-operational-recovery: ok");

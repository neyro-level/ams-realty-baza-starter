import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isLiveFuturePayloadJob } from "../src/core/leads/index.ts";
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
assert.ok(
	leadDeliveries.includes("/:id/retry"),
	"controlled manual retry endpoint is required",
);

const recoverSource = readFileSync("src/payload/jobs/tasks.ts", "utf8");
assert.ok(
	recoverSource.includes("inspectPayloadJob"),
	"orphan recovery must inspect jobs through the system gateway",
);
assert.ok(
	recoverSource.includes("isLiveFuturePayloadJob"),
	"pending jobs with future waitUntil must not be treated as orphans",
);
assert.ok(
	jobs.includes("importStaleThresholdMs"),
	"jobs janitor must use import stale threshold",
);
assert.ok(
	jobs.includes("queuedImportOrphanThresholdMs"),
	"jobs janitor must use queued import orphan threshold",
);
assert.ok(
	jobs.includes("pendingDeliveryOrphanThresholdMs"),
	"delivery recovery must use pending delivery orphan threshold",
);
assert.ok(
	!jobs.includes("staleJobThresholdMs"),
	"recovery must not share one universal stale constant",
);
assert.ok(
	!/collection:\s*["']payload-jobs["']/.test(recoverSource),
	"recoverLeadDeliveries must not use generic payload-jobs CRUD",
);

for (const forbidden of ["Raw XML", "PII", "credentials", "токены"]) {
	assert.ok(
		operations.includes(forbidden),
		`runbook must explicitly forbid ${forbidden}`,
	);
}

assert.equal(
	isLiveFuturePayloadJob(
		{ waitUntil: "2026-09-16T13:00:00.000Z", completedAt: null },
		new Date("2026-09-16T12:00:00.000Z"),
	),
	true,
);
assert.equal(
	isLiveFuturePayloadJob(
		{ waitUntil: null, completedAt: "2026-09-16T11:00:00.000Z" },
		new Date("2026-09-16T12:00:00.000Z"),
	),
	false,
);

console.log("verify-operational-recovery: ok");

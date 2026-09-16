import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { FeedSources } from "../src/payload/collections/FeedSources.ts";
import { ImportIssues } from "../src/payload/collections/ImportIssues.ts";
import { ImportRuns } from "../src/payload/collections/ImportRuns.ts";
import { LeadDeliveries } from "../src/payload/collections/LeadDeliveries.ts";
import { Leads } from "../src/payload/collections/Leads.ts";

const root = process.cwd();

const operationalCollections = [
	FeedSources,
	ImportRuns,
	ImportIssues,
	Leads,
	LeadDeliveries,
];

function assertRoleProtected(collection) {
	for (const operation of ["create", "read", "update", "delete"]) {
		assert.equal(
			typeof collection.access?.[operation],
			"function",
			`${collection.slug}.${operation} must be role protected`,
		);
	}
}

function findField(fields, name) {
	for (const field of fields) {
		if (field.name === name) return field;
		const nested =
			"fields" in field ? findField(field.fields ?? [], name) : null;
		if (nested) return nested;
	}
	return null;
}

for (const collection of operationalCollections) {
	assert.equal(
		collection.admin?.group,
		"Operations",
		`${collection.slug} must be grouped under Payload Admin Operations`,
	);
	assert.ok(
		collection.admin?.description,
		`${collection.slug} must describe the owner operation safely`,
	);
	assertRoleProtected(collection);
}

assert.deepEqual(FeedSources.admin?.defaultColumns, [
	"code",
	"title",
	"market",
	"enabled",
	"nextDueAt",
]);
assert.ok(
	findField(
		FeedSources.fields,
		"deactivationApproval",
	)?.admin?.description?.includes("Audit-safe approval"),
	"feed-sources must expose suspicious-run approval guidance",
);

assert.ok(
	ImportRuns.admin?.defaultColumns?.includes("warningCount"),
	"import-runs must expose warning count",
);
assert.ok(
	ImportRuns.admin?.defaultColumns?.includes("errorCount"),
	"import-runs must expose error count",
);
assert.ok(
	findField(
		ImportRuns.fields,
		"lastErrorRedacted",
	)?.admin?.description?.includes("Redacted"),
	"import-runs diagnostics must be explicitly redacted",
);

assert.ok(
	findField(
		ImportIssues.fields,
		"messageRedacted",
	)?.admin?.description?.includes("No raw XML"),
	"import issue diagnostics must reject raw payloads",
);

assert.ok(
	LeadDeliveries.admin?.defaultColumns?.includes("lastErrorKind"),
	"lead-deliveries must expose delivery error kind",
);
assert.ok(
	findField(
		LeadDeliveries.fields,
		"nextAttemptAt",
	)?.admin?.description?.includes("Manual retry"),
	"lead-deliveries must expose manual retry guidance",
);

assert.ok(
	Leads.admin?.description?.includes(
		"External delivery state lives in Lead Deliveries",
	),
	"leads must keep agency workflow separate from delivery state",
);

assert.equal(
	existsSync(join(root, "src", "app", "owner-operations")),
	false,
	"owner operations must not create a second Admin framework",
);

console.log("verify-owner-operations: ok");

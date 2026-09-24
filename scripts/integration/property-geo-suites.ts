import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "../../payload.config.ts";
import { systemOverrideAccess } from "../../src/core/data-access/system/overrides.ts";
import { runPropertyGeoBackfill } from "../../src/core/data-access/system/property-geo-backfill.ts";
import { requirePayloadRuntime } from "../../src/project/env.ts";

requirePayloadRuntime();
const payload = await getPayload({ config });
const access = systemOverrideAccess("system-job");
const suffix = Date.now().toString(36);

const feedSource = await payload.create({
	collection: "feed-sources",
	data: {
		code: `geo-backfill-${suffix}`,
		title: "Geo backfill fixture",
		parser: "yrl",
		market: "secondary",
		feedUrlRef: "GEO_BACKFILL_FIXTURE_URL",
		enabled: false,
		refreshIntervalMinutes: 1440,
		safetyThresholdPercent: 30,
		maxDeactivationsPerRun: 50,
	},
	...access,
});
const run = await payload.create({
	collection: "import-runs",
	data: {
		feedSource: feedSource.id,
		status: "running",
		jobId: "property-geo-backfill-v1",
		queuedAt: "2026-09-24T15:00:00.000Z",
		startedAt: "2026-09-24T15:00:00.000Z",
	},
	...access,
});
const genericRun = await payload.create({
	collection: "import-runs",
	data: {
		feedSource: feedSource.id,
		status: "running",
		queuedAt: "2026-09-24T14:59:00.000Z",
	},
	...access,
});
await assert.rejects(
	() =>
		runPropertyGeoBackfill({
			payload,
			importRunId: genericRun.id,
			apply: true,
		}),
	/dedicated property-geo-backfill-v1/i,
);

const createProperty = (input: {
	externalId: string;
	slug: string;
	locality: string;
	district: string;
}) =>
	payload.create({
		collection: "properties",
		data: {
			feedSource: feedSource.id,
			externalId: input.externalId,
			origin: "feed",
			status: "active",
			slug: input.slug,
			market: "secondary",
			category: "apartment",
			dealType: "sale",
			region: "Приморье",
			locality: input.locality,
			district: input.district,
			title: `Geo fixture ${input.externalId}`,
		},
		...access,
	});

const matched = await createProperty({
	externalId: `matched-${suffix}`,
	slug: `geo-matched-${suffix}`,
	locality: "Приморск",
	district: "Северный",
});
const unknown = await createProperty({
	externalId: `unknown-${suffix}`,
	slug: `geo-unknown-${suffix}`,
	locality: "Приморск",
	district: "Неизвестный район",
});
const scopedSynonym = await createProperty({
	externalId: `scoped-${suffix}`,
	slug: `geo-scoped-${suffix}`,
	locality: "Заречный",
	district: "Центр",
});

const first = await runPropertyGeoBackfill({
	payload,
	importRunId: run.id,
	apply: true,
	batchSize: 2,
});
assert.equal(first.processed, 3);
assert.equal(first.updated, 3);
assert.equal(first.createdIssues, 1);

const [matchedAfter, unknownAfter, scopedAfter] = await Promise.all([
	payload.findByID({
		collection: "properties",
		id: matched.id,
		depth: 0,
		...access,
	}),
	payload.findByID({
		collection: "properties",
		id: unknown.id,
		depth: 0,
		...access,
	}),
	payload.findByID({
		collection: "properties",
		id: scopedSynonym.id,
		depth: 0,
		...access,
	}),
]);
assert.ok(
	matchedAfter.regionRef && matchedAfter.cityRef && matchedAfter.districtRef,
);
assert.equal(unknownAfter.status, "active");
assert.equal(unknownAfter.districtRef, null);
assert.equal(unknownAfter.needsReview, true);
assert.ok(scopedAfter.cityRef && scopedAfter.districtRef);
assert.notEqual(String(scopedAfter.cityRef), String(matchedAfter.cityRef));

const issues = await payload.find({
	collection: "import-issues",
	where: { importRun: { equals: run.id } },
	pagination: false,
	depth: 0,
	...access,
});
assert.equal(issues.totalDocs, 1);
assert.equal(issues.docs[0]?.code, "GEO_DISTRICT_UNRECOGNIZED");
assert.ok(!issues.docs[0]?.messageRedacted.includes("Неизвестный"));

const second = await runPropertyGeoBackfill({
	payload,
	importRunId: run.id,
	apply: true,
	batchSize: 2,
});
assert.equal(second.processed, 3);
assert.equal(second.updated, 0);
assert.equal(second.unchanged, 3);
assert.equal(second.createdIssues, 0);

await payload.destroy();
console.log("property geo integration suites: ok");

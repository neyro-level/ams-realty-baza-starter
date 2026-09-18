import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "../../payload.config.ts";
import { requirePayloadRuntime } from "../../src/payload/env.ts";
import { systemOverrideAccess } from "../../src/server/system-gateway/overrides.ts";
import { createControllableClock, installRuntimeClock, resetRuntimeClock } from "../../src/core/time/clock.ts";
import { payloadJobTaskSlugs } from "../../src/payload/jobs/registry.ts";
import { payloadJobTasks } from "../../src/payload/jobs/tasks.ts";
import {
	findPublicCatalogProperties,
	findPublicPropertyBySlug,
} from "../../src/server/public-gateway/catalog.ts";
import { findPublicPage } from "../../src/server/public-gateway/pages.ts";

requirePayloadRuntime();

const clock = createControllableClock("2026-09-18T12:00:00.000Z");
installRuntimeClock(clock);

const payload = await getPayload({ config });
const access = systemOverrideAccess("system-job");

async function assertPubliclyInaccessible(
	collection:
		| "leads"
		| "lead-deliveries"
		| "properties"
		| "pages"
		| "media"
		| "redirects",
) {
	try {
		const result = await payload.find({
			collection,
			overrideAccess: false,
			user: null,
			limit: 1,
		});
		assert.equal(
			result.docs.length,
			0,
			`${collection} must not return documents to anonymous Local API`,
		);
	} catch {
		return;
	}
}

await assertPubliclyInaccessible("leads");
await assertPubliclyInaccessible("lead-deliveries");
await assertPubliclyInaccessible("properties");
await assertPubliclyInaccessible("pages");
await assertPubliclyInaccessible("media");
await assertPubliclyInaccessible("redirects");

const catalog = await findPublicCatalogProperties(payload, { page: 1, limit: 1 });
assert.ok(Array.isArray(catalog.items), "public catalog gateway must return DTO items");
assert.ok(typeof catalog.total === "number", "public catalog gateway must return totals");
const catalogProperty = await findPublicPropertyBySlug(payload, "__missing-public-property__");
assert.equal(catalogProperty, null, "missing public property slug must resolve to null");
const cmsPage = await findPublicPage(payload, "__missing-public-page__");
assert.equal(cmsPage, null, "missing public CMS page slug must resolve to null");

const suffix = `${Date.now()}`;
const lead = await payload.create({
	collection: "leads",
	data: {
		name: "Integration",
		phoneE164: "+79990000001",
		formKind: "callback",
		sourcePage: "/",
		status: "new",
		consent: {
			accepted: true,
			version: "test",
			consentedAt: clock.nowIso(),
		},
		idempotencyKey: `itest-lead-${suffix}`,
		retentionUntil: "2099-01-01T00:00:00.000Z",
		retentionMode: "anonymize",
	},
	...access,
});

let hidden = false;
try {
	const stillHidden = await payload.find({
		collection: "leads",
		overrideAccess: false,
		user: null,
		where: { id: { equals: lead.id } },
	});
	hidden = stillHidden.totalDocs === 0;
} catch (error) {
	const status = error && typeof error === "object" && "status" in error ? Number(error.status) : 0;
	hidden = status === 403 || /forbidden/i.test(String(error));
}
assert.equal(hidden, true, "created lead must stay inaccessible anonymously");

const feedSource = await payload.create({
	collection: "feed-sources",
	data: {
		code: `itest-feed-${suffix}`,
		title: "Integration feed",
		parser: "yrl",
		market: "secondary",
		feedUrlRef: "INTEGRATION_FEED_URL",
		enabled: true,
		refreshIntervalMinutes: 60,
		nextDueAt: clock.nowIso(),
		safetyThresholdPercent: 30,
		maxDeactivationsPerRun: 50,
		lastOfferCount: 2,
	},
	...access,
});

const importRun = await payload.create({
	collection: "import-runs",
	data: {
		feedSource: feedSource.id,
		status: "running",
		queuedAt: "2026-09-18T10:00:00.000Z",
		startedAt: "2026-09-18T10:00:00.000Z",
		heartbeatAt: "2026-09-18T10:00:00.000Z",
	},
	...access,
});

const janitor = payloadJobTasks.find((task) => task.slug === payloadJobTaskSlugs.jobsJanitor);
const handler = janitor?.handler;
if (typeof handler !== "function") {
	throw new Error("jobsJanitor handler is missing");
}

clock.setIso("2026-09-18T12:00:00.000Z");
await handler({
	req: { payload, user: undefined } as never,
	input: {},
	job: {} as never,
} as never);

const recovered = await payload.findByID({
	collection: "import-runs",
	id: importRun.id,
	...access,
});
assert.equal(recovered.status, "interrupted");

resetRuntimeClock();
await payload.destroy();

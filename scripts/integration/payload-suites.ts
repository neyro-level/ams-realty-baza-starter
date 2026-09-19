import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "../../payload.config.ts";
import {
	findPublicCatalogProperties,
	findPublicPropertyBySlug,
} from "../../src/core/data-access/public/catalog.ts";
import { findPublicPage } from "../../src/core/data-access/public/pages.ts";
import { systemOverrideAccess } from "../../src/core/data-access/system/overrides.ts";
import {
	createControllableClock,
	installRuntimeClock,
	resetRuntimeClock,
} from "../../src/core/time/clock.ts";
import { requirePayloadRuntime } from "../../src/payload/env.ts";
import { payloadJobTaskSlugs } from "../../src/payload/jobs/registry.ts";
import { payloadJobTasks } from "../../src/payload/jobs/tasks.ts";
import {
	claimQueuedImportRun,
	consumeDeactivationApproval,
	finishImportRun,
	touchImportRunHeartbeat,
} from "../../src/core/data-access/ingest/sql/index.ts";

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

const catalog = await findPublicCatalogProperties(payload, {
	page: 1,
	limit: 1,
});
assert.ok(
	Array.isArray(catalog.items),
	"public catalog gateway must return DTO items",
);
assert.ok(
	typeof catalog.total === "number",
	"public catalog gateway must return totals",
);
const catalogProperty = await findPublicPropertyBySlug(
	payload,
	"__missing-public-property__",
);
assert.equal(
	catalogProperty,
	null,
	"missing public property slug must resolve to null",
);
const cmsPage = await findPublicPage(payload, "__missing-public-page__");
assert.equal(
	cmsPage,
	null,
	"missing public CMS page slug must resolve to null",
);

const suffix = `${Date.now()}`;
const numericPropertyBase = {
	origin: "manual" as const,
	status: "active" as const,
	market: "secondary" as const,
	category: "apartment" as const,
	dealType: "sale" as const,
	title: "Numeric invariant probe",
};
await assert.rejects(
	() =>
		payload.create({
			collection: "properties",
			data: {
				...numericPropertyBase,
				slug: `integration-fractional-money-${suffix}`,
				priceMinor: 100.5,
			},
			...access,
		}),
	/safe integer/,
	"System writes must reject fractional minor units before PostgreSQL",
);
await assert.rejects(
	() =>
		payload.create({
			collection: "properties",
			data: {
				...numericPropertyBase,
				slug: `integration-area-precision-${suffix}`,
				totalArea: 12.345,
			},
			overrideAccess: false,
			user: {
				id: 10_002,
				collection: "users",
				roles: ["admin"],
			} as never,
		}),
	/two decimal places/,
	"Admin writes must reject area precision above two decimals",
);
const publishedPage = await payload.create({
	collection: "pages",
	data: {
		slug: `integration-public-page-${suffix}`,
		title: "Published integration page",
		status: "published",
		publishedAt: clock.nowIso(),
		seo: { description: "Public page" },
	},
	...access,
});
await payload.create({
	collection: "pages",
	data: {
		slug: `integration-draft-page-${suffix}`,
		title: "Draft integration page",
		status: "draft",
	},
	...access,
});

const publicPage = await findPublicPage(payload, publishedPage.slug);
assert.equal(
	publicPage?.slug,
	publishedPage.slug,
	"published page must pass Public Gateway access",
);
assert.equal(
	await findPublicPage(payload, `integration-draft-page-${suffix}`),
	null,
	"draft page must remain unavailable through Public Gateway",
);

const publishedProperty = await payload.create({
	collection: "properties",
	data: {
		origin: "manual",
		status: "active",
		publishedAt: clock.nowIso(),
		slug: `integration-public-property-${suffix}`,
		market: "secondary",
		category: "apartment",
		dealType: "sale",
		title: "Published integration property",
		internalComment: "must never enter public DTO",
		ownerContact: "+79990000099",
	},
	...access,
});
await payload.create({
	collection: "properties",
	data: {
		origin: "manual",
		status: "active",
		slug: `integration-private-property-${suffix}`,
		market: "secondary",
		category: "apartment",
		dealType: "sale",
		title: "Unpublished integration property",
	},
	...access,
});

const publicProperty = await findPublicPropertyBySlug(
	payload,
	publishedProperty.slug,
);
assert.equal(
	publicProperty?.slug,
	publishedProperty.slug,
	"published property must pass Public Gateway access",
);
assert.equal(
	"internalComment" in (publicProperty ?? {}),
	false,
	"private property fields must be absent from the public DTO",
);
assert.equal(
	"ownerContact" in (publicProperty ?? {}),
	false,
	"owner contact must be absent from the public DTO",
);
assert.equal(
	await findPublicPropertyBySlug(
		payload,
		`integration-private-property-${suffix}`,
	),
	null,
	"unpublished property must remain unavailable through Public Gateway",
);

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
	const status =
		error && typeof error === "object" && "status" in error
			? Number(error.status)
			: 0;
	hidden = status === 403 || /forbidden/i.test(String(error));
}
assert.equal(hidden, true, "created lead must stay inaccessible anonymously");

const owner = { id: 10_001, collection: "users", roles: ["owner"] } as never;
const admin = { id: 10_002, collection: "users", roles: ["admin"] } as never;
const editor = { id: 10_003, collection: "users", roles: ["editor"] } as never;

for (const [role, user] of [
	["owner", owner],
	["admin", admin],
] as const) {
	const visible = await payload.find({
		collection: "leads",
		overrideAccess: false,
		user,
		where: { id: { equals: lead.id } },
	});
	assert.equal(visible.totalDocs, 1, `${role} must read operational lead data`);
}

let editorDenied = false;
try {
	const editorResult = await payload.find({
		collection: "leads",
		overrideAccess: false,
		user: editor,
		where: { id: { equals: lead.id } },
	});
	editorDenied = editorResult.totalDocs === 0;
} catch {
	editorDenied = true;
}
assert.equal(editorDenied, true, "editor must not read operational lead data");

const updatedByAdmin = await payload.update({
	collection: "leads",
	id: lead.id,
	data: { status: "in_progress" },
	overrideAccess: false,
	user: admin,
});
assert.equal(
	updatedByAdmin.status,
	"in_progress",
	"admin must update operational lead data",
);

let editorUpdateDenied = false;
try {
	await payload.update({
		collection: "leads",
		id: lead.id,
		data: { status: "processed" },
		overrideAccess: false,
		user: editor,
	});
} catch {
	editorUpdateDenied = true;
}
assert.equal(
	editorUpdateDenied,
	true,
	"editor must not update operational lead data",
);

let adminDeleteDenied = false;
try {
	await payload.delete({
		collection: "leads",
		id: lead.id,
		overrideAccess: false,
		user: admin,
	});
} catch {
	adminDeleteDenied = true;
}
assert.equal(
	adminDeleteDenied,
	true,
	"admin must not perform owner-only destructive operations",
);

const ownerDeleteLead = await payload.create({
	collection: "leads",
	data: {
		name: "Owner delete proof",
		phoneE164: "+79990000002",
		formKind: "callback",
		sourcePage: "/",
		status: "new",
		consent: {
			accepted: true,
			version: "test",
			consentedAt: clock.nowIso(),
		},
		idempotencyKey: `itest-owner-delete-${suffix}`,
		retentionUntil: "2099-01-01T00:00:00.000Z",
		retentionMode: "anonymize",
	},
	...access,
});
await payload.delete({
	collection: "leads",
	id: ownerDeleteLead.id,
	overrideAccess: false,
	user: owner,
});

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

const lifecycleRun = await payload.create({
	collection: "import-runs",
	data: {
		feedSource: feedSource.id,
		status: "queued",
		queuedAt: "2026-09-18T11:55:00.000Z",
	},
	...access,
});
const claimAt = new Date("2026-09-18T12:00:00.000Z");
const contenders = await Promise.all([
	claimQueuedImportRun(payload, {
		importRunId: String(lifecycleRun.id),
		now: claimAt,
	}),
	claimQueuedImportRun(payload, {
		importRunId: String(lifecycleRun.id),
		now: claimAt,
	}),
]);
assert.equal(
	contenders.filter(Boolean).length,
	1,
	"two concurrent import contenders must produce exactly one claim winner",
);
const heartbeatAt = new Date("2026-09-18T12:01:00.000Z");
assert.equal(
	await touchImportRunHeartbeat(payload, {
		importRunId: String(lifecycleRun.id),
		now: heartbeatAt,
	}),
	true,
	"the running claim owner must update its heartbeat",
);
const heartbeatRead = await payload.findByID({
	collection: "import-runs",
	id: lifecycleRun.id,
	depth: 0,
	...access,
});
assert.equal(
	heartbeatRead.heartbeatAt,
	heartbeatAt.toISOString(),
	"an independent Local API read must observe the committed heartbeat",
);
assert.equal(
	await finishImportRun(payload, {
		importRunId: String(lifecycleRun.id),
		now: new Date("2026-09-18T12:02:00.000Z"),
		status: "success",
	}),
	true,
	"the running claim owner must win one terminal transition",
);
assert.equal(
	await finishImportRun(payload, {
		importRunId: String(lifecycleRun.id),
		now: new Date("2026-09-18T12:03:00.000Z"),
		status: "failed",
	}),
	false,
	"a terminal import run must reject a second terminal transition",
);
assert.equal(
	await claimQueuedImportRun(payload, {
		importRunId: String(lifecycleRun.id),
		now: new Date("2026-09-18T12:04:00.000Z"),
	}),
	undefined,
	"a terminal import run must never restart",
);
await payload.update({
	collection: "feed-sources",
	id: feedSource.id,
	data: {
		deactivationApproval: {
			runId: lifecycleRun.id,
			expiresAt: "2026-09-18T13:00:00.000Z",
			consumedAt: null,
		},
	},
	...access,
});
assert.equal(
	await consumeDeactivationApproval(payload, {
		feedSourceId: String(feedSource.id),
		importRunId: String(lifecycleRun.id),
		now: new Date("2026-09-18T12:05:00.000Z"),
	}),
	false,
	"database approval consumption must reject a row without approvedAt",
);
await payload.update({
	collection: "feed-sources",
	id: feedSource.id,
	data: {
		deactivationApproval: {
			runId: lifecycleRun.id,
			approvedAt: "2026-09-18T12:00:00.000Z",
			expiresAt: "2026-09-18T13:00:00.000Z",
			consumedAt: null,
		},
	},
	...access,
});
assert.equal(
	await consumeDeactivationApproval(payload, {
		feedSourceId: String(feedSource.id),
		importRunId: String(lifecycleRun.id),
		now: new Date("2026-09-18T12:05:00.000Z"),
	}),
	true,
	"complete matching approval must be consumed once",
);
assert.equal(
	await consumeDeactivationApproval(payload, {
		feedSourceId: String(feedSource.id),
		importRunId: String(lifecycleRun.id),
		now: new Date("2026-09-18T12:05:00.000Z"),
	}),
	false,
	"consumed approval must not be reusable",
);

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

const janitor = payloadJobTasks.find(
	(task) => task.slug === payloadJobTaskSlugs.jobsJanitor,
);
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

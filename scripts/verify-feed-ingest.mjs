import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	dispatchDueFeeds,
	ingestNormalizedFeed,
	isEnabledFeedDue,
	runImportFeed,
	startImportHeartbeat,
} from "../src/core/ingest/index.ts";

const repository = createRepository();
const baseContext = {
	feedSourceId: "feed-source-a",
	feedSourceCode: "source-a",
	importRunId: "run-1",
	market: "secondary",
	nowIso: "2026-09-16T12:00:00.000Z",
};
const offer = {
	externalId: "external-1",
	title: "Квартира на Тестовой",
	category: "квартира",
	dealType: "продажа",
	priceMinor: 12_000_000_00,
	currency: "RUB",
	publicAddress: "Москва, Тестовая, 1",
	locality: "Москва",
	images: [
		{ url: "https://img.allowed.example/1.jpg", host: "img.allowed.example" },
	],
};

const firstRun = await ingestNormalizedFeed({
	context: baseContext,
	offers: [offer],
	issues: [
		{
			severity: "warning",
			code: "feed.image_host_disallowed",
			externalId: "external-1",
			field: "images",
			messageRedacted:
				"Feed image skipped because its URL or host is not allowed.",
		},
	],
	repository,
	invalidateCache: repository.invalidateCache,
});
assert.equal(firstRun.createdCount, 1);
assert.equal(firstRun.updatedCount, 0);
assert.equal(firstRun.warningCount, 1);
assert.equal(repository.issues.length, 1);
assert.deepEqual(firstRun.invalidatedTargets, [
	{ type: "tag", tag: "properties" },
	{ type: "path", path: "/nedvizhimost", routeType: "page" },
]);

const sameRun = await ingestNormalizedFeed({
	context: { ...baseContext, importRunId: "run-2" },
	offers: [offer],
	repository,
	invalidateCache: repository.invalidateCache,
});
assert.equal(sameRun.createdCount, 0);
assert.equal(sameRun.updatedCount, 0);
assert.equal(sameRun.skippedCount, 1);
assert.equal(
	repository.byId.get("property-1").slug,
	"feed-source-a-external-1",
);
assert.equal(repository.touched.at(-1)?.importRunId, "run-2");

repository.byId.get("property-1").manualOverrides = [{ field: "title" }];
repository.byId.get("property-1").title = "Ручной заголовок";
const manualOverrideRun = await ingestNormalizedFeed({
	context: { ...baseContext, importRunId: "run-3" },
	offers: [
		{ ...offer, title: "Новый заголовок из feed", priceMinor: 13_000_000_00 },
	],
	repository,
});
assert.equal(manualOverrideRun.updatedCount, 1);
assert.equal(repository.byId.get("property-1").title, "Ручной заголовок");
assert.equal(repository.byId.get("property-1").priceMinor, 13_000_000_00);

const sourceIsolationRun = await ingestNormalizedFeed({
	context: {
		...baseContext,
		feedSourceId: "feed-source-b",
		feedSourceCode: "source-b",
		importRunId: "run-4",
	},
	offers: [offer],
	repository,
});
assert.equal(sourceIsolationRun.createdCount, 1);
assert.equal(repository.byId.size, 2);

const otherMarket = await ingestNormalizedFeed({
	context: { ...baseContext, market: "newbuild", importRunId: "run-market" },
	offers: [offer],
	repository,
});
assert.equal(otherMarket.errorCount, 1);
assert.equal(repository.byId.get("property-1").market, "secondary");

const firstClaim = await dispatchDueFeeds({
	now: new Date("2026-09-18T06:00:00.000Z"),
	batchSize: 3,
	claimDueFeedSources: async ({ batchSize }) => {
		assert.equal(batchSize, 3);
		return [
			{
				id: "11",
				code: "a",
				market: "secondary",
				feedUrlRef: "FEED_A_URL",
				refreshIntervalMinutes: 60,
				nextDueAt: "2026-09-18T07:00:00.000Z",
				safetyThresholdPercent: 30,
				maxDeactivationsPerRun: 50,
				enabled: true,
			},
		];
	},
	createQueuedImportRun: async ({ feedSourceId }) => ({ id: `run-${feedSourceId}` }),
	enqueueImportFeed: async () => ({ id: "job-1" }),
	attachJobId: async () => undefined,
});
assert.equal(firstClaim.dispatched.length, 1);

const secondClaimer = { calls: 0 };
const concurrent = await Promise.all([
	dispatchDueFeeds({
		now: new Date("2026-09-18T06:00:00.000Z"),
		claimDueFeedSources: async () => {
			secondClaimer.calls += 1;
			return secondClaimer.calls === 1
				? [
						{
							id: "11",
							code: "a",
							market: "secondary",
							feedUrlRef: "FEED_A_URL",
							refreshIntervalMinutes: 60,
							nextDueAt: "2026-09-18T07:00:00.000Z",
							safetyThresholdPercent: 30,
							maxDeactivationsPerRun: 50,
							enabled: true,
						},
					]
				: [];
		},
		createQueuedImportRun: async ({ feedSourceId }) => ({ id: `run-${feedSourceId}` }),
		enqueueImportFeed: async () => ({ id: "job-1" }),
		attachJobId: async () => undefined,
	}),
	dispatchDueFeeds({
		now: new Date("2026-09-18T06:00:00.000Z"),
		claimDueFeedSources: async () => [],
		createQueuedImportRun: async () => ({ id: "x" }),
		enqueueImportFeed: async () => ({ id: "y" }),
		attachJobId: async () => undefined,
	}),
]);
assert.equal(concurrent[0].dispatched.length + concurrent[1].dispatched.length, 1);

let ticks = 0;
const heartbeat = startImportHeartbeat({
	intervalMs: 20,
	tick: async () => {
		ticks += 1;
	},
});
await new Promise((resolve) => setTimeout(resolve, 60));
heartbeat.stop();
assert.ok(ticks >= 1, "heartbeat ticks must run outside ingest work");

let ingestCalls = 0;
const unchanged = await runImportFeed(
	{
		now: () => new Date("2026-09-18T06:00:00.000Z"),
		heartbeatIntervalMs: 60_000,
		claimQueuedImportRun: async () => "7",
		touchHeartbeat: async () => undefined,
		loadFeedSource: async () => ({
			id: "11",
			code: "a",
			enabled: true,
			market: "secondary",
			feedUrlRef: "FEED_A_URL",
			safetyThresholdPercent: 30,
			maxDeactivationsPerRun: 50,
		}),
		resolveFeedUrl: () => "https://feeds.example.test/a.xml",
		fetchFeed: async () => ({
			status: "unchanged",
			etag: '"next"',
		}),
		createRepository: () => repository,
		ingest: async () => {
			ingestCalls += 1;
			throw new Error("ingest must not run on 304");
		},
		finishRun: async () => undefined,
		recordSourceContact: async () => undefined,
		allowedImageHosts: new Set(["img.allowed.example"]),
	},
	{ feedSourceId: "11", importRunId: "7" },
);
assert.equal(unchanged.claimed, true);
assert.equal(unchanged.status, "unchanged");
assert.equal(ingestCalls, 0);

const skipped = await runImportFeed(
	{
		now: () => new Date("2026-09-18T06:00:00.000Z"),
		claimQueuedImportRun: async () => undefined,
		touchHeartbeat: async () => {
			throw new Error("heartbeat must not start if claim failed");
		},
		loadFeedSource: async () => {
			throw new Error("source must not load if claim failed");
		},
		resolveFeedUrl: () => {
			throw new Error("url must not resolve if claim failed");
		},
		fetchFeed: async () => {
			throw new Error("fetch must not run if claim failed");
		},
		createRepository: () => repository,
		finishRun: async () => undefined,
		recordSourceContact: async () => undefined,
		allowedImageHosts: new Set(),
	},
	{ feedSourceId: "11", importRunId: "7" },
);
assert.equal(skipped.claimed, false);

const { chunkCacheTargets, postBatchedHttpRevalidate } = await import(
	"../src/core/cache/http-revalidate.ts"
);
assert.equal(chunkCacheTargets(new Array(33).fill({ type: "tag", tag: "properties" })).length, 2);
let postedBodies = 0;
const httpOk = await postBatchedHttpRevalidate({
	baseUrl: "https://start-baza.ams24.ru",
	secret: "fixture-secret",
	targets: [
		{ type: "tag", tag: "properties" },
		{ type: "path", path: "/nedvizhimost", routeType: "page" },
	],
	fetchImpl: async (_url, init) => {
		postedBodies += 1;
		const body = JSON.parse(String(init.body));
		assert.equal(body.targets.length, 2);
		return new Response(JSON.stringify({ revalidated: true, count: 2 }), { status: 200 });
	},
});
assert.equal(httpOk.ok, true);
assert.equal(postedBodies, 1);
const httpFail = await postBatchedHttpRevalidate({
	baseUrl: "https://start-baza.ams24.ru",
	secret: "fixture-secret",
	targets: [{ type: "tag", tag: "properties" }],
	fetchImpl: async () => new Response("no", { status: 500 }),
});
assert.equal(httpFail.ok, false);
assert.equal(httpFail.warning, true);

assert.equal(
	isEnabledFeedDue({
		enabled: true,
		nextDueAt: null,
		nowIso: "2026-09-18T06:00:00.000Z",
	}),
	true,
);
const nullDueDispatch = await dispatchDueFeeds({
	now: new Date("2026-09-18T06:00:00.000Z"),
	claimDueFeedSources: async () =>
		isEnabledFeedDue({
			enabled: true,
			nextDueAt: null,
			nowIso: "2026-09-18T06:00:00.000Z",
		})
			? [
					{
						id: "null-due",
						code: "n",
						market: "secondary",
						feedUrlRef: "FEED_N_URL",
						refreshIntervalMinutes: 60,
						nextDueAt: "2026-09-18T06:00:00.000Z",
						safetyThresholdPercent: 30,
						maxDeactivationsPerRun: 50,
						enabled: true,
					},
				]
			: [],
	createQueuedImportRun: async ({ feedSourceId }) => ({ id: `run-${feedSourceId}` }),
	enqueueImportFeed: async () => ({ id: "job-null" }),
	attachJobId: async () => undefined,
});
assert.equal(nullDueDispatch.dispatched.length, 1);

const importRuntime = readFileSync("src/core/ingest/import-feed-runtime.ts", "utf8");
const ownerFeed = readFileSync("src/core/ingest/owner-feed-operations.ts", "utf8");
assert.ok(
	importRuntime.includes("safetyThresholdPercent: source.safetyThresholdPercent"),
	"import runtime must use source safetyThresholdPercent",
);
assert.ok(
	importRuntime.includes("maxDeactivationsPerRun: source.maxDeactivationsPerRun"),
	"import runtime must use source maxDeactivationsPerRun",
);
assert.equal(
	ownerFeed.includes("safetyThresholdPercent: 0"),
	false,
	"manual import must not bypass safety knobs",
);
assert.ok(
	ownerFeed.includes('task: "importFeed"'),
	"manual import must enqueue the same importFeed job",
);

console.log("verify-feed-ingest: ok");

function createRepository() {
	const byId = new Map();
	const issues = [];
	const cacheInvalidations = [];
	const touched = [];
	const deactivated = [];

	return {
		byId,
		issues,
		cacheInvalidations,
		touched,
		deactivated,
		async findFeedProperty({ feedSourceId, externalId }) {
			return [...byId.values()].find(
				(record) =>
					record.feedSource === feedSourceId &&
					record.externalId === externalId,
			);
		},
		async createFeedProperty(data) {
			const record = {
				...data,
				id: `property-${byId.size + 1}`,
				slug: data.slug,
				manualOverrides: [],
			};
			byId.set(record.id, record);
			return record;
		},
		async updateFeedProperty(id, data) {
			const existing = byId.get(id);
			if (data.feedSource && data.feedSource !== existing.feedSource) {
				throw new Error("Feed ingest repository is source-scoped.");
			}
			const next = { ...existing, ...data };
			byId.set(id, next);
			return next;
		},
		async createImportIssue(issue) {
			issues.push(issue);
		},
		async touchLastSeenAt(input) {
			touched.push(input);
			for (const record of byId.values()) {
				if (
					record.feedSource === input.feedSourceId &&
					input.externalIds.includes(record.externalId)
				) {
					record.lastSeenAt = input.nowIso;
					record.lastImportRun = input.importRunId;
				}
			}
		},
		async countMissingActive({ feedSourceId, seenBeforeIso }) {
			return [...byId.values()].filter(
				(record) =>
					record.feedSource === feedSourceId &&
					record.status === "active" &&
					(!record.lastSeenAt || record.lastSeenAt < seenBeforeIso),
			).length;
		},
		async deactivateMissing({ feedSourceId, importRunId, seenBeforeIso, nowIso }) {
			let count = 0;
			for (const record of byId.values()) {
				if (
					record.feedSource === feedSourceId &&
					record.status === "active" &&
					(!record.lastSeenAt || record.lastSeenAt < seenBeforeIso)
				) {
					record.status = "archived";
					record.deactivatedAt = nowIso;
					record.deactivatedByRun = importRunId;
					count += 1;
				}
			}
			deactivated.push({ feedSourceId, importRunId, count });
			return count;
		},
		async invalidateCache(targets) {
			cacheInvalidations.push(targets);
		},
	};
}

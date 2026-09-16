import assert from "node:assert/strict";
import { ingestNormalizedFeed } from "../src/core/ingest/index.ts";

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
	{ type: "tag", tag: "catalog" },
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
assert.equal(sameRun.updatedCount, 1);
assert.equal(
	repository.byId.get("property-1").slug,
	"feed-source-a-external-1",
);

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

console.log("verify-feed-ingest: ok");

function createRepository() {
	const byId = new Map();
	const issues = [];
	const cacheInvalidations = [];

	return {
		byId,
		issues,
		cacheInvalidations,
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
			const next = { ...existing, ...data };
			byId.set(id, next);
			return next;
		},
		async createImportIssue(issue) {
			issues.push(issue);
		},
		async invalidateCache(targets) {
			cacheInvalidations.push(targets);
		},
	};
}

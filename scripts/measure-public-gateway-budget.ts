import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { dirname, resolve } from "node:path";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
	getListing,
	getPropertyByPublicUrlId,
} from "../src/project/data-access/public/geo-catalog.ts";

const warmupRequests = 5;
const measuredRequests = 35;
const listBudgetMs = 300;
const detailBudgetMs = 200;
const detailPublicUrlId = 100001;

function p95(values: readonly number[]): number {
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[Math.ceil(sorted.length * 0.95) - 1] ?? 0;
}

async function measure(operation: () => Promise<unknown>): Promise<number[]> {
	for (let index = 0; index < warmupRequests; index += 1) await operation();
	const timings: number[] = [];
	for (let index = 0; index < measuredRequests; index += 1) {
		const started = performance.now();
		await operation();
		timings.push(Number((performance.now() - started).toFixed(3)));
	}
	return timings;
}

const payload = await getPayload({ config });
try {
	const fixtureRows = await payload.count({
		collection: "properties",
		overrideAccess: true,
	});
	assert.ok(
		fixtureRows.totalDocs >= 1_900 && fixtureRows.totalDocs <= 2_100,
		`Expected a documented ~2k property fixture, received ${fixtureRows.totalDocs}.`,
	);

	const listOperation = async () => {
		const result = await getListing(payload, {
			geo: "primorsk",
			surface: "kvartiry",
			page: 1,
			query: { limit: 24 },
		}, "Starter benchmark");
		assert.ok(result && result.items.length > 0, "List benchmark returned no public rows.");
	};
	const detailOperation = async () => {
		const result = await getPropertyByPublicUrlId(payload, detailPublicUrlId);
		assert.ok(result, "Detail benchmark returned no public row.");
	};

	const listRawMs = await measure(listOperation);
	const detailRawMs = await measure(detailOperation);
	const listP95Ms = Number(p95(listRawMs).toFixed(3));
	const detailP95Ms = Number(p95(detailRawMs).toFixed(3));
	const evidence = {
		measuredAt: new Date().toISOString(),
		environment: {
			os: "Windows 11 native",
			node: process.version,
			postgresql: "18.6 native Windows service",
			fixture: `${fixtureRows.totalDocs} published property rows in an isolated local database`,
		},
		protocol: {
			warmupRequestsPerSurface: warmupRequests,
			measuredRequestsPerSurface: measuredRequests,
			sequence: "list warm-up and measurements, then detail warm-up and measurements",
			listQuery: "Public Gateway getListing: geo=primorsk, surface=kvartiry, page=1, limit=24",
			detailQuery: `Public Gateway getPropertyByPublicUrlId: publicUrlId=${detailPublicUrlId}`,
		},
		results: {
			list: { budgetMs: listBudgetMs, p95Ms: listP95Ms, rawMs: listRawMs },
			detail: { budgetMs: detailBudgetMs, p95Ms: detailP95Ms, rawMs: detailRawMs },
		},
	};

	assert.ok(listP95Ms <= listBudgetMs, `List p95 ${listP95Ms}ms exceeded ${listBudgetMs}ms.`);
	assert.ok(detailP95Ms <= detailBudgetMs, `Detail p95 ${detailP95Ms}ms exceeded ${detailBudgetMs}ms.`);
	const output = resolve("docs/evidence/plan9/S11_CACHE_BUDGET.json");
	await mkdir(dirname(output), { recursive: true });
	await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
	console.log(`Public Gateway budget PASS: list p95 ${listP95Ms}ms; detail p95 ${detailP95Ms}ms.`);
} finally {
	await payload.destroy();
}

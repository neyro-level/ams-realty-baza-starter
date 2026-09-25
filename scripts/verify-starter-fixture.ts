import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readDevelopmentWorkbook } from "../src/core/ingest/development-excel.ts";
import { generateStarterDevelopmentExcelSample } from "../src/project/fixture-data/development-excel-sample.ts";
import { starterFixtureDataset } from "../src/project/fixture-data/starter-dataset.ts";
import {
	resetStarterFixture,
	type StarterFixtureResetPort,
	type StarterFixtureSeedPort,
	seedStarterFixture,
} from "../src/project/fixture-data/starter-seed.ts";
import { geoHierarchyFixtures } from "../src/project/geo/fixtures.ts";
import { projectSeoRegistrySeed } from "../src/project/seo/registry-seed.ts";

const dataset = starterFixtureDataset;
assert.equal(dataset.identity.indexing, "noindex");
assert.equal(dataset.cities.length, 2);
const districts = dataset.cities.flatMap((city) =>
	city.districts.map(({ districtType, parent }) => ({
		districtType,
		parent,
	})),
);
assert.equal(districts.length, 4);
assert.equal(
	districts.filter((district) => district.districtType === "administrative")
		.length,
	2,
);
assert.equal(
	districts.filter(
		(district) =>
			district.districtType === "microdistrict" && district.parent === null,
	).length,
	1,
);
assert.equal(
	districts.filter((district) => district.parent !== null).length,
	1,
);
assert.equal(dataset.developers.length, 2);
assert.deepEqual(dataset.developments.map((item) => item.dataTier).sort(), [
	"A",
	"B",
	"C",
]);
assert.deepEqual(
	dataset.properties
		.filter((item) => item.market === "secondary")
		.map((item) => item.category)
		.sort(),
	["apartment", "house", "land"],
);
assert.equal(
	dataset.properties.filter((item) => item.market === "newbuild").length,
	2,
);
assert.strictEqual(geoHierarchyFixtures.region, dataset.region);
assert.strictEqual(geoHierarchyFixtures.cities, dataset.cities);

const workbooks = [
	await generateStarterDevelopmentExcelSample(),
	await readFile("fixtures/starter/developments.xlsx"),
];
for (const workbook of workbooks) {
	const parsed = await readDevelopmentWorkbook(workbook);
	assert.equal(parsed.Застройщики.length, dataset.developers.length);
	assert.equal(parsed.ЖК.length, dataset.developments.length);
	assert.equal(parsed.Цены.length, dataset.developments.length);
	assert.equal(parsed.Тексты.length, dataset.developments.length);
}

const records = new Map<
	string,
	{ id: number; data: Record<string, unknown> }
>();
let nextId = 1;
const port: StarterFixtureSeedPort = {
	async upsert({ collection, identity, data }) {
		const key = `${collection}:${identity.field}:${identity.value}`;
		const existing = records.get(key);
		if (!existing) {
			const created = { id: nextId++, data: structuredClone(data) };
			records.set(key, created);
			return { id: created.id, state: "created" };
		}
		if (JSON.stringify(existing.data) === JSON.stringify(data)) {
			return { id: existing.id, state: "unchanged" };
		}
		existing.data = structuredClone(data);
		return { id: existing.id, state: "updated" };
	},
};
const first = await seedStarterFixture(port);
const second = await seedStarterFixture(port);
assert.equal(first.created, 17);
assert.equal(first.updated, 0);
assert.equal(second.created, 0);
assert.equal(second.updated, 0);
assert.equal(second.unchanged, 17);

const resetPort: StarterFixtureResetPort = {
	async deleteOwned({ collection, identity, ownership }) {
		const key = `${collection}:${identity.field}:${identity.value}`;
		const existing = records.get(key);
		if (!existing) return "missing";
		if (existing.data[ownership.field] !== ownership.value) {
			throw new Error("Test reset encountered a non-owned record.");
		}
		records.delete(key);
		return "deleted";
	},
};
const reset = await resetStarterFixture(resetPort);
assert.equal(reset.deleted, 10);
assert.equal(reset.missing, 0);
assert.equal(reset.retainedGeoRecords, 7);
assert.equal(records.size, 7);
assert.ok(
	projectSeoRegistrySeed.some(
		(row) => row.entityRef === "development:severnyy-bereg",
	),
);
assert.ok(
	projectSeoRegistrySeed.every((row) => row.defaultRobots === "noindex,follow"),
);

console.log(
	"verify:starter-fixture passed (canonical dataset, Excel parity, idempotent seed, scoped reset, noindex)",
);

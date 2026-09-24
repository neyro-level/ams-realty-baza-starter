import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
	generateDevelopmentExcelTemplate,
	importDevelopmentExcel,
	createDevelopmentWorkbook,
} from "../src/core/ingest/development-excel.ts";
import { createPayloadDevelopmentExcelRepository } from "../src/core/data-access/system/development-excel-repository.ts";
import { systemOverrideAccess } from "../src/core/data-access/system/overrides.ts";

const databaseUri = process.env.DATABASE_URI;
if (!databaseUri || !new URL(databaseUri).pathname.endsWith("_test")) {
	throw new Error("verify:development-excel:integration requires an isolated local _test database.");
}
const payload = await getPayload({ config });
const access = systemOverrideAccess("system-job");
let regions = await payload.find({ collection: "regions", where: { slug: { equals: "p8-11-integration-region" } }, limit: 1, depth: 0, ...access });
if (!regions.docs[0]) {
	await payload.create({ collection: "regions", data: { slug: "p8-11-integration-region", title: "P8-11 Integration Region", morphology: { nominative: "Region", genitive: "Region", prepositional: "Region" }, shortName: "P8-11", sortOrder: 99, status: "draft" }, ...access });
	regions = await payload.find({ collection: "regions", where: { slug: { equals: "p8-11-integration-region" } }, limit: 1, depth: 0, ...access });
}
const region = regions.docs[0];
assert.ok(region);
let cities = await payload.find({ collection: "cities", where: { slug: { equals: "p8-11-integration-city" } }, limit: 1, depth: 0, ...access });
if (!cities.docs[0]) {
	await payload.create({ collection: "cities", data: { slug: "p8-11-integration-city", title: "P8-11 Integration City", morphology: { nominative: "City", genitive: "City", prepositional: "City" }, preposition: "v", cityType: "city", region: region.id, morphologyApproved: true, sortOrder: 99, status: "draft" }, ...access });
	cities = await payload.find({ collection: "cities", where: { slug: { equals: "p8-11-integration-city" } }, limit: 1, depth: 0, ...access });
}
const city = cities.docs[0];
assert.ok(city);

const workbook = await createDevelopmentWorkbook();
await workbook.xlsx.load((await generateDevelopmentExcelTemplate()) as never);
workbook.getWorksheet("Застройщики")?.addRow([
	"p8-11-integration-developer",
	"P8-11 Integration Developer",
	"",
	"",
	"",
	"Integration fixture",
	"draft",
	"2026-09-24T20:00:00.000Z",
]);
workbook.getWorksheet("ЖК")?.addRow([
	"development-1",
	"p8-11-integration-developer",
	"P8-11 Integration Development",
	"p8-11-integration-development",
	"residential_complex",
	region.slug,
	city.slug,
	"",
	"Integration address",
	"",
	"",
	"comfort",
	"ready",
	"",
	"available",
	"1 lot",
	"C",
	"draft",
	"2026-09-24T20:00:00.000Z",
]);
workbook.getWorksheet("Цены")?.addRow(["development-1", "from", "100000000", "RUB", "2026-09-24T20:00:00.000Z"]);
workbook.getWorksheet("Тексты")?.addRow(["development-1", "short", "Integration text", "2026-09-24T20:00:00.000Z"]);
const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
const repository = createPayloadDevelopmentExcelRepository(payload);
const common = { buffer, fileName: "p8-11-integration.xlsx", sourceKey: "p8-11-integration", repository };

const dryRun = await importDevelopmentExcel({ ...common, mode: "dry-run", now: new Date("2026-09-24T20:01:00.000Z") });
assert.equal(dryRun.errors, 0);
const applied = await importDevelopmentExcel({ ...common, mode: "apply", now: new Date("2026-09-24T20:02:00.000Z") });
assert.equal(applied.errors, 0);
const repeated = await importDevelopmentExcel({ ...common, mode: "dry-run", now: new Date("2026-09-24T20:03:00.000Z") });
assert.equal(repeated.created, 0);
assert.equal(repeated.changed, 0);
assert.equal(repeated.unchanged, 2);

const runs = await payload.find({ collection: "import-runs", where: { excelSourceKey: { equals: "p8-11-integration" } }, sort: "-createdAt", limit: 1, depth: 0, ...access });
assert.equal(runs.docs[0]?.sourceKind, "excel-developments");
assert.equal(runs.docs[0]?.feedSource, null);
assert.equal(runs.docs[0]?.feedHash, applied.workbookSha256);
console.log("verify:development-excel:integration: ok");
process.exit(0);

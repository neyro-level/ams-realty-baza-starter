import assert from "node:assert/strict";
import {
	createDevelopmentWorkbook,
	type DevelopmentExcelRepository,
	generateDevelopmentExcelTemplate,
	importDevelopmentExcel,
	readDevelopmentWorkbook,
} from "../src/core/ingest/development-excel.ts";
import { validateImportRunSourceIdentity } from "../src/project/collections/ImportRuns.ts";

const template = await generateDevelopmentExcelTemplate();
const opened = await readDevelopmentWorkbook(template);
assert.deepEqual(Object.keys(opened), ["Застройщики", "ЖК", "Цены", "Медиа", "Тексты"]);

const workbook = await createDevelopmentWorkbook();
await workbook.xlsx.load(template as never);
workbook.getWorksheet("Застройщики")?.addRow([
	"atlas-dev",
	"Атлас Девелопмент",
	"Атлас|Atlas",
	"ООО Атлас",
	"https://example.test",
	"Описание",
	"draft",
	"2026-09-24T18:00:00.000Z",
]);
workbook.getWorksheet("ЖК")?.addRow([
	"atlas-1",
	"atlas-dev",
	"ЖК Атлас",
	"atlas",
	"residential_complex",
	"luhanskaya-oblast",
	"luhansk",
	"",
	"ул. Тестовая, 1",
	"48.57",
	"39.31",
	"comfort",
	"ready",
	"2027-12-31T00:00:00.000Z",
	"available",
	"12 квартир",
	"A",
	"draft",
	"2026-09-24T18:00:00.000Z",
]);
workbook.getWorksheet("Цены")?.addRow(["atlas-1", "от", "550000000", "RUB", "2026-09-24T18:00:00.000Z"]);
workbook.getWorksheet("Тексты")?.addRow(["atlas-1", "short", "Короткое описание", "2026-09-24T18:00:00.000Z"]);
const fixture = Buffer.from(await workbook.xlsx.writeBuffer());

const developers = new Map<string, Record<string, unknown>>();
const developments = new Map<string, Record<string, unknown>>();
let nextId = 1;
let runId = 0;
const comparable = (value: Record<string, unknown>) => {
	const copy = structuredClone(value);
	delete copy.id;
	delete copy.lastImportRun;
	delete copy.developer;
	delete copy.developerSlug;
	return JSON.stringify(copy);
};
const repository: DevelopmentExcelRepository = {
	async inspectDeveloper(input) {
		const existing = developers.get(input.slug);
		return existing
			? { id: String(existing.id), state: comparable(existing) === comparable(input) ? "unchanged" : "changed" }
			: { state: "new" };
	},
	async inspectDevelopment({ sourceKey, externalId, data }) {
		const key = `${sourceKey}:${externalId}`;
		const existing = developments.get(key);
		return existing
			? { id: String(existing.id), state: comparable(existing) === comparable(data) ? "unchanged" : "changed" }
			: { state: "new" };
	},
	async resolveGeo() {
		return { region: "1", city: "2" };
	},
	async mediaExists() {
		return true;
	},
	async createImportRun() {
		runId += 1;
		return runId;
	},
	async upsertDeveloper(id, input) {
		const entityId = id ?? String(nextId++);
		developers.set(input.slug, { ...input, id: entityId });
		return entityId;
	},
	async upsertDevelopment(id, input) {
		const entityId = id ?? String(nextId++);
		const identity = input.externalIdentities[0];
		developments.set(`${identity.source.replace("excel-developments:", "")}:${identity.externalId}`, { ...input, id: entityId });
		return entityId;
	},
	async recordIssue() {},
	async finishImportRun() {},
};

const dryRun = await importDevelopmentExcel({ buffer: fixture, fileName: "fixture.xlsx", sourceKey: "fixture", mode: "dry-run", now: new Date("2026-09-24T19:00:00.000Z"), repository });
assert.equal(dryRun.created, 2);
assert.equal(dryRun.errors, 0);

const applied = await importDevelopmentExcel({ buffer: fixture, fileName: "fixture.xlsx", sourceKey: "fixture", mode: "apply", now: new Date("2026-09-24T19:01:00.000Z"), repository });
assert.equal(applied.created, 2);
assert.equal(developers.size, 1);
assert.equal(developments.size, 1);

const repeated = await importDevelopmentExcel({ buffer: fixture, fileName: "fixture.xlsx", sourceKey: "fixture", mode: "dry-run", now: new Date("2026-09-24T19:02:00.000Z"), repository });
assert.equal(repeated.created, 0);
assert.equal(repeated.changed, 0);
assert.equal(repeated.unchanged, 2);

const enumCell = workbook.getWorksheet("ЖК")?.getCell("E2");
assert.equal(enumCell?.dataValidation.type, "list");
assert.throws(() => validateImportRunSourceIdentity({ sourceKind: "yrl-feed", excelSourceKey: "invalid" }), /requires feedSource/);
assert.throws(() => validateImportRunSourceIdentity({ sourceKind: "excel-developments", feedSource: 1, excelSourceKey: "fixture" }), /forbids feedSource/);
assert.equal(validateImportRunSourceIdentity({ feedSource: 1 }).sourceKind, "yrl-feed");

const collisionRepository: DevelopmentExcelRepository = {
	...repository,
	async inspectDevelopment() {
		return { state: "new", collision: true };
	},
};
const collision = await importDevelopmentExcel({ buffer: fixture, fileName: "fixture.xlsx", sourceKey: "collision", mode: "dry-run", now: new Date("2026-09-24T19:03:00.000Z"), repository: collisionRepository });
assert.equal(collision.collisions, 1);
assert.equal(collision.errors, 1);

await assert.rejects(() => readDevelopmentWorkbook(Buffer.alloc(10 * 1024 * 1024 + 1)), /exceeds/);
console.log("verify:development-excel: ok");

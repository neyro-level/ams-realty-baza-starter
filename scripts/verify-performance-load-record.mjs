import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const record = readFileSync(
	"docs/evidence/plan12/E10_T6_PERFORMANCE_LOAD.md",
	"utf8",
);
const plan = readFileSync(
	"docs/AMS_REALTY_BAZA_STARTER_FINAL_COMMERCIAL_FREEZE_MASTER_PLAN_V2_0.md",
	"utf8",
);
const cache = readFileSync(
	"src/project/routing/filtered-catalog-cache.ts",
	"utf8",
);
const historical = JSON.parse(
	readFileSync("docs/evidence/plan10/B2_PUBLIC_GATEWAY_BUDGET.json", "utf8"),
);

assert.match(plan, /OD12-02 — Isolated query-load proof waiver/);
for (const required of [
	"Catalog clean path p95",
	"Property detail p95",
	"1000 unique filter-query protection test",
	"Memory behavior",
	"DB query behavior",
	"LCP / CLS",
	"NO PERFORMANCE PASS",
]) {
	assert.ok(
		record.includes(required),
		`performance record missing: ${required}`,
	);
}
assert.match(record, /Property detail p95 \| `NOT_MEASURED`/);
assert.match(
	record,
	/1000 unique filter-query protection test \| `PASS` for the in-runtime bounded cache/,
);
assert.match(record, /DB query behavior \| `NOT_MEASURED`/);
assert.equal(historical.results.read.p95Ms, 64.793);
for (const bound of [
	"FILTERED_CATALOG_CACHE_MAX_ENTRIES = 64",
	"FILTERED_CATALOG_CACHE_TTL_MS = 20_000",
	"FILTERED_CATALOG_CACHE_MAX_ENTRY_BYTES = 64 * 1024",
	"FILTERED_CATALOG_CACHE_MAX_TOTAL_BYTES = 2 * 1024 * 1024",
]) {
	assert.ok(cache.includes(bound), `bounded-cache contract missing: ${bound}`);
}

console.log(
	"performance/load record PASS (LIMITED): OD12-02 honored; no current p95, DB, RSS, LCP or CLS claim.",
);

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateRegistryCsv } from "./seo-registry.ts";
import {
	assertSeoRegistry,
	formatRussianPlural,
	type SeoRegistryRow,
} from "../src/core/seo/registry.ts";
import { fixtureDistrictRouteRegistryFor } from "../src/fixture/route-registries.ts";
import { projectSeoRegistrySeed } from "../src/project/seo/registry-seed.ts";
import {
	projectSeoTemplateKeys,
	renderProjectSeoTemplate,
} from "../src/project/seo/templates.ts";
import { siteProfileFixtures } from "../src/project/site-profile.ts";
import { createProjectUrlGrammar } from "../src/project/url-grammar.ts";

const grammar = createProjectUrlGrammar(
	siteProfileFixtures.multiGeo,
	fixtureDistrictRouteRegistryFor(siteProfileFixtures.multiGeo),
);
const now = new Date("2026-09-24T12:00:00.000Z");
const csvSource = readFileSync("docs/seo/SEO_REGISTRY_SEED.csv", "utf8");
const csvRows = validateRegistryCsv(csvSource);
assert.deepEqual(csvRows, projectSeoRegistrySeed);

const [csvHeader, homeCsvRow] = csvSource.split(/\r?\n/);
assert.ok(csvHeader && homeCsvRow);

for (const [name, profile] of Object.entries(siteProfileFixtures)) {
	const [profileRow] = validateRegistryCsv(`${csvHeader}\n${homeCsvRow}\n`);
	assert.ok(profileRow);
	const profileGrammar = createProjectUrlGrammar(
		profile,
		fixtureDistrictRouteRegistryFor(profile),
	);
	assert.doesNotThrow(
		() =>
			assertSeoRegistry({
				rows: [{ ...profileRow, targetPhrases: [`${name} home intent`] }],
				buildUrl: profileGrammar.buildUrl,
				now,
			}),
		`${name} CSV fixture`,
	);
}

const duplicateCsv = `${csvSource.trimEnd()}\n${csvSource.split(/\r?\n/)[1]}\n`;
assert.throws(() => validateRegistryCsv('"unterminated'), /unterminated quoted field/);
assert.throws(
	() => validateRegistryCsv(csvSource.replace("pageKey,url,canonical", "url,pageKey,canonical")),
	/columns or order differ/,
);
assert.throws(() => validateRegistryCsv(duplicateCsv), /Duplicate SEO URL|Duplicate SEO intent/);
assert.throws(
	() => validateRegistryCsv(csvSource.replace('"","fallback_no_data"', '"1","fallback_no_data"')),
	/must keep value null/,
);
assert.throws(
	() => validateRegistryCsv(csvSource.replace('"draft","true","starter-v2.1.0"', '"approved","true","starter-v2.1.0"')),
	/Synthetic SEO row cannot be approved/,
);
assert.throws(
	() => validateRegistryCsv(csvSource.replace('"draft","true","starter-v2.1.0","listing"', '"unknown","true","starter-v2.1.0","listing"')),
	/Unsupported SEO registry status/,
);
assert.throws(
	() => validateRegistryCsv(csvSource.replace('"noindex,follow","home"', '"unknown","home"')),
	/Unsupported SEO robots directive/,
);
assert.throws(
	() => validateRegistryCsv(csvSource.replace('"starter-v2.1.0","listing"', '"starter-v2.1.0","unknown"')),
	/Unsupported contentGateRule/,
);

assertSeoRegistry({
	rows: projectSeoRegistrySeed,
	buildUrl: grammar.buildUrl,
	now,
});
assert.deepEqual(
	new Set(projectSeoRegistrySeed.map((row) => row.templateKey)),
	new Set(projectSeoTemplateKeys),
);
assert.ok(
	projectSeoRegistrySeed.every(
		(row) =>
			row.synthetic &&
			row.source === "fallback_no_data" &&
			row.value === null &&
			row.status === "draft" &&
			row.defaultRobots === "noindex,follow",
	),
);

const withoutOptionals = renderProjectSeoTemplate("property", {
	brand: "AMS Realty",
	entityName: "Квартира",
});
assert.equal(withoutOptionals.h1, "Квартира");
assert.equal(withoutOptionals.description, "Квартира");
assert.ok(!withoutOptionals.description.includes("undefined"));
assert.ok(!withoutOptionals.description.includes("—"));

const stalePrice = renderProjectSeoTemplate("developmentNormal", {
	brand: "AMS Realty",
	entityName: "ЖК «Тест»",
	freshPrice: { label: "от 1 млн ₽", fresh: false },
});
assert.equal(stalePrice.description, "ЖК «Тест»");

const unapproved = renderProjectSeoTemplate("categoryGeo", {
	brand: "AMS Realty",
	category: "Квартиры",
	city: {
		approved: false,
		nominative: "Тестоград",
		genitive: "Тестограда",
		prepositional: "Тестограде",
		preposition: "в",
	},
});
assert.equal(unapproved.morphologyApproved, false);

const geoHubSnapshot = renderProjectSeoTemplate("geoHub", {
	brand: "AMS Realty",
	city: {
		approved: true,
		nominative: "Ростов-на-Дону",
		genitive: "Ростова-на-Дону",
		prepositional: "Ростове-на-Дону",
		preposition: "в",
	},
	inventory: 21,
});
assert.equal(
	geoHubSnapshot.description,
	"Квартиры, дома и новостройки в Ростове-на-Дону — 21 объект.",
);

const districtSnapshot = renderProjectSeoTemplate("categoryGeoDistrict", {
	brand: "AMS Realty",
	category: "Квартиры",
	city: {
		approved: true,
		nominative: "Ростов-на-Дону",
		genitive: "Ростова-на-Дону",
		prepositional: "Ростове-на-Дону",
		preposition: "в",
	},
	district: {
		approved: true,
		nominative: "Северный",
		genitive: "Северного",
		prepositional: "Северном",
		preposition: "на",
	},
	districtType: "microdistrict",
	inventory: 22,
});
assert.equal(
	districtSnapshot.h1,
	"Квартиры на Северном в Ростове-на-Дону",
);
assert.equal(
	districtSnapshot.description,
	"Квартиры на Северном в Ростове-на-Дону — актуальные предложения. 22 объекта.",
);
assert.deepEqual(
	[1, 2, 5, 11, 21, 24].map((value) =>
		formatRussianPlural(value, ["объект", "объекта", "объектов"]),
	),
	["1 объект", "2 объекта", "5 объектов", "11 объектов", "21 объект", "24 объекта"],
);

const base = projectSeoRegistrySeed[0];
assert.ok(base);
function rejects(row: SeoRegistryRow, pattern: RegExp): void {
	assert.throws(
		() => assertSeoRegistry({ rows: [row], buildUrl: grammar.buildUrl, now }),
		pattern,
	);
}

rejects({ ...base, url: "/wrong/" }, /differs from buildUrl/);
rejects({ ...base, canonical: "/wrong/" }, /canonical differs/);
rejects({ ...base, snapshotDate: "2026-02-30" }, /date is invalid/);
rejects({ ...base, snapshotDate: "2026-09-25" }, /future/);
rejects({ ...base, value: 0 }, /must keep value null/);
rejects({ ...base, source: "wordstat", value: null }, /non-negative value/);
rejects(
	{ ...base, source: "unknown" as SeoRegistryRow["source"] },
	/Unsupported SEO evidence source/,
);
rejects(
	{ ...base, tier: "P3" as SeoRegistryRow["tier"] },
	/Unsupported SEO tier/,
);
assert.doesNotThrow(() =>
	assertSeoRegistry({
		rows: [{ ...base, tier: "NONE" }],
		buildUrl: grammar.buildUrl,
		now,
	}),
);
rejects(
	{ ...base, morphologyApproved: false, defaultRobots: "index,follow" },
	/Unapproved morphology/,
);
rejects(
	{ ...base, status: "approved" },
	/Synthetic SEO row cannot be approved/,
);

const second = projectSeoRegistrySeed[1];
assert.ok(second);
assert.throws(
	() =>
		assertSeoRegistry({
			rows: [base, { ...second, targetPhrases: base.targetPhrases }],
			buildUrl: grammar.buildUrl,
			now,
		}),
	/Duplicate SEO intent/,
);
assert.throws(
	() =>
		assertSeoRegistry({
			rows: [base, { ...second, url: base.url }],
			buildUrl: grammar.buildUrl,
			now,
		}),
	/differs from buildUrl|Duplicate SEO URL/,
);
assert.throws(
	() =>
		assertSeoRegistry({
			rows: [base, { ...second, canonical: base.canonical }],
			buildUrl: grammar.buildUrl,
			now,
		}),
	/canonical differs|Duplicate SEO canonical/,
);

console.log(
	"verify:seo-registry passed (source/date/value, URL/canonical/intent, morphology and optional fragments)",
);

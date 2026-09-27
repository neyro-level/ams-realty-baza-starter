import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	readClonePreset,
	siteProfileConfigForPreset,
} from "./clone-preset.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const referencePath = resolve(root, "docs/reference/SOUZ_MATRIX.json");
const presetPath = resolve(root, "docs/CLONE_PRESET.souz.example.json");
const driftFixturePath = resolve(
	root,
	"scripts/fixtures/souz-parity-drift.json",
);

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertSubset(actual, expected, path = "") {
	if (Array.isArray(expected)) {
		assert.ok(Array.isArray(actual), `${path || "/"} must be an array`);
		assert.ok(
			actual.length >= expected.length,
			`${path || "/"} requires at least ${expected.length} items`,
		);
		for (const [index, value] of expected.entries()) {
			assertSubset(actual[index], value, `${path}/${index}`);
		}
		return;
	}
	if (isRecord(expected)) {
		assert.ok(isRecord(actual), `${path || "/"} must be an object`);
		for (const [key, value] of Object.entries(expected)) {
			assert.ok(Object.hasOwn(actual, key), `${path || "/"} is missing ${key}`);
			assertSubset(actual[key], value, `${path}/${key}`);
		}
		return;
	}
	assert.deepEqual(actual, expected, path || "/");
}

function collectLeafPaths(value, path = "") {
	if (Array.isArray(value)) {
		if (value.length === 0) return [path];
		return value.flatMap((item, index) =>
			collectLeafPaths(item, `${path}/${index}`),
		);
	}
	if (isRecord(value)) {
		const entries = Object.entries(value);
		if (entries.length === 0) return [path];
		return entries.flatMap(([key, item]) =>
			collectLeafPaths(item, `${path}/${key}`),
		);
	}
	return [path];
}

function referencedSections(reference) {
	const known = new Set(Object.keys(reference.source.sections));
	const used = new Set();
	for (const [sectionId, section] of Object.entries(
		reference.source.sections,
	)) {
		assert.equal(typeof section.heading, "string", `${sectionId} heading`);
		if (sectionId.startsWith("SOUZ-")) {
			assert.match(
				section.sourceLines,
				/^\d+-\d+$/,
				`${sectionId} sourceLines`,
			);
		} else {
			assert.equal(typeof section.decision, "string", `${sectionId} decision`);
		}
	}
	for (const refs of Object.values(reference.fieldSources)) {
		for (const ref of refs) {
			assert.ok(known.has(ref), `Unknown field source reference: ${ref}`);
			used.add(ref);
		}
	}
	for (const group of Object.values(reference.constraints)) {
		for (const rule of group) {
			for (const ref of rule.sources) {
				assert.ok(
					known.has(ref),
					`Unknown constraint source reference: ${ref}`,
				);
				used.add(ref);
			}
		}
	}
	for (const required of reference.source.requiredSections) {
		assert.ok(
			known.has(required),
			`Required source section is missing: ${required}`,
		);
		assert.ok(
			used.has(required),
			`Required source section is not used: ${required}`,
		);
	}
	for (const section of known) {
		assert.ok(
			used.has(section),
			`Source section has no guarded field: ${section}`,
		);
	}
	return known;
}

function assertEveryFieldHasSource(reference) {
	const sourcePrefixes = Object.keys(reference.fieldSources).sort(
		(left, right) => right.length - left.length,
	);
	for (const path of collectLeafPaths(reference.expectedPreset)) {
		const owner = sourcePrefixes.find(
			(prefix) => path === prefix || path.startsWith(`${prefix}/`),
		);
		assert.ok(owner, `Reference field has no source section: ${path}`);
	}
}

function assertNoPlaceholders(value, path = "preset") {
	if (typeof value === "string") {
		assert.doesNotMatch(
			value,
			/\b(?:TODO|TBD|NEEDS_OWNER|PLACEHOLDER)\b|<[^>]+>|\$\{[^}]+\}/i,
			`Unresolved placeholder at ${path}`,
		);
		return;
	}
	if (Array.isArray(value)) {
		for (const [index, item] of value.entries()) {
			assertNoPlaceholders(item, `${path}[${index}]`);
		}
		return;
	}
	if (isRecord(value)) {
		for (const [key, item] of Object.entries(value)) {
			assertNoPlaceholders(item, `${path}.${key}`);
		}
	}
}

function assertConstraints(reference, preset) {
	for (const rule of reference.constraints.forbiddenStaticRoutes) {
		assert.equal(
			preset.staticRoutes.some((route) => route.path === rule.path),
			false,
			`Forbidden static route is present: ${rule.path}`,
		);
	}
	for (const rule of reference.constraints.requiredLegacyRoutes) {
		assert.equal(
			rule.sourceFrom,
			`${rule.from}/`,
			"Legacy source URL must retain the source trailing slash",
		);
		assert.notEqual(rule.from, rule.to, "Legacy redirect must be one-hop");
		assert.ok(
			preset.legacyRoutes.some(
				(route) =>
					route.from === rule.from &&
					route.to === rule.to &&
					route.statusCode === rule.statusCode,
			),
			`Required legacy route is missing: ${rule.from}`,
		);
	}
	for (const rule of reference.constraints.forbiddenPreparedCategories) {
		assert.equal(
			preset.categoryStatus[rule.category],
			"OUT",
			`${rule.category} must be OUT globally`,
		);
		for (const [geo, matrix] of Object.entries(preset.geoCategoryStatus)) {
			assert.equal(
				matrix[rule.category],
				"OUT",
				`${rule.category} must be OUT for ${geo}`,
			);
		}
	}
}

function verifyParity(reference, preset) {
	assertSubset(preset, reference.expectedPreset);
	assertConstraints(reference, preset);
	assertNoPlaceholders(preset);
}

function applyMutation(target, mutation) {
	const segments = mutation.path
		.split("/")
		.slice(1)
		.map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
	let cursor = target;
	for (const segment of segments.slice(0, -1)) {
		cursor = cursor[segment];
	}
	const leaf = segments.at(-1);
	if (leaf === "-") {
		assert.ok(Array.isArray(cursor), `${mutation.path} must target an array`);
		cursor.push(mutation.value);
		return;
	}
	cursor[leaf] = mutation.value;
}

function verifyNegativeFixtures(reference, preset, fixture) {
	assert.equal(fixture.schemaVersion, 1);
	assert.ok(fixture.cases.length > 0, "Negative drift fixture is empty");
	for (const testCase of fixture.cases) {
		const candidate = structuredClone(preset);
		applyMutation(candidate, testCase);
		assert.throws(
			() => verifyParity(reference, candidate),
			undefined,
			`Drift fixture did not fail: ${testCase.name}`,
		);
	}
}

const reference = readJson(referencePath);
const rawPreset = readJson(presetPath);
const driftFixture = readJson(driftFixturePath);

assert.equal(reference.schemaVersion, 1);
assert.equal(
	reference.source.planId,
	"AMS-SOUZ-HOME-GEO-CATALOG-PLATFORM-BUILD",
);
assert.equal(reference.source.version, "4.1.1 FINAL");
referencedSections(reference);
assertEveryFieldHasSource(reference);
verifyParity(reference, rawPreset);

const parsedPreset = readClonePreset(presetPath);
const acceptedProfile = siteProfileConfigForPreset(parsedPreset);
assert.equal(acceptedProfile.primaryGeo, "rostov-na-donu");
assert.equal(acceptedProfile.categoryStatus.komnaty, "OUT");
assert.equal(acceptedProfile.categoryStatus.garazhi, "OUT");
assert.equal(acceptedProfile.categoryStatus.arenda, "OUT");

verifyNegativeFixtures(reference, rawPreset, driftFixture);

console.log(
	`verify:souz-parity PASS (${collectLeafPaths(reference.expectedPreset).length} guarded reference fields, ${Object.keys(reference.source.sections).length} source sections, ${driftFixture.cases.length} negative drift cases)`,
);

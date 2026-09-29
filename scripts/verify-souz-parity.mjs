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
			const hasLineRange = /^\d+-\d+$/.test(section.sourceLines ?? "");
			const hasExactSection =
				typeof section.sourceSection === "string" &&
				section.sourceSection.length > 0;
			assert.ok(
				hasLineRange || hasExactSection,
				`${sectionId} requires sourceLines or sourceSection`,
			);
		} else {
			assert.equal(typeof section.decision, "string", `${sectionId} decision`);
		}
	}
	for (const refs of Object.values(reference.scopeSources)) {
		for (const ref of refs) {
			assert.ok(known.has(ref), `Unknown scope source reference: ${ref}`);
			used.add(ref);
		}
	}
	for (const [behavior, coverage] of Object.entries(
		reference.behaviorCoverage,
	)) {
		assert.equal(typeof coverage.claim, "string", `${behavior} claim`);
		assert.ok(coverage.claim.length > 0, `${behavior} claim is empty`);
		assert.ok(coverage.sources.length > 0, `${behavior} sources are empty`);
		for (const ref of coverage.sources) {
			assert.ok(known.has(ref), `Unknown behavior source reference: ${ref}`);
			used.add(ref);
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

function assertReferenceScope(reference) {
	assert.equal(reference.referenceScope.classification, "sourceBackedSubset");
	assert.equal(reference.referenceScope.completeRealClientGeoParity, false);
	assert.equal(reference.referenceScope.representedBehaviorsOnly, true);

	const sourcePrefixes = Object.keys(reference.scopeSources).sort(
		(left, right) => right.length - left.length,
	);
	for (const path of collectLeafPaths(reference.referenceScope)) {
		const owner = sourcePrefixes.find(
			(prefix) => path === prefix || path.startsWith(`${prefix}/`),
		);
		assert.ok(owner, `Reference scope field has no source: ${path}`);
	}

	assert.deepEqual(Object.keys(reference.behaviorCoverage).sort(), [
		"activeRouteSkeleton",
		"apartmentDistrictPageTiers",
		"canonicalMetadataTemplates",
		"legacyMigrationPolicy",
		"moduleAndJournalRequirements",
		"projectConfig",
		"r1PageResponsibilityMatrix",
		"representedDistrictSubset",
	]);
}

function assertDistrictSeoClassification(reference) {
	const matrix = reference.districtSeoClassification;
	assert.deepEqual(matrix.policy.allowed, ["P1", "P2", "TEST", "filter-only"]);
	assert.equal(matrix.policy.publishFromRecordExistence, false);
	assert.equal(matrix.policy.unverifiedTierFallback, "filter-only");
	for (const ref of matrix.policy.sources) {
		assert.ok(Object.hasOwn(reference.source.sections, ref));
	}

	const entries = Object.entries(matrix).filter(([key]) => key !== "policy");
	assert.deepEqual(
		entries.map(([key]) => key),
		[
			"rostov-na-donu/leninskiy",
			"rostov-na-donu/voroshilovskiy",
			"rostov-na-donu/severnyy",
			"rostov-na-donu/tsentr",
		],
	);
	for (const [key, entry] of entries) {
		assert.equal(entry.classification, "filter-only", `${key} classification`);
		assert.equal(entry.publicationClaim, false, `${key} publicationClaim`);
		assert.ok(entry.sources.length > 0, `${key} sources`);
		for (const ref of entry.sources) {
			assert.ok(Object.hasOwn(reference.source.sections, ref));
		}
	}
}

function assertStaticServiceSurfaces(reference) {
	const contract = reference.staticServiceSurfaces;
	const activeByKey = new Map(
		contract.active.map((surface) => [surface.key, surface]),
	);
	assert.deepEqual(
		[...activeByKey.keys()],
		[
			"home",
			"geoHub",
			"newbuild",
			"apartments",
			"developers",
			"mortgage",
			"sell",
			"about",
			"reviews",
			"contacts",
			"privacy",
			"consent",
		],
	);
	assert.equal(activeByKey.get("reviews").path, "/otzyvy");
	assert.equal(
		contract.active.some(({ path }) => path === "/uslugi"),
		false,
		"/uslugi must not replace /otzyvy",
	);
	assert.deepEqual(contract.legacyDecisions, [
		{ path: "/uslugi", decision: "REVIEW", sources: ["SOUZ-20"] },
	]);
	for (const surface of [...contract.active, ...contract.legacyDecisions]) {
		assert.ok(surface.sources.length > 0, `${surface.path} sources`);
		for (const ref of surface.sources) {
			assert.ok(Object.hasOwn(reference.source.sections, ref));
		}
	}
}

function assertJournalContract(reference) {
	assert.deepEqual(reference.journalContract, {
		souzR1: "activation-required-before-R1",
		genericStarterDefault: "optional",
		requiredRoutes: [
			"/journal/",
			"/journal/category/{slug}/",
			"/journal/{slug}/",
		],
		sources: ["SOUZ-MODULE-JOURNAL", "SOUZ-30"],
	});
	for (const ref of reference.journalContract.sources) {
		assert.ok(Object.hasOwn(reference.source.sections, ref));
	}
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
assertReferenceScope(reference);
assertDistrictSeoClassification(reference);
assertStaticServiceSurfaces(reference);
assertJournalContract(reference);
assertEveryFieldHasSource(reference);
verifyParity(reference, rawPreset);

const inflatedReference = structuredClone(reference);
inflatedReference.referenceScope.classification = "completeRealClientGeoParity";
inflatedReference.referenceScope.completeRealClientGeoParity = true;
assert.throws(
	() => assertReferenceScope(inflatedReference),
	undefined,
	"Reference matrix must reject a complete real-client parity claim",
);

const unbackedReference = structuredClone(reference);
unbackedReference.behaviorCoverage.activeRouteSkeleton.sources = [];
assert.throws(
	() => referencedSections(unbackedReference),
	undefined,
	"Reference matrix must reject a behavior without source coverage",
);

const inferredDistrictPage = structuredClone(reference);
inferredDistrictPage.districtSeoClassification["rostov-na-donu/leninskiy"] = {
	classification: "P1",
	publicationClaim: true,
	sources: [],
};
assert.throws(
	() => assertDistrictSeoClassification(inferredDistrictPage),
	undefined,
	"Souz district existence must not infer page publication",
);

const servicesInsteadOfReviews = structuredClone(reference);
servicesInsteadOfReviews.staticServiceSurfaces.active.find(
	({ key }) => key === "reviews",
).path = "/uslugi";
assert.throws(
	() => assertStaticServiceSurfaces(servicesInsteadOfReviews),
	undefined,
	"/uslugi must not silently replace /otzyvy",
);

const missingReviews = structuredClone(reference);
missingReviews.staticServiceSurfaces.active =
	missingReviews.staticServiceSurfaces.active.filter(
		({ key }) => key !== "reviews",
	);
assert.throws(
	() => assertStaticServiceSurfaces(missingReviews),
	undefined,
	"Missing /otzyvy must fail",
);

const missingJournal = structuredClone(reference);
delete missingJournal.journalContract;
assert.throws(
	() => assertJournalContract(missingJournal),
	undefined,
	"Missing journal activation requirement must fail",
);

const parsedPreset = readClonePreset(presetPath);
const acceptedProfile = siteProfileConfigForPreset(parsedPreset);
assert.equal(acceptedProfile.primaryGeo, "rostov-na-donu");
assert.equal(acceptedProfile.categoryStatus.komnaty, "OUT");
assert.equal(acceptedProfile.categoryStatus.garazhi, "OUT");
assert.equal(acceptedProfile.categoryStatus.arenda, "OUT");

verifyNegativeFixtures(reference, rawPreset, driftFixture);

console.log(
	`verify:souz-parity PASS (${collectLeafPaths(reference.expectedPreset).length} guarded reference fields, ${Object.keys(reference.source.sections).length} source sections, ${Object.keys(reference.behaviorCoverage).length} covered behaviors, 4 fail-closed district classifications, 12 active/service surfaces, journal activation guarded, ${driftFixture.cases.length + 6} negative drift cases)`,
);

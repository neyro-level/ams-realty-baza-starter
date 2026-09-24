import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "../../payload.config.ts";
import { systemOverrideAccess } from "../../src/core/data-access/system/overrides.ts";
import { requirePayloadRuntime } from "../../src/project/env.ts";
import { geoHierarchyFixtures } from "../../src/project/geo/fixtures.ts";

requirePayloadRuntime();

const payload = await getPayload({ config });
const access = systemOverrideAccess("system-job");
const now = "2026-09-24T12:00:00.000Z";
const relationId = (value: unknown) =>
	value && typeof value === "object" && "id" in value
		? String((value as { id: string | number }).id)
		: String(value);

await assert.rejects(
	() =>
		payload.find({
			collection: "regions",
			overrideAccess: false,
			user: null,
			limit: 1,
		}),
	"raw geo collections stay private",
);

const region = await payload.create({
	collection: "regions",
	data: {
		...geoHierarchyFixtures.region,
		status: "published",
		publishedAt: now,
	},
	...access,
});

const primaryFixture = geoHierarchyFixtures.cities[0];
const nearbyFixture = geoHierarchyFixtures.cities[1];
const primary = await payload.create({
	collection: "cities",
	data: {
		slug: primaryFixture.slug,
		title: primaryFixture.title,
		morphology: primaryFixture.morphology,
		preposition: primaryFixture.preposition,
		cityType: primaryFixture.cityType,
		morphologyApproved: primaryFixture.morphologyApproved,
		sortOrder: primaryFixture.sortOrder,
		region: region.id,
		status: "published",
		publishedAt: now,
	},
	...access,
});
const nearby = await payload.create({
	collection: "cities",
	data: {
		slug: nearbyFixture.slug,
		title: nearbyFixture.title,
		morphology: nearbyFixture.morphology,
		preposition: nearbyFixture.preposition,
		cityType: nearbyFixture.cityType,
		morphologyApproved: nearbyFixture.morphologyApproved,
		sortOrder: nearbyFixture.sortOrder,
		region: region.id,
		agglomerationOf: primary.id,
		status: "published",
		publishedAt: now,
	},
	...access,
});

const primaryDistrictFixture = primaryFixture.districts[0];
const siblingDistrictFixture = primaryFixture.districts[1];
const nearbyDistrictFixture = nearbyFixture.districts[0];
const mutableDistrictFixture = <
	T extends { synonyms: readonly { value: string }[] },
>(
	fixture: T,
) => ({
	...fixture,
	synonyms: fixture.synonyms.map(({ value }) => ({ value })),
});
const primaryDistrict = await payload.create({
	collection: "districts",
	data: {
		...mutableDistrictFixture(primaryDistrictFixture),
		city: primary.id,
		status: "published",
		publishedAt: now,
	},
	...access,
});
const siblingDistrict = await payload.create({
	collection: "districts",
	data: {
		...mutableDistrictFixture(siblingDistrictFixture),
		city: primary.id,
		status: "published",
		publishedAt: now,
	},
	...access,
});
const nearbyDistrict = await payload.create({
	collection: "districts",
	data: {
		...mutableDistrictFixture(nearbyDistrictFixture),
		city: nearby.id,
		status: "published",
		publishedAt: now,
	},
	...access,
});
assert.equal(relationId(primaryDistrict.city), String(primary.id));
assert.equal(relationId(nearbyDistrict.city), String(nearby.id));
assert.equal(primaryDistrict.parent, null);
assert.equal(primaryDistrict.preposition, "na");

await payload.update({
	collection: "districts",
	id: siblingDistrict.id,
	data: { parent: primaryDistrict.id },
	...access,
});
await assert.rejects(
	() =>
		payload.update({
			collection: "districts",
			id: primaryDistrict.id,
			data: { parent: siblingDistrict.id },
			...access,
		}),
	/cycle/i,
);

await assert.rejects(
	() =>
		payload.create({
			collection: "cities",
			data: {
				slug: geoHierarchyFixtures.region.slug,
				title: "Root collision",
				morphology: primaryFixture.morphology,
				preposition: primaryFixture.preposition,
				cityType: primaryFixture.cityType,
				morphologyApproved: true,
				sortOrder: 99,
				region: region.id,
				status: "draft",
			},
			...access,
		}),
	/already owned/i,
);
await assert.rejects(
	() =>
		payload.create({
			collection: "cities",
			data: {
				slug: "novostroyki",
				title: "Reserved collision",
				morphology: primaryFixture.morphology,
				preposition: primaryFixture.preposition,
				cityType: primaryFixture.cityType,
				morphologyApproved: true,
				sortOrder: 99,
				region: region.id,
				status: "draft",
			},
			...access,
		}),
	/reserved namespace/i,
);
await assert.rejects(
	() =>
		payload.create({
			collection: "districts",
			data: {
				...mutableDistrictFixture(primaryDistrictFixture),
				title: "Duplicate district",
				city: primary.id,
				status: "draft",
			},
			...access,
		}),
	/already owned/i,
);
await assert.rejects(
	() =>
		payload.create({
			collection: "districts",
			data: {
				slug: "dvukhkomnatnye",
				title: "Facet collision",
				morphology: primaryFixture.morphology,
				districtType: "microdistrict",
				preposition: "na",
				morphologyApproved: true,
				sortOrder: 99,
				city: primary.id,
				status: "draft",
			},
			...access,
		}),
	/reserved namespace/i,
);
await assert.rejects(
	() =>
		payload.update({
			collection: "cities",
			id: primary.id,
			data: { agglomerationOf: nearby.id },
			...access,
		}),
	/cycle/i,
);

const secondRegion = await payload.create({
	collection: "regions",
	data: {
		slug: "vostochnaya-oblast",
		title: "Восточная область",
		morphology: {
			nominative: "Восточная область",
			genitive: "Восточной области",
			prepositional: "Восточной области",
		},
		shortName: "Восток",
		sortOrder: 20,
		status: "draft",
	},
	...access,
});
const foreignCity = await payload.create({
	collection: "cities",
	data: {
		slug: "vostochnyy",
		title: "Восточный",
		morphology: {
			nominative: "Восточный",
			genitive: "Восточного",
			prepositional: "Восточном",
		},
		preposition: "v",
		cityType: "city",
		morphologyApproved: true,
		sortOrder: 30,
		region: secondRegion.id,
		status: "draft",
	},
	...access,
});
await assert.rejects(
	() =>
		payload.update({
			collection: "cities",
			id: foreignCity.id,
			data: { agglomerationOf: primary.id },
			...access,
		}),
	/same region/i,
);
await assert.rejects(
	() =>
		payload.update({
			collection: "cities",
			id: primary.id,
			data: { slug: "primorsk-renamed" },
			...access,
		}),
	/immutable/i,
);

const cityCount = await payload.count({ collection: "cities", ...access });
const districtCount = await payload.count({
	collection: "districts",
	...access,
});
assert.equal(cityCount.totalDocs, 3);
assert.equal(districtCount.totalDocs, 3);

await payload.destroy();
console.log("geo integration suites: ok");

import assert from "node:assert/strict";
import {
	defineSiteProfile,
	isConfiguredRouteAvailable,
	isGeoHubAvailable,
	siteProfileSchema,
} from "../src/core/profile/index.ts";
import {
	createProjectSiteProfile,
	siteProfile,
	siteProfileFixtures,
} from "../src/project/site-profile.ts";
import { projectSiteProfileConfig } from "../src/project/site-profile.config.ts";

for (const [name, fixture] of Object.entries(siteProfileFixtures)) {
	assert.equal(
		siteProfileSchema.safeParse(fixture).success,
		true,
		`${name} fixture`,
	);
	assert.equal(fixture.primaryGeo, "primorsk");
}
assert.deepEqual(siteProfile, siteProfileFixtures.singleGeo);
assert.deepEqual(siteProfile, createProjectSiteProfile(projectSiteProfileConfig));
assert.equal(siteProfile.preset, "MIXED");
assert.equal(siteProfile.geoMode, "SINGLE_GEO");
assert.equal(
	siteProfileFixtures.multiGeo.geos.zarechnyy?.agglomerationOf,
	"primorsk",
);

function expectInvalid(
	name: string,
	mutate: (profile: Record<string, unknown>) => void,
) {
	const candidate = structuredClone(siteProfileFixtures.multiGeo) as Record<
		string,
		unknown
	>;
	mutate(candidate);
	assert.equal(siteProfileSchema.safeParse(candidate).success, false, name);
}

expectInvalid("unknown primary geo", (profile) => {
	profile.primaryGeo = "missing";
});
expectInvalid("single geo cannot contain two geos", (profile) => {
	profile.geoMode = "SINGLE_GEO";
});
expectInvalid(
	"active geo category requires active platform category",
	(profile) => {
		const category = profile.categoryStatus as Record<string, string>;
		category.kvartiry = "OUT";
	},
);
expectInvalid(
	"active geo market requires active platform market",
	(profile) => {
		const market = profile.marketCapability as Record<string, string>;
		market.secondary = "PREPARED_OFF";
	},
);
expectInvalid("active geo developers require active root", (profile) => {
	const developers = profile.developersSurface as {
		root: string;
		byGeo: Record<string, string>;
	};
	developers.root = "OUT";
});
expectInvalid("unknown geo matrix key", (profile) => {
	const matrix = profile.marketStatus as Record<string, unknown>;
	matrix.unknown = { newbuild: "OUT", secondary: "OUT" };
});
expectInvalid("agglomeration parent must exist", (profile) => {
	const geos = profile.geos as Record<string, { agglomerationOf?: string }>;
	geos.zarechnyy.agglomerationOf = "missing";
});
expectInvalid("self agglomeration", (profile) => {
	const geos = profile.geos as Record<string, { agglomerationOf?: string }>;
	geos.zarechnyy.agglomerationOf = "zarechnyy";
});
expectInvalid("price fail threshold follows stale threshold", (profile) => {
	const gate = profile.gate as {
		priceStaleDays: number;
		priceFailDays: number;
	};
	gate.priceFailDays = gate.priceStaleDays;
});
expectInvalid("unknown profile field", (profile) => {
	profile.projectBrand = "must stay outside reusable core";
});

assert.equal(
	isConfiguredRouteAvailable({
		status: "NOINDEX_AUTO",
		inventory: 9,
		minimumInventory: 10,
	}),
	false,
);
assert.equal(
	isConfiguredRouteAvailable({
		status: "NOINDEX_AUTO",
		inventory: 10,
		minimumInventory: 10,
	}),
	true,
);
assert.equal(
	isConfiguredRouteAvailable({
		status: "ACTIVE",
		inventory: 0,
		minimumInventory: 10,
	}),
	true,
);
assert.equal(
	isGeoHubAvailable({
		published: false,
		status: "ACTIVE",
		inventory: 100,
		minimumInventory: 10,
	}),
	false,
);
assert.equal(
	isGeoHubAvailable({
		published: true,
		status: "OUT",
		inventory: 100,
		minimumInventory: 10,
	}),
	false,
);

assert.deepEqual(
	defineSiteProfile(siteProfileFixtures.singleGeo),
	siteProfileFixtures.singleGeo,
);
console.log("verify:site-profile passed (4 fixtures + invalid matrix)");

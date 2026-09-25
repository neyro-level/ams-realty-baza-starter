import assert from "node:assert/strict";
import type { EntityPageLifecycleState } from "../src/core/lifecycle/entity-lifecycle.ts";
import {
	type ContentGateInput,
	evaluateContentGate,
} from "../src/core/seo/content-gate.ts";
import type { SeoRegistryRow } from "../src/core/seo/registry.ts";
import { projectSeoRegistrySeed } from "../src/project/seo/registry-seed.ts";
import { siteProfileFixtures } from "../src/project/site-profile.ts";

const now = new Date("2026-09-24T12:00:00.000Z");
const activeLifecycle: EntityPageLifecycleState = {
	kind: "active",
	statusCode: 200,
};
const override = {
	actor: "owner",
	reason: "Reviewed exception",
	requestedAt: "2026-09-24T10:00:00.000Z",
};
const registryFixture = projectSeoRegistrySeed[1];
assert.ok(registryFixture);
const approvedRegistry: SeoRegistryRow = {
	...registryFixture,
	synthetic: false,
	status: "approved",
	defaultRobots: "index,follow",
	source: "wordstat",
	value: 100,
	minimumObjects: 5,
	tier: "P1",
};

const common = {
	url: approvedRegistry.url,
	canonical: approvedRegistry.url,
	profileStatus: "ACTIVE" as const,
};

const passingCases: readonly ContentGateInput[] = [
	{
		...common,
		kind: "listing",
		registry: approvedRegistry,
		inventory: 12,
		intro: "Полезное описание каталога. ".repeat(30),
		ssrLinkCount: 3,
	},
	{
		...common,
		kind: "secondary",
		lifecycle: activeLifecycle,
		priceMinor: 7_000_000_00,
		area: 54,
		category: "apartment",
		rooms: 2,
		district: null,
		rawDistrictRef: "legacy:district-17",
		ownedPhotoCount: 3,
		description: "Квартира с проверенным описанием.",
	},
	{
		...common,
		kind: "development",
		lifecycle: activeLifecycle,
		dataTier: "A",
		description: "Описание жилого комплекса. ".repeat(70),
		mediaCount: 8,
		layoutCount: 1,
		progressPresent: true,
		priceRows: [
			{ checkedAt: "2026-09-20T00:00:00.000Z" },
			{ checkedAt: "2026-09-21T00:00:00.000Z" },
		],
	},
	{
		...common,
		kind: "developerGeo",
		developersWithPassingDevelopment: 5,
	},
	{
		...common,
		kind: "developer",
		lifecycle: activeLifecycle,
		hasPassingDevelopment: true,
		description: "Проверенное описание застройщика. ".repeat(20),
		descriptionSource: "official-company-profile",
		descriptionCheckedAt: "2026-09-20T00:00:00.000Z",
	},
];
const passingListing = passingCases[0] as Extract<
	ContentGateInput,
	{ kind: "listing" }
>;
const passingSecondary = passingCases[1] as Extract<
	ContentGateInput,
	{ kind: "secondary" }
>;
const passingDevelopment = passingCases[2] as Extract<
	ContentGateInput,
	{ kind: "development" }
>;

for (const [profileName, profile] of Object.entries(siteProfileFixtures)) {
	for (const input of passingCases) {
		const decision = evaluateContentGate(profile, input, now);
		assert.equal(decision.statusCode, 200, `${profileName}:${input.kind}`);
		assert.equal(decision.indexing, "index", `${profileName}:${input.kind}`);
		assert.equal(
			decision.includeInSitemap,
			true,
			`${profileName}:${input.kind}`,
		);
	}
}

const profile = siteProfileFixtures.multiGeo;
const weakListing: ContentGateInput = {
	...common,
	kind: "listing",
	registry: null,
	inventory: 0,
	intro: "Коротко",
	ssrLinkCount: 0,
};
const weakDecision = evaluateContentGate(profile, weakListing, now);
assert.equal(weakDecision.statusCode, 200);
assert.equal(weakDecision.indexing, "noindex");
assert.equal(weakDecision.includeInSitemap, false);
assert.ok(weakDecision.reasons.includes("registry_metadata_not_approved"));

const overridden = evaluateContentGate(
	profile,
	{ ...weakListing, ownerOverride: override },
	now,
);
assert.equal(overridden.indexing, "index");
assert.equal(overridden.overrideAudit?.result, "applied");

const out = evaluateContentGate(
	profile,
	{ ...weakListing, profileStatus: "OUT", ownerOverride: override },
	now,
);
assert.equal(out.statusCode, 404);
assert.equal(out.overrideAudit?.result, "denied");

const preparedOff = evaluateContentGate(
	profile,
	{ ...weakListing, profileStatus: "PREPARED_OFF", ownerOverride: override },
	now,
);
assert.equal(preparedOff.statusCode, 404);

const autoNoindex = evaluateContentGate(
	profile,
	{
		...passingListing,
		profileStatus: "NOINDEX_AUTO",
		ownerOverride: override,
	},
	now,
);
assert.equal(autoNoindex.statusCode, 200);
assert.equal(autoNoindex.indexing, "noindex");
assert.equal(autoNoindex.overrideAudit?.result, "denied");

for (const lifecycle of [
	{ kind: "missing", statusCode: 404 },
	{ kind: "archived", statusCode: 200, robots: "noindex" },
	{ kind: "redirect", statusCode: 301, destination: "/target/" },
	{ kind: "gone", statusCode: 410, robots: "noindex" },
] as const satisfies readonly EntityPageLifecycleState[]) {
	const decision = evaluateContentGate(
		profile,
		{
			...passingSecondary,
			lifecycle,
			ownerOverride: override,
		},
		now,
	);
	assert.equal(decision.statusCode, lifecycle.statusCode);
	assert.equal(decision.indexing, "noindex");
	assert.equal(decision.overrideAudit?.result, "denied");
}

const newbuild = evaluateContentGate(
	profile,
	{
		...common,
		kind: "newbuildLot",
		lifecycle: activeLifecycle,
		canonical: "/wrong/",
		ownerOverride: override,
	},
	now,
);
assert.equal(newbuild.indexing, "noindex");
assert.equal(newbuild.following, "follow");
assert.equal(newbuild.canonical, common.url);
assert.equal(newbuild.includeInSitemap, false);
assert.equal(newbuild.overrideAudit?.result, "denied");

const staleDevelopment = evaluateContentGate(
	profile,
	{
		...passingDevelopment,
		priceRows: [{ checkedAt: "2026-07-25T00:00:00.000Z" }],
	},
	now,
);
assert.equal(staleDevelopment.visiblePriceRows, 0);
assert.equal(staleDevelopment.indexing, "noindex");
assert.equal(staleDevelopment.dataTier, "A");

const expiredDevelopment = evaluateContentGate(
	profile,
	{
		...passingDevelopment,
		priceRows: [{ checkedAt: "2026-05-01T00:00:00.000Z" }],
	},
	now,
);
assert.ok(
	expiredDevelopment.reasons.includes("development_all_prices_expired"),
);
assert.equal(expiredDevelopment.dataTier, "A");

const tierC = evaluateContentGate(
	profile,
	{
		...passingDevelopment,
		dataTier: "C",
		ownerOverride: override,
	},
	now,
);
assert.equal(tierC.indexing, "noindex");
assert.equal(tierC.overrideAudit?.result, "denied");

assert.throws(
	() =>
		evaluateContentGate(
			profile,
			{ ...weakListing, ownerOverride: { ...override, reason: "" } },
			now,
		),
	/actor and reason/,
);
assert.throws(
	() =>
		evaluateContentGate(
			profile,
			{
				...passingDevelopment,
				priceRows: [{ checkedAt: "2026-09-25T00:00:00.000Z" }],
			},
			now,
		),
	/future/,
);

console.log(
	"verify:content-gate passed (four profiles + listing/property/development/developer/override matrix)",
);

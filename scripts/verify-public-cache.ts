import assert from "node:assert/strict";
import { buildPublicEntityInvalidationTargets } from "../src/core/cache/entity-change-targets.ts";
import { executeInternalRevalidation } from "../src/core/cache/internal-route-executor.ts";
import { publicGatewayCacheTags } from "../src/project/routing/public-gateway-cache.ts";

const listingTags = publicGatewayCacheTags({
	kind: "categoryGeoDistrict",
	geo: "rostov-na-donu",
	category: "kvartiry",
	district: "leninskiy",
});
assert.deepEqual(listingTags, [
	"site",
	"registry",
	"properties",
	"developments",
	"developers",
	"geo:rostov-na-donu",
	"geo-surface:rostov-na-donu:kvartiry",
	"district:leninskiy",
]);
assert.ok(listingTags.length <= 8);

assert.deepEqual(
	publicGatewayCacheTags({
		kind: "property",
		category: "kvartiry",
		semantic: "demo",
		publicUrlId: 2001,
	}),
	["site", "registry", "properties", "property:2001"],
);

const canonicalMoveTargets = buildPublicEntityInvalidationTargets({
	entityType: "development",
	doc: { slug: "new-slug" },
	previousDoc: { slug: "old-slug" },
});
assert.deepEqual(canonicalMoveTargets, [
	{ type: "tag", tag: "developments" },
	{ type: "tag", tag: "properties" },
	{ type: "tag", tag: "developers" },
	{ type: "tag", tag: "development:new-slug" },
	{ type: "tag", tag: "development:old-slug" },
]);

const accepted: unknown[] = [];
const result = await executeInternalRevalidation({
	expectedSecret: "test-secret",
	providedSecret: "test-secret",
	body: { targets: canonicalMoveTargets, reason: "test" },
	invalidate: async (targets) => {
		accepted.push(...targets);
	},
});
assert.equal(result.status, 200);
assert.deepEqual(accepted, canonicalMoveTargets);

console.log(
	`Public cache verified: ${listingTags.length} bounded listing tags; old/new canonical invalidation accepted once.`,
);

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	createRouteResolver,
	type PageKey,
} from "../src/core/routing/index.ts";
import { separateTrackingQueryParams } from "../src/core/seo/tracking-query-params.ts";
import { createFixtureResolverDataPort } from "../src/fixture/resolver.ts";
import { fixtureDistrictRouteRegistryFor } from "../src/fixture/route-registries.ts";
import {
	parseCatalogSearchParams,
} from "../src/project/routing/catalog-search-params.ts";
import { publicGatewayRouteCacheIdentity } from "../src/project/routing/public-gateway-cache.ts";
import { siteProfile } from "../src/project/site-profile.ts";
import { createProjectUrlGrammar } from "../src/project/url-grammar.ts";

const pageKey = {
	kind: "categoryGeo",
	geo: siteProfile.primaryGeo,
	category: "kvartiry",
} as const satisfies PageKey;
const cleanPath = `/${siteProfile.primaryGeo}/kvartiry/`;
const grammar = createProjectUrlGrammar(
	siteProfile,
	fixtureDistrictRouteRegistryFor(siteProfile),
);
const resolver = createRouteResolver({
	profile: siteProfile,
	grammar,
	port: createFixtureResolverDataPort({
		grammar,
		pages: [
			{
				pageKey,
				inventory: 12,
				record: {
					lifecycle: "active",
					geo: siteProfile.primaryGeo,
					market: null,
					dataTier: null,
				},
			},
		],
	}),
});
const cleanRoute = await resolver.resolvePath(cleanPath);
assert.equal(cleanRoute.kind, "page");
if (cleanRoute.kind !== "page") throw new Error("Fixture listing route is absent.");
assert.equal(cleanRoute.canonicalPath, cleanPath);

const cleanQuery = parseCatalogSearchParams("");
assert.ok(cleanQuery);
const cleanCacheIdentity = publicGatewayRouteCacheIdentity(
	siteProfile,
	pageKey,
	"",
);
assert.ok(cleanCacheIdentity);

for (const queryString of [
	"yclid=123&utm_source=yandex",
	"gclid=paid-click",
	"_openstat=campaign&utm_source=yandex&utm_medium=cpc",
]) {
	const partition = separateTrackingQueryParams(queryString);
	assert.equal(partition.functionalQueryString, "", queryString);
	assert.equal(partition.trackingQueryString, queryString, queryString);
	assert.deepEqual(parseCatalogSearchParams(queryString), cleanQuery, queryString);
	assert.deepEqual(
		publicGatewayRouteCacheIdentity(siteProfile, pageKey, queryString),
		cleanCacheIdentity,
		queryString,
	);
}

assert.equal(
	parseCatalogSearchParams("unknown=value&utm_source=yandex"),
	null,
	"unknown functional keys stay fail-closed",
);
assert.equal(
	parseCatalogSearchParams("from=campaign"),
	null,
	"from requires an explicit project tracking opt-in",
);

const runtime = readFileSync("src/project/routing/runtime-route.ts", "utf8");
assert.match(
	runtime,
	/separateTrackingQueryParams\(queryString\)\.functionalQueryString[\s\S]{0,900}publicGatewayRouteCacheIdentity/,
);

console.log(
	`tracking traffic verified for ${cleanPath}: paid tags preserve the clean route, canonical and cache identity.`,
);

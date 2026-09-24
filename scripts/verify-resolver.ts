import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	createRouteResolver,
	type PageKey,
} from "../src/core/routing/index.ts";
import { createFixtureResolverDataPort } from "../src/fixture/resolver.ts";
import { siteProfileFixtures } from "../src/project/site-profile.ts";
import { defineSiteProfile } from "../src/core/profile/index.ts";
import { createProjectUrlGrammar } from "../src/project/url-grammar.ts";

for (const [name, profile] of Object.entries(siteProfileFixtures)) {
	const grammar = createProjectUrlGrammar(profile);
	const primaryGeo = profile.primaryGeo;
	const pages: { pageKey: PageKey; inventory?: number }[] = [
		{ pageKey: { kind: "home" } },
		{ pageKey: { kind: "geoHub", geo: primaryGeo } },
		{ pageKey: { kind: "categoryRoot", category: "kvartiry" } },
		{ pageKey: { kind: "categoryGeo", geo: primaryGeo, category: "kvartiry" } },
		{ pageKey: { kind: "developerRoot" } },
	];
	const resolver = createRouteResolver({
		profile,
		grammar,
		port: createFixtureResolverDataPort({ grammar, pages }),
	});
	assert.equal((await resolver.resolvePath("/")).kind, "page", name);
	assert.equal(
		(await resolver.resolvePath(`/${primaryGeo}/`)).kind,
		"page",
		name,
	);
	assert.deepEqual(await resolver.resolvePath(`/${primaryGeo.toUpperCase()}`), {
		kind: "redirect",
		destinationPath: `/${primaryGeo}/`,
		statusCode: 308,
	});
	const root = await resolver.resolvePath("/kvartiry/");
	assert.equal(root.kind, "page", name);
	if (root.kind === "page" && profile.geoMode === "SINGLE_GEO") {
		assert.equal(root.robots.indexing, "noindex");
		assert.equal(root.inSitemap, false);
	}
}

const profile = siteProfileFixtures.multiGeo;
const grammar = createProjectUrlGrammar(profile);
const canonicalProperty = {
	kind: "property",
	category: "kvartiry",
	semantic: "ulitsa-mira-10",
	publicUrlId: 42,
} as const;
const wrongCategoryProperty = {
	...canonicalProperty,
	category: "doma",
} as const;
const replacementProperty = {
	...canonicalProperty,
	semantic: "ulitsa-mira-12",
	publicUrlId: 43,
} as const;
const goneProperty = {
	...canonicalProperty,
	semantic: "gone",
	publicUrlId: 44,
} as const;
const movedProperty = {
	...canonicalProperty,
	semantic: "moved",
	publicUrlId: 45,
} as const;
const archivedProperty = {
	...canonicalProperty,
	semantic: "archive",
	publicUrlId: 46,
} as const;
const lowInventory = {
	kind: "categoryGeo",
	geo: "zarechnyy",
	category: "kvartiry",
} as const;
const port = createFixtureResolverDataPort({
	grammar,
	pages: [
		{ pageKey: canonicalProperty },
		{
			pageKey: wrongCategoryProperty,
			record: { lifecycle: "active", canonicalPageKey: canonicalProperty },
		},
		{ pageKey: replacementProperty },
		{ pageKey: goneProperty, record: { lifecycle: "purged" } },
		{
			pageKey: movedProperty,
			record: { lifecycle: "purged", replacementPageKey: replacementProperty },
		},
		{ pageKey: archivedProperty, record: { lifecycle: "archived" } },
		{ pageKey: lowInventory, inventory: 0 },
	],
	redirects: {
		"/old-property/": grammar.buildUrl(canonicalProperty),
		"/chain-a/": "/chain-b/",
		"/chain-b/": grammar.buildUrl(canonicalProperty),
		"/loop/": "/loop/",
	},
});
const resolver = createRouteResolver({ profile, grammar, port });

assert.deepEqual(await resolver.resolvePath("/old-property/"), {
	kind: "redirect",
	destinationPath: grammar.buildUrl(canonicalProperty),
	statusCode: 308,
});
for (const path of ["/chain-a/", "/loop/"]) {
	assert.deepEqual(await resolver.resolvePath(path), {
		kind: "notFound",
		statusCode: 404,
	});
}
assert.deepEqual(
	await resolver.resolvePath(grammar.buildUrl(wrongCategoryProperty)),
	{
		kind: "redirect",
		destinationPath: grammar.buildUrl(canonicalProperty),
		statusCode: 308,
	},
);
assert.deepEqual(await resolver.resolvePath(grammar.buildUrl(goneProperty)), {
	kind: "gone",
	statusCode: 410,
});
assert.deepEqual(await resolver.resolvePath(grammar.buildUrl(movedProperty)), {
	kind: "redirect",
	destinationPath: grammar.buildUrl(replacementProperty),
	statusCode: 308,
});
const archived = await resolver.resolvePath(grammar.buildUrl(archivedProperty));
assert.equal(archived.kind, "page");
if (archived.kind === "page") {
	assert.equal(archived.robots.indexing, "noindex");
	assert.equal(archived.robots.following, "follow");
	assert.equal(archived.inSitemap, false);
}
for (const path of [
	"/kvartiry/primorsk/",
	"/primorsk/kvartiry/severnyy/dvukhkomnatnye/",
	"/primorsk/kvartiry/severnyy/extra/",
	"/missing/",
]) {
	assert.deepEqual(await resolver.resolvePath(path), {
		kind: "notFound",
		statusCode: 404,
	});
}
assert.deepEqual(await resolver.resolvePath(grammar.buildUrl(lowInventory)), {
	kind: "notFound",
	statusCode: 404,
});

const inactiveInput = structuredClone(siteProfileFixtures.multiGeo);
inactiveInput.geos.zarechnyy.status = "OUT";
const inactiveProfile = defineSiteProfile(inactiveInput);
const inactiveGrammar = createProjectUrlGrammar(inactiveProfile);
const inactiveGeoKey = { kind: "geoHub", geo: "zarechnyy" } as const;
const inactiveResolver = createRouteResolver({
	profile: inactiveProfile,
	grammar: inactiveGrammar,
	port: createFixtureResolverDataPort({
		grammar: inactiveGrammar,
		pages: [{ pageKey: inactiveGeoKey }],
	}),
});
assert.deepEqual(
	await inactiveResolver.resolvePath(inactiveGrammar.buildUrl(inactiveGeoKey)),
	{ kind: "notFound", statusCode: 404 },
);

const secondaryProfile = siteProfileFixtures.secondaryFirst;
const secondaryGrammar = createProjectUrlGrammar(secondaryProfile);
const preparedOffKey = {
	kind: "categoryGeo",
	geo: "primorsk",
	category: "novostroyki",
} as const;
const secondaryResolver = createRouteResolver({
	profile: secondaryProfile,
	grammar: secondaryGrammar,
	port: createFixtureResolverDataPort({
		grammar: secondaryGrammar,
		pages: [{ pageKey: preparedOffKey }],
	}),
});
assert.deepEqual(
	await secondaryResolver.resolvePath(
		secondaryGrammar.buildUrl(preparedOffKey),
	),
	{ kind: "notFound", statusCode: 404 },
);

const resolverSource = readFileSync("src/core/routing/resolver.ts", "utf8");
for (const forbidden of [
	'from "next',
	'from "payload',
	"@/project",
	"../project",
]) {
	assert.ok(
		!resolverSource.includes(forbidden),
		`resolver imports ${forbidden}`,
	);
}

console.log(
	"verify:resolver passed (four profiles + page/redirect/404/410 + no-chain matrix)",
);

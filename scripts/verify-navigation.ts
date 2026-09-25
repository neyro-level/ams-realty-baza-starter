import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSafeNavigationBuilder } from "../src/core/navigation/index.ts";
import type { PageKey } from "../src/core/routing/index.ts";
import { createRouteResolver } from "../src/core/routing/index.ts";
import type { ContentGateDecision } from "../src/core/seo/content-gate.ts";
import {
	fixtureDeveloper,
	fixtureDevelopment,
	fixtureGeoHub,
	fixtureGeoSwitcherOptions,
	fixtureListing,
} from "../src/fixture/geo-catalog.ts";
import { createFixtureResolverDataPort } from "../src/fixture/resolver.ts";
import { siteProfileFixtures } from "../src/project/site-profile.ts";
import { createProjectUrlGrammar } from "../src/project/url-grammar.ts";

function gate(
	canonical: string,
	input: Partial<ContentGateDecision> = {},
): ContentGateDecision {
	return {
		statusCode: 200,
		indexing: "index",
		following: "follow",
		canonical,
		includeInSitemap: true,
		reasons: [],
		...input,
	};
}

for (const [name, profile] of Object.entries(siteProfileFixtures)) {
	const grammar = createProjectUrlGrammar(profile);
	const navigation = createSafeNavigationBuilder({ profile, grammar });
	const home = { kind: "home" } as const;
	const geo = { kind: "geoHub", geo: profile.primaryGeo } as const;
	const listing = {
		kind: "categoryGeo",
		geo: profile.primaryGeo,
		category: profile.preset === "NEWBUILD_FIRST" ? "novostroyki" : "kvartiry",
	} as const;
	const candidates = [home, geo, listing].map((pageKey) => ({
		pageKey,
		label: pageKey.kind,
		gate: gate(grammar.buildUrl(pageKey)),
	}));
	const links = navigation.links(candidates);
	assert.equal(links.length, candidates.length, `${name}: active links`);
	const resolver = createRouteResolver({
		profile,
		grammar,
		port: createFixtureResolverDataPort({
			grammar,
			pages: links.map(({ pageKey }) => ({ pageKey, inventory: 20 })),
		}),
	});
	for (const link of links) {
		const result = await resolver.resolvePath(link.href);
		assert.equal(result.kind, "page", `${name}: ${link.href}`);
		if (result.kind === "page") {
			assert.equal(result.canonicalPath, link.href, `${name}: canonical`);
			assert.equal(result.robots.indexing, "index", `${name}: indexable`);
		}
	}
}

const profile = siteProfileFixtures.multiGeo;
const grammar = createProjectUrlGrammar(profile);
const navigation = createSafeNavigationBuilder({ profile, grammar });
const inactiveGeo = { kind: "geoHub", geo: "zarechnyy" } as const;
const inactiveHref = grammar.buildUrl(inactiveGeo);
const blockedCandidates = [
	{
		pageKey: inactiveGeo,
		label: "NOINDEX_AUTO geo",
		gate: gate(inactiveHref, {
			indexing: "noindex",
			includeInSitemap: false,
		}),
	},
	{
		pageKey: { kind: "home" } as const,
		label: "Redirect",
		gate: gate("/", { statusCode: 301, includeInSitemap: false }),
	},
	{
		pageKey: { kind: "home" } as const,
		label: "Canonical mismatch",
		gate: gate("/wrong/"),
	},
];
assert.deepEqual(navigation.links(blockedCandidates), []);
const blockedGeoCandidate = blockedCandidates[0];
assert.ok(blockedGeoCandidate);

const breadcrumbs = navigation.breadcrumbs({
	ancestors: [
		{ pageKey: { kind: "home" }, label: "Главная", gate: gate("/") },
		blockedGeoCandidate,
	],
	currentLabel: "Объект",
});
assert.deepEqual(breadcrumbs.items, [
	{ pageKey: { kind: "home" }, href: "/", label: "Главная", count: undefined },
	{ label: "NOINDEX_AUTO geo" },
	{ label: "Объект" },
]);

function breadcrumbLinks(
	items: typeof fixtureDeveloper.breadcrumbs.items,
): Array<{ pageKey: PageKey; href: string; label: string }> {
	return items.flatMap((item) =>
		item.href && item.pageKey
			? [
					{
						pageKey: item.pageKey as PageKey,
						href: item.href,
						label: item.label,
					},
				]
			: [],
	);
}

const fixtureLinks = [
	...fixtureGeoHub.categoryLinks,
	...fixtureGeoHub.districtLinks,
	fixtureGeoHub.developerLink,
	...fixtureGeoHub.nearby,
	...fixtureListing.subLinks,
	...fixtureListing.nearby,
	...fixtureGeoSwitcherOptions,
	...breadcrumbLinks(fixtureDeveloper.breadcrumbs.items),
	...breadcrumbLinks(fixtureDevelopment.breadcrumbs.items),
];
const fixtureResolver = createRouteResolver({
	profile,
	grammar,
	port: createFixtureResolverDataPort({
		grammar,
		pages: fixtureLinks.map(({ pageKey }) => ({ pageKey, inventory: 20 })),
	}),
});
for (const link of fixtureLinks) {
	assert.ok(!link.href.includes("?"), `query link forbidden: ${link.href}`);
	const result = await fixtureResolver.resolvePath(link.href);
	assert.equal(result.kind, "page", `fixture crawl: ${link.href}`);
	if (result.kind === "page") {
		assert.equal(
			result.canonicalPath,
			link.href,
			`fixture canonical: ${link.href}`,
		);
	}
}
assert.equal(fixtureGeoHub.nearby.length, 0, "NOINDEX_AUTO nearby hidden");
assert.equal(fixtureListing.nearby.length, 0, "NOINDEX_AUTO interlink hidden");
assert.equal(fixtureGeoSwitcherOptions.length, 1, "NOINDEX_AUTO menu hidden");

const breadcrumbSource = readFileSync(
	"packages/ui/src/views/shared/BreadcrumbsView.tsx",
	"utf8",
);
assert.match(breadcrumbSource, /index === breadcrumbs\.items\.length - 1/);

console.log(
	`verify:navigation passed (5 profiles; ${fixtureLinks.length} fixture links; zero 404/redirect/query links)`,
);

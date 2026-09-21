import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	buildCatalogSeoDecision,
	catalogSeoParamPolicy,
} from "../src/core/seo/catalog.ts";
import { serializeJsonLdSafely } from "../src/core/seo/json-ld.ts";
import {
	getPropertyRobots,
	resolvePropertyPageLifecycle,
	sanitizeExplicitRedirectPath,
} from "../src/core/seo/property.ts";
import { staticPublicUrlEntries } from "../src/core/seo/site.ts";
import {
	buildRobots,
	getProjectIndexingPolicy,
	metadataRobotsForPolicy,
	resolveIndexingPolicy,
} from "../src/project/indexing-policy.ts";

const fixtureOrigin = "https://realty-client.example";
assert.equal(getProjectIndexingPolicy(), "noindex");
assert.equal(
	resolveIndexingPolicy({
		projectKind: "starter-demo",
		productionIndexing: "public",
	}),
	"noindex",
);
assert.deepEqual(metadataRobotsForPolicy("noindex"), {
	index: false,
	follow: false,
});
assert.deepEqual(buildRobots("noindex", fixtureOrigin), {
	rules: [{ userAgent: "*", disallow: "/" }],
});
assert.deepEqual(buildRobots("public", fixtureOrigin), {
	rules: [
		{
			userAgent: "*",
			allow: "/",
			disallow: ["/admin", "/api"],
		},
	],
	sitemap: `${fixtureOrigin}/sitemap.xml`,
	host: fixtureOrigin,
});
assert.deepEqual(
	buildRobots(
		resolveIndexingPolicy({
			projectKind: "client",
			productionIndexing: "noindex",
		}),
		fixtureOrigin,
	),
	{ rules: [{ userAgent: "*", disallow: "/" }] },
);
assert.ok(
	readFileSync("src/app/robots.ts", "utf8").includes(
		"buildRobots(getProjectIndexingPolicy(), getSiteUrl())",
	),
);
assert.ok(
	readFileSync("src/app/layout.tsx", "utf8").includes(
		"metadataRobotsForPolicy(getProjectIndexingPolicy())",
	),
);

const adversarialJsonLd = {
	name: '</script><script>alert("json-ld")</script>',
	description: '<&>\u2028\u2029quotes"backslash\\',
};
const serializedJsonLd = serializeJsonLdSafely(adversarialJsonLd);
assert.equal(serializedJsonLd.includes("</script"), false);
for (const escaped of ["\\u003c", "\\u003e", "\\u0026", "\\u2028", "\\u2029"]) {
	assert.ok(serializedJsonLd.includes(escaped));
}
assert.deepEqual(JSON.parse(serializedJsonLd), adversarialJsonLd);
const structuredDataSource = readFileSync(
	"src/core/seo/structured-data.tsx",
	"utf8",
);
assert.ok(structuredDataSource.includes("serializeJsonLdSafely(data)"));
assert.equal(structuredDataSource.includes("JSON.stringify(data)"), false);

assert.deepEqual(catalogSeoParamPolicy.indexedFilterKeys, [
	"category",
	"dealType",
	"city",
	"district",
	"rooms",
]);

const base = buildCatalogSeoDecision({});
assert.equal(base.canonicalPath, "/nedvizhimost");
assert.equal(base.index, true);
assert.equal(base.reason, "base");

const whitelisted = buildCatalogSeoDecision({
	dealType: "sale",
	category: "apartment",
	rooms: ["2", "1"],
});
assert.equal(
	whitelisted.canonicalPath,
	"/nedvizhimost?category=apartment&dealType=sale&rooms=1&rooms=2",
);
assert.equal(whitelisted.index, true);
assert.equal(whitelisted.reason, "whitelisted_filter");
assert.deepEqual(whitelisted.query.rooms, [1, 2]);

const control = buildCatalogSeoDecision({ page: "2", sort: "priceAsc" });
assert.equal(control.canonicalPath, "/nedvizhimost");
assert.equal(control.index, false);
assert.equal(control.reason, "control_or_nonindex_filter");

const freeText = buildCatalogSeoDecision({ query: "центр" });
assert.equal(freeText.canonicalPath, "/nedvizhimost");
assert.equal(freeText.index, false);
assert.equal(freeText.reason, "control_or_nonindex_filter");

const unknown = buildCatalogSeoDecision({ debug: "1", category: "house" });
assert.equal(unknown.canonicalPath, "/nedvizhimost?category=house");
assert.equal(unknown.index, false);
assert.equal(unknown.reason, "unknown_param");

const sitemapPaths = staticPublicUrlEntries
	.filter((entry) => entry.indexable)
	.map((entry) => entry.path);
assert.ok(sitemapPaths.includes("/"));
assert.ok(sitemapPaths.includes("/nedvizhimost"));
assert.equal(sitemapPaths.includes("/politika-konfidencialnosti"), false);
assert.equal(
	sitemapPaths.includes("/soglasie-na-obrabotku-personalnyh-dannyh"),
	false,
);

assert.deepEqual(
	getPropertyRobots({ lifecycle: { status: "active", isArchived: false } }),
	{ indexing: "index", following: "follow" },
);
assert.deepEqual(
	getPropertyRobots({ lifecycle: { status: "archived", isArchived: true } }),
	{ indexing: "noindex", following: "follow" },
);

assert.deepEqual(resolvePropertyPageLifecycle({ found: false }), {
	kind: "missing",
	statusCode: 404,
});
assert.deepEqual(
	resolvePropertyPageLifecycle({
		found: true,
		status: "active",
		publishedAt: "2026-01-01T00:00:00.000Z",
		contentPurgedAt: null,
		explicitRedirectPath: null,
	}),
	{ kind: "active", statusCode: 200 },
);
assert.deepEqual(
	resolvePropertyPageLifecycle({
		found: true,
		status: "archived",
		publishedAt: "2026-01-01T00:00:00.000Z",
		contentPurgedAt: null,
		explicitRedirectPath: null,
	}),
	{ kind: "archived", statusCode: 200, robots: "noindex" },
);
assert.deepEqual(
	resolvePropertyPageLifecycle({
		found: true,
		status: "archived",
		publishedAt: "2026-01-01T00:00:00.000Z",
		contentPurgedAt: "2026-02-01T00:00:00.000Z",
		explicitRedirectPath: null,
	}),
	{ kind: "gone", statusCode: 410, robots: "noindex" },
);
assert.deepEqual(
	resolvePropertyPageLifecycle({
		found: true,
		status: "archived",
		publishedAt: "2026-01-01T00:00:00.000Z",
		contentPurgedAt: "2026-02-01T00:00:00.000Z",
		explicitRedirectPath: "/obekty/explicit-target",
	}),
	{
		kind: "redirect",
		statusCode: 308,
		destination: "/obekty/explicit-target",
	},
);
assert.deepEqual(
	resolvePropertyPageLifecycle({
		found: true,
		status: "archived",
		publishedAt: "2026-01-01T00:00:00.000Z",
		contentPurgedAt: "2026-02-01T00:00:00.000Z",
		explicitRedirectPath: "/",
	}),
	{ kind: "gone", statusCode: 410, robots: "noindex" },
);
assert.equal(sanitizeExplicitRedirectPath("/"), null);
assert.equal(sanitizeExplicitRedirectPath("/obekty/next"), "/obekty/next");

const sitemapSource = readFileSync("src/app/sitemap.ts", "utf8");
assert.ok(sitemapSource.includes("generateSitemaps"));
assert.match(sitemapSource, /export const revalidate = 3600;/);
assert.equal(sitemapSource.includes("limit: 1000"), false);
const catalogSource = readFileSync(
	"src/core/data-access/public/catalog.ts",
	"utf8",
);
assert.equal(catalogSource.includes("limit: 1000"), false);
assert.ok(catalogSource.includes("aggregatePublicCatalogFacets"));
assert.ok(catalogSource.includes("payload-aggregate"));
assert.equal(catalogSource.includes("sql-aggregate"), false);
assert.ok(
	readFileSync(
		"src/app/http/property-lifecycle/[slug]/route.ts",
		"utf8",
	).includes("status: 410") ||
		readFileSync("src/core/http/property-gone-response.ts", "utf8").includes(
			"status: 410",
		),
);
assert.ok(
	readFileSync("src/project/collections/Pages.ts", "utf8").includes(
		"reservedNamespaces",
	),
);

const marketingPages = [
	"src/app/(site)/uslugi/page.tsx",
	"src/app/(site)/o-kompanii/page.tsx",
	"src/app/(site)/ipoteka/page.tsx",
	"src/app/(site)/kontakty/page.tsx",
	"src/app/(site)/politika-konfidencialnosti/page.tsx",
	"src/app/(site)/soglasie-na-obrabotku-personalnyh-dannyh/page.tsx",
	"src/app/(site)/sdat/page.tsx",
	"src/app/(site)/prodat/page.tsx",
];
for (const file of marketingPages) {
	const source = readFileSync(file, "utf8");
	assert.equal(
		source.includes("force-dynamic"),
		false,
		`${file} must not be force-dynamic`,
	);
	assert.ok(
		source.includes("export const revalidate = 3600;"),
		`${file} must export literal ISR revalidate`,
	);
}
assert.match(
	readFileSync("src/core/lib/page-cache.ts", "utf8"),
	/export const marketingRevalidateSeconds = 3600;/,
);
assert.ok(
	readFileSync("src/app/(site)/page.tsx", "utf8").includes(
		"export const revalidate = 3600;",
	),
	"home must export literal ISR revalidate",
);
assert.equal(
	readFileSync("src/app/(site)/page.tsx", "utf8").includes("force-dynamic"),
	false,
	"home must not be force-dynamic",
);
assert.ok(
	readFileSync("src/app/(site)/nedvizhimost/page.tsx", "utf8").includes(
		"force-dynamic",
	),
	"catalog may stay dynamic",
);

console.log("verify-seo-contracts: ok");

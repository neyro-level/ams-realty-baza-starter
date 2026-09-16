import assert from "node:assert/strict";
import {
	buildCatalogSeoDecision,
	catalogSeoParamPolicy,
} from "../src/server/seo/catalog.ts";
import {
	getPropertyRobots,
	resolvePropertyPageLifecycle,
} from "../src/server/seo/property.ts";
import { staticPublicUrlEntries } from "../src/server/seo/site.ts";

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

console.log("verify-seo-contracts: ok");

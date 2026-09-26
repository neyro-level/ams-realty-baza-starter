import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
	catalogCanonicalPath,
	pageHref,
	parseCatalogSearchParams,
	parsePageSearchParams,
} from "../src/project/routing/catalog-search-params.ts";

const cleanPath = "/primorsk/kvartiry/";
const clean = parseCatalogSearchParams("");
assert.ok(clean);
assert.equal(clean.page, 1);
assert.equal(clean.hasFilters, false);
assert.equal(catalogCanonicalPath(cleanPath, clean), cleanPath);

const pageTwo = parseCatalogSearchParams("page=2");
assert.ok(pageTwo);
assert.equal(catalogCanonicalPath(cleanPath, pageTwo), `${cleanPath}?page=2`);
assert.equal(pageHref(cleanPath, pageTwo, 1), cleanPath);
assert.equal(pageHref(cleanPath, pageTwo, 3), `${cleanPath}?page=3`);

const filtered = parseCatalogSearchParams(
	"rooms=2,1&priceFrom=5000000&priceTo=9000000&district=severnyy&page=2&sort=priceAsc",
);
assert.ok(filtered);
assert.deepEqual(filtered.rooms, [1, 2]);
assert.equal(filtered.priceFromMinor, 500_000_000);
assert.equal(filtered.priceToMinor, 900_000_000);
assert.equal(filtered.hasFilters, true);
assert.equal(catalogCanonicalPath(cleanPath, filtered), cleanPath);
assert.equal(
	pageHref(cleanPath, filtered, 3),
	`${cleanPath}?page=3&sort=priceAsc&priceFrom=5000000&priceTo=9000000&rooms=1%2C2&district=severnyy`,
);

for (const invalid of [
	"page=0",
	"page=2&page=3",
	"unknown=value",
	"priceFrom=900&priceTo=100",
	"rooms=-1",
	"district=INVALID",
]) {
	assert.equal(parseCatalogSearchParams(invalid), null, invalid);
}
assert.deepEqual(parsePageSearchParams("page=2"), {
	page: 2,
	queryString: "page=2",
});
assert.equal(parsePageSearchParams("sort=newest"), null);

const catchAllPage = readFileSync(
	"src/app/(site)/[...segments]/page.tsx",
	"utf8",
);
const listingView = readFileSync(
	"packages/ui/src/views/catalog/ListingView.tsx",
	"utf8",
);
assert.match(catchAllPage, /searchParams:\s*Promise/);
assert.match(
	catchAllPage,
	/resolveRuntimeRoute\(routePath, queryString\(query\)\)/,
);
assert.match(
	listingView,
	/<a href=\{pageHref\(listing\.pagination\.previousPage\)\}>/,
);
assert.match(
	listingView,
	/<a href=\{pageHref\(listing\.pagination\.nextPage\)\}>/,
);

console.log("catalog query parser, canonical matrix and SSR hrefs verified");

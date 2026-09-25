import assert from "node:assert/strict";
import {
	buildDiscoveryShards,
	discoveryGroups,
	latestLastModified,
	renderDiscoveryRobots,
	renderSitemapIndexXml,
	renderSitemapXml,
	type DiscoveryCandidate,
} from "../src/core/seo/discovery-feeds.ts";
import { evaluateContentGate } from "../src/core/seo/content-gate.ts";
import { siteProfileFixtures } from "../src/project/site-profile.ts";

const origin = "https://example.test";
const now = new Date("2026-09-25T12:00:00.000Z");
const intro = "а".repeat(700);

function listingCandidate(
	name: keyof typeof siteProfileFixtures,
): DiscoveryCandidate {
	const profile = siteProfileFixtures[name];
	const path = `/kvartiry/${name}/`;
	const gate = evaluateContentGate(
		profile,
		{
			kind: "listing",
			profileStatus: profile.categoryStatus.kvartiry,
			url: path,
			canonical: path,
			inventory: 20,
			intro,
			ssrLinkCount: 2,
			registry: {
				pageKey: { kind: "categoryRoot", category: "kvartiry" },
				url: path,
				canonical: path,
				entityRef: null,
				targetPhrases: [`квартиры ${name}`],
				metric: "searchDemand",
				value: 100,
				source: "wordstat",
				snapshotDate: "2026-09-24",
				status: "approved",
				synthetic: false,
				tier: "P1",
				minimumObjects: 5,
				defaultRobots: "index,follow",
				templateKey: "categoryRoot",
				morphologyApproved: true,
				title: "Квартиры",
				h1: "Квартиры",
				description: "Проверенное описание",
			},
		},
		now,
	);
	return {
		group: "catalog",
		path,
		canonicalPath: path,
		lastModified: "2026-09-24T10:00:00.000Z",
		published: true,
		gate,
	};
}

const profileSnapshots = Object.fromEntries(
	(
		Object.keys(siteProfileFixtures) as (keyof typeof siteProfileFixtures)[]
	).map((name) => {
		const shards = buildDiscoveryShards({
			publicOrigin: origin,
			candidates: [listingCandidate(name)],
		});
		return [
			name,
			shards.flatMap((shard) => shard.entries.map((entry) => entry.url)),
		];
	}),
);

assert.deepEqual(profileSnapshots, {
	singleGeo: ["https://example.test/kvartiry/singleGeo/"],
	multiGeo: ["https://example.test/kvartiry/multiGeo/"],
	newbuildFirst: [],
	secondaryFirst: ["https://example.test/kvartiry/secondaryFirst/"],
});

const passingGate = {
	statusCode: 200 as const,
	indexing: "index" as const,
	following: "follow" as const,
	canonical: "/placeholder/",
	includeInSitemap: true,
};
const candidates = discoveryGroups.flatMap((group, index) => {
	const path = `/${group}/${index}/`;
	return [
		{
			group,
			path,
			canonicalPath: path,
			lastModified: `2026-09-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`,
			published: true,
			gate: { ...passingGate, canonical: path },
		},
		{
			group,
			path: `${path}draft/`,
			canonicalPath: `${path}draft/`,
			lastModified: "2026-09-20T10:00:00.000Z",
			published: false,
			gate: { ...passingGate, canonical: `${path}draft/` },
		},
	];
});
const shards = buildDiscoveryShards({
	publicOrigin: origin,
	candidates,
	shardSize: 2,
});
assert.deepEqual(
	shards.map((shard) => shard.group),
	[...discoveryGroups],
);
assert.ok(shards.every((shard) => shard.entries.length <= 2));
assert.equal(
	shards.flatMap((shard) => shard.entries).length,
	discoveryGroups.length,
);

assert.equal(
	latestLastModified([
		"2026-09-20T10:00:00.000Z",
		"2026-09-24T12:00:00.000Z",
		"2026-09-22T08:00:00.000Z",
	]),
	"2026-09-24T12:00:00.000Z",
);
assert.throws(() => latestLastModified([]), /at least one source timestamp/);

const firstXml = renderSitemapXml(shards[0].entries);
assert.equal(
	firstXml,
	'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		"  <url><loc>https://example.test/static/0/</loc><lastmod>2026-09-01T10:00:00.000Z</lastmod></url>\n" +
		"</urlset>",
);
const indexXml = renderSitemapIndexXml({ publicOrigin: origin, shards });
assert.match(indexXml, /https:\/\/example\.test\/sitemaps\/static-1\.xml/);
assert.match(indexXml, /2026-09-08T10:00:00\.000Z/);

assert.equal(
	renderDiscoveryRobots({ publicOrigin: origin, indexingEnabled: false }),
	"User-agent: *\nDisallow: /\n",
);
const publicRobots = renderDiscoveryRobots({
	publicOrigin: origin,
	indexingEnabled: true,
});
assert.match(publicRobots, /Disallow: \/admin\//);
assert.match(publicRobots, /Sitemap: https:\/\/example\.test\/sitemap\.xml/);

console.log(
	"Discovery feeds verified: four profiles, groups, shards, lastmod, XML and robots.",
);

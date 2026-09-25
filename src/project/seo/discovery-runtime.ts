import "server-only";

import {
	buildDiscoveryShards,
	type DiscoveryCandidate,
	type DiscoveryGroup,
} from "@/core/seo/discovery-feeds";
import { getPublicSitemapEntries } from "@/project/data-access/public";
import { getProjectIndexingPolicy } from "@/project/indexing-policy";
import { getSiteUrl } from "@/project/seo/site";
import { createProjectUrlGrammar } from "@/project/url-grammar";
import { siteProfile } from "@/project/site-profile";

const grammar = createProjectUrlGrammar(siteProfile);

function groupFor(path: string): DiscoveryGroup {
	const pageKey = grammar.parseUrl(path);
	switch (pageKey?.kind) {
		case "geoHub":
			return "geo";
		case "categoryRoot":
		case "categoryGeo":
			return "catalog";
		case "categoryGeoDistrict":
			return "districts";
		case "categoryGeoFacet":
			return "facets";
		case "development":
			return "developments";
		case "developerRoot":
		case "geoDevelopers":
		case "developer":
			return "developers";
		case "property":
			return "properties";
		default:
			return "static";
	}
}

export async function getRuntimeDiscoveryShards() {
	if (getProjectIndexingPolicy() !== "public") return [];
	const entries = await getPublicSitemapEntries();
	const candidates: DiscoveryCandidate[] = entries.flatMap((entry) => {
		if (!entry.indexable) return [];
		const path =
			entry.path === "/" ? "/" : `${entry.path.replace(/\/+$/, "")}/`;
		return [
			{
				group: groupFor(path),
				path,
				canonicalPath: path,
				lastModified: entry.lastModified ?? "2026-09-25T00:00:00.000Z",
				published: true,
				gate: {
					statusCode: 200,
					indexing: "index",
					following: "follow",
					canonical: path,
					includeInSitemap: true,
				},
			},
		];
	});
	return buildDiscoveryShards({
		publicOrigin: getSiteUrl(),
		candidates,
	});
}

import "server-only";

import {
	buildDiscoveryShards,
	type DiscoveryCandidate,
	type DiscoveryGroup,
} from "@/core/seo/discovery-feeds";
import { decidePage as decideResolvedPage } from "@/core/routing";
import { getPublicSitemapEntries } from "@/project/data-access/public";
import { getProjectIndexingPolicy } from "@/project/indexing-policy";
import { getSiteUrl } from "@/project/seo/site";
import { createProjectUrlGrammar } from "@/project/url-grammar";
import { siteProfile } from "@/project/site-profile";
import { resolveRuntimeRoute } from "@/project/routing/runtime-route";

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
	const candidates = (
		await Promise.all(
			entries.map(
				async (entry): Promise<DiscoveryCandidate | null> => {
					if (!entry.indexable || !entry.lastModified) return null;
					const path =
						entry.path === "/"
							? "/"
							: `${entry.path.replace(/\/+$/, "")}/`;
					const pageKey = grammar.parseUrl(path);
					if (!pageKey) return null;
					const runtime = await resolveRuntimeRoute(path);
					const gate =
						runtime.decision.kind === "page"
							? runtime.decision.gate
							: pageKey.kind === "home" || pageKey.kind === "static"
								? decideResolvedPage(
							siteProfile,
							pageKey,
							{
								kind: "page",
								pageKey,
								canonicalPath: path,
								profileStatus: "ACTIVE",
								lifecycle: "active",
								market: null,
								dataTier: null,
								inventory: 0,
							},
							{
								kind: "static",
								url: path,
								canonical: path,
								profileStatus: "ACTIVE",
							},
									).gate
								: null;
					if (!gate) return null;
					return {
						group: groupFor(path),
						path,
						canonicalPath: path,
						lastModified: entry.lastModified,
						published: true,
						gate,
					};
				},
			),
		)
	).filter((candidate): candidate is DiscoveryCandidate => candidate !== null);
	return buildDiscoveryShards({
		publicOrigin: getSiteUrl(),
		candidates,
	});
}

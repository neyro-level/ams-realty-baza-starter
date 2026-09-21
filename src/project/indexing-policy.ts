import type { MetadataRoute } from "next";
import { clientReadinessConfig } from "./client-readiness.config.ts";
import { type ProjectKind, siteConfig } from "./site.config.ts";

export type IndexingPolicy = "public" | "noindex";

export function resolveIndexingPolicy(input: {
	projectKind: ProjectKind;
	productionIndexing: IndexingPolicy | null;
}): IndexingPolicy {
	if (input.projectKind === "starter-demo") return "noindex";
	return input.productionIndexing ?? "noindex";
}

export function getProjectIndexingPolicy(): IndexingPolicy {
	return resolveIndexingPolicy({
		projectKind: siteConfig.projectKind,
		productionIndexing: clientReadinessConfig.productionIndexing,
	});
}

export function metadataRobotsForPolicy(policy: IndexingPolicy) {
	return policy === "public"
		? { index: true, follow: true }
		: { index: false, follow: false };
}

export function buildRobots(
	policy: IndexingPolicy,
	host: string,
): MetadataRoute.Robots {
	if (policy === "noindex") {
		return {
			rules: [{ userAgent: "*", disallow: "/" }],
		};
	}

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin", "/api"],
			},
		],
		sitemap: `${host}/sitemap.xml`,
		host,
	};
}

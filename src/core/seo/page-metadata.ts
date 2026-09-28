import type { PageSEOContract } from "@ams/realtbase-contracts";
import type { Metadata } from "next";
import { composeFinalRobots, type GlobalIndexingPolicy } from "./final-robots";

export function toMetadata(
	seo: PageSEOContract,
	globalIndexingPolicy: GlobalIndexingPolicy,
): Metadata {
	return {
		title: seo.title,
		description: seo.description,
		alternates: { canonical: seo.canonicalPath },
		robots: composeFinalRobots(globalIndexingPolicy, seo),
		openGraph: seo.openGraph
			? {
					title: seo.openGraph.title ?? seo.title,
					description: seo.openGraph.description ?? seo.description,
				}
			: undefined,
	};
}

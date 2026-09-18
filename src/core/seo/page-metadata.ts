import type { PageSEOContract } from "@ams/realtbase-contracts";
import type { Metadata } from "next";

export function toMetadata(seo: PageSEOContract): Metadata {
	return {
		title: seo.title,
		description: seo.description,
		alternates: { canonical: seo.canonicalPath },
		robots: {
			index: seo.indexing === "index",
			follow: seo.following === "follow",
		},
		openGraph: seo.openGraph
			? {
					title: seo.openGraph.title ?? seo.title,
					description: seo.openGraph.description ?? seo.description,
				}
			: undefined,
	};
}

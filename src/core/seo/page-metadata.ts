import type { PageSEOContract } from "@ams/realtbase-contracts";
import type { Metadata } from "next";
import { composeFinalRobots, type GlobalIndexingPolicy } from "./final-robots";

export type PublicMetadataOptions = {
	globalIndexingPolicy: GlobalIndexingPolicy;
	webmasterVerification?: Metadata["verification"];
};

export function toMetadata(
	seo: PageSEOContract,
	options: PublicMetadataOptions,
): Metadata {
	return {
		title: seo.title,
		description: seo.description,
		alternates: { canonical: seo.canonicalPath },
		robots: composeFinalRobots(options.globalIndexingPolicy, seo),
		verification: options.webmasterVerification,
		openGraph: seo.openGraph
			? {
					title: seo.openGraph.title ?? seo.title,
					description: seo.openGraph.description ?? seo.description,
				}
			: undefined,
	};
}

export function toPublicSiteMetadata(input: {
	title: string;
	metadataBase: URL;
	options: PublicMetadataOptions;
}): Metadata {
	return {
		metadataBase: input.metadataBase,
		title: input.title,
		robots: composeFinalRobots(input.options.globalIndexingPolicy, {
			indexing: "index",
			following: "follow",
		}),
		verification: input.options.webmasterVerification,
	};
}

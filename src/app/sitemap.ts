import type { MetadataRoute } from "next";
import { getPublicSitemapEntries } from "@/server/public-gateway";
import { absoluteUrl, staticPublicUrlEntries } from "@/server/seo/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const dynamicEntries = await getPublicSitemapEntries();
	const entries = [...staticPublicUrlEntries, ...dynamicEntries].filter(
		(entry) => entry.indexable,
	);

	return entries.map((entry) => ({
		url: absoluteUrl(entry.path),
		lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
		changeFrequency: entry.changeFrequency,
		priority: entry.priority,
	}));
}

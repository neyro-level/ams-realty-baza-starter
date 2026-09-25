import type { MetadataRoute } from "next";
import { renderDiscoveryRobots } from "@/core/seo/discovery-feeds";
import { getSiteUrl } from "@/project/seo/site";
import { getProjectIndexingPolicy } from "@/project/indexing-policy";

export default function robots(): MetadataRoute.Robots {
	const publicOrigin = getSiteUrl();
	const indexingEnabled = getProjectIndexingPolicy() === "public";
	const rendered = renderDiscoveryRobots({ publicOrigin, indexingEnabled });
	if (!indexingEnabled) {
		return { rules: [{ userAgent: "*", disallow: "/" }] };
	}
	const sitemap = rendered
		.split("\n")
		.find((line) => line.startsWith("Sitemap: "))
		?.slice("Sitemap: ".length);
	return {
		rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
		sitemap,
		host: new URL(publicOrigin).host,
	};
}

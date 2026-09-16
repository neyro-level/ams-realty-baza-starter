import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/server/seo/site";

export default function robots(): MetadataRoute.Robots {
	const host = getSiteUrl();
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin", "/api", "/api/internal"],
			},
		],
		sitemap: `${host}/sitemap.xml`,
		host,
	};
}

import { renderDiscoveryRobots } from "../../core/seo/discovery-feeds.ts";
import { getProjectIndexingPolicy } from "../../project/indexing-policy.ts";
import { getSiteUrl } from "../../project/seo/site.ts";

export const revalidate = 3600;

const cleanParam = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
	"utm_id",
	"utm_referrer",
	"utm_media",
	"utm_group",
	"utm_expid",
	"yclid",
	"ysclid",
	"yrclid",
	"gclid",
	"_openstat",
].join("&");

export async function GET() {
	const indexingEnabled = getProjectIndexingPolicy() === "public";
	return new Response(
		renderDiscoveryRobots({
			publicOrigin: getSiteUrl(),
			indexingEnabled,
			cleanParam: indexingEnabled ? cleanParam : undefined,
		}),
		{
			headers: {
				"content-type": "text/plain; charset=utf-8",
				"cache-control": "public, max-age=0, s-maxage=3600",
			},
		},
	);
}

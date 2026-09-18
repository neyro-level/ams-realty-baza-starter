import { notFound } from "next/navigation";
import { MarketingPageView } from "@ams/realtbase-ui";
import { getPublicMarketingPage } from "@/core/data-access/public";
import { toMetadata } from "@/core/seo/page-metadata";

export async function MarketingRoute({ slug }: { slug: string }) {
	const page = await getPublicMarketingPage(slug);
	if (!page) notFound();
	return <MarketingPageView page={page} />;
}

export async function generateMarketingMetadata(slug: string) {
	const page = await getPublicMarketingPage(slug);
	return page ? toMetadata(page.seo) : {};
}

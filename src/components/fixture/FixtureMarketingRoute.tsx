import { notFound } from "next/navigation";
import { toMetadata } from "@/fixture/metadata";
import { getPublicMarketingPage } from "@/core/data-access/public";
import { MarketingPageView } from "./FixturePages";

export async function FixtureMarketingRoute({ slug }: { slug: string }) {
	const page = await getPublicMarketingPage(slug);
	if (!page) notFound();
	return <MarketingPageView page={page} />;
}

export async function generateFixtureMetadata(slug: string) {
	const page = await getPublicMarketingPage(slug);
	return page ? toMetadata(page.seo) : {};
}

import {
	HomeFeaturedSection,
	HomeHeroSection,
	HomeLeadSection,
	HomeProcessSection,
	HomeServicesSection,
	HomeTrustSection,
} from "@ams/realtbase-ui";
import { toMetadata } from "@/core/seo/page-metadata";
import { getPublicHomePage } from "@/project/data-access/public";
import {
	buildOrganizationJsonLd,
	buildWebsiteJsonLd,
	JsonLdScript,
} from "@/project/seo/structured-data";

export const revalidate = 3600;

export async function generateMetadata() {
	const home = await getPublicHomePage();
	return toMetadata(home.page.seo);
}

export default async function HomePage() {
	const home = await getPublicHomePage();
	return (
		<>
			<JsonLdScript data={buildOrganizationJsonLd()} />
			<JsonLdScript data={buildWebsiteJsonLd(home.page)} />
			<HomeHeroSection page={home.page} featured={home.featured} />
			<HomeServicesSection page={home.page} />
			<HomeFeaturedSection featured={home.featured} />
			<HomeProcessSection page={home.page} />
			<HomeTrustSection />
			<HomeLeadSection page={home.page} />
		</>
	);
}

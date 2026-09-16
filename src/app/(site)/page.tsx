import { HomePageView } from "@/components/fixture/FixturePages";
import { toMetadata } from "@/fixture/metadata";
import { getPublicHomePage } from "@/server/public-gateway";
import {
	buildOrganizationJsonLd,
	buildWebsiteJsonLd,
	JsonLdScript,
} from "@/server/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
	const home = await getPublicHomePage();
	return toMetadata(home.page.seo);
}

export default async function HomePage() {
	const home = await getPublicHomePage();
	if (!home.featured) return null;
	return (
		<>
			<JsonLdScript data={buildOrganizationJsonLd()} />
			<JsonLdScript data={buildWebsiteJsonLd(home.page)} />
			<HomePageView page={home.page} featured={home.featured} />
		</>
	);
}

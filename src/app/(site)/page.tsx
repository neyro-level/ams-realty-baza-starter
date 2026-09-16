import { HomePageView } from "@/components/fixture/FixturePages";
import { toMetadata } from "@/fixture/metadata";
import { fixtureHome, fixtureProperties } from "@/fixture/provider";

export const metadata = toMetadata(fixtureHome.seo);

export default function HomePage() {
	const featured =
		fixtureProperties.find(
			(item) => item.id === fixtureHome.featuredPropertyId,
		) ?? fixtureProperties[0];
	if (!featured) return null;
	return <HomePageView page={fixtureHome} featured={featured} />;
}

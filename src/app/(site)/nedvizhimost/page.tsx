import { CatalogPageView } from "@/components/fixture/FixturePages";
import { toMetadata } from "@/fixture/metadata";
import { fixtureHome, getFixtureCatalog } from "@/fixture/provider";

export const metadata = toMetadata({
	...fixtureHome.seo,
	title: "Каталог недвижимости — AMS Realty Baza Starter",
	description: "Fixture-каталог объектов недвижимости.",
	canonicalPath: "/nedvizhimost",
});

export default async function CatalogPage() {
	const catalog = await getFixtureCatalog();
	return <CatalogPageView list={catalog.list} filters={catalog.filters} />;
}

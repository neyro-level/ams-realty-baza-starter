import { CatalogPageView } from "@/components/fixture/FixturePages";
import { toMetadata } from "@/fixture/metadata";
import { getPublicCatalog } from "@/server/public-gateway";

export const dynamic = "force-dynamic";

export const metadata = toMetadata({
	title: "Каталог недвижимости — AMS Realty Baza Starter",
	description: "Каталог опубликованных объектов недвижимости.",
	canonicalPath: "/nedvizhimost",
	indexing: "index",
	following: "follow",
});

export default async function CatalogPage() {
	const catalog = await getPublicCatalog();
	return <CatalogPageView list={catalog.list} filters={catalog.filters} />;
}

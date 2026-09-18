import { CatalogPageView } from "@ams/realtbase-ui";
import { getPublicCatalog } from "@/server/public-gateway";
import {
	buildCatalogMetadata,
	buildCatalogSeoDecision,
	type CatalogSearchParams,
} from "@/server/seo/catalog";
import {
	buildCatalogItemListJsonLd,
	JsonLdScript,
} from "@/server/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	searchParams,
}: PageProps<"/nedvizhimost">) {
	return buildCatalogMetadata((await searchParams) as CatalogSearchParams);
}

export default async function CatalogPage({
	searchParams,
}: PageProps<"/nedvizhimost">) {
	const decision = buildCatalogSeoDecision(
		(await searchParams) as CatalogSearchParams,
	);
	const catalog = await getPublicCatalog(decision.query);
	return (
		<>
			<JsonLdScript data={buildCatalogItemListJsonLd(catalog.list)} />
			<CatalogPageView list={catalog.list} filters={catalog.filters} />
		</>
	);
}

import { CatalogPageView } from "@ams/realtbase-ui";
import { getPublicCatalog } from "@/core/data-access/public";
import {
	buildCatalogMetadata,
	buildCatalogSeoDecision,
	type CatalogSearchParams,
} from "@/core/seo/catalog";
import {
	buildCatalogItemListJsonLd,
	JsonLdScript,
} from "@/core/seo/structured-data";
import { leadConsentContext } from "@/project/legal.config";

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
			<CatalogPageView
				list={catalog.list}
				filters={catalog.filters}
				leadContext={{
					formKind: "general",
					sourcePage: "/nedvizhimost",
					...leadConsentContext(),
				}}
			/>
		</>
	);
}

import type { MarketingPageDTO } from "@ams/realtbase-contracts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyPageView } from "@/components/fixture/FixturePages";
import { toMetadata } from "@/fixture/metadata";
import { fixtureProperties, getFixtureProperty } from "@/fixture/provider";

export function generateStaticParams() {
	return fixtureProperties.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
	params,
}: PageProps<"/obekty/[slug]">): Promise<Metadata> {
	const { slug } = await params;
	const property = await getFixtureProperty(slug);
	if (!property) return {};
	return toMetadata({
		title: `${property.title} — AMS Realty Baza Starter`,
		description: property.description,
		canonicalPath: property.href,
		indexing: "noindex",
		following: "nofollow",
	});
}

export default async function PropertyPage({
	params,
}: PageProps<"/obekty/[slug]">) {
	const { slug } = await params;
	const property = await getFixtureProperty(slug);
	if (!property) notFound();
	const leadPage: MarketingPageDTO = {
		slug: property.slug,
		eyebrow: "Просмотр объекта",
		title: property.title,
		lead: property.address,
		seo: {
			title: property.title,
			description: property.description,
			canonicalPath: property.href,
			indexing: "noindex",
			following: "nofollow",
		},
		breadcrumbs: { items: [] },
		sections: [],
		leadContext: {
			formKind: "property",
			sourcePage: property.href,
			property: { id: property.id, slug: property.slug, title: property.title },
			consentVersion: "fixture-consent-v1",
			consentHref: "/soglasie-na-obrabotku-personalnyh-dannyh",
			consentRequired: true,
		},
	};
	return <PropertyPageView property={property} leadPage={leadPage} />;
}

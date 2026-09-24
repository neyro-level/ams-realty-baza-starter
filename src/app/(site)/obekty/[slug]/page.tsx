import type { MarketingPageDTO } from "@ams/realtbase-contracts";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GonePropertyPageView, PropertyPageView } from "@ams/realtbase-ui";
import { toMetadata } from "@/core/seo/page-metadata";
import { getPublicProperty } from "@/project/data-access/public";
import { getPropertyRobots } from "@/core/seo/property";
import {
	buildBreadcrumbJsonLd,
	buildPropertyJsonLd,
	JsonLdScript,
} from "@/project/seo/structured-data";
import { siteConfig } from "@/project/site.config";
import { leadConsentContext } from "@/project/legal.config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: PageProps<"/obekty/[slug]">): Promise<Metadata> {
	const { slug } = await params;
	const state = await getPublicProperty(slug);
	if (!state) return {};
	if (!("property" in state)) {
		if (state.lifecycle.kind === "gone") {
			return toMetadata({
				title: `Объект снят с публикации — ${siteConfig.brandName}`,
				description:
					"Объект больше не публикуется. Посмотрите актуальные предложения в каталоге.",
				canonicalPath: `/obekty/${slug}`,
				indexing: "noindex",
				following: "follow",
			});
		}

		return {};
	}

	const { property } = state;
	const robots = getPropertyRobots(property);
	return toMetadata({
		title: `${property.title} — ${siteConfig.brandName}`,
		description: property.description,
		canonicalPath: property.href,
		indexing: robots.indexing,
		following: robots.following,
		openGraph: {
			title: property.title,
			description: property.description,
			image: property.primaryMedia ?? undefined,
		},
	});
}

export default async function PropertyPage({
	params,
}: PageProps<"/obekty/[slug]">) {
	const { slug } = await params;
	const state = await getPublicProperty(slug);
	if (!state) notFound();
	if (!("property" in state)) {
		if (state.lifecycle.kind === "redirect") {
			permanentRedirect(state.lifecycle.destination);
		}

		return <GonePropertyPageView slug={slug} />;
	}

	const { property } = state;
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
			...leadConsentContext(),
		},
	};
	return (
		<>
			{property.lifecycle.isArchived ? (
				<div className="border-b border-border bg-surface-subtle px-4 py-3 text-center text-body text-content-default">
					Этот объект уже в архиве. Страница доступна внутри retention-периода и
					закрыта от индексации; ниже показаны актуальные альтернативы.
				</div>
			) : null}
			<JsonLdScript data={buildPropertyJsonLd(property)} />
			<JsonLdScript
				data={buildBreadcrumbJsonLd([
					{ name: "Главная", path: "/" },
					{ name: "Недвижимость", path: "/nedvizhimost" },
					{ name: property.title, path: property.href },
				])}
			/>
			<PropertyPageView
				property={property}
				leadContext={leadPage.leadContext}
			/>
		</>
	);
}

import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
	DeveloperView,
	DevelopersListView,
	DevelopmentDetailsView,
	GeoHubView,
	ListingView,
	PropertyPageView,
} from "@ams/realtbase-ui";
import type { PageSEOContract } from "@ams/realtbase-contracts";
import { toMetadata } from "@/core/seo/page-metadata";
import { leadConsentContext } from "@/project/legal.config";
import { resolveRuntimeRoute } from "@/project/routing/runtime-route";
import { projectSeoMeta } from "@/project/seo/templates";
import { pageHref } from "@/project/routing/catalog-search-params";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function pathname(segments: readonly string[]) {
	return `/${segments.join("/")}/`;
}

type CanonicalRouteProps = {
	params: Promise<{ segments: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryString(input: Record<string, string | string[] | undefined>) {
	const params = new URLSearchParams();
	for (const key of Object.keys(input).sort()) {
		const value = input[key];
		for (const item of Array.isArray(value)
			? value
			: value === undefined
				? []
				: [value]) {
			params.append(key, item);
		}
	}
	return params.toString();
}

function routeSeo(
	data: NonNullable<Awaited<ReturnType<typeof resolveRuntimeRoute>>["data"]>,
	brandName: string,
): PageSEOContract {
	if (data.kind === "developers") {
		return {
			title: "Застройщики",
			description: "Застройщики и опубликованные проекты недвижимости.",
			canonicalPath: "/zastroyshchiki/",
			indexing: "noindex",
			following: "follow",
		};
	}
	if (data.kind === "property") {
		return projectSeoMeta(
			"property",
			{
				brand: brandName,
				entityName: data.value.title,
				freshPrice: data.value.price
					? { label: data.value.price.label, fresh: true }
					: undefined,
			},
			data.value.href,
		);
	}
	return data.value.seo;
}

export async function generateMetadata({
	params,
	searchParams,
}: CanonicalRouteProps): Promise<Metadata> {
	const [{ segments }, query] = await Promise.all([params, searchParams]);
	const result = await resolveRuntimeRoute(
		pathname(segments),
		queryString(query),
	);
	if (result.decision.kind !== "page" || !result.data || !result.brandName) {
		return {};
	}
	const seo = routeSeo(result.data, result.brandName);
	return toMetadata({
		...seo,
		canonicalPath: result.decision.canonicalPath,
		indexing: result.decision.robots.indexing,
		following: result.decision.robots.following,
	});
}

export default async function CanonicalRuntimePage({
	params,
	searchParams,
}: CanonicalRouteProps) {
	const [{ segments }, query] = await Promise.all([params, searchParams]);
	const routePath = pathname(segments);
	const result = await resolveRuntimeRoute(routePath, queryString(query));
	if (result.decision.kind === "redirect") {
		permanentRedirect(result.decision.destinationPath);
	}
	if (result.decision.kind !== "page" || !result.data) notFound();

	switch (result.data.kind) {
		case "geoHub":
			return <GeoHubView hub={result.data.value} />;
		case "listing": {
			const listing = result.data;
			const listingQuery = listing.query;
			return (
				<ListingView
					listing={listing.value}
					pageHref={
						listingQuery
							? (page) => pageHref(routePath, listingQuery, page)
							: undefined
					}
				/>
			);
		}
		case "developers":
			return <DevelopersListView developers={result.data.value} />;
		case "developer": {
			const developer = result.data.value;
			return (
				<DeveloperView
					developer={developer}
					developments={result.data.developments}
					total={result.data.pagination.total}
					page={result.data.pagination.page}
					totalPages={result.data.pagination.totalPages}
					pageHref={(page) =>
						page <= 1 ? routePath : `${routePath}?page=${page}`
					}
				/>
			);
		}
		case "development":
			return (
				<DevelopmentDetailsView
					development={result.data.value}
					leadContext={{
						formKind: "general",
						sourcePage: result.data.value.href,
						...leadConsentContext(),
					}}
				/>
			);
		case "property":
			return (
				<PropertyPageView
					property={result.data.value}
					leadContext={{
						formKind: "property",
						sourcePage: result.data.value.href,
						property: {
							id: result.data.value.id,
							slug: result.data.value.slug,
							title: result.data.value.title,
						},
						...leadConsentContext(),
					}}
				/>
			);
	}
}

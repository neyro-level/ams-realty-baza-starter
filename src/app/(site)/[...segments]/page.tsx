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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function pathname(segments: readonly string[]) {
	return `/${segments.join("/")}/`;
}

type CanonicalRouteProps = { params: Promise<{ segments: string[] }> };

function routeSeo(data: NonNullable<Awaited<ReturnType<typeof resolveRuntimeRoute>>["data"]>): PageSEOContract {
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
		return {
			title: data.value.title,
			description: data.value.description,
			canonicalPath: data.value.href,
			indexing: "noindex",
			following: "follow",
		};
	}
	return data.value.seo;
}

export async function generateMetadata({
	params,
}: CanonicalRouteProps): Promise<Metadata> {
	const { segments } = await params;
	const result = await resolveRuntimeRoute(pathname(segments));
	if (result.decision.kind !== "page" || !result.data) return {};
	const seo = routeSeo(result.data);
	return toMetadata({
		...seo,
		canonicalPath: result.decision.canonicalPath,
		indexing: result.decision.robots.indexing,
		following: result.decision.robots.following,
	});
}

export default async function CanonicalRuntimePage({
	params,
}: CanonicalRouteProps) {
	const { segments } = await params;
	const result = await resolveRuntimeRoute(pathname(segments));
	if (result.decision.kind === "redirect") {
		permanentRedirect(result.decision.destinationPath);
	}
	if (result.decision.kind !== "page" || !result.data) notFound();

	switch (result.data.kind) {
		case "geoHub":
			return <GeoHubView hub={result.data.value} />;
		case "listing":
			return <ListingView listing={result.data.value} />;
		case "developers":
			return <DevelopersListView developers={result.data.value} />;
		case "developer": {
			const developer = result.data.value;
			return (
				<DeveloperView
					developer={developer}
					developments={result.data.developments.filter(
						(item) => item.developer?.id === developer.id,
					)}
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

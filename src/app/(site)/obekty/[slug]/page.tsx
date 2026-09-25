import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GonePropertyPageView } from "@ams/realtbase-ui";
import { toMetadata } from "@/core/seo/page-metadata";
import { getPublicProperty } from "@/project/data-access/public";
import { getPropertyRobots } from "@/core/seo/property";
import { siteConfig } from "@/project/site.config";

export const dynamic = "force-dynamic";

type LegacyPropertyPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: LegacyPropertyPageProps): Promise<Metadata> {
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
}: LegacyPropertyPageProps) {
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
	permanentRedirect(property.href);
}

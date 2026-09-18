import type { MarketingPageDTO } from "@ams/realtbase-contracts";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PropertyPageView } from "@ams/realtbase-ui";
import { toMetadata } from "@/core/seo/page-metadata";
import { getPublicProperty } from "@/core/data-access/public";
import { getPropertyRobots } from "@/core/seo/property";
import {
	buildBreadcrumbJsonLd,
	buildPropertyJsonLd,
	JsonLdScript,
} from "@/core/seo/structured-data";

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
				title: "Объект снят с публикации — AMS Realty Baza Starter",
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
		title: `${property.title} — AMS Realty Baza Starter`,
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

		return <GonePropertyPage slug={slug} />;
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
			consentVersion: "pd-2026-01",
			consentHref: "/soglasie-na-obrabotku-personalnyh-dannyh",
			consentRequired: true,
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
			<PropertyPageView property={property} leadContext={leadPage.leadContext} />
		</>
	);
}

function GonePropertyPage({ slug }: { slug: string }) {
	return (
		<main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
			<p className="mb-3 font-medium text-content-muted text-sm uppercase tracking-[0.2em]">
				410
			</p>
			<h1 className="text-balance font-semibold text-4xl text-content-default">
				Объект снят с публикации
			</h1>
			<p className="mt-4 text-balance text-body-lg text-content-muted">
				Страница объекта {slug} больше не содержит публичные данные после
				окончания retention-периода. Автоматический редирект на главную не
				выполняется.
			</p>
			<a
				className="mt-8 rounded-full bg-content-default px-6 py-3 font-medium text-surface text-sm"
				href="/nedvizhimost"
			>
				Смотреть актуальные объекты
			</a>
		</main>
	);
}

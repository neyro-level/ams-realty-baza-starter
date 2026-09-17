import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import type { ReactNode } from "react";
import type { SitemapListingPageDTO } from "../../view-models/content";
import type { SiteLinkRenderer } from "../../lib/adapters";

export function HtmlSitemapListingView({
	page,
	breadcrumbs,
	linkRenderer: LinkRenderer,
}: {
	page: SitemapListingPageDTO;
	breadcrumbs: ReactNode;
	linkRenderer: SiteLinkRenderer;
}) {
	const totalPages = Math.max(1, Math.ceil(page.total / page.pageSize));
	const title =
		page.kind === "objects"
			? "Актуальные объекты недвижимости"
			: "Резерв объектов";
	const basePath = `/sitemap/${page.kind}`;
	return (
		<main className="bg-[var(--html-sitemap-listing-surface-primary)] text-[var(--html-sitemap-listing-content-primary)]">
			<header className="border-b border-[var(--html-sitemap-listing-border-primary)] bg-[var(--surface-card)]">
				<div className="mx-auto max-w-295 px-5 py-9 md:px-8 md:py-12">
					{breadcrumbs}
					<LinkRenderer
						href="/sitemap"
						className="inline-flex min-h-11 items-center gap-2 text-body font-bold text-[var(--html-sitemap-listing-content-secondary)] hover:text-[var(--accent)]"
					>
						<ArrowLeft className="size-4" aria-hidden /> Карта сайта
					</LinkRenderer>
					<h1 className="mt-4 text-heading-large font-extrabold leading-tight-copy md:text-display-medium">
						{title}
					</h1>
					<p className="mt-3 text-body text-[var(--html-sitemap-listing-content-tertiary)]">
						Страница {page.page} из {totalPages}. Всего объектов: {page.total}.
					</p>
				</div>
			</header>
			<section className="mx-auto max-w-295 px-5 py-8 md:px-8 md:py-12">
				<div className="grid gap-px overflow-hidden rounded-lg border border-[var(--html-sitemap-listing-border-primary)] bg-[var(--html-sitemap-listing-surface-secondary)] sm:grid-cols-2 lg:grid-cols-3">
					{page.items.map((item) => (
						<LinkRenderer
							key={item.id}
							href={`/obekty/${item.slug}`}
							className="group flex min-h-22 gap-3 bg-[var(--surface-card)] p-4 transition hover:bg-[var(--html-sitemap-listing-surface-tertiary)]"
						>
							<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--html-sitemap-listing-surface-subtle)] text-[var(--accent)]">
								<Building2 className="size-4" aria-hidden />
							</span>
							<span className="min-w-0 text-body font-semibold leading-step-body text-[var(--html-sitemap-listing-content-subtle)] group-hover:text-[var(--accent)]">
								{item.title}
							</span>
						</LinkRenderer>
					))}
				</div>
				<nav
					className="mt-6 flex flex-wrap items-center justify-center gap-2"
					aria-label="Пагинация карты сайта"
				>
					{page.page > 1 ? (
						<LinkRenderer
							href={`${basePath}/${page.page - 1}`}
							className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--html-sitemap-listing-border-secondary)] bg-[var(--surface-card)] px-4 text-body font-bold"
						>
							<ArrowLeft className="size-4" aria-hidden /> Назад
						</LinkRenderer>
					) : null}
					{buildPagination(page.page, totalPages).map((item) =>
						typeof item === "string" ? (
							<span
								key={item}
								className="grid min-h-11 min-w-11 place-items-center text-body text-[var(--html-sitemap-listing-content-secondary)]"
							>
								…
							</span>
						) : (
							<LinkRenderer
								key={item}
								href={`${basePath}/${item}`}
								ariaCurrent={item === page.page ? "page" : undefined}
								className={`grid min-h-11 min-w-11 place-items-center rounded-lg border px-3 text-body font-bold ${item === page.page ? "border-[var(--html-sitemap-listing-border-tertiary)] bg-[var(--html-sitemap-listing-surface-muted)] text-white" : "border-[var(--html-sitemap-listing-border-secondary)] bg-[var(--surface-card)] text-[var(--html-sitemap-listing-content-muted)]"}`}
							>
								{item}
							</LinkRenderer>
						),
					)}
					{page.page < totalPages ? (
						<LinkRenderer
							href={`${basePath}/${page.page + 1}`}
							className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--html-sitemap-listing-surface-muted)] px-4 text-body font-bold text-white"
						>
							Далее <ArrowRight className="size-4" aria-hidden />
						</LinkRenderer>
					) : null}
				</nav>
			</section>
		</main>
	);
}
function buildPagination(
	page: number,
	totalPages: number,
): Array<number | `ellipsis-${number}-${number}`> {
	const pages = new Set([
		1,
		totalPages,
		page - 2,
		page - 1,
		page,
		page + 1,
		page + 2,
	]);
	const visible = [...pages]
		.filter((item) => item >= 1 && item <= totalPages)
		.sort((a, b) => a - b);
	const result: Array<number | `ellipsis-${number}-${number}`> = [];
	visible.forEach((item, index) => {
		const previous = visible.at(index - 1);
		if (previous !== undefined && item - previous > 1) {
			result.push(`ellipsis-${previous}-${item}`);
		}
		result.push(item);
	});
	return result;
}

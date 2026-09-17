import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type {
	HtmlSitemapPageDTO,
	SitemapColumnDTO,
	SitemapLinkDTO,
} from "../../view-models/content";
import type { SiteLinkRenderer } from "../../lib/adapters";

export function HtmlSitemapView({
	page,
	breadcrumbs,
	linkRenderer: LinkRenderer,
}: {
	page: HtmlSitemapPageDTO;
	breadcrumbs: ReactNode;
	linkRenderer: SiteLinkRenderer;
}) {
	return (
		<main className="bg-[var(--surface-card)] pb-24 text-[var(--html-sitemap-content-primary)] md:pb-32">
			<section className="mx-auto max-w-site-frame px-5 pb-7 pt-7 md:pb-9 md:pt-9 lg:pb-10 lg:pt-10">
				{breadcrumbs}
				<div className="flex flex-col gap-4 border-b border-[var(--html-sitemap-border-primary)] pb-5 md:flex-row md:items-end md:justify-between">
					<h1 className="text-section-small font-semibold leading-tight-copy md:text-section-prominent">
						Опубликованные страницы
					</h1>
					<dl
						className="grid grid-cols-3 gap-2 md:flex md:items-end md:gap-3"
						aria-label="Счетчики опубликованных страниц"
					>
						<Counter
							label="Всего страниц"
							value={page.metrics.totalPages}
							featured
						/>
						<Counter
							label="Основные страницы"
							value={page.metrics.staticPages}
						/>
						<Counter
							label="Объекты недвижимости"
							value={page.metrics.objectPages}
						/>
					</dl>
				</div>
			</section>
			<section className="mx-auto max-w-site-frame px-5">
				<div className="grid gap-0">
					{page.sections.map((section) => (
						<SitemapSection
							key={section.title}
							section={section}
							linkRenderer={LinkRenderer}
						/>
					))}
				</div>
			</section>
		</main>
	);
}

function SitemapSection({
	section,
	linkRenderer: LinkRenderer,
}: {
	section: HtmlSitemapPageDTO["sections"][number];
	linkRenderer: SiteLinkRenderer;
}) {
	const columns = section.columns.filter((column) => column.items.length);
	if (!columns.length) return null;
	return (
		<details className="group border-b border-[var(--html-sitemap-border-primary)] py-5 first:pt-0">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-5 [&::-webkit-details-marker]:hidden">
				<span className="min-w-0">
					<span
						id={sectionId(section.title)}
						className="block text-lead font-semibold leading-tight-copy text-[var(--text-primary)] md:text-heading-small"
					>
						{section.title}
					</span>
					<span className="mt-1 block text-label font-medium leading-step-small text-[var(--text-muted)]">
						{section.count ?? countItems(columns)} ссылок
					</span>
				</span>
				<ChevronDown
					className="size-5 shrink-0 text-[var(--text-muted)] transition group-open:rotate-180 group-hover:text-[var(--accent)]"
					aria-hidden
				/>
			</summary>
			<div className="grid gap-x-12 gap-y-8 pt-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
				{columns.map((column, index) =>
					section.grouped ? (
						<ul key={column.title ?? index} className="grid gap-2.5">
							{column.items.map((item) => (
								<li key={item.href}>
									<TextLink item={item} linkRenderer={LinkRenderer} />
								</li>
							))}
						</ul>
					) : (
						<Column
							key={column.title ?? index}
							column={column}
							linkRenderer={LinkRenderer}
						/>
					),
				)}
			</div>
		</details>
	);
}
function Column({
	column,
	linkRenderer: LinkRenderer,
}: {
	column: SitemapColumnDTO;
	linkRenderer: SiteLinkRenderer;
}) {
	return (
		<div className="min-w-0">
			{column.title ? (
				<h3 className="text-body-compact font-semibold leading-step-body text-[var(--text-primary)]">
					{column.title}
				</h3>
			) : null}
			<ul className={`${column.title ? "mt-3" : ""} grid gap-2.5`}>
				{column.items.map((item) => (
					<li key={item.href}>
						<TextLink item={item} linkRenderer={LinkRenderer} />
					</li>
				))}
			</ul>
		</div>
	);
}
function TextLink({
	item,
	linkRenderer: LinkRenderer,
}: {
	item: SitemapLinkDTO;
	linkRenderer: SiteLinkRenderer;
}) {
	return (
		<LinkRenderer
			href={item.href}
			className={`text-body leading-step-body text-[var(--html-sitemap-content-secondary)] transition hover:text-[var(--accent)] ${item.emphasis ? "font-semibold" : "font-medium"}`}
		>
			{item.label}
		</LinkRenderer>
	);
}
function Counter({
	label,
	value,
	featured = false,
}: {
	label: string;
	value: number;
	featured?: boolean;
}) {
	return (
		<div
			className={`rounded-lg px-3 py-2 text-right md:min-w-33 ${featured ? "bg-[var(--accent)] text-white" : "bg-[var(--html-sitemap-surface-primary)] text-[var(--html-sitemap-content-primary)]"}`}
		>
			<dt
				className={`text-overline font-medium uppercase leading-flat tracking-label ${featured ? "text-white/78" : "text-[var(--text-muted)]"}`}
			>
				{label}
			</dt>
			<dd
				className={`mt-1 font-semibold leading-flat ${featured ? "text-lead md:text-heading-small" : "text-body-large md:text-lead"}`}
			>
				{value}
			</dd>
		</div>
	);
}
function countItems(columns: readonly SitemapColumnDTO[]) {
	return columns.reduce((sum, column) => sum + column.items.length, 0);
}
function sectionId(title: string) {
	return `sitemap-${title
		.toLowerCase()
		.replace(/[^a-zа-я0-9]+/giu, "-")
		.replace(/^-|-$/g, "")}`;
}

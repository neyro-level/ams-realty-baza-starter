import type { ListingPageDTO } from "@ams/realtbase-contracts";
import { Button } from "../../components/ui/button";
import { Container, Section, SectionHeader } from "../../components/ui/layout";
import { DevelopmentCardView } from "../development/DevelopmentCardView";
import { DevelopersListView } from "../developer/DevelopersListView";
import { StarterPropertyCard } from "../property/StarterPropertyCardView";
import { BreadcrumbsView } from "../shared/BreadcrumbsView";
import { NearbyView } from "./NearbyView";

export function ListingView({
	listing,
	pageHref,
}: {
	listing: ListingPageDTO;
	pageHref?: (page: number) => string;
}) {
	const developers = listing.items
		.filter((item) => item.kind === "developer")
		.map((item) => item.item);
	const catalogItems = listing.items.filter(
		(item) => item.kind !== "developer",
	);
	return (
		<>
			<Section
				space="hero"
				className="border-b border-border bg-surface-raised"
			>
				<Container>
					<BreadcrumbsView breadcrumbs={listing.breadcrumbs} />
					<h1 className="mt-6 text-display font-extrabold tracking-display">
						{listing.h1}
					</h1>
					<p className="mt-4 max-w-3xl text-body-large text-content-default">
						{listing.intro}
					</p>
				</Container>
			</Section>
			{listing.subLinks.length ? (
				<Section space="md" aria-label="Уточнить выбор">
					<Container>
						<ul className="flex flex-wrap gap-3">
							{listing.subLinks.map((link) => (
								<li key={link.href}>
									<Button asChild variant="outline">
										<a href={link.href}>
											{link.label}
											{link.count === undefined ? "" : ` · ${link.count}`}
										</a>
									</Button>
								</li>
							))}
						</ul>
					</Container>
				</Section>
			) : null}
			<Section aria-labelledby="listing-results-title">
				<Container>
					<SectionHeader
						titleId="listing-results-title"
						title={`Найдено: ${listing.total}`}
						description="Показываем опубликованные предложения с подтверждёнными характеристиками."
					/>
					{catalogItems.length ? (
						<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{catalogItems.map((entry) =>
								entry.kind === "property" ? (
									<StarterPropertyCard
										key={`property-${entry.item.id}`}
										property={entry.item}
									/>
								) : (
									<DevelopmentCardView
										key={`development-${entry.item.id}`}
										development={entry.item}
									/>
								),
							)}
						</div>
					) : (
						<div
							className="mt-8 rounded-md border border-border bg-surface-subtle p-6"
							role="status"
						>
							<p className="text-body-large">
								Подходящих предложений пока нет.
							</p>
							<p className="mt-2 text-content-default">
								Измените параметры или оставьте заявку на подбор.
							</p>
						</div>
					)}
					{listing.pagination.totalPages > 1 ? (
						<nav
							aria-label="Страницы каталога"
							className="mt-8 flex items-center justify-center gap-3"
						>
							{listing.pagination.previousPage && pageHref ? (
								<Button asChild variant="outline">
									<a href={pageHref(listing.pagination.previousPage)}>Назад</a>
								</Button>
							) : (
								<Button variant="outline" disabled>
									Назад
								</Button>
							)}
							<span aria-current="page">
								{listing.pagination.page} из {listing.pagination.totalPages}
							</span>
							{listing.pagination.nextPage && pageHref ? (
								<Button asChild variant="outline">
									<a href={pageHref(listing.pagination.nextPage)}>Вперёд</a>
								</Button>
							) : (
								<Button variant="outline" disabled>
									Вперёд
								</Button>
							)}
						</nav>
					) : null}
				</Container>
			</Section>
			{developers.length ? (
				<DevelopersListView
					developers={developers}
					title="Застройщики"
					headingLevel="h2"
				/>
			) : null}
			<NearbyView links={listing.nearby} />
		</>
	);
}

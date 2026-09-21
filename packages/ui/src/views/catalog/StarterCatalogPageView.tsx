import type {
	LeadFormContext,
	PropertyFilterDTO,
	PropertyListDTO,
} from "@ams/realtbase-contracts";
import { Badge } from "../../components/ui/badge";
import { Container, Section, SectionHeader } from "../../components/ui/layout";
import { StarterPropertyCard } from "../property/StarterPropertyCardView";
import { LeadFormView } from "../starter/LeadFormView";

export function CatalogPageView({
	list,
	filters,
	leadContext,
}: {
	list: PropertyListDTO;
	filters: PropertyFilterDTO;
	leadContext: LeadFormContext;
}) {
	return (
		<>
			<section
				id="section-catalog-hero"
				className="border-b border-border bg-surface-raised py-[var(--section-space-md)]"
			>
				<Container>
					<p className="text-label font-bold uppercase tracking-wide-role text-action-primary">
						Каталог
					</p>
					<h1 className="mt-4 text-display font-extrabold tracking-display">
						Недвижимость
					</h1>
					<p className="mt-4 max-w-2xl text-body-large text-content-default">
						Актуальные объекты агентства. Фильтры и карточки отражают
						опубликованный каталог.
					</p>
				</Container>
			</section>
			<section id="section-catalog-filters" aria-label="Фильтры">
				<Section>
					<Container>
						<fieldset className="mb-8 flex flex-wrap gap-2">
							<legend className="sr-only">Доступные фильтры</legend>
							{filters.rooms.map((room) => (
								<Badge key={room} variant="outline">
									{room}-комнатные
								</Badge>
							))}
							<Badge variant="outline">Продажа</Badge>
						</fieldset>
					</Container>
				</Section>
			</section>
			<section id="section-catalog-toolbar" aria-label="Результаты">
				<Container>
					<SectionHeader
						title={`Найдено: ${filters.resultLabel}`}
						description="Показываем только подтверждённые характеристики объекта."
					/>
				</Container>
			</section>
			<section id="section-catalog-grid">
				<Section>
					<Container>
						{list.items.length ? (
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{list.items.map((property) => (
									<StarterPropertyCard key={property.id} property={property} />
								))}
							</div>
						) : (
							<p
								id="section-catalog-empty"
								className="text-body-large text-content-default"
							>
								Подходящих объектов пока нет. Измените запрос или оставьте
								заявку — подберём варианты.
							</p>
						)}
					</Container>
				</Section>
			</section>
			<section id="section-catalog-cta">
				<Section className="bg-surface-subtle">
					<Container size="narrow">
						<LeadFormView
							context={leadContext}
							title="Нужна помощь с подбором?"
						/>
					</Container>
				</Section>
			</section>
		</>
	);
}

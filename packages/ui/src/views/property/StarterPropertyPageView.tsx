import type {
	MarketingPageDTO,
	PropertyDetailsDTO,
} from "@ams/realtbase-contracts";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "../../components/ui/card";
import { Container, Section, SectionHeader } from "../../components/ui/layout";
import { StarterFeedImage } from "../../lib/starter-image";
import { LeadFormView } from "../starter/LeadFormView";
import { MediaFallback } from "../starter/MediaFallback";
import { MediaGallery } from "./MediaGallery";
import { StarterPropertyCard } from "./StarterPropertyCardView";

export function PropertyPageView({
	property,
	leadContext,
}: {
	property: PropertyDetailsDTO;
	leadContext: MarketingPageDTO["leadContext"];
}) {
	return (
		<>
			<section id="section-property-gallery">
				<Section space="hero">
					<Container>
						<nav className="mb-6 text-caption text-content-default">
							<a href="/">Главная</a> / <a href="/nedvizhimost">Недвижимость</a>{" "}
							/ {property.title}
						</nav>
						<div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
							<div>
								<div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-surface-subtle">
									<MediaGallery
										images={(property.gallery.length
											? property.gallery
											: property.primaryMedia
												? [property.primaryMedia]
												: []
										).map((image) => ({
											src: image.src,
											alt: image.alt || property.title,
										}))}
										imageRenderer={StarterFeedImage}
										imageSizes="(min-width: 1024px) 62vw, 100vw"
										priority
										shouldOptimizeImage={(src) =>
											src.startsWith("/") && !src.startsWith("//")
										}
										emptyContent={
											<MediaFallback className="absolute inset-0 min-h-full" />
										}
									/>
								</div>
								<section id="section-property-summary">
									<h1 className="mt-8 text-display-small font-extrabold leading-heading">
										{property.title}
									</h1>
									<p className="mt-2 text-body-large text-content-default">
										{property.address}
									</p>
								</section>
								<section id="section-property-characteristics">
									<dl className="mt-8 grid gap-4 sm:grid-cols-2">
										{property.characteristics.map((item) => (
											<div
												key={item.label}
												className="border-b border-border pb-3"
											>
												<dt className="text-label text-content-default">
													{item.label}
												</dt>
												<dd className="mt-1 font-semibold">{item.value}</dd>
											</div>
										))}
									</dl>
								</section>
								<section id="section-property-description">
									<p className="mt-8 text-body-large text-content-default">
										{property.description}
									</p>
								</section>
							</div>
							<aside id="section-property-actions">
								<Card elevation="raised" className="sticky top-32">
									<CardHeader>
										<h2 className="text-display-small font-semibold leading-tight-copy">
											{property.price?.label ?? "Цена по запросу"}
										</h2>
										<CardDescription>{property.address}</CardDescription>
									</CardHeader>
									<CardContent>
										<Button asChild className="w-full">
											<a href="#lead-form">Записаться на просмотр</a>
										</Button>
									</CardContent>
								</Card>
							</aside>
						</div>
					</Container>
				</Section>
			</section>
			<section id="section-property-related" className="bg-surface-subtle">
				<Section>
					<Container>
						<SectionHeader title="Похожие объекты" />
						{property.related.length ? (
							<div className="mt-8 grid gap-6 md:grid-cols-2">
								{property.related.map((item) => (
									<StarterPropertyCard key={item.id} property={item} />
								))}
							</div>
						) : (
							<p className="mt-8 text-body-large text-content-default">
								Похожие объекты появятся, когда в каталоге будет достаточно
								опубликованных предложений.
							</p>
						)}
					</Container>
				</Section>
			</section>
			<section id="section-property-lead">
				<Section>
					<Container size="narrow">
						{leadContext ? (
							<LeadFormView
								context={leadContext}
								title="Записаться на просмотр"
								submitLabel="Отправить заявку"
							/>
						) : null}
					</Container>
				</Section>
			</section>
		</>
	);
}

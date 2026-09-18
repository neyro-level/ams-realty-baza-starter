import type {
	HomePageDTO,
	MarketingPageDTO,
	PropertyCardDTO,
	PropertyDetailsDTO,
	PropertyFilterDTO,
	PropertyListDTO,
} from "@ams/realtbase-contracts";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Container, Section, SectionHeader } from "../../components/ui/layout";
import { MediaGallery } from "../property/MediaGallery";
import { StarterFeedImage } from "../../lib/starter-image";
import { LeadFormView } from "./LeadFormView";
import { MediaFallback } from "./MediaFallback";

function Breadcrumbs({ items }: MarketingPageDTO["breadcrumbs"]) {
	return (
		<nav
			aria-label="Хлебные крошки"
			className="mb-6 flex flex-wrap gap-2 text-caption text-content-default"
		>
			{items.map((item, index) => (
				<span key={`${item.href ?? "current"}-${item.label}`}>
					{index ? <span aria-hidden> / </span> : null}
					{item.href ? (
						<a href={item.href} className="hover:text-action-primary">
							{item.label}
						</a>
					) : (
						item.label
					)}
				</span>
			))}
		</nav>
	);
}

export function StarterPropertyCard({
	property,
	headingLevel = "h3",
	priority = false,
}: {
	property: PropertyCardDTO;
	headingLevel?: "h2" | "h3";
	priority?: boolean;
}) {
	const heading = (
		<a href={property.href} className="group-hover:text-action-primary">
			{property.title}
		</a>
	);
	return (
		<Card
			elevation="raised"
			className="group overflow-hidden transition-transform hover:-translate-y-1"
		>
			<a href={property.href} className="relative block aspect-[3/2] bg-surface-subtle">
				<span className="sr-only">Открыть объект: {property.title}</span>
				{property.primaryMedia?.src ? (
					<StarterFeedImage
						src={property.primaryMedia.src}
						alt={property.primaryMedia.alt || property.title}
						width={900}
						height={600}
						sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
						priority={priority}
						className="h-full w-full object-cover"
					/>
				) : (
					<MediaFallback className="absolute inset-0" />
				)}
			</a>
			<CardHeader>
				<div className="flex flex-wrap gap-2">
					{property.badges.map((badge) => (
						<Badge key={badge}>{badge}</Badge>
					))}
				</div>
				{headingLevel === "h2" ? (
					<h2 className="text-lead font-semibold leading-tight-copy">{heading}</h2>
				) : (
					<CardTitle>{heading}</CardTitle>
				)}
				<CardDescription>{property.address}</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-lead font-extrabold">
					{property.price?.label ?? "Цена по запросу"}
				</p>
				<dl className="mt-4 grid grid-cols-2 gap-3 text-label">
					{property.summary.map((item) => (
						<div key={item.key}>
							<dt className="text-content-default">{item.label}</dt>
							<dd className="mt-1 font-semibold">{item.value}</dd>
						</div>
					))}
				</dl>
			</CardContent>
			<CardFooter>
				<Button asChild variant="outline">
					<a href={property.href}>Подробнее</a>
				</Button>
			</CardFooter>
		</Card>
	);
}

export function HomePageView({
	page,
	featured,
}: {
	page: HomePageDTO;
	featured: PropertyCardDTO | null;
}) {
	return (
		<main>
			<section
				id="section-home-hero"
				aria-labelledby="home-hero-title"
				className="border-b border-border bg-surface-raised py-[var(--section-space-md)] lg:py-[var(--section-space-lg)]"
			>
				<Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="text-label font-bold uppercase tracking-wide-role text-action-primary">
							{page.eyebrow}
						</p>
						<h1
							id="home-hero-title"
							className="mt-4 max-w-4xl text-display font-extrabold leading-display-tight tracking-display"
						>
							{page.title}
						</h1>
						<p className="mt-5 max-w-2xl text-body-large leading-step-relaxed text-content-default">
							{page.lead}
						</p>
						<div className="mt-7 flex flex-wrap gap-3">
							<Button asChild size="lg">
								<a href="/nedvizhimost">Смотреть объекты</a>
							</Button>
							<Button asChild size="lg" variant="outline">
								<a href="#lead-form">Оставить заявку</a>
							</Button>
						</div>
					</div>
					{featured ? (
						<StarterPropertyCard property={featured} headingLevel="h2" priority />
					) : (
						<Card>
							<CardHeader>
								<CardTitle>Подберём объект под вашу задачу</CardTitle>
								<CardDescription>
									В каталоге пока нет опубликованных предложений. Оставьте заявку
									— свяжемся и расскажем о ближайших вариантах.
								</CardDescription>
							</CardHeader>
							<CardFooter>
								<Button asChild variant="outline">
									<a href="/nedvizhimost">Открыть каталог</a>
								</Button>
							</CardFooter>
						</Card>
					)}
				</Container>
			</section>
			<section id="section-home-services" aria-labelledby="home-services-title">
				<Section>
					<Container>
						<SectionHeader
							eyebrow="Направления"
							title="Чем можем помочь"
							description="Покупка, продажа, аренда и ипотечное сопровождение в одном агентстве."
						/>
						<h2 id="home-services-title" className="sr-only">
							Услуги
						</h2>
						<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{page.serviceLinks.map((item) => (
								<Card key={item.href}>
									<CardHeader>
										<CardTitle>
											<a href={item.href} className="hover:text-action-primary">
												{item.label}
											</a>
										</CardTitle>
										<CardDescription>{item.description}</CardDescription>
									</CardHeader>
								</Card>
							))}
						</div>
					</Container>
				</Section>
			</section>
			<section
				id="section-home-featured"
				aria-labelledby="home-featured-title"
				className="bg-surface-subtle"
			>
				<Section>
					<Container>
						<SectionHeader
							title="Актуальные предложения"
							description="Карточки объектов из рабочего каталога агентства."
						/>
						<h2 id="home-featured-title" className="sr-only">
							Избранные объекты
						</h2>
						{featured ? (
							<div className="mt-8 max-w-xl">
								<StarterPropertyCard property={featured} />
							</div>
						) : (
							<p className="mt-8 text-body-large text-content-default">
								Как только объекты появятся в каталоге, они отобразятся здесь.
							</p>
						)}
					</Container>
				</Section>
			</section>
			<section id="section-home-process" aria-labelledby="home-process-title">
				<Section>
					<Container size="narrow">
						<SectionHeader
							eyebrow={page.sections[0]?.title}
							title="Как мы работаем"
							description={page.sections[0]?.text}
						/>
						<h2 id="home-process-title" className="sr-only">
							Процесс
						</h2>
						<ol className="mt-8 grid gap-4 md:grid-cols-3">
							{page.sections[0]?.items?.map((item, index) => (
								<li key={item}>
									<Card>
										<CardHeader>
											<p className="text-display-small font-extrabold text-action-primary">
												0{index + 1}
											</p>
											<CardTitle>{item}</CardTitle>
										</CardHeader>
									</Card>
								</li>
							))}
						</ol>
					</Container>
				</Section>
			</section>
			<section
				id="section-home-trust"
				aria-labelledby="home-trust-title"
				className="bg-surface-subtle"
			>
				<Section>
					<Container size="narrow">
						<SectionHeader
							title="Почему с нами спокойнее"
							description="Проверяем документы, сопровождаем показ и помогаем довести сделку до регистрации."
						/>
						<h2 id="home-trust-title" className="sr-only">
							Доверие
						</h2>
					</Container>
				</Section>
			</section>
			<section id="section-home-lead" aria-labelledby="home-lead-title">
				<Section>
					<Container size="narrow">
						<h2 id="home-lead-title" className="sr-only">
							Заявка
						</h2>
						{page.leadContext ? <LeadFormView context={page.leadContext} /> : null}
					</Container>
				</Section>
			</section>
		</main>
	);
}

export function CatalogPageView({
	list,
	filters,
}: {
	list: PropertyListDTO;
	filters: PropertyFilterDTO;
}) {
	return (
		<main>
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
						Актуальные объекты агентства. Фильтры и карточки отражают опубликованный
						каталог.
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
								Подходящих объектов пока нет. Измените запрос или оставьте заявку —
								подберём варианты.
							</p>
						)}
					</Container>
				</Section>
			</section>
			<section id="section-catalog-cta">
				<Section className="bg-surface-subtle">
					<Container size="narrow">
						<LeadFormView
							context={{
								formKind: "general",
								sourcePage: "/nedvizhimost",
								consentVersion: "pd-2026-01",
								consentHref: "/soglasie-na-obrabotku-personalnyh-dannyh",
								consentRequired: true,
							}}
							title="Нужна помощь с подбором?"
						/>
					</Container>
				</Section>
			</section>
		</main>
	);
}

export function PropertyPageView({
	property,
	leadContext,
}: {
	property: PropertyDetailsDTO;
	leadContext: MarketingPageDTO["leadContext"];
}) {
	return (
		<main>
			<section id="section-property-gallery">
				<Section space="hero">
					<Container>
						<nav className="mb-6 text-caption text-content-default">
							<a href="/">Главная</a> / <a href="/nedvizhimost">Недвижимость</a> /{" "}
							{property.title}
						</nav>
						<div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
							<div>
								<div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-surface-subtle">
									<MediaGallery
										images={
											(property.gallery.length
												? property.gallery
												: property.primaryMedia
													? [property.primaryMedia]
													: []
											).map((image) => ({
												src: image.src,
												alt: image.alt || property.title,
											}))
										}
										imageRenderer={StarterFeedImage}
										imageSizes="(min-width: 1024px) 62vw, 100vw"
										priority
										shouldOptimizeImage={(src) => src.startsWith("/") && !src.startsWith("//")}
										emptyContent={<MediaFallback className="absolute inset-0 min-h-full" />}
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
											<div key={item.label} className="border-b border-border pb-3">
												<dt className="text-label text-content-default">{item.label}</dt>
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
		</main>
	);
}

export function MarketingPageView({ page }: { page: MarketingPageDTO }) {
	return (
		<main>
			<Section space="hero" className="border-b border-border bg-surface-raised">
				<Container size="narrow">
					<Breadcrumbs items={page.breadcrumbs.items} />
					<p className="text-label font-bold uppercase tracking-wide-role text-action-primary">
						{page.eyebrow}
					</p>
					<h1 className="mt-4 text-display font-extrabold leading-display-tight tracking-display">
						{page.title}
					</h1>
					<p className="mt-5 max-w-3xl text-body-large leading-step-relaxed text-content-default">
						{page.lead}
					</p>
				</Container>
			</Section>
			<Section>
				<Container size="narrow" className="grid gap-6 md:grid-cols-2">
					{page.sections.map((section) => (
						<Card key={section.title} elevation="raised">
							<CardHeader>
								<CardTitle>{section.title}</CardTitle>
								<CardDescription>{section.text}</CardDescription>
							</CardHeader>
							{section.items?.length ? (
								<CardContent>
									<ul className="grid gap-2 text-body text-content-default">
										{section.items.map((item) => (
											<li key={item}>— {item}</li>
										))}
									</ul>
								</CardContent>
							) : null}
						</Card>
					))}
					{page.leadContext ? (
						<div className="md:col-span-2">
							<LeadFormView context={page.leadContext} />
						</div>
					) : null}
				</Container>
			</Section>
		</main>
	);
}

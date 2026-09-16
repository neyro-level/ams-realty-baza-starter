import type {
	HomePageDTO,
	MarketingPageDTO,
	PropertyCardDTO,
	PropertyDetailsDTO,
	PropertyFilterDTO,
	PropertyListDTO,
} from "@ams/realtbase-contracts";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Container,
	LeadConsentField,
	Section,
	SectionHeader,
} from "@ams/realtbase-ui";
import Link from "next/link";

function Breadcrumbs({ items }: MarketingPageDTO["breadcrumbs"]) {
	return (
		<nav
			aria-label="Хлебные крошки"
			className="mb-6 flex flex-wrap gap-2 text-caption text-content-subtle"
		>
			{items.map((item, index) => (
				<span key={`${item.href ?? "current"}-${item.label}`}>
					{index ? <span aria-hidden> / </span> : null}
					{item.href ? (
						<Link href={item.href} className="hover:text-action-primary">
							{item.label}
						</Link>
					) : (
						item.label
					)}
				</span>
			))}
		</nav>
	);
}

export function FixtureLeadForm({ page }: { page: MarketingPageDTO }) {
	if (!page.leadContext) return null;
	return (
		<form aria-label="Форма заявки">
			<Card id="lead-form" className="shadow-[var(--shadow-card)]">
				<CardHeader>
					<CardTitle>Обсудить задачу</CardTitle>
					<CardDescription>
						Форма показывает frozen-draft consent contract. Отправка будет
						подключена в отдельном эпике.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<label className="grid gap-2 text-label font-semibold">
						Имя
						<input
							className="min-h-control rounded-md border border-input bg-surface-raised px-4 font-normal"
							name="name"
							autoComplete="name"
						/>
					</label>
					<label className="grid gap-2 text-label font-semibold">
						Телефон
						<input
							className="min-h-control rounded-md border border-input bg-surface-raised px-4 font-normal"
							name="phone"
							inputMode="tel"
							autoComplete="tel"
						/>
					</label>
					<LeadConsentField context={page.leadContext} />
				</CardContent>
				<CardFooter>
					<Button type="button" disabled>
						Отправка подключается позже
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}

export function MarketingPageView({ page }: { page: MarketingPageDTO }) {
	return (
		<main>
			<Section
				space="hero"
				className="border-b border-border bg-surface-raised"
			>
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
						<Card key={section.title} className="shadow-[var(--shadow-card)]">
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
							<FixtureLeadForm page={page} />
						</div>
					) : null}
				</Container>
			</Section>
		</main>
	);
}

export function PropertyCard({ property }: { property: PropertyCardDTO }) {
	return (
		<Card className="group overflow-hidden shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1">
			<Link
				href={property.href}
				className="block aspect-[3/2] bg-surface-subtle"
				aria-label={`Открыть объект: ${property.title}`}
			>
				<div className="flex h-full items-center justify-center text-label text-content-subtle">
					Фотография из XML-фида
				</div>
			</Link>
			<CardHeader>
				<div className="flex flex-wrap gap-2">
					{property.badges.map((badge) => (
						<Badge key={badge}>{badge}</Badge>
					))}
				</div>
				<CardTitle>
					<Link
						href={property.href}
						className="group-hover:text-action-primary"
					>
						{property.title}
					</Link>
				</CardTitle>
				<CardDescription>{property.address}</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-lead font-extrabold">
					{property.price?.label ?? "Цена по запросу"}
				</p>
				<dl className="mt-4 grid grid-cols-2 gap-3 text-label">
					{property.summary.map((item) => (
						<div key={item.key}>
							<dt className="text-content-subtle">{item.label}</dt>
							<dd className="mt-1 font-semibold">{item.value}</dd>
						</div>
					))}
				</dl>
			</CardContent>
			<CardFooter>
				<Button asChild variant="outline">
					<Link href={property.href}>Подробнее</Link>
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
	featured: PropertyCardDTO;
}) {
	return (
		<main>
			<Section space="hero" className="bg-surface-raised">
				<Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="text-label font-bold uppercase tracking-wide-role text-action-primary">
							{page.eyebrow}
						</p>
						<h1 className="mt-4 max-w-4xl text-display font-extrabold leading-display-tight tracking-display">
							{page.title}
						</h1>
						<p className="mt-5 max-w-2xl text-body-large leading-step-relaxed text-content-default">
							{page.lead}
						</p>
						<div className="mt-7 flex flex-wrap gap-3">
							<Button asChild size="lg">
								<Link href="/nedvizhimost">Смотреть объекты</Link>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href="#lead-form">Обсудить задачу</Link>
							</Button>
						</div>
					</div>
					<PropertyCard property={featured} />
				</Container>
			</Section>
			<Section>
				<Container>
					<SectionHeader
						eyebrow="Направления"
						title="Чем можем помочь"
						description="Fixture-композиция использует проектные DTO и остаётся независимой от будущего backend."
					/>
					<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{page.serviceLinks.map((item) => (
							<Card key={item.href}>
								<CardHeader>
									<CardTitle>
										<Link
											href={item.href}
											className="hover:text-action-primary"
										>
											{item.label}
										</Link>
									</CardTitle>
									<CardDescription>{item.description}</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</Container>
			</Section>
			<Section className="bg-surface-subtle">
				<Container size="narrow">
					<SectionHeader
						eyebrow={page.sections[0]?.title}
						title="Три понятных шага"
						description={page.sections[0]?.text}
					/>
					<ol className="mt-8 grid gap-4 md:grid-cols-3">
						{page.sections[0]?.items?.map((item, index) => (
							<Card key={item}>
								<CardHeader>
									<p className="text-display-small font-extrabold text-action-primary">
										0{index + 1}
									</p>
									<CardTitle>{item}</CardTitle>
								</CardHeader>
							</Card>
						))}
					</ol>
				</Container>
			</Section>
			<Section>
				<Container size="narrow">
					<FixtureLeadForm page={page} />
				</Container>
			</Section>
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
			<Section
				space="hero"
				className="border-b border-border bg-surface-raised"
			>
				<Container>
					<p className="text-label font-bold uppercase tracking-wide-role text-action-primary">
						Каталог
					</p>
					<h1 className="mt-4 text-display font-extrabold tracking-display">
						Недвижимость в Демо-городе
					</h1>
					<p className="mt-4 max-w-2xl text-body-large text-content-default">
						Данные карточек приходят из fixture provider в форме будущего Public
						Gateway.
					</p>
				</Container>
			</Section>
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
						<Badge variant="outline">Демо-город</Badge>
					</fieldset>
					<SectionHeader
						title={`Найдено: ${filters.resultLabel}`}
						description="Неизвестные поля не вычисляются и не показываются."
					/>
					<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{list.items.map((property) => (
							<PropertyCard key={property.id} property={property} />
						))}
					</div>
				</Container>
			</Section>
		</main>
	);
}

export function PropertyPageView({
	property,
	leadPage,
}: {
	property: PropertyDetailsDTO;
	leadPage: MarketingPageDTO;
}) {
	return (
		<main>
			<Section space="hero">
				<Container>
					<nav className="mb-6 text-caption text-content-subtle">
						<Link href="/">Главная</Link> /{" "}
						<Link href="/nedvizhimost">Недвижимость</Link> / {property.title}
					</nav>
					<div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
						<div>
							<div className="flex aspect-[16/9] items-center justify-center rounded-[var(--radius-lg)] bg-surface-subtle text-content-subtle">
								Галерея заполняется тегами picture из XML-фида
							</div>
							<h1 className="mt-8 text-display-small font-extrabold leading-heading">
								{property.title}
							</h1>
							<p className="mt-4 text-body-large text-content-default">
								{property.description}
							</p>
							<dl className="mt-8 grid gap-4 sm:grid-cols-2">
								{property.characteristics.map((item) => (
									<div key={item.label} className="border-b border-border pb-3">
										<dt className="text-label text-content-subtle">
											{item.label}
										</dt>
										<dd className="mt-1 font-semibold">{item.value}</dd>
									</div>
								))}
							</dl>
						</div>
						<aside>
							<Card className="sticky top-32 shadow-[var(--shadow-card)]">
								<CardHeader>
									<CardTitle className="text-display-small">
										{property.price?.label ?? "Цена по запросу"}
									</CardTitle>
									<CardDescription>{property.address}</CardDescription>
								</CardHeader>
								<CardContent>
									<Button asChild className="w-full">
										<Link href="#lead-form">Записаться на просмотр</Link>
									</Button>
								</CardContent>
							</Card>
						</aside>
					</div>
				</Container>
			</Section>
			<Section className="bg-surface-subtle">
				<Container>
					<SectionHeader title="Похожие объекты" />
					<div className="mt-8 grid gap-6 md:grid-cols-2">
						{property.related.map((item) => (
							<PropertyCard key={item.id} property={item} />
						))}
					</div>
				</Container>
			</Section>
			<Section>
				<Container size="narrow">
					<FixtureLeadForm page={leadPage} />
				</Container>
			</Section>
		</main>
	);
}

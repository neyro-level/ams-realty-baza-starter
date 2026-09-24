import type {
	DevelopmentDetailsDTO,
	LeadFormContext,
} from "@ams/realtbase-contracts";
import { Badge } from "../../components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui/card";
import { Container, Section, SectionHeader } from "../../components/ui/layout";
import { BreadcrumbsView } from "../shared/BreadcrumbsView";
import { StarterPropertyMediaGallery } from "../property/StarterPropertyMediaGallery";
import { PriceRequestFormView } from "./PriceRequestFormView";

export type DevelopmentPresentationContent = {
	layouts?: readonly { name: string; area: string; priceLabel?: string }[];
	progress?: { label: string; description?: string; checkedAt?: string };
	faq?: readonly { question: string; answer: string }[];
};

function freshPriceRows(
	development: DevelopmentDetailsDTO,
	referenceDate: string,
) {
	const now = new Date(referenceDate).getTime();
	return development.priceRows.filter((row) => {
		const checked = new Date(row.checkedAt).getTime();
		return (
			Number.isFinite(checked) &&
			now - checked <= 45 * 86_400_000 &&
			checked <= now
		);
	});
}

export function DevelopmentDetailsView({
	development,
	leadContext,
	content = {},
	referenceDate = new Date().toISOString(),
}: {
	development: DevelopmentDetailsDTO;
	leadContext: LeadFormContext;
	content?: DevelopmentPresentationContent;
	referenceDate?: string;
}) {
	const prices = freshPriceRows(development, referenceDate);
	return (
		<>
			<Section space="hero">
				<Container>
					<BreadcrumbsView breadcrumbs={development.breadcrumbs} />
					<div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
						<div>
							<div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] bg-surface-subtle">
								<StarterPropertyMediaGallery
									images={development.gallery}
									title={development.name}
								/>
							</div>
							<h1 className="mt-8 text-display-small font-extrabold leading-heading">
								{development.name}
							</h1>
							<p className="mt-3 text-body-large text-content-default">
								{development.address ?? development.cityName}
							</p>
							{development.description ? (
								<p className="mt-6 text-body-large text-content-default">
									{development.description}
								</p>
							) : null}
						</div>
						<aside>
							<Card elevation="raised">
								<CardHeader>
									<h2 className="text-lead font-semibold leading-tight-copy">
										Предложения
									</h2>
								</CardHeader>
								<CardContent className="space-y-4">
									{prices.length ? (
										prices.map((row) => (
											<div
												key={`${row.label}-${row.checkedAt}`}
												className="border-b border-border pb-3"
											>
												<p className="text-label text-content-default">
													{row.label}
												</p>
												<p className="mt-1 font-semibold">{row.price.label}</p>
											</div>
										))
									) : (
										<p className="text-body text-content-default">
											Актуальную стоимость уточнит специалист.
										</p>
									)}
									{development.completionLabel ? (
										<Badge variant="outline">
											{development.completionLabel}
										</Badge>
									) : null}
								</CardContent>
							</Card>
						</aside>
					</div>
				</Container>
			</Section>
			<Section
				className="bg-surface-subtle"
				aria-labelledby="development-details-title"
			>
				<Container>
					<SectionHeader
						titleId="development-details-title"
						title="О проекте"
					/>
					<dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{development.characteristics.map((item) => (
							<div
								key={item.label}
								className="rounded-md bg-surface-raised p-4"
							>
								<dt className="text-label text-content-default">
									{item.label}
								</dt>
								<dd className="mt-1 font-semibold">{item.value}</dd>
							</div>
						))}
					</dl>
				</Container>
			</Section>
			{content.layouts?.length ? (
				<Section aria-labelledby="development-layouts-title">
					<Container>
						<SectionHeader
							titleId="development-layouts-title"
							title="Планировки"
						/>
						<div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{content.layouts.map((layout) => (
								<Card key={`${layout.name}-${layout.area}`}>
									<CardHeader>
										<CardTitle>{layout.name}</CardTitle>
									</CardHeader>
									<CardContent>
										<p>{layout.area}</p>
										{layout.priceLabel ? (
											<p className="mt-2 font-semibold">{layout.priceLabel}</p>
										) : null}
									</CardContent>
								</Card>
							))}
						</div>
					</Container>
				</Section>
			) : null}
			{content.progress ? (
				<Section
					className="bg-surface-subtle"
					aria-labelledby="development-progress-title"
				>
					<Container>
						<SectionHeader
							titleId="development-progress-title"
							title="Ход строительства"
							description={content.progress.description}
						/>
						<p className="mt-6 font-semibold">{content.progress.label}</p>
						{content.progress.checkedAt ? (
							<p className="mt-2 text-label text-content-default">
								Проверено: {content.progress.checkedAt}
							</p>
						) : null}
					</Container>
				</Section>
			) : null}
			{content.faq?.length ? (
				<Section aria-labelledby="development-faq-title">
					<Container size="narrow">
						<SectionHeader
							titleId="development-faq-title"
							title="Вопросы и ответы"
						/>
						<div className="mt-6 divide-y divide-border">
							{content.faq.map((item) => (
								<details key={item.question} className="py-4">
									<summary className="cursor-pointer font-semibold">
										{item.question}
									</summary>
									<p className="mt-3 text-content-default">{item.answer}</p>
								</details>
							))}
						</div>
					</Container>
				</Section>
			) : null}
			<Section className="bg-surface-subtle">
				<Container size="narrow">
					<PriceRequestFormView
						leadContext={leadContext}
						developmentSlug={development.slug}
					/>
				</Container>
			</Section>
		</>
	);
}

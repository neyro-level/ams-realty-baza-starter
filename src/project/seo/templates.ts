import type { SeoMetaDTO } from "@ams/realtbase-contracts";
import {
	type ApprovedMorphology,
	formatRussianPlural,
	isApprovedMorphology,
	morphologyPhrase,
	type RenderedSeoTemplate,
	renderSeoDefinition,
	type SeoTemplateDefinition,
} from "../../core/seo/registry.ts";
import {
	projectSeoCategoryLabelsInput,
	projectSeoFacetLabelsInput,
	projectSeoTemplatesInput,
} from "./template-inputs.ts";

export const projectSeoTemplateKeys = [
	"home",
	"geoHub",
	"categoryRoot",
	"categoryGeo",
	"categoryGeoDistrict",
	"categoryGeoFacet",
	"geoDevelopers",
	"developmentNormal",
	"developmentCollision",
	"developer",
	"property",
] as const;

export type ProjectSeoTemplateKey = (typeof projectSeoTemplateKeys)[number];
export type ProjectDistrictType = "administrative" | "microdistrict";

export type ProjectSeoTemplateContext = {
	brand: string;
	category?: string;
	city?: ApprovedMorphology;
	region?: ApprovedMorphology;
	district?: ApprovedMorphology;
	districtType?: ProjectDistrictType;
	facet?: string;
	entityName?: string;
	inventory?: number;
	freshPrice?: { label: string; fresh: boolean };
};

const projectSeoFacetLabels: Readonly<Record<string, string>> =
	projectSeoFacetLabelsInput;

const projectSeoCategoryLabels: Readonly<Record<string, string>> =
	projectSeoCategoryLabelsInput;

export function projectSeoCategoryLabel(slug: string): string {
	const label = projectSeoCategoryLabels[slug];
	if (!label)
		throw new Error(`Project SEO category label is missing: ${slug}.`);
	return label;
}

export function projectSeoFacetLabel(slug: string): string {
	const label = projectSeoFacetLabels[slug];
	if (!label) throw new Error(`Project SEO facet label is missing: ${slug}.`);
	return label;
}

const templates = projectSeoTemplatesInput satisfies Record<
	ProjectSeoTemplateKey,
	SeoTemplateDefinition
>;

const districtTemplateByType = {
	administrative: templates.categoryGeoDistrict,
	microdistrict: templates.categoryGeoDistrict,
} satisfies Record<ProjectDistrictType, SeoTemplateDefinition>;

const cityRequired = new Set<ProjectSeoTemplateKey>([
	"home",
	"geoHub",
	"categoryGeo",
	"categoryGeoDistrict",
	"categoryGeoFacet",
	"geoDevelopers",
	"developmentCollision",
]);

export function renderProjectSeoTemplate(
	templateKey: ProjectSeoTemplateKey,
	context: ProjectSeoTemplateContext,
): RenderedSeoTemplate {
	const geo = context.city ?? context.region;
	const definition =
		templateKey === "categoryGeoDistrict"
			? districtTemplateByType[context.districtType ?? "administrative"]
			: templates[templateKey];
	const inventory =
		context.inventory === undefined
			? undefined
			: formatRussianPlural(context.inventory, [
					"объект",
					"объекта",
					"объектов",
				]);
	const freshPrice = context.freshPrice?.fresh
		? context.freshPrice.label.trim()
		: undefined;
	const requiresCity = cityRequired.has(templateKey);
	const requiresDistrict = templateKey === "categoryGeoDistrict";
	const morphologyApproved =
		(!requiresCity || isApprovedMorphology(geo)) &&
		(!requiresDistrict || isApprovedMorphology(context.district));

	return renderSeoDefinition(
		definition,
		{
			brand: context.brand,
			category: context.category,
			cityPhrase: morphologyPhrase(geo, "prepositional", true),
			geoGenitive: morphologyPhrase(geo, "genitive"),
			districtPhrase: morphologyPhrase(context.district, "prepositional", true),
			facet: context.facet,
			entityName: context.entityName,
			inventory,
			freshPrice,
		},
		morphologyApproved,
	);
}

export function projectSeoMeta(
	templateKey: ProjectSeoTemplateKey,
	context: ProjectSeoTemplateContext,
	canonicalPath: string,
): SeoMetaDTO & { morphologyApproved: boolean } {
	const rendered = renderProjectSeoTemplate(templateKey, context);
	return {
		title: rendered.title,
		description: rendered.description,
		canonicalPath,
		indexing: "noindex",
		following: "follow",
		morphologyApproved: rendered.morphologyApproved,
	};
}

export function isSeoMetaMorphologyApproved(seo: SeoMetaDTO): boolean {
	return (
		(seo as SeoMetaDTO & { morphologyApproved?: boolean })
			.morphologyApproved !== false
	);
}

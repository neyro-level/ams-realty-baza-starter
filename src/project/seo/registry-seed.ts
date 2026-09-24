import type { PageKey } from "../../core/routing/index.ts";
import {
	assertSeoRegistry,
	renderSeoTemplate,
	type SeoRegistryRow,
	type SeoTemplateContext,
	type SeoTemplateKey,
} from "../../core/seo/registry.ts";
import { siteProfileFixtures } from "../site-profile.ts";
import { createProjectUrlGrammar } from "../url-grammar.ts";

const grammar = createProjectUrlGrammar(siteProfileFixtures.multiGeo);
const snapshotDate = "2026-09-24";
const approvedCity = {
	approved: true,
	nominative: "Приморск",
	genitive: "Приморска",
	prepositional: "Приморске",
	preposition: "в" as const,
};
const approvedDistrict = {
	approved: true,
	nominative: "Северный район",
	genitive: "Северного района",
	prepositional: "Северном районе",
};

type SeedInput = {
	pageKey: PageKey;
	entityRef: string | null;
	targetPhrase: string;
	templateKey: SeoTemplateKey;
	context: Omit<SeoTemplateContext, "brand">;
};

function seedRow(input: SeedInput): SeoRegistryRow {
	const url = grammar.buildUrl(input.pageKey);
	const metadata = renderSeoTemplate(input.templateKey, {
		brand: "AMS Realty",
		...input.context,
	});
	return {
		pageKey: input.pageKey,
		url,
		canonical: url,
		entityRef: input.entityRef,
		targetPhrases: [input.targetPhrase],
		metric: "searchDemand",
		value: null,
		source: "fallback_no_data",
		snapshotDate,
		synthetic: true,
		tier: "TEST",
		minimumObjects: 10,
		defaultRobots: "noindex,follow",
		templateKey: input.templateKey,
		...metadata,
		status: "draft",
	};
}

export const projectSeoRegistrySeed: readonly SeoRegistryRow[] = [
	seedRow({
		pageKey: { kind: "home" },
		entityRef: null,
		targetPhrase: "fixture home intent",
		templateKey: "home",
		context: { city: approvedCity },
	}),
	seedRow({
		pageKey: { kind: "geoHub", geo: "primorsk" },
		entityRef: "geo:primorsk",
		targetPhrase: "fixture geo hub intent",
		templateKey: "geoHub",
		context: { city: approvedCity, inventory: 28 },
	}),
	seedRow({
		pageKey: { kind: "categoryRoot", category: "kvartiry" },
		entityRef: "category:kvartiry",
		targetPhrase: "fixture root catalog intent",
		templateKey: "categoryRoot",
		context: { category: "Квартиры", inventory: 21 },
	}),
	seedRow({
		pageKey: { kind: "categoryGeo", geo: "primorsk", category: "kvartiry" },
		entityRef: "geo:primorsk/category:kvartiry",
		targetPhrase: "fixture geo catalog intent",
		templateKey: "categoryGeo",
		context: { category: "Квартиры", city: approvedCity, inventory: 18 },
	}),
	seedRow({
		pageKey: {
			kind: "categoryGeoDistrict",
			geo: "primorsk",
			category: "kvartiry",
			district: "severnyy",
		},
		entityRef: "district:severnyy",
		targetPhrase: "fixture district catalog intent",
		templateKey: "categoryGeoDistrict",
		context: {
			category: "Квартиры",
			city: approvedCity,
			district: approvedDistrict,
			inventory: 12,
		},
	}),
	seedRow({
		pageKey: {
			kind: "categoryGeoFacet",
			geo: "primorsk",
			category: "kvartiry",
			facet: "dvukhkomnatnye",
		},
		entityRef: "facet:dvukhkomnatnye",
		targetPhrase: "fixture facet catalog intent",
		templateKey: "categoryGeoFacet",
		context: {
			category: "квартиры",
			city: approvedCity,
			facet: "Двухкомнатные",
			inventory: 11,
		},
	}),
	seedRow({
		pageKey: { kind: "geoDevelopers", geo: "primorsk" },
		entityRef: "geo:primorsk/developers",
		targetPhrase: "fixture geo developers intent",
		templateKey: "geoDevelopers",
		context: { city: approvedCity, inventory: 7 },
	}),
	seedRow({
		pageKey: {
			kind: "development",
			developmentKind: "residential_complex",
			slug: "severnyy-bereg",
		},
		entityRef: "development:severnyy-bereg",
		targetPhrase: "fixture development normal intent",
		templateKey: "developmentNormal",
		context: {
			city: approvedCity,
			entityName: "ЖК «Северный берег»",
			freshPrice: { label: "от 6,2 млн ₽", fresh: true },
		},
	}),
	seedRow({
		pageKey: {
			kind: "development",
			developmentKind: "cottage_village",
			slug: "severnyy-bereg",
		},
		entityRef: "development:severnyy-bereg-kp",
		targetPhrase: "fixture development collision intent",
		templateKey: "developmentCollision",
		context: { city: approvedCity, entityName: "КП «Северный берег»" },
	}),
	seedRow({
		pageKey: { kind: "developer", slug: "stroy-invest" },
		entityRef: "developer:stroy-invest",
		targetPhrase: "fixture developer intent",
		templateKey: "developer",
		context: {
			city: approvedCity,
			entityName: "Строй Инвест",
			inventory: 4,
		},
	}),
	seedRow({
		pageKey: {
			kind: "property",
			category: "kvartiry",
			semantic: "ulitsa-mira-10",
			publicUrlId: 42,
		},
		entityRef: "property:42",
		targetPhrase: "fixture property intent",
		templateKey: "property",
		context: {
			city: approvedCity,
			entityName: "2-комнатная квартира, улица Мира, 10",
			freshPrice: { label: "5,8 млн ₽", fresh: true },
		},
	}),
];

assertSeoRegistry({
	rows: projectSeoRegistrySeed,
	buildUrl: grammar.buildUrl,
	now: new Date("2026-09-24T12:00:00.000Z"),
});

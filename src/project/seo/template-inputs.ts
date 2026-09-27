/** Project-owned SEO copy inputs. Client clones replace this file from preset v2. */
export const projectSeoCategoryLabelsInput = {
	kvartiry: {
		nominativePlural: "Квартиры",
		accusativeSingular: "квартиру",
		genitivePlural: "квартир",
	},
	doma: {
		nominativePlural: "Дома",
		accusativeSingular: "дом",
		genitivePlural: "домов",
	},
	uchastki: {
		nominativePlural: "Участки",
		accusativeSingular: "участок",
		genitivePlural: "участков",
	},
	"kommercheskaya-nedvizhimost": {
		nominativePlural: "Коммерческая недвижимость",
		accusativeSingular: "коммерческую недвижимость",
		genitivePlural: "объектов коммерческой недвижимости",
	},
	komnaty: {
		nominativePlural: "Комнаты",
		accusativeSingular: "комнату",
		genitivePlural: "комнат",
	},
	garazhi: {
		nominativePlural: "Гаражи",
		accusativeSingular: "гараж",
		genitivePlural: "гаражей",
	},
	arenda: {
		nominativePlural: "Аренда",
		accusativeSingular: "объект в аренду",
		genitivePlural: "предложений аренды",
	},
	novostroyki: {
		nominativePlural: "Новостройки",
		accusativeSingular: "новостройку",
		genitivePlural: "новостроек",
	},
	"kottedzhnye-poselki": {
		nominativePlural: "Коттеджные посёлки",
		accusativeSingular: "коттеджный посёлок",
		genitivePlural: "коттеджных посёлков",
	},
} as const;

export const projectSeoFacetLabelsInput = {
	vtorichka: "Вторичные",
	dvukhkomnatnye: "Двухкомнатные",
	odnokomnatnye: "Однокомнатные",
} as const;

export const projectSeoTemplatesInput = {
	home: {
		title: "Недвижимость {geoGenitive} — {brand}",
		h1: "Недвижимость {geoGenitive}",
		description: "Подбор недвижимости[ {cityPhrase}][ — {inventory}.]",
	},
	geoHub: {
		title: "Недвижимость {geoGenitive} — {brand}",
		h1: "Недвижимость {geoGenitive}",
		description: "Квартиры, дома и новостройки[ {cityPhrase}][ — {inventory}.]",
	},
	categoryRoot: {
		title: "{category} — {brand}",
		h1: "{category}",
		description: "{category} — актуальные предложения[. {inventory}.]",
	},
	categoryGeo: {
		title: "{category} {cityPhrase} — {brand}",
		h1: "{category} {cityPhrase}",
		description:
			"{category} {cityPhrase} — актуальные предложения[. {inventory}.]",
	},
	categoryGeoDistrictAdmin: {
		title:
			"Купить {categoryAccusative} в {districtAdjLocative} районе {cityGenitive} — цены",
		h1: "{categoryNominativePlural} в {districtAdjLocative} районе {cityGenitive}",
		description:
			"{categoryNominativePlural} в {districtAdjLocative} районе {cityGenitive} — актуальные предложения[. {inventory}.]",
	},
	categoryGeoDistrictMicro: {
		title: "Купить {categoryAccusative} {districtPhrase} {cityPhrase} — цены",
		h1: "{categoryNominativePlural} {districtPhrase} {cityPhrase}",
		description:
			"{categoryNominativePlural} {districtPhrase} {cityPhrase} — актуальные предложения[. {inventory}.]",
	},
	categoryGeoFacet: {
		title: "{facet} {category} {cityPhrase} — {brand}",
		h1: "{facet} {category} {cityPhrase}",
		description:
			"{facet} {category} {cityPhrase} — актуальные предложения[. {inventory}.]",
	},
	geoDevelopers: {
		title: "Застройщики {cityPhrase} — {brand}",
		h1: "Застройщики {cityPhrase}",
		description:
			"Застройщики и проверенные жилые комплексы {cityPhrase}[ — {inventory}.]",
	},
	developerRoot: {
		title: "Застройщики — {brand}",
		h1: "Застройщики",
		description: "Проверенные застройщики и жилые комплексы[ — {inventory}.]",
	},
	developmentNormal: {
		title: "{entityName} — {brand}",
		h1: "{entityName}",
		description: "{entityName}[ {cityPhrase}][ — {freshPrice}.]",
	},
	developmentCollision: {
		title: "{entityName} {cityPhrase} — {brand}",
		h1: "{entityName} {cityPhrase}",
		description: "{entityName} {cityPhrase}[ — {freshPrice}.]",
	},
	developer: {
		title: "{entityName} — {brand}",
		h1: "{entityName}",
		description:
			"Объекты застройщика {entityName}[ {cityPhrase}][ — {inventory}.]",
	},
	property: {
		title: "{entityName} — {brand}",
		h1: "{entityName}",
		description: "{entityName}[ {cityPhrase}][ — {freshPrice}.]",
	},
} as const;

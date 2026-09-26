import { starterFixtureDataset } from "./starter-dataset.ts";

export type StarterFixtureCollection =
	| "regions"
	| "cities"
	| "districts"
	| "developers"
	| "developments"
	| "properties";

export type StarterFixtureSeedPort = {
	upsert(input: {
		collection: StarterFixtureCollection;
		identity: { field: string; value: string };
		data: Record<string, unknown>;
	}): Promise<{
		id: string | number;
		state: "created" | "updated" | "unchanged";
	}>;
};

export type StarterFixtureResetPort = {
	deleteOwned(input: {
		collection: "properties" | "developments" | "developers";
		identity: { field: string; value: string };
		ownership: { field: string; value: string };
	}): Promise<"deleted" | "missing">;
};

export type StarterFixtureSeedReport = {
	created: number;
	updated: number;
	unchanged: number;
	byCollection: Record<StarterFixtureCollection, number>;
};

function requiredReference(
	map: ReadonlyMap<string, string | number>,
	key: string,
	label: string,
): string | number {
	const value = map.get(key);
	if (value === undefined)
		throw new Error(`Starter fixture reference is missing: ${label}=${key}`);
	return value;
}

export async function seedStarterFixture(
	port: StarterFixtureSeedPort,
	options: { through?: "geo" | "all" } = {},
): Promise<StarterFixtureSeedReport> {
	const dataset = starterFixtureDataset;
	if (dataset.identity.indexing !== "noindex") {
		throw new Error("Starter fixture must remain noindex.");
	}
	const report: StarterFixtureSeedReport = {
		created: 0,
		updated: 0,
		unchanged: 0,
		byCollection: {
			regions: 0,
			cities: 0,
			districts: 0,
			developers: 0,
			developments: 0,
			properties: 0,
		},
	};
	async function upsert(
		collection: StarterFixtureCollection,
		identity: { field: string; value: string },
		data: Record<string, unknown>,
	) {
		const result = await port.upsert({ collection, identity, data });
		report[result.state] += 1;
		report.byCollection[collection] += 1;
		return result.id;
	}

	const published = {
		status: "published",
		publishedAt: dataset.identity.snapshotAt,
	};
	const regionId = await upsert(
		"regions",
		{ field: "slug", value: dataset.region.slug },
		{ ...dataset.region, ...published },
	);
	const cityIds = new Map<string, string | number>();
	for (const city of dataset.cities) {
		const data = Object.fromEntries(
			Object.entries(city).filter(
				([key]) => !["districts", "agglomerationOf"].includes(key),
			),
		);
		const agglomerationOf =
			"agglomerationOf" in city && city.agglomerationOf
				? requiredReference(
						cityIds,
						city.agglomerationOf,
						"city.agglomerationOf",
					)
				: undefined;
		cityIds.set(
			city.slug,
			await upsert(
				"cities",
				{ field: "slug", value: city.slug },
				{
					...data,
					region: regionId,
					agglomerationOf,
					...published,
				},
			),
		);
	}
	const districtIds = new Map<string, string | number>();
	for (const city of dataset.cities) {
		for (const district of city.districts.filter(
			(item) => item.parent === null,
		)) {
			const { parent: _parent, ...data } = district;
			districtIds.set(
				district.slug,
				await upsert(
					"districts",
					{ field: "slug", value: district.slug },
					{
						...data,
						city: requiredReference(cityIds, city.slug, "district.city"),
						...published,
					},
				),
			);
		}
		for (const district of city.districts.filter(
			(item) => item.parent !== null,
		)) {
			const { parent, ...data } = district;
			districtIds.set(
				district.slug,
				await upsert(
					"districts",
					{ field: "slug", value: district.slug },
					{
						...data,
						city: requiredReference(cityIds, city.slug, "district.city"),
						parent: requiredReference(districtIds, parent, "district.parent"),
						...published,
					},
				),
			);
		}
	}
	if (options.through === "geo") return report;

	const developerIds = new Map<string, string | number>();
	for (const developer of dataset.developers) {
		developerIds.set(
			developer.slug,
			await upsert(
				"developers",
				{ field: "slug", value: developer.slug },
				{
					...developer,
					description: `Синтетическое описание ${developer.name}.`,
					source: dataset.identity.source,
					checkedAt: dataset.identity.snapshotAt,
					status: "draft",
				},
			),
		);
	}
	const developmentIds = new Map<string, string | number>();
	for (const development of dataset.developments) {
		developmentIds.set(
			development.slug,
			await upsert(
				"developments",
				{ field: "slug", value: development.slug },
				{
					name: development.name,
					slug: development.slug,
					kind: development.kind,
					region: regionId,
					city: requiredReference(
						cityIds,
						development.citySlug,
						"development.city",
					),
					district: requiredReference(
						districtIds,
						development.districtSlug,
						"development.district",
					),
					developer: requiredReference(
						developerIds,
						development.developerSlug,
						"development.developer",
					),
					address: development.address,
					districtRaw: development.districtSlug,
					salesStatus: "on_sale",
					salesAvailability: "confirmed",
					dataTier: development.dataTier,
					priceByRooms: [
						{
							roomsLabel: "1-комнатные",
							priceFromMinor: development.priceMinor,
							priceToMinor: development.priceMinor,
							lotsAvailable: 1,
							priceCheckedAt: dataset.identity.snapshotAt,
							source: dataset.identity.source,
						},
					],
					descriptions: [
						{
							kind: "short",
							text: `Синтетическое описание ${development.name}.`,
							source: dataset.identity.source,
							checkedAt: dataset.identity.snapshotAt,
						},
					],
					externalIdentities: [
						{
							source: dataset.identity.source,
							externalId: development.externalId,
						},
					],
					source: dataset.identity.source,
					checkedAt: dataset.identity.snapshotAt,
					status: "draft",
				},
			),
		);
	}
	for (const property of dataset.properties) {
		await upsert(
			"properties",
			{ field: "externalId", value: `starter-fixture-${property.externalId}` },
			{
				origin: "manual",
				externalId: `starter-fixture-${property.externalId}`,
				slug: property.slug,
				market: property.market,
				category: property.category,
				dealType: "sale",
				priceMinor: property.priceMinor,
				currency: "RUB",
				rooms: "rooms" in property ? property.rooms : undefined,
				totalArea: "totalArea" in property ? property.totalArea : undefined,
				plotAreaSotka:
					"plotAreaSotka" in property ? property.plotAreaSotka : undefined,
				region: dataset.region.title,
				regionRef: regionId,
				locality: dataset.cities.find((city) => city.slug === property.citySlug)
					?.title,
				cityRef: requiredReference(cityIds, property.citySlug, "property.city"),
				districtRef: requiredReference(
					districtIds,
					property.districtSlug,
					"property.district",
				),
				district: property.districtSlug,
				development:
					"developmentSlug" in property
						? requiredReference(
								developmentIds,
								property.developmentSlug,
								"property.development",
							)
						: undefined,
				publicAddress: property.title,
				title: property.title,
				description: "Синтетический объект starter fixture.",
				status: "active",
				needsReview: false,
			},
		);
	}
	return report;
}

export async function resetStarterFixture(
	port: StarterFixtureResetPort,
): Promise<{ deleted: number; missing: number; retainedGeoRecords: number }> {
	const dataset = starterFixtureDataset;
	const targets = [
		...dataset.properties.map((property) => ({
			collection: "properties" as const,
			identity: {
				field: "externalId",
				value: `starter-fixture-${property.externalId}`,
			},
			ownership: {
				field: "externalId",
				value: `starter-fixture-${property.externalId}`,
			},
		})),
		...dataset.developments.map((development) => ({
			collection: "developments" as const,
			identity: { field: "slug", value: development.slug },
			ownership: { field: "source", value: dataset.identity.source },
		})),
		...dataset.developers.map((developer) => ({
			collection: "developers" as const,
			identity: { field: "slug", value: developer.slug },
			ownership: { field: "source", value: dataset.identity.source },
		})),
	];
	let deleted = 0;
	let missing = 0;
	for (const target of targets) {
		const state = await port.deleteOwned(target);
		if (state === "deleted") deleted += 1;
		else missing += 1;
	}
	return {
		deleted,
		missing,
		retainedGeoRecords:
			1 +
			dataset.cities.length +
			dataset.cities.reduce((sum, city) => sum + city.districts.length, 0),
	};
}

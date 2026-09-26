import {
	defineSiteProfile,
	type SitePreset,
	type SiteProfile,
} from "../core/profile/index.ts";
import { projectSiteProfileConfig } from "./site-profile.config.ts";
import type { ProjectSiteProfileConfig } from "./site-profile.config.types.ts";
import { createPresetSiteProfileConfig } from "./site-profile-presets.ts";

export { createPresetSiteProfileConfig } from "./site-profile-presets.ts";

export function createProjectSiteProfile(
	input: ProjectSiteProfileConfig,
): SiteProfile {
	return defineSiteProfile(input);
}

function createFixtureProfile(input: {
	preset: SitePreset;
	geoMode: ProjectSiteProfileConfig["geoMode"];
}): SiteProfile {
	const geos: ProjectSiteProfileConfig["geos"] = {
		primorsk: { published: true, hubStatus: "ACTIVE" },
		...(input.geoMode === "MULTI_GEO"
			? {
					zarechnyy: {
						published: true,
						hubStatus: "NOINDEX_AUTO" as const,
						agglomerationOf: "primorsk",
					},
				}
			: {}),
	};
	return createProjectSiteProfile(
		createPresetSiteProfileConfig({
			preset: input.preset,
			geoMode: input.geoMode,
			primaryGeo: "primorsk",
			geos,
		}),
	);
}

export const siteProfileFixtures = {
	singleGeo: createFixtureProfile({ preset: "MIXED", geoMode: "SINGLE_GEO" }),
	multiGeo: createFixtureProfile({ preset: "MIXED", geoMode: "MULTI_GEO" }),
	newbuildFirst: createFixtureProfile({
		preset: "NEWBUILD_FIRST",
		geoMode: "MULTI_GEO",
	}),
	secondaryFirst: createFixtureProfile({
		preset: "SECONDARY_FIRST",
		geoMode: "MULTI_GEO",
	}),
	singleGeoThreeCities: createProjectSiteProfile(
		createPresetSiteProfileConfig({
			preset: "MIXED",
			geoMode: "SINGLE_GEO",
			primaryGeo: "primorsk",
			geos: {
				primorsk: { published: true, hubStatus: "ACTIVE" },
				zarechnyy: {
					published: true,
					hubStatus: "PREPARED_OFF",
					agglomerationOf: "primorsk",
				},
				beregovoy: { published: false, hubStatus: "PREPARED_OFF" },
			},
		}),
	),
} as const;

export const siteProfile = createProjectSiteProfile(projectSiteProfileConfig);

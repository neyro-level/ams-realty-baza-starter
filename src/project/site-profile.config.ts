import type { ProjectSiteProfileConfig } from "./site-profile.config.types.ts";

/**
 * Project-owned profile input. `clone:prepare --preset-file=...` replaces only
 * this file in a client clone; reusable profile logic stays unchanged.
 */
export const projectSiteProfileConfig = {
	preset: "MIXED",
	geoMode: "SINGLE_GEO",
	primaryGeo: "primorsk",
	geos: {
		primorsk: { published: true, status: "ACTIVE" },
	},
} as const satisfies ProjectSiteProfileConfig;

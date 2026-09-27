import { defineSiteProfile, type SiteProfile } from "../core/profile/index.ts";
import { projectSiteProfileConfig } from "./site-profile.config.ts";
import type { ProjectSiteProfileConfig } from "./site-profile.config.types.ts";

export { createPresetSiteProfileConfig } from "./site-profile-presets.ts";

export function createProjectSiteProfile(
	input: ProjectSiteProfileConfig,
): SiteProfile {
	return defineSiteProfile(input);
}

export const siteProfile = createProjectSiteProfile(projectSiteProfileConfig);

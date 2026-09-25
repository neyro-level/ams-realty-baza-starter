import type { EntityPageLifecycleState } from "../lifecycle/entity-lifecycle.ts";
import type { ProfileStatus, SiteProfile } from "../profile/index.ts";
import type { SeoRegistryRow } from "./registry.ts";

export type ContentGateOverride = {
	actor: string;
	reason: string;
	requestedAt: string;
};

export type ContentGateCommon = {
	url: string;
	canonical: string;
	profileStatus: ProfileStatus;
	lifecycle?: EntityPageLifecycleState;
	ownerOverride?: ContentGateOverride;
};

type PriceRow = { checkedAt: string };

export type ContentGateInput = ContentGateCommon &
	(
		| {
				kind: "listing";
				registry: SeoRegistryRow | null;
				inventory: number;
				intro: string;
				ssrLinkCount: number;
		  }
		| {
				kind: "secondary";
				priceMinor: number | null;
				area: number | null;
				category:
					| "apartment"
					| "room"
					| "house"
					| "land"
					| "commercial"
					| "garage";
				rooms: number | null;
				district: string | null;
				rawDistrictRef: string | null;
				ownedPhotoCount: number;
				description: string;
		  }
		| { kind: "newbuildLot" }
		| {
				kind: "development";
				dataTier: "A" | "B" | "C";
				description: string;
				mediaCount: number;
				layoutCount: number;
				progressPresent: boolean;
				priceRows: readonly PriceRow[];
		  }
		| {
				kind: "developerGeo";
				developersWithPassingDevelopment: number;
		  }
		| {
				kind: "developer";
				hasPassingDevelopment: boolean;
				description: string;
				descriptionSource: string | null;
				descriptionCheckedAt: string | null;
		  }
	);

export type ContentGateDecision = {
	statusCode: 200 | 301 | 404 | 410;
	indexing: "index" | "noindex";
	following: "follow";
	canonical: string;
	includeInSitemap: boolean;
	reasons: readonly string[];
	visiblePriceRows?: number;
	dataTier?: "A" | "B" | "C";
	overrideAudit?: ContentGateOverride & {
		result: "applied" | "denied";
		detail: string;
	};
};

function validCount(value: number, label: string): number {
	if (!Number.isSafeInteger(value) || value < 0) {
		throw new Error(`${label} must be a non-negative safe integer.`);
	}
	return value;
}

function ageDays(value: string, now: Date): number {
	const checked = new Date(value);
	if (Number.isNaN(checked.getTime())) {
		throw new Error(`Invalid checkedAt date: ${value}`);
	}
	if (checked.getTime() > now.getTime()) {
		throw new Error(`checkedAt cannot be in the future: ${value}`);
	}
	return (now.getTime() - checked.getTime()) / 86_400_000;
}

function validateOverride(value: ContentGateOverride): void {
	if (!value.actor.trim() || !value.reason.trim()) {
		throw new Error("Owner override requires actor and reason.");
	}
	if (Number.isNaN(new Date(value.requestedAt).getTime())) {
		throw new Error("Owner override requestedAt must be a valid date.");
	}
}

function lifecycleDecision(
	lifecycle: EntityPageLifecycleState | undefined,
): Pick<ContentGateDecision, "statusCode" | "indexing" | "reasons"> | null {
	if (!lifecycle || lifecycle.kind === "active") return null;
	switch (lifecycle.kind) {
		case "missing":
			return {
				statusCode: 404,
				indexing: "noindex",
				reasons: ["lifecycle_missing"],
			};
		case "redirect":
			return {
				statusCode: 301,
				indexing: "noindex",
				reasons: ["lifecycle_redirect"],
			};
		case "gone":
			return {
				statusCode: 410,
				indexing: "noindex",
				reasons: ["lifecycle_gone"],
			};
		case "archived":
			return {
				statusCode: 200,
				indexing: "noindex",
				reasons: ["lifecycle_archived"],
			};
	}
}

function baseDecision(input: ContentGateInput): ContentGateDecision | null {
	if (input.ownerOverride) validateOverride(input.ownerOverride);
	if (input.profileStatus === "OUT" || input.profileStatus === "PREPARED_OFF") {
		return {
			statusCode: 404,
			indexing: "noindex",
			following: "follow",
			canonical: input.canonical,
			includeInSitemap: false,
			reasons: [`profile_${input.profileStatus.toLowerCase()}`],
			overrideAudit: input.ownerOverride
				? { ...input.ownerOverride, result: "denied", detail: "profile_status" }
				: undefined,
		};
	}
	const lifecycle = lifecycleDecision(input.lifecycle);
	if (!lifecycle) return null;
	return {
		...lifecycle,
		following: "follow",
		canonical: input.canonical,
		includeInSitemap: false,
		overrideAudit: input.ownerOverride
			? { ...input.ownerOverride, result: "denied", detail: "lifecycle" }
			: undefined,
	};
}

function contentReasons(
	profile: SiteProfile,
	input: ContentGateInput,
	now: Date,
): { reasons: string[]; hardNoindex: boolean; visiblePriceRows?: number } {
	const reasons: string[] = [];
	let hardNoindex = false;
	let visiblePriceRows: number | undefined;

	switch (input.kind) {
		case "listing": {
			validCount(input.inventory, "inventory");
			validCount(input.ssrLinkCount, "ssrLinkCount");
			const row = input.registry;
			if (row?.status !== "approved" || row.synthetic) {
				reasons.push("registry_metadata_not_approved");
			} else {
				if (row.tier === "NONE") reasons.push("registry_tier_none");
				const minimum = Math.max(
					row.minimumObjects,
					row.tier === "NONE" ? 0 : profile.seoTiers.minInventory[row.tier],
				);
				if (input.inventory < minimum)
					reasons.push("listing_inventory_below_tier");
				if (!row.morphologyApproved)
					reasons.push("registry_morphology_unapproved");
				if (!row.title.trim() || !row.h1.trim() || !row.description.trim()) {
					reasons.push("registry_metadata_incomplete");
				}
			}
			if (input.intro.trim().length < profile.gate.listingIntroMinChars) {
				reasons.push("listing_intro_too_short");
			}
			if (input.ssrLinkCount < 1) reasons.push("listing_ssr_links_missing");
			break;
		}
		case "secondary":
			validCount(input.ownedPhotoCount, "ownedPhotoCount");
			if (input.priceMinor === null || input.priceMinor <= 0)
				reasons.push("secondary_price_missing");
			if (input.area === null || input.area <= 0)
				reasons.push("secondary_area_missing");
			if (
				input.category === "apartment" &&
				(!input.rooms || input.rooms <= 0)
			) {
				reasons.push("secondary_rooms_missing");
			}
			if (!input.district?.trim() && !input.rawDistrictRef?.trim()) {
				reasons.push("secondary_district_missing");
			}
			if (input.ownedPhotoCount < profile.gate.propertyPhotosMin)
				reasons.push("secondary_photos_missing");
			if (!input.description.trim())
				reasons.push("secondary_description_missing");
			break;
		case "newbuildLot":
			hardNoindex = true;
			reasons.push("newbuild_lot_forced_noindex");
			if (input.canonical !== input.url)
				reasons.push("newbuild_lot_not_self_canonical");
			break;
		case "development": {
			validCount(input.mediaCount, "mediaCount");
			validCount(input.layoutCount, "layoutCount");
			const ages = input.priceRows.map((row) => ageDays(row.checkedAt, now));
			visiblePriceRows = ages.filter(
				(age) => age <= profile.gate.priceStaleDays,
			).length;
			if (input.dataTier === "C") {
				hardNoindex = true;
				reasons.push("development_tier_c");
			} else {
				const threshold =
					input.dataTier === "A"
						? profile.gate.developmentA
						: profile.gate.developmentB;
				if (visiblePriceRows < threshold.priceRowsMin)
					reasons.push("development_prices_below_tier");
				if (input.mediaCount < threshold.mediaMin)
					reasons.push("development_media_below_tier");
				if (input.layoutCount < threshold.layoutsMin)
					reasons.push("development_layouts_below_tier");
				if (input.description.trim().length < threshold.descriptionMinChars)
					reasons.push("development_description_below_tier");
				if (threshold.progressRequired && !input.progressPresent)
					reasons.push("development_progress_missing");
			}
			if (
				ages.length > 0 &&
				ages.every((age) => age > profile.gate.priceFailDays)
			) {
				reasons.push("development_all_prices_expired");
			}
			break;
		}
		case "developerGeo":
			validCount(
				input.developersWithPassingDevelopment,
				"developersWithPassingDevelopment",
			);
			if (input.developersWithPassingDevelopment < profile.gate.developerGeoMin)
				reasons.push("developer_geo_minimum_not_met");
			break;
		case "developer":
			if (!input.hasPassingDevelopment)
				reasons.push("developer_has_no_passing_development");
			if (input.description.trim().length < profile.gate.developerDescMinChars)
				reasons.push("developer_description_too_short");
			if (!input.descriptionSource?.trim() || !input.descriptionCheckedAt) {
				reasons.push("developer_description_not_sourced");
			} else {
				ageDays(input.descriptionCheckedAt, now);
			}
			break;
	}

	if (input.canonical !== input.url) reasons.push("canonical_mismatch");
	return { reasons, hardNoindex, visiblePriceRows };
}

export function evaluateContentGate(
	profile: SiteProfile,
	input: ContentGateInput,
	now = new Date(),
): ContentGateDecision {
	const blocked = baseDecision(input);
	if (blocked) return blocked;
	const content = contentReasons(profile, input, now);
	const profileNoindex = input.profileStatus === "NOINDEX_AUTO";
	const canOverride = Boolean(
		input.ownerOverride && !profileNoindex && !content.hardNoindex,
	);
	const contentPasses = content.reasons.length === 0;
	const indexable =
		!profileNoindex && !content.hardNoindex && (contentPasses || canOverride);
	const reasons = profileNoindex
		? ["profile_noindex_auto", ...content.reasons]
		: content.reasons;

	return {
		statusCode: 200,
		indexing: indexable ? "index" : "noindex",
		following: "follow",
		canonical: input.kind === "newbuildLot" ? input.url : input.canonical,
		includeInSitemap: indexable && input.kind !== "newbuildLot",
		reasons,
		visiblePriceRows: content.visiblePriceRows,
		dataTier: input.kind === "development" ? input.dataTier : undefined,
		overrideAudit: input.ownerOverride
			? {
					...input.ownerOverride,
					result: canOverride && !contentPasses ? "applied" : "denied",
					detail:
						canOverride && !contentPasses
							? "content_requirements"
							: contentPasses
								? "not_needed"
								: profileNoindex
									? "profile_status"
									: "hard_noindex",
				}
			: undefined,
	};
}

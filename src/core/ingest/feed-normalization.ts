import { z } from "zod";
import {
	type ImageHostIssueCode,
	validateExternalImageUrl,
} from "./image-hosts.ts";

export const normalizedFeedImageSchema = z.object({
	url: z.string().url(),
	host: z.string().min(1),
});

export const normalizedFeedOfferSchema = z.object({
	externalId: z.string().min(1),
	title: z.string().min(1),
	description: z.string().optional(),
	category: z.string().optional(),
	dealType: z.string().optional(),
	propertyType: z.string().optional(),
	priceMinor: z.number().int().nonnegative().optional(),
	currency: z.string().min(3).max(3).default("RUB"),
	publicAddress: z.string().optional(),
	locality: z.string().optional(),
	district: z.string().optional(),
	latitude: z.number().finite().optional(),
	longitude: z.number().finite().optional(),
	images: z.array(normalizedFeedImageSchema),
});

export type NormalizedFeedOffer = z.output<typeof normalizedFeedOfferSchema>;

export type FeedNormalizationIssue = {
	severity: "warning" | "error";
	code: ImageHostIssueCode | "feed.offer_invalid";
	externalId?: string;
	field?: string;
	messageRedacted: string;
};

export type RawYrlOffer = {
	externalId: string;
	title?: string;
	description?: string;
	category?: string;
	type?: string;
	propertyType?: string;
	price?: string;
	currency?: string;
	address?: string;
	locality?: string;
	district?: string;
	latitude?: string;
	longitude?: string;
	pictures: string[];
};

export type NormalizeFeedOfferResult =
	| {
			ok: true;
			offer: NormalizedFeedOffer;
			issues: FeedNormalizationIssue[];
	  }
	| {
			ok: false;
			issues: FeedNormalizationIssue[];
	  };

export function normalizeYrlOffer(
	rawOffer: RawYrlOffer,
	allowedImageHosts: ReadonlySet<string>,
): NormalizeFeedOfferResult {
	const issues: FeedNormalizationIssue[] = [];
	const images = [];

	for (const picture of rawOffer.pictures) {
		const validation = validateExternalImageUrl(picture, allowedImageHosts);
		if (validation.ok) {
			images.push({ url: validation.url, host: validation.host });
			continue;
		}

		issues.push({
			severity: "warning",
			code: validation.code,
			externalId: rawOffer.externalId,
			field: "images",
			messageRedacted:
				"Feed image skipped because its URL or host is not allowed.",
		});
	}

	const parsed = normalizedFeedOfferSchema.safeParse({
		externalId: rawOffer.externalId,
		title:
			rawOffer.title ??
			rawOffer.address ??
			rawOffer.locality ??
			rawOffer.externalId,
		description: rawOffer.description,
		category: rawOffer.category,
		dealType: rawOffer.type,
		propertyType: rawOffer.propertyType,
		priceMinor: parseMoneyToMinor(rawOffer.price),
		currency: normalizeCurrency(rawOffer.currency),
		publicAddress: rawOffer.address,
		locality: rawOffer.locality,
		district: rawOffer.district,
		latitude: parseCoordinate(rawOffer.latitude),
		longitude: parseCoordinate(rawOffer.longitude),
		images,
	});

	if (!parsed.success) {
		return {
			ok: false,
			issues: [
				...issues,
				{
					severity: "error",
					code: "feed.offer_invalid",
					externalId: rawOffer.externalId,
					messageRedacted: "Feed offer failed normalization.",
				},
			],
		};
	}

	return { ok: true, offer: parsed.data, issues };
}

function normalizeCurrency(value: string | undefined): string {
	const currency = value?.trim().toUpperCase();
	if (!currency || currency === "RUR") {
		return "RUB";
	}
	return currency;
}

function parseMoneyToMinor(value: string | undefined): number | undefined {
	if (!value) {
		return undefined;
	}
	const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
	const amount = Number(normalized);
	if (!Number.isFinite(amount) || amount < 0) {
		return undefined;
	}
	return Math.round(amount * 100);
}

function parseCoordinate(value: string | undefined): number | undefined {
	if (!value) {
		return undefined;
	}
	const coordinate = Number(value.trim().replace(",", "."));
	return Number.isFinite(coordinate) ? coordinate : undefined;
}

import { SaxesParser } from "saxes";
import {
	type FeedNormalizationIssue,
	type NormalizedFeedOffer,
	normalizeYrlOffer,
	type RawYrlOffer,
} from "./feed-normalization.ts";

export type YrlFeedInput = {
	stream:
		| ReadableStream<Uint8Array>
		| AsyncIterable<Uint8Array>
		| Iterable<Uint8Array>;
	allowedImageHosts: ReadonlySet<string>;
	signal?: AbortSignal;
	onOffer?: (offer: NormalizedFeedOffer) => void | Promise<void>;
	onIssue?: (issue: FeedNormalizationIssue) => void | Promise<void>;
	collectOffers?: boolean;
	collectIssues?: boolean;
	maxNestingDepth?: number;
	maxAttributes?: number;
	maxTextNodeChars?: number;
	maxOfferBytes?: number;
};

export type YrlFeedParseStats = {
	offersSeen: number;
	maxBufferedOffersObserved: number;
	maxRetainedCharsObserved: number;
	parserCompleted: boolean;
	criticalStructuralAnomaly: boolean;
};

export type YrlFeedParseResult = {
	offers: NormalizedFeedOffer[];
	issues: FeedNormalizationIssue[];
	stats: YrlFeedParseStats;
};

const DEFAULT_MAX_NESTING = 32;
const DEFAULT_MAX_ATTRIBUTES = 32;
const DEFAULT_MAX_TEXT_NODE = 64 * 1024;
const DEFAULT_MAX_OFFER_BYTES = 1024 * 1024;

type ActiveOffer = {
	raw: RawYrlOffer;
	stack: string[];
	bytes: number;
};

export async function parseYrlFeed({
	stream,
	allowedImageHosts,
	signal,
	onOffer,
	onIssue,
	collectOffers = Boolean(onOffer) === false,
	collectIssues = Boolean(onIssue) === false,
	maxNestingDepth = DEFAULT_MAX_NESTING,
	maxAttributes = DEFAULT_MAX_ATTRIBUTES,
	maxTextNodeChars = DEFAULT_MAX_TEXT_NODE,
	maxOfferBytes = DEFAULT_MAX_OFFER_BYTES,
}: YrlFeedInput): Promise<YrlFeedParseResult> {
	const decoder = new TextDecoder();
	const offers: NormalizedFeedOffer[] = [];
	const issues: FeedNormalizationIssue[] = [];
	const stats: YrlFeedParseStats = {
		offersSeen: 0,
		maxBufferedOffersObserved: 0,
		maxRetainedCharsObserved: 0,
		parserCompleted: false,
		criticalStructuralAnomaly: false,
	};

	const parser = new SaxesParser({ xmlns: false, fragment: false });
	const documentStack: string[] = [];
	let currentText = "";
	let active: ActiveOffer | undefined;
	let stopError: Error | undefined;
	type PendingDelivery =
		| { type: "offer"; value: NormalizedFeedOffer }
		| { type: "issue"; value: FeedNormalizationIssue };
	let pendingDeliveries: PendingDelivery[] = [];

	const recordIssue = (issue: FeedNormalizationIssue) => {
		if (collectIssues) issues.push(issue);
		if (onIssue) pendingDeliveries.push({ type: "issue", value: issue });
	};

	const recordOffer = (offer: NormalizedFeedOffer) => {
		if (collectOffers) offers.push(offer);
		if (onOffer) pendingDeliveries.push({ type: "offer", value: offer });
		stats.maxBufferedOffersObserved = Math.max(
			stats.maxBufferedOffersObserved,
			pendingDeliveries.filter((delivery) => delivery.type === "offer").length,
		);
	};

	const flushDeliveries = async () => {
		const deliveries = pendingDeliveries;
		pendingDeliveries = [];
		for (const delivery of deliveries) {
			if (delivery.type === "offer") await onOffer?.(delivery.value);
			else await onIssue?.(delivery.value);
		}
	};

	const writeWithBackpressure = async (value: string) => {
		let offset = 0;
		while (offset < value.length) {
			const tagEnd = value.indexOf(">", offset);
			const end = tagEnd === -1 ? value.length : tagEnd + 1;
			parser.write(value.slice(offset, end));
			offset = end;
			await flushDeliveries();
			if (stopError) break;
		}
	};

	const failCritical = (message: string) => {
		stats.criticalStructuralAnomaly = true;
		stopError = new Error(message);
	};

	parser.on("doctype", () => {
		failCritical("DTD and DOCTYPE are not allowed in feed XML.");
	});

	parser.on("error", (error) => {
		if (active) {
			recordIssue({
				severity: "error",
				code: "feed.offer_invalid",
				externalId: active.raw.externalId || undefined,
				messageRedacted: "Malformed offer XML was isolated and skipped.",
			});
			active = undefined;
			currentText = "";
			return;
		}
		failCritical(error.message || "Malformed feed XML.");
	});

	parser.on("opentag", (tag) => {
		if (stopError) return;
		const name = tag.name.toLowerCase();
		const attributeCount = Object.keys(tag.attributes).length;
		if (attributeCount > maxAttributes) {
			failCritical("Feed XML exceeded max attributes per element.");
			return;
		}

		documentStack.push(name);
		if (documentStack.length > maxNestingDepth) {
			failCritical("Feed XML exceeded max nesting depth.");
			return;
		}

		currentText = "";

		if (name === "offer") {
			active = {
				raw: emptyRawOffer(tag.attributes),
				stack: ["offer"],
				bytes: 0,
			};
			return;
		}

		if (active) {
			active.stack.push(name);
			active.bytes += name.length + attributeCount * 8;
			if (active.bytes > maxOfferBytes) {
				recordIssue({
					severity: "error",
					code: "feed.offer_invalid",
					externalId: active.raw.externalId || undefined,
					messageRedacted: "Offer exceeded max size and was skipped.",
				});
				active = undefined;
			}
		}
	});

	const appendText = (value: string) => {
		if (stopError || !value) return;
		if (value.length > maxTextNodeChars) {
			if (active) {
				recordIssue({
					severity: "error",
					code: "feed.offer_invalid",
					externalId: active.raw.externalId || undefined,
					messageRedacted: "Offer text node exceeded max size.",
				});
				active = undefined;
				currentText = "";
				return;
			}
			failCritical("Feed XML text node exceeded max size.");
			return;
		}
		currentText += value;
		if (currentText.length > maxTextNodeChars) {
			appendText("");
			return;
		}
		if (active) {
			active.bytes += value.length;
			stats.maxRetainedCharsObserved = Math.max(
				stats.maxRetainedCharsObserved,
				active.bytes,
			);
			if (active.bytes > maxOfferBytes) {
				recordIssue({
					severity: "error",
					code: "feed.offer_invalid",
					externalId: active.raw.externalId || undefined,
					messageRedacted: "Offer exceeded max size and was skipped.",
				});
				active = undefined;
			}
		}
	};

	parser.on("text", appendText);
	parser.on("cdata", appendText);

	parser.on("closetag", (tag) => {
		if (stopError) return;
		const name = tag.name.toLowerCase();
		documentStack.pop();
		const text = currentText.trim();
		currentText = "";

		if (active) {
			assignOfferField(active.raw, active.stack, text);
			active.stack.pop();
			if (name === "offer") {
				stats.offersSeen += 1;
				const normalized = normalizeYrlOffer(active.raw, allowedImageHosts);
				for (const issue of normalized.issues) recordIssue(issue);
				if (normalized.ok) {
					recordOffer(normalized.offer);
				}
				active = undefined;
			}
		}
	});

	try {
		for await (const chunk of toAsyncIterable(stream)) {
			if (signal?.aborted) {
				failCritical("Feed parser was cancelled.");
				break;
			}
			await writeWithBackpressure(decoder.decode(chunk, { stream: true }));
			if (stopError) break;
		}
		if (!stopError && !signal?.aborted) {
			await writeWithBackpressure(decoder.decode());
			parser.close();
			await flushDeliveries();
			stats.parserCompleted = !stats.criticalStructuralAnomaly;
		}
	} catch (error) {
		stats.criticalStructuralAnomaly = true;
		stats.parserCompleted = false;
		if (!stopError) {
			stopError =
				error instanceof Error ? error : new Error("Feed parser failed.");
		}
	}

	if (stats.criticalStructuralAnomaly) {
		recordIssue({
			severity: "error",
			code: "feed.offer_invalid",
			messageRedacted: "Feed XML had a critical structural anomaly.",
		});
	}
	await flushDeliveries();

	return { offers, issues, stats };
}

function emptyRawOffer(attributes: Record<string, string>): RawYrlOffer {
	return {
		externalId: attributes.id ?? attributes["internal-id"] ?? "",
		pictures: [],
		marketFromXml: undefined,
	};
}

function assignOfferField(
	raw: RawYrlOffer,
	stack: string[],
	text: string,
): void {
	if (!text || stack.length < 2) return;
	const path = stack.slice(1).join("/");
	switch (path) {
		case "external-id":
			raw.externalId ||= text;
			break;
		case "title":
		case "name":
			raw.title = raw.title ?? text;
			break;
		case "description":
			raw.description = text;
			break;
		case "category":
			raw.category = text;
			break;
		case "type":
			raw.type = text;
			break;
		case "property-type":
			raw.propertyType = text;
			break;
		case "price/value":
			raw.price = text;
			break;
		case "price":
			raw.price = raw.price ?? text;
			break;
		case "price/currency":
			raw.currency = text;
			break;
		case "currency":
			raw.currency = raw.currency ?? text;
			break;
		case "address":
			raw.address = text;
			break;
		case "locality-name":
			raw.locality = text;
			break;
		case "region":
			raw.region = text;
			break;
		case "district":
			raw.district = text;
			break;
		case "street":
			raw.street = text;
			break;
		case "house":
			raw.house = text;
			break;
		case "latitude":
			raw.latitude = text;
			break;
		case "longitude":
			raw.longitude = text;
			break;
		case "rooms":
			raw.rooms = text;
			break;
		case "floor":
			raw.floor = text;
			break;
		case "floors-total":
			raw.floors = text;
			break;
		case "area/value":
			raw.totalArea = text;
			break;
		case "area/unit":
			raw.totalAreaUnit = text;
			break;
		case "living-space/value":
			raw.livingArea = text;
			break;
		case "living-space/unit":
			raw.livingAreaUnit = text;
			break;
		case "kitchen-space/value":
			raw.kitchenArea = text;
			break;
		case "kitchen-space/unit":
			raw.kitchenAreaUnit = text;
			break;
		case "picture":
			raw.pictures.push(text);
			break;
		case "yandex-building-id":
		case "building-id":
			raw.externalBuildingId = raw.externalBuildingId ?? text;
			break;
		case "yandex-house-id":
			raw.externalLayoutId = text;
			break;
		case "building-name":
		case "yandex-building-name":
			raw.externalComplexName = raw.externalComplexName ?? text;
			break;
		case "complex-id":
		case "village-id":
			raw.externalComplexId = text;
			break;
		case "market":
			raw.marketFromXml = text;
			break;
		default:
			break;
	}
}

async function* toAsyncIterable(
	stream:
		| ReadableStream<Uint8Array>
		| AsyncIterable<Uint8Array>
		| Iterable<Uint8Array>,
): AsyncIterable<Uint8Array> {
	if (Symbol.asyncIterator in stream) {
		yield* stream;
		return;
	}

	if (Symbol.iterator in stream) {
		yield* stream;
		return;
	}

	const reader = stream.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				return;
			}
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}

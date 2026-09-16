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
	maxRetainedChars?: number;
};

export type YrlFeedParseStats = {
	offersSeen: number;
	maxRetainedCharsObserved: number;
};

export type YrlFeedParseResult = {
	offers: NormalizedFeedOffer[];
	issues: FeedNormalizationIssue[];
	stats: YrlFeedParseStats;
};

const DEFAULT_MAX_RETAINED_CHARS = 512 * 1024;
const OFFER_CLOSE_TAG = "</offer>";

export async function parseYrlFeed({
	stream,
	allowedImageHosts,
	maxRetainedChars = DEFAULT_MAX_RETAINED_CHARS,
}: YrlFeedInput): Promise<YrlFeedParseResult> {
	const decoder = new TextDecoder();
	const offers: NormalizedFeedOffer[] = [];
	const issues: FeedNormalizationIssue[] = [];
	const stats: YrlFeedParseStats = {
		offersSeen: 0,
		maxRetainedCharsObserved: 0,
	};
	let buffer = "";

	for await (const chunk of toAsyncIterable(stream)) {
		buffer += decoder.decode(chunk, { stream: true });
		stats.maxRetainedCharsObserved = Math.max(
			stats.maxRetainedCharsObserved,
			buffer.length,
		);
		buffer = drainCompleteOffers(
			buffer,
			allowedImageHosts,
			offers,
			issues,
			stats,
		);
		assertRetainedBufferLimit(buffer, maxRetainedChars);
	}

	buffer += decoder.decode();
	stats.maxRetainedCharsObserved = Math.max(
		stats.maxRetainedCharsObserved,
		buffer.length,
	);
	buffer = drainCompleteOffers(
		buffer,
		allowedImageHosts,
		offers,
		issues,
		stats,
	);
	assertRetainedBufferLimit(buffer, maxRetainedChars);

	return { offers, issues, stats };
}

function drainCompleteOffers(
	input: string,
	allowedImageHosts: ReadonlySet<string>,
	offers: NormalizedFeedOffer[],
	issues: FeedNormalizationIssue[],
	stats: YrlFeedParseStats,
): string {
	let buffer = input;

	while (true) {
		const start = findOfferStart(buffer);
		if (start === -1) {
			return retainXmlTail(buffer);
		}

		if (start > 0) {
			buffer = buffer.slice(start);
		}

		const end = buffer.toLowerCase().indexOf(OFFER_CLOSE_TAG);
		if (end === -1) {
			return buffer;
		}

		const offerXml = buffer.slice(0, end + OFFER_CLOSE_TAG.length);
		stats.offersSeen += 1;

		const normalized = normalizeYrlOffer(
			parseRawOffer(offerXml),
			allowedImageHosts,
		);
		issues.push(...normalized.issues);
		if (normalized.ok) {
			offers.push(normalized.offer);
		}

		buffer = buffer.slice(end + OFFER_CLOSE_TAG.length);
	}
}

function findOfferStart(value: string): number {
	const match = /<offer\b/i.exec(value);
	return match?.index ?? -1;
}

function retainXmlTail(value: string): string {
	const tailStart = Math.max(0, value.length - 32);
	return value.slice(tailStart);
}

function assertRetainedBufferLimit(
	value: string,
	maxRetainedChars: number,
): void {
	if (value.length > maxRetainedChars) {
		throw new Error(
			"Feed parser retained too much data while waiting for an offer boundary.",
		);
	}
}

function parseRawOffer(offerXml: string): RawYrlOffer {
	const openingTag = offerXml.match(/<offer\b[^>]*>/i)?.[0] ?? "";

	return {
		externalId:
			readAttribute(openingTag, "id") ??
			readTagText(offerXml, "external-id") ??
			"",
		title:
			readTagText(offerXml, "title") ??
			readTagText(offerXml, "name") ??
			readTagText(offerXml, "address"),
		description: readTagText(offerXml, "description"),
		category: readTagText(offerXml, "category"),
		type: readTagText(offerXml, "type"),
		propertyType: readTagText(offerXml, "property-type"),
		price:
			readNestedPriceTag(offerXml, "value") ?? readTagText(offerXml, "price"),
		currency:
			readNestedPriceTag(offerXml, "currency") ??
			readTagText(offerXml, "currency"),
		address: readTagText(offerXml, "address"),
		locality: readTagText(offerXml, "locality-name"),
		district: readTagText(offerXml, "district"),
		latitude: readTagText(offerXml, "latitude"),
		longitude: readTagText(offerXml, "longitude"),
		pictures: readRepeatedTagText(offerXml, "picture"),
	};
}

function readAttribute(value: string, attribute: string): string | undefined {
	const pattern = new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i");
	const match = pattern.exec(value);
	return cleanXmlText(match?.[1]);
}

function readNestedPriceTag(value: string, tag: string): string | undefined {
	const priceBlock = /<price\b[^>]*>([\s\S]*?)<\/price>/i.exec(value)?.[1];
	return priceBlock ? readTagText(priceBlock, tag) : undefined;
}

function readTagText(value: string, tag: string): string | undefined {
	const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
	const match = pattern.exec(value);
	return cleanXmlText(match?.[1]);
}

function readRepeatedTagText(value: string, tag: string): string[] {
	const pattern = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
	return [...value.matchAll(pattern)]
		.map((match) => cleanXmlText(match[1]))
		.filter((item): item is string => Boolean(item));
}

function cleanXmlText(value: string | undefined): string | undefined {
	const text = value
		?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/<[^>]+>/g, "")
		.trim();

	if (!text) {
		return undefined;
	}

	return decodeXmlEntities(text);
}

function decodeXmlEntities(value: string): string {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&");
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

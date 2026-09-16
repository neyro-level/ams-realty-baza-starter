export type ConditionalFeedState = {
	etag?: string | null;
	lastModified?: string | null;
};

export type ConditionalFeedHeaders = {
	"If-None-Match"?: string;
	"If-Modified-Since"?: string;
};

export type FetchFeedInput = ConditionalFeedState & {
	url: string;
	fetchImpl?: typeof fetch;
};

export type FetchedFeed = {
	status: "fetched";
	body: ReadableStream<Uint8Array>;
	etag?: string;
	lastModified?: string;
};

export type NotModifiedFeed = {
	status: "not-modified";
	etag?: string;
	lastModified?: string;
};

export type FetchFeedResult = FetchedFeed | NotModifiedFeed;

export function buildConditionalFeedHeaders({
	etag,
	lastModified,
}: ConditionalFeedState): ConditionalFeedHeaders {
	const headers: ConditionalFeedHeaders = {};
	if (etag) {
		headers["If-None-Match"] = etag;
	}
	if (lastModified) {
		headers["If-Modified-Since"] = lastModified;
	}
	return headers;
}

export async function fetchConditionalFeed({
	url,
	etag,
	lastModified,
	fetchImpl = fetch,
}: FetchFeedInput): Promise<FetchFeedResult> {
	const parsedUrl = new URL(url);
	if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
		throw new Error("Feed URL must use http or https.");
	}

	const response = await fetchImpl(parsedUrl, {
		headers: buildConditionalFeedHeaders({ etag, lastModified }),
		redirect: "follow",
	});

	const responseEtag = response.headers.get("etag") ?? undefined;
	const responseLastModified =
		response.headers.get("last-modified") ?? undefined;

	if (response.status === 304) {
		return {
			status: "not-modified",
			etag: responseEtag ?? etag ?? undefined,
			lastModified: responseLastModified ?? lastModified ?? undefined,
		};
	}

	if (!response.ok) {
		throw new Error(`Feed request failed with status ${response.status}.`);
	}

	if (!response.body) {
		throw new Error("Feed response body is empty.");
	}

	return {
		status: "fetched",
		body: response.body,
		etag: responseEtag,
		lastModified: responseLastModified,
	};
}

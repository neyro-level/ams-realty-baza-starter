import assert from "node:assert/strict";
import {
	buildConditionalFeedHeaders,
	fetchConditionalFeed,
	parseAllowedImageHosts,
	parseYrlFeed,
} from "../src/core/ingest/index.ts";

const allowedImageHosts = parseAllowedImageHosts("img.allowed.example");
const feed = buildLargeFeed(180);

const parsed = await parseYrlFeed({
	stream: chunkUtf8(feed, 127),
	allowedImageHosts,
	maxRetainedChars: 64 * 1024,
});

assert.equal(parsed.offers.length, 180);
assert.equal(parsed.stats.offersSeen, 180);
assert.equal(
	parsed.issues.some(
		(issue) =>
			issue.severity === "warning" &&
			issue.code === "feed.image_host_disallowed" &&
			issue.field === "images",
	),
	true,
);
assert.equal(parsed.offers[0].images.length, 1);
assert.ok(
	parsed.stats.maxRetainedCharsObserved < feed.length / 5,
	"Parser retained too much of the full feed.",
);

const headers = buildConditionalFeedHeaders({
	etag: '"known-etag"',
	lastModified: "Wed, 16 Sep 2026 09:00:00 GMT",
});
assert.deepEqual(headers, {
	"If-None-Match": '"known-etag"',
	"If-Modified-Since": "Wed, 16 Sep 2026 09:00:00 GMT",
});

const notModified = await fetchConditionalFeed({
	url: "https://feeds.example.test/base.xml",
	etag: '"known-etag"',
	lastModified: "Wed, 16 Sep 2026 09:00:00 GMT",
	fetchImpl: async (_url, init) => {
		assert.equal(init?.headers?.["If-None-Match"], '"known-etag"');
		assert.equal(
			init?.headers?.["If-Modified-Since"],
			"Wed, 16 Sep 2026 09:00:00 GMT",
		);
		return new Response(null, {
			status: 304,
			headers: { etag: '"known-etag-next"' },
		});
	},
});

assert.equal(notModified.status, "not-modified");
assert.equal(notModified.etag, '"known-etag-next"');

console.log("verify-feed-parser: ok");

function buildLargeFeed(count) {
	const offers = [];
	for (let index = 0; index < count; index += 1) {
		const disallowed =
			index === 0
				? "<picture>https://cdn.disallowed.example/blocked.jpg</picture>"
				: "";
		offers.push(`
<offer internal-id="${index}" id="offer-${index}">
  <type>продажа</type>
  <property-type>жилая</property-type>
  <category>квартира</category>
  <url>https://agency.example/offers/${index}</url>
  <address>Москва, Тестовая улица, ${index}</address>
  <locality-name>Москва</locality-name>
  <district>ЦАО</district>
  <latitude>55.${index.toString().padStart(4, "0")}</latitude>
  <longitude>37.${index.toString().padStart(4, "0")}</longitude>
  <price>
    <value>${10_000_000 + index}</value>
    <currency>RUR</currency>
  </price>
  <picture>https://img.allowed.example/${index}.jpg</picture>
  ${disallowed}
  <description><![CDATA[Тестовое описание ${index}]]></description>
</offer>`);
	}

	return `<?xml version="1.0" encoding="utf-8"?><realty-feed><generation-date>2026-09-16T09:00:00+03:00</generation-date>${offers.join("")}</realty-feed>`;
}

async function* chunkUtf8(value, chunkSize) {
	const encoded = new TextEncoder().encode(value);
	for (let offset = 0; offset < encoded.length; offset += chunkSize) {
		yield encoded.slice(offset, offset + chunkSize);
	}
}

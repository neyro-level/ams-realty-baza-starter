import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createSafeFeedOutboundFetch } from "../src/server/security/safe-outbound-client.ts";
import {
	buildConditionalFeedHeaders,
	calculatePropertyDerivedFields,
	fetchConditionalFeed,
	parseAllowedImageHosts,
	parseYrlFeed,
} from "../src/core/ingest/index.ts";

const allowedImageHosts = parseAllowedImageHosts("img.allowed.example");
const feed = buildLargeFeed(180);

const parsed = await parseYrlFeed({
	stream: chunkUtf8(feed, 127),
	allowedImageHosts,
	collectOffers: true,
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
	outboundFetch: async ({ url, headers: requestHeaders }) => {
		assert.equal(url.hostname, "feeds.example.test");
		assert.equal(requestHeaders["If-None-Match"], '"known-etag"');
		assert.equal(
			requestHeaders["If-Modified-Since"],
			"Wed, 16 Sep 2026 09:00:00 GMT",
		);
		return {
			status: 304,
			statusText: "Not Modified",
			headers: new Headers({ etag: '"known-etag-next"' }),
			body: null,
			sha256: Promise.resolve(null),
		};
	},
});

assert.equal(notModified.status, "unchanged");
assert.equal(notModified.etag, '"known-etag-next"');

const bodyText = "streaming-feed-body";
const expectedHash = createHash("sha256").update(bodyText).digest("hex");
const outbound = createSafeFeedOutboundFetch({
	allowedHosts: ["feeds.example.test"],
	resolveAddresses: async () => [{ address: "203.0.113.10", family: 4 }],
	fetchImpl: async (_url, init) => {
		assert.equal(init?.redirect, "manual");
		assert.equal(
			new Headers(init?.headers).get("if-none-match"),
			'"body-etag"',
		);
		return new Response(bodyText, {
			status: 200,
			headers: {
				etag: '"body-etag-next"',
				"last-modified": "Wed, 16 Sep 2026 10:00:00 GMT",
			},
		});
	},
});

const fetched = await fetchConditionalFeed({
	url: "https://feeds.example.test/base.xml",
	etag: '"body-etag"',
	outboundFetch: outbound,
});

assert.equal(fetched.status, "fetched");
if (fetched.status !== "fetched") throw new Error("expected fetched feed");
const consumed = await new Response(fetched.body).text();
assert.equal(consumed, bodyText);
assert.equal(await fetched.sha256, expectedHash);
assert.equal(fetched.etag, '"body-etag-next"');

const dtd = await parseYrlFeed({
	stream: chunkUtf8(
		`<?xml version="1.0"?><!DOCTYPE realty-feed [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><realty-feed><offer id="x"><type>продажа</type></offer></realty-feed>`,
		32,
	),
	allowedImageHosts,
	collectOffers: true,
});
assert.equal(dtd.stats.criticalStructuralAnomaly, true);
assert.equal(dtd.stats.parserCompleted, false);

const marketProbe = await parseYrlFeed({
	stream: chunkUtf8(
		`<?xml version="1.0"?><realty-feed><offer id="m1"><title>Market probe</title><market>newbuild</market><type>продажа</type><category>квартира</category><price><value>1000000</value><currency>RUR</currency></price><area><value>50</value><unit>sqm</unit></area></offer></realty-feed>`,
		64,
	),
	allowedImageHosts,
	collectOffers: true,
});
assert.equal(marketProbe.stats.parserCompleted, true);
assert.equal(marketProbe.offers[0].externalId, "m1");
assert.equal(marketProbe.offers[0].totalArea, 50);
assert.equal("market" in marketProbe.offers[0], false);
assert.deepEqual(
	calculatePropertyDerivedFields({ priceMinor: 10_000_000_00, totalArea: 50 }),
	{ pricePerMeterMinor: 20_000_000 },
);

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

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderDiscoveryRobots } from "../src/core/seo/discovery-feeds.ts";

assert.equal(existsSync("src/app/robots.ts"), false);
const route = readFileSync("src/app/robots.txt/route.ts", "utf8");
assert.match(route, /export async function GET/);
assert.match(route, /export const revalidate = 3600/);
assert.match(route, /text\/plain; charset=utf-8/);
assert.match(route, /s-maxage=3600/);
assert.doesNotMatch(route, /utm_\*/);

const publicText = renderDiscoveryRobots({
	publicOrigin: "https://realty-client.example",
	indexingEnabled: true,
	cleanParam: "utm_source&utm_medium&yclid",
});
assert.match(publicText, /Allow: \//);
assert.match(publicText, /Disallow: \/admin\//);
assert.match(publicText, /Host: realty-client\.example/);
assert.match(publicText, /Sitemap: https:\/\/realty-client\.example\/sitemap\.xml/);
assert.match(publicText, /Clean-param: utm_source&utm_medium&yclid/);

const noindexText = renderDiscoveryRobots({
	publicOrigin: "https://realty-client.example",
	indexingEnabled: false,
	cleanParam: "utm_source&utm_medium&yclid",
});
assert.equal(noindexText, "User-agent: *\nDisallow: /\n");

console.log("verify-robots-route: custom robots route contract passed");

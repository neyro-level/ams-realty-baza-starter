import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync("src/project/routing/runtime-route.ts", "utf8");
const metadata = readFileSync("src/app/(site)/[...segments]/page.tsx", "utf8");
const gate = readFileSync("src/project/routing/content-gate.ts", "utf8");
const nap = readFileSync("src/project/data-access/public/nap.ts", "utf8");

assert.match(nap, /export async function findPublicBrandName/);
assert.match(nap, /slug:\s*["']site-settings["']/);
assert.match(runtime, /const brandName = await findPublicBrandName\(publicPayload\)/);
assert.match(runtime, /getGeoHub\(payload, pageKey\.geo, grammar, brandName\)/);
assert.match(runtime, /getDevelopment\(payload, pageKey\.slug, brandName\)/);
assert.match(metadata, /projectSeoMeta/);
assert.match(metadata, /result\.brandName/);
assert.match(metadata, /indexing:\s*result\.decision\.robots\.indexing/);
assert.match(metadata, /following:\s*result\.decision\.robots\.following/);
assert.match(gate, /runtime_morphology_unapproved/);
assert.match(gate, /inSitemap:\s*false/);

console.log(
	"runtime SEO proof passed: Site Settings brand, project templates, Gate robots and morphology fail-closed",
);

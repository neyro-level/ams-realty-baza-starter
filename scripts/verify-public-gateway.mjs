import { readFileSync } from "node:fs";

const catalogSource = readFileSync("src/core/data-access/public/catalog.ts", "utf8");
const gatewaySource = readFileSync("src/core/data-access/public/index.ts", "utf8");
const policySource = readFileSync("src/core/data-access/public/policy.ts", "utf8");
const accessSource = readFileSync("src/core/data-access/system/public-read.ts", "utf8");
const propertiesSource = readFileSync("src/payload/collections/Properties.ts", "utf8");
const pagesSource = readFileSync("src/payload/collections/Pages.ts", "utf8");
const mediaSource = readFileSync("src/payload/collections/Media.ts", "utf8");
const rawRestBoundary = JSON.parse(readFileSync("config/raw-rest-boundary.json", "utf8"));

const forbiddenPublicFields = [
	"feedSource",
	"externalId",
	"importHash",
	"lastImportRun",
	"deactivatedByRun",
	"manualOverrides",
	"unitNumber",
	"cadastralNumber",
	"internalComment",
	"ownerContact",
];

const selectMatch = catalogSource.match(
	/const publicPropertySelect = \{(?<select>[\s\S]*?)\} satisfies PropertiesSelect/u,
);

if (!selectMatch?.groups?.select) {
	throw new Error("publicPropertySelect allowlist not found");
}

for (const field of forbiddenPublicFields) {
	if (selectMatch.groups.select.includes(`${field}:`)) {
		throw new Error(`Forbidden private/internal field in public select: ${field}`);
	}
}

const requiredPolicySnippets = [
	"publicGatewayReadAccess",
	"depth: 0",
	"maxLimit: 48",
	"output: \"dto\"",
];

for (const snippet of requiredPolicySnippets) {
	if (!policySource.includes(snippet)) {
		throw new Error(`Public Gateway policy missing: ${snippet}`);
	}
}

if (!accessSource.includes("publicGatewayOperation:") || !accessSource.includes("public-read")) {
	throw new Error("Public Gateway must declare explicit public-read access mode");
}

if (!accessSource.includes("overrideAccess:") || !accessSource.includes("true")) {
	throw new Error("Public Gateway Local API must use explicit overrideAccess, not anonymous collection read");
}

if (propertiesSource.includes("publicPropertyReadWhere") || pagesSource.includes("publicPageReadWhere")) {
	throw new Error("Publication predicates must not live in collection access as a public API");
}

if (!propertiesSource.includes("read: adminsAndOwners") || !pagesSource.includes("read: adminsAndOwners")) {
	throw new Error("properties and pages anonymous collection read must be deny");
}

if (!gatewaySource.includes("export { publicGatewayPolicy }")) {
	throw new Error("Public Gateway policy is not exported from index");
}

if (!gatewaySource.includes("export { publicGatewayReadAccess }")) {
	throw new Error("publicGatewayReadAccess must be exported from Public Gateway");
}

const requiredPredicateSnippets = [
	"status: { equals: \"active\" }",
	"publishedAt: { exists: true }",
	"contentPurgedAt: { exists: false }",
];

for (const snippet of requiredPredicateSnippets) {
	if (!catalogSource.includes(snippet)) {
		throw new Error(`Publication predicate missing from Public Gateway: ${snippet}`);
	}
}

const facetSnippets = [
	"aggregatePublicCatalogFacets",
	"source: \"payload-aggregate\"",
	"export async function findPublicCatalogFacets",
];

for (const snippet of facetSnippets) {
	if (!catalogSource.includes(snippet)) {
		throw new Error(`Public Gateway facet implementation missing: ${snippet}`);
	}
}

const requiredRawRestDeniedCollections = [
	"pages",
	"properties",
	"feed-sources",
	"import-runs",
	"import-issues",
	"leads",
	"lead-deliveries",
	"media",
	"redirects",
];

for (const collection of requiredRawRestDeniedCollections) {
	if (!rawRestBoundary.anonymousDenyCollections.includes(collection)) {
		throw new Error(`Raw anonymous REST is not denied for ${collection}`);
	}
}

console.log("verify:public-gateway passed");

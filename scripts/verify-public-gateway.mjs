import { readFileSync } from "node:fs";

const catalogSource = readFileSync("src/server/public-gateway/catalog.ts", "utf8");
const gatewaySource = readFileSync("src/server/public-gateway/index.ts", "utf8");
const policySource = readFileSync("src/server/public-gateway/policy.ts", "utf8");
const propertiesSource = readFileSync("src/payload/collections/Properties.ts", "utf8");

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
	"overrideAccess: false",
	"depth: 0",
	"maxLimit: 48",
	"output: \"dto\"",
];

for (const snippet of requiredPolicySnippets) {
	if (!policySource.includes(snippet)) {
		throw new Error(`Public Gateway policy missing: ${snippet}`);
	}
}

if (!gatewaySource.includes("export { publicGatewayPolicy }")) {
	throw new Error("Public Gateway policy is not exported from index");
}

const requiredPredicateSnippets = [
	"status: { equals: \"active\" }",
	"publishedAt: { exists: true }",
	"contentPurgedAt: { exists: false }",
];

for (const snippet of requiredPredicateSnippets) {
	if (!catalogSource.includes(snippet) || !propertiesSource.includes(snippet)) {
		throw new Error(`Publication predicate missing from gateway/access: ${snippet}`);
	}
}

console.log("verify:public-gateway passed");

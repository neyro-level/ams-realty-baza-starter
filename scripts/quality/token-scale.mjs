import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const declarations = new Map(
	[...css.matchAll(/^\s*(--site-type-[a-z0-9_-]+)\s*:\s*([^;]+);/gim)].map(
		(match) => [match[1], match[2].trim()],
	),
);

const consolidations = [
	["--site-type-body-dense", "--site-type-body-compact", 0.4],
	["--site-type-caption-dense", "--site-type-caption-relaxed", 0.05],
	["--site-type-support-dense", "--site-type-support", 0.25],
	["--site-type-card-compact", "--site-type-body-fluid", 0.1],
	["--site-type-card-compact-medium", "--site-type-body-lg", 0.16],
	["--site-type-card-compact-large", "--site-type-body-lg", 0.32],
	["--site-type-body-highlight", "--site-type-lead", 0.08],
	["--site-type-card-title", "--site-type-lead", 0.4],
	["--site-type-card-title-large", "--site-type-lead-compact", 0.12],
	["--site-type-price", "--site-type-lead-compact", 0.04],
	["--site-type-price-large", "--site-type-lead-compact", 0.2],
	["--site-type-price-medium", "--site-type-card-lg", 0.12],
	["--site-type-price-mobile", "--site-type-heading-medium", 0.28],
	["--site-type-selection-title", "--site-type-section-large", 0.4],
	["--site-type-profile-title", "--site-type-display-medium", 0.4],
];

for (const [token, owner, driftPx] of consolidations) {
	assert.equal(declarations.get(token), `var(${owner})`, `${token} must reuse ${owner}`);
	assert.ok(driftPx < 0.5, `${token} source drift must remain below 0.5px`);
}

const literalSizes = [...declarations.values()].filter((value) =>
	/^(?:\d*\.)?\d+(?:px|rem)$/.test(value),
);
const normalizedSizes = new Set(
	literalSizes.map((value) =>
		value.endsWith("rem")
			? Number.parseFloat(value) * 16
			: Number.parseFloat(value),
	),
);

assert.equal(new Set(declarations.keys()).size, declarations.size);
console.log(
	`verify:token-scale: ok (${consolidations.length} aliases below 0.5px; ${normalizedSizes.size} fixed literal sizes retained)`,
);

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { analyzeDesignTokens } from "./quality/design-tokens.mjs";
import {
	readClonePreset,
	renderBrandCss,
	renderProjectFontConfig,
} from "./clone-preset.mjs";

const brandCss = readFileSync("src/project/brand.css", "utf8");
const globalsCss = readFileSync("src/app/globals.css", "utf8");
const starterBrandPreset = readClonePreset("docs/CLONE_PRESET.example.json");

function block(selector) {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return brandCss.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? "";
}

function values(source) {
	return new Map(
		[...source.matchAll(/^\s*(--brand-[a-z0-9_-]+)\s*:\s*([^;]+);/gim)].map(
			(match) => [match[1], match[2].trim()],
		),
	);
}

function rgb(hex) {
	const raw = hex.replace("#", "");
	return [0, 2, 4].map((offset) => Number.parseInt(raw.slice(offset, offset + 2), 16));
}

function luminance(hex) {
	return rgb(hex)
		.map((value) => value / 255)
		.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
		.reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground, background) {
	const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
	return (light + 0.05) / (dark + 0.05);
}

const analysis = analyzeDesignTokens();
assert.deepEqual(analysis.failures, [], analysis.failures.join("\n"));
assert.ok(analysis.brandPrimitives >= 20 && analysis.brandPrimitives <= 30);

const current = values(block(":root"));
const proof = new Map(current);
for (const [key, value] of values(block(':root[data-brand-proof="blue"]'))) proof.set(key, value);

for (const theme of [current, proof]) {
	assert.ok(
		contrast(theme.get("--brand-accent"), theme.get("--brand-content-inverse")) >= 4.5,
		"accent text contrast must remain WCAG AA",
	);
	assert.ok(
		contrast(theme.get("--brand-accent-hover"), theme.get("--brand-content-inverse")) >= 4.5,
		"accent hover text contrast must remain WCAG AA",
	);
}

for (const key of ["--brand-accent", "--brand-accent-hover", "--brand-accent-soft"]) {
	assert.notEqual(current.get(key), proof.get(key), `${key} must change in the blue proof theme`);
}
assert.ok(globalsCss.includes('@import "../project/brand.css"'));
assert.equal(/rgba?\(\s*(?:138\s*,\s*21\s*,\s*21|158\s*,\s*28\s*,\s*28)/i.test(globalsCss), false);
assert.equal(brandCss, renderBrandCss(starterBrandPreset));
assert.equal(
	readFileSync("src/project/font.generated.ts", "utf8"),
	renderProjectFontConfig(starterBrandPreset),
);

console.log(
	`verify:brand-ownership: ok (${analysis.brandPrimitives} primitives; current and blue proof WCAG AA)`,
);

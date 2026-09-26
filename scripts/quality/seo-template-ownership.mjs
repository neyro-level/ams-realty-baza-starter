import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const core = readFileSync("src/core/seo/registry.ts", "utf8");
const project = [
	"src/project/seo/templates.ts",
	"src/project/seo/template-inputs.ts",
]
	.map((path) => readFileSync(path, "utf8"))
	.join("\n");
const catalog = readFileSync(
	"src/project/data-access/public/geo-catalog.ts",
	"utf8",
);

const marketingLiterals = [
	"Недвижимость",
	"Квартиры",
	"Застройщики",
	"актуальные предложения",
	"жилые комплексы",
];
for (const literal of marketingLiterals) {
	assert.equal(
		core.includes(literal),
		false,
		`Reusable SEO core contains project marketing literal: ${literal}`,
	);
	assert.equal(
		project.includes(literal),
		true,
		`Project SEO templates must own marketing literal: ${literal}`,
	);
}
assert.doesNotMatch(catalog, /\bsafeSeo\b/);
assert.doesNotMatch(catalog, /following:\s*["']nofollow["']/);
assert.match(catalog, /projectSeoMeta/);

console.log("project SEO template ownership guard passed");

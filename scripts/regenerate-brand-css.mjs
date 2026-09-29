import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { renderBrandCss } from "./clone-preset.mjs";

const root = resolve(process.cwd());
const bootstrapPath = join(root, "docs", "CLIENT_BOOTSTRAP.json");
const outputPath = join(root, "src", "project", "brand.css");

if (!existsSync(bootstrapPath)) {
	throw new Error("Brand regeneration requires client docs/CLIENT_BOOTSTRAP.json input.");
}

const bootstrap = JSON.parse(readFileSync(bootstrapPath, "utf8"));
if (!bootstrap.brand || typeof bootstrap.brand !== "object") {
	throw new Error("Client bootstrap brand input is missing.");
}

const expected = renderBrandCss({ brand: bootstrap.brand });
if (process.argv.slice(2).includes("--check")) {
	if (!existsSync(outputPath)) {
		throw new Error("Generated brand output is missing.");
	}
	if (readFileSync(outputPath, "utf8").replaceAll("\r\n", "\n") !== expected) {
		throw new Error("Generated brand output is not reproducible from client input.");
	}
	console.log("regenerate-brand-css: existing output matches client input");
} else {
	writeFileSync(outputPath, expected);
	console.log("regenerate-brand-css: wrote deterministic brand output");
}

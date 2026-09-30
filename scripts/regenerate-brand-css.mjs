import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { renderBrandCss } from "./clone-preset.mjs";

const root = resolve(process.cwd());
const bootstrapPath = join(root, "docs", "CLIENT_BOOTSTRAP.json");
const outputPath = join(root, "src", "app", "globals.css");
const blockPattern =
	/\/\* CLONE_BRAND_VALUES_BEGIN:[\s\S]*?\/\* CLONE_BRAND_VALUES_END \*\//;

if (!existsSync(bootstrapPath)) {
	throw new Error("Brand regeneration requires client docs/CLIENT_BOOTSTRAP.json input.");
}

const bootstrap = JSON.parse(readFileSync(bootstrapPath, "utf8"));
if (!bootstrap.brand || typeof bootstrap.brand !== "object") {
	throw new Error("Client bootstrap brand input is missing.");
}

const expected = renderBrandCss({ brand: bootstrap.brand });
const currentOutput = readFileSync(outputPath, "utf8").replaceAll("\r\n", "\n");
if (!blockPattern.test(currentOutput)) {
	throw new Error("Generated globals brand block is missing.");
}
if (process.argv.slice(2).includes("--check")) {
	const currentBlock = currentOutput.match(blockPattern)?.[0] ?? "";
	if (currentBlock.trim() !== expected.trim()) {
		throw new Error("Generated globals brand block is not reproducible from client input.");
	}
	console.log("regenerate-brand-css: existing globals brand block matches client input");
} else {
	writeFileSync(outputPath, currentOutput.replace(blockPattern, expected.trim()));
	console.log("regenerate-brand-css: wrote deterministic globals brand block");
}

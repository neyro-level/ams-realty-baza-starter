import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const owned = [
	"src/app/(site)/[...segments]/page.tsx",
	"src/project/data-access/public/dto.ts",
	"src/project/data-access/public/geo-catalog.ts",
	"src/project/routing/runtime-route.ts",
	"src/project/seo/discovery-runtime.ts",
];
const violations = owned.filter((file) =>
	/indexing\s*:\s*["']index["']/.test(readFileSync(resolve(root, file), "utf8")),
);
if (violations.length) {
	throw new Error(
		`Content Gate ownership violation: direct index decision in ${violations.join(", ")}`,
	);
}
const runtime = readFileSync(
	resolve(root, "src/project/routing/runtime-route.ts"),
	"utf8",
);
const discovery = readFileSync(
	resolve(root, "src/project/seo/discovery-runtime.ts"),
	"utf8",
);
if (!runtime.includes("decidePage(decision, routeData)")) {
	throw new Error("Runtime route must delegate page semantics to decidePage.");
}
if (!discovery.includes("runtime.decision.gate")) {
	throw new Error("Discovery runtime must consume the decidePage Gate decision.");
}
console.log("content-gate ownership guard passed");

import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const tokenSource = join(root, "src/app/globals.css");
const tokenCss = readFileSync(tokenSource, "utf8");

function walk(directory, extensions) {
	return readdirSync(directory).flatMap((entry) => {
		if (entry === "node_modules" || entry === ".next") return [];
		const path = join(directory, entry);
		return statSync(path).isDirectory()
			? walk(path, extensions)
			: extensions.has(extname(entry))
				? [path]
				: [];
	});
}

const definitions = new Set(
	[...tokenCss.matchAll(/^\s*(--[a-z0-9_-]+)\s*:/gim)].map((match) => match[1]),
);

const externalValues = walk(join(root, "src"), new Set([".css"]))
	.concat(walk(join(root, "packages"), new Set([".css"])))
	.filter((path) => path !== tokenSource)
	.flatMap((path) => {
		const css = readFileSync(path, "utf8");
		return [...css.matchAll(/^\s*(--[a-z0-9_-]+)\s*:\s*([^;]+);/gim)]
			.filter((match) => !match[2].includes("var(--"))
			.map((match) => `${relative(root, path)}:${match[1]}`);
	});

const uiFiles = walk(
	join(root, "packages/ui/src"),
	new Set([".ts", ".tsx", ".css"]),
);
const primitiveStyleFiles = [
	...walk(
		join(root, "packages/ui/src/components/ui"),
		new Set([".ts", ".tsx"]),
	),
	join(root, "packages/ui/src/lead-consent-field.tsx"),
	join(root, "packages/ui/src/views/property/MediaGallery.tsx"),
];
const unresolved = [];

for (const path of uiFiles) {
	const source = readFileSync(path, "utf8");
	for (const match of source.matchAll(
		/var\((--[a-z0-9_-]+)(?:\s*,\s*([^)]*))?\)/gim,
	)) {
		const [, token, fallback] = match;
		if (definitions.has(token)) continue;

		const fallbackToken = fallback?.match(/var\((--[a-z0-9_-]+)/i)?.[1];
		const hasSafeFallback = Boolean(
			fallback && (!fallbackToken || definitions.has(fallbackToken)),
		);
		if (!hasSafeFallback) unresolved.push(`${relative(root, path)}:${token}`);
	}
}

const forbiddenStylePatterns = [
	/(?:text|bg|border|ring|accent|outline)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-|\/|\b)/i,
	/#[0-9a-f]{3,8}\b/i,
	/rgba?\(/i,
	/hsla?\(/i,
	/rounded-\[(?!var\(|inherit\])/i,
	/backdrop-blur-\[(?!var\()/i,
	/duration-\[(?!var\()/i,
	/ease-\[(?!var\()/i,
];
const forbiddenStyles = primitiveStyleFiles.flatMap((path) => {
	const source = readFileSync(path, "utf8");
	return source.split(/\r?\n/).flatMap((line, index) => {
		const hasForbiddenLiteral = forbiddenStylePatterns.some((pattern) =>
			pattern.test(line),
		);
		const hasUntokenizedMotion =
			/\btransition(?:-|\s)/.test(line) &&
			!line.includes("duration-[var(--motion-duration-");
		return hasForbiddenLiteral || hasUntokenizedMotion
			? [`${relative(root, path)}:${index + 1}`]
			: [];
	});
});

const required = [
	"--background",
	"--surface",
	"--text-primary",
	"--border",
	"--accent",
	"--site-type-display",
	"--site-type-body",
	"--site-radius-sm",
	"--site-radius-lg",
	"--site-frame-max",
	"--site-frame-floating-max",
	"--container-copy-measure",
	"--container-narrow-max",
	"--container-site-max",
	"--container-wide-max",
	"--site-section-space-desktop",
	"--section-space-sm",
	"--section-space-md",
	"--section-space-lg",
	"--control-height-md",
	"--control-radius",
	"--focus-ring-soft",
	"--motion-duration-standard",
	"--motion-ease-standard",
	"--motion-ease-emphasized",
	"--color-background",
	"--font-sans",
];

const missingRequired = required.filter((token) => !definitions.has(token));
const failures = [
	...missingRequired.map((token) => `missing required token ${token}`),
	...externalValues.map(
		(item) => `raw token value outside globals.css ${item}`,
	),
	...unresolved.map((item) => `unresolved UI token ${item}`),
	...forbiddenStyles.map((item) => `forbidden primitive style literal ${item}`),
];

if (!tokenCss.includes("@theme inline"))
	failures.push("missing Tailwind @theme mapping");

if (failures.length > 0) {
	console.error(failures.join("\n"));
	process.exit(1);
}

console.log(
	`Design tokens OK: ${definitions.size} definitions, ${uiFiles.length} UI source files, one token source.`,
);

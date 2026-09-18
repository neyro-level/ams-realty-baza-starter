import { readdirSync, readFileSync, statSync } from "node:fs";
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

const componentCssFiles = walk(join(root, "src"), new Set([".css"]))
	.concat(walk(join(root, "packages"), new Set([".css"])))
	.filter((path) => path !== tokenSource);
const externalDefinitions = new Set(
	componentCssFiles.flatMap((path) => {
		const css = readFileSync(path, "utf8");
		return [...css.matchAll(/(?:^|[;{])\s*(--[a-z0-9_-]+)\s*:/gim)].map(
			(match) => match[1],
		);
	}),
);
const knownDefinitions = new Set([...definitions, ...externalDefinitions]);
const externalValues = componentCssFiles.flatMap((path) => {
	const css = readFileSync(path, "utf8");
	return [...css.matchAll(/^\s*(--[a-z0-9_-]+)\s*:\s*([^;]+);/gim)]
		.filter((match) => !match[2].includes("var(--"))
		.map((match) => `${relative(root, path)}:${match[1]}`);
});

const uiFiles = walk(
	join(root, "packages/ui/src"),
	new Set([".ts", ".tsx", ".css"]),
);
const uiCodeFiles = uiFiles.filter((path) => !path.endsWith(".css"));
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
		if (knownDefinitions.has(token)) continue;

		const fallbackToken = fallback?.match(/var\((--[a-z0-9_-]+)/i)?.[1];
		const hasSafeFallback = Boolean(
			fallback && (!fallbackToken || knownDefinitions.has(fallbackToken)),
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

const uiSource = uiCodeFiles.map((path) => readFileSync(path, "utf8")).join("\n");
const allowedExternalHooks = new Set([
	"home-page",
	"request-modal__link",
	"site-primary-action",
]);
const pageStyleFailures = componentCssFiles.flatMap((path) => {
	const css = readFileSync(path, "utf8");
	const relativePath = relative(root, path);
	const failures = [];
	for (const [index, line] of css.split(/\r?\n/).entries()) {
		if (
			/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|font-weight:\s*[0-9]+|border-radius:\s*[0-9]+|(?:[0-9]*\.)?[0-9]+(?:ms|s)\b/i.test(
				line,
			)
		) {
			failures.push(`${relativePath}:${index + 1}:raw design value`);
		}
		if (/box-shadow:/.test(line) && !line.includes("var(--")) {
			failures.push(`${relativePath}:${index + 1}:raw shadow`);
		}
		if (/\.(?:journal|leadgen|promo)-/i.test(line)) {
			failures.push(`${relativePath}:${index + 1}:excluded module selector`);
		}
	}

	const selectorCss = css.replace(/^@import.*$/gm, "");
	const selectors = [
		...new Set(
			[...selectorCss.matchAll(/\.([a-z][a-z0-9_-]*)/gi)].map(
				(match) => match[1],
			),
		),
	];
	for (const selector of selectors) {
		if (!uiSource.includes(selector) && !allowedExternalHooks.has(selector)) {
			failures.push(`${relativePath}:unused selector .${selector}`);
		}
	}
	return failures;
});

const reservedPrefixes = [];

function isReservedToken(token) {
	return reservedPrefixes.some((prefix) => token.startsWith(prefix));
}

const themeBlock = tokenCss.match(/@theme inline[\s\S]*?\{([\s\S]*?)\}/)?.[1] ?? "";
const themeKeys = new Set(
	[...themeBlock.matchAll(/^\s*(--[a-z0-9_-]+)\s*:/gim)].map((match) => match[1]),
);
const codeCorpus = [
	...walk(join(root, "src"), new Set([".css", ".ts", ".tsx"])),
	...walk(join(root, "packages"), new Set([".css", ".ts", ".tsx"])),
	...walk(join(root, "scripts"), new Set([".mjs", ".ts"])),
]
	.filter((path) => path !== tokenSource)
	.map((path) => ({ path, text: readFileSync(path, "utf8") }));

const deadTokens = [...definitions].filter((token) => {
	if (themeKeys.has(token) || isReservedToken(token)) return false;
	const needle = `var(${token}`;
	return !codeCorpus.some((file) => file.text.includes(needle)) &&
		!tokenCss.includes(needle);
});

const moduleDrift = codeCorpus.flatMap((file) => {
	const relativePath = relative(root, file.path).replaceAll("\\", "/");
	if (
		relativePath.includes("/journal") ||
		relativePath.endsWith("globals.css") ||
		relativePath.includes("token-taxonomy")
	) {
		return [];
	}
	const hits = [
		...file.text.matchAll(/var\((--journal-[a-z0-9_-]+)/gi),
	].map((match) => match[1]);
	return hits.map(
		(token) => `${relativePath}:${token}: journal token outside journal module`,
	);
});

const secondControl = componentCssFiles.flatMap((path) => {
	const css = readFileSync(path, "utf8");
	return css.includes(".home-btn-primary")
		? [`${relative(root, path)}: second control pattern .home-btn-primary`]
		: [];
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
	"--site-radius-full",
	"--site-font-weight-medium",
	"--site-font-weight-bold",
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
	...pageStyleFailures.map((item) => `page CSS violation ${item}`),
	...deadTokens.map((token) => `dead token ${token}`),
	...moduleDrift,
	...secondControl,
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

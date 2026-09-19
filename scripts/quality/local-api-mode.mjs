import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { relative } from "node:path";

import { filesUnder } from "./source-files.mjs";

const callPattern =
	/\b(?:req\.)?payload\.(find|findByID|count|create|update|delete)\s*\(\s*\{/g;
const explicitMode =
	/overrideAccess\s*:|\.\.\.\s*(?:systemOverrideAccess|publicGatewayReadAccess)\s*\(|\.\.\.\s*(?:access|requestAccess)\b|\.\.\.\s*[A-Za-z][\w]*Access\b|\.\.\.\s*publicGatewayPolicy\b/;

function readObjectLiteral(source, start) {
	let depth = 0;
	let quote = null;
	let escaped = false;
	for (let index = start; index < source.length; index += 1) {
		const char = source[index];
		if (quote) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === '"' || char === "'" || char === "`") {
			quote = char;
			continue;
		}
		if (char === "{") depth += 1;
		if (char === "}" && --depth === 0) return source.slice(start, index + 1);
	}
	return source.slice(start);
}

export function findMissingLocalApiModes(source, file = "fixture.ts") {
	const findings = [];
	for (const match of source.matchAll(callPattern)) {
		const start = source.indexOf("{", match.index);
		const object = readObjectLiteral(source, start);
		if (explicitMode.test(object)) continue;
		findings.push({
			file,
			line: source.slice(0, match.index).split(/\r?\n/).length,
			operation: match[1],
		});
	}
	return findings;
}

assert.equal(
	findMissingLocalApiModes('await payload.find({ collection: "pages" })')
		.length,
	1,
	"broken fixture without a Local API mode must fail",
);
assert.equal(
	findMissingLocalApiModes(
		'await payload.find({ collection: "pages", overrideAccess: false })',
	).length,
	0,
);
assert.equal(
	findMissingLocalApiModes(
		'await payload.update({ collection: "pages", ...systemOverrideAccess("system-job") })',
	).length,
	0,
);

const root = process.cwd();
const findings = filesUnder(root, "src", new Set([".ts", ".tsx"])).flatMap(
	(path) =>
		findMissingLocalApiModes(
			readFileSync(path, "utf8"),
			relative(root, path).replaceAll("\\", "/"),
		),
);

if (findings.length) {
	console.error(
		findings
			.map(
				({ file, line, operation }) =>
					`${file}:${line} payload.${operation} missing explicit Local API mode`,
			)
			.join("\n"),
	);
	process.exit(1);
}

console.log("Local API mode guard: PASS");

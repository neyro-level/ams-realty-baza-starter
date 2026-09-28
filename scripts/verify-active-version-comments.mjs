import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const activeDocs = [
	"README.md",
	"PROJECT.md",
	"03_ARCHITECTURE.md",
	"CLONE_ONBOARDING.md",
	"DESIGN.md",
	"OPERATIONS.md",
].map((file) => join(root, "docs", file));
const ignoredScriptDirectories = new Set(["demo", "fixtures"]);
const stalePresetVersion = new RegExp("\\bpreset\\s+v" + "2\\b", "i");

function filesUnder(directory, extensions, ignoredDirectories = new Set()) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			return ignoredDirectories.has(entry.name)
				? []
				: filesUnder(path, extensions, ignoredDirectories);
		}
		return extensions.has(entry.name.split(".").pop()) ? [path] : [];
	});
}

function assertNoStalePresetVersion(content, path) {
	assert.doesNotMatch(
		content,
		stalePresetVersion,
		`${path} uses obsolete preset version 2`,
	);
}

assert.throws(
	() =>
		assertNoStalePresetVersion("/** Generated from preset v" + "2. */", "fixture"),
	/obsolete preset version 2/,
);
assert.doesNotThrow(() =>
	assertNoStalePresetVersion("Clone preset schemaVersion 2 is obsolete.", "fixture"),
);

const activeFiles = [
	...filesUnder(join(root, "src"), new Set(["ts", "tsx"])),
	...filesUnder(join(root, "scripts"), new Set(["ts", "mjs"]), ignoredScriptDirectories),
	join(root, "AGENTS.md"),
	...activeDocs,
];
for (const path of activeFiles) {
	assertNoStalePresetVersion(readFileSync(path, "utf8"), path);
}

console.log(`Active version-comment guard passed (${activeFiles.length} files).`);

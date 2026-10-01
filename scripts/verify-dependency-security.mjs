import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
	return readFileSync(path, "utf8").replaceAll("\r\n", "\n");
}

const packageJson = JSON.parse(read("package.json"));
const lockfile = read("pnpm-lock.yaml");
const workspace = read("pnpm-workspace.yaml");

const expected = {
	packageManager: "pnpm@11.28.2",
	next: "16.3.8",
	payload: "3.90.2",
	"@payloadcms/next": "3.90.2",
	"@payloadcms/db-postgres": "3.90.2",
	undici: "7.30.0",
	react: "19.2.8",
	"react-dom": "19.2.8",
	sharp: "0.35.4",
	zod: "^4.6.5",
	tailwindcss: "^4",
};

assert.equal(packageJson.packageManager, expected.packageManager);
assert.match(packageJson.packageManager, /^pnpm@11\./);
assert.match(workspace, /overrides:\n\s+undici:\s+7\.30\.0/);

for (const [name, version] of Object.entries(expected)) {
	if (name === "packageManager" || name === "tailwindcss") continue;
	assert.equal(
		packageJson.dependencies?.[name],
		version,
		`package.json dependency ${name} must stay pinned to ${version}`,
	);
}
assert.equal(packageJson.devDependencies?.tailwindcss, expected.tailwindcss);
assert.equal(packageJson.devDependencies?.["@tailwindcss/postcss"], "^4");

assert.equal(
	packageJson.scripts?.["verify:dependency-security"],
	"node scripts/verify-dependency-security.mjs",
);
assert.equal(
	packageJson.scripts?.["verify:safe-outbound"],
	"node --experimental-strip-types scripts/verify-safe-outbound.mjs",
);

for (const needle of [
	"lockfileVersion:",
	"overrides:",
	"undici: 7.30.0",
	"next@16.3.8",
	"'@next/env@16.3.8'",
	"'@payloadcms/db-postgres@3.90.2'",
	"'@payloadcms/next@3.90.2'",
	"payload@3.90.2",
	"undici@7.30.0",
]) {
	assert.ok(lockfile.includes(needle), `pnpm-lock.yaml missing ${needle}`);
}

for (const obsolete of [
	"specifier: 16.3.5",
	"next@16.3.5",
	"specifier: 3.90.1",
	"payload@3.90.1",
	"specifier: 7.29.0",
	"undici@7.29.0",
	"undici: 7.29.0",
]) {
	assert.ok(!lockfile.includes(obsolete), `pnpm-lock.yaml still contains ${obsolete}`);
}

console.log("verify-dependency-security: ok");

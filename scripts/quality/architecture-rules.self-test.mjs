import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import dependencyConfig from "../../.dependency-cruiser.mjs";
import {
	findCacheGraphViolations,
	findPackageBoundaryViolations,
	findUiPersistenceViolations,
} from "./architecture-rules.mjs";
import { findMissingLocalApiModes } from "./local-api-mode-rule.mjs";
import { findSqlGovernanceViolations } from "./sql-governance.mjs";

const root = process.cwd();
const fixtureRoot = path.join(
	root,
	"scripts",
	"quality",
	"fixtures",
	"architecture",
);
const fixture = (kind, name, virtualName) => ({
	name: virtualName,
	content: readFileSync(
		path.join(fixtureRoot, kind, `${name}.fixture.txt`),
		"utf8",
	),
});

assert.equal(
	findPackageBoundaryViolations([
		fixture("allowed", "ui-dto-type-import", "packages/ui/src/card.tsx"),
	]).length,
	0,
	"UI pure-type DTO import fixture must remain allowed",
);
assert.equal(
	findPackageBoundaryViolations([
		fixture("broken", "ui-framework-import", "packages/ui/src/card.tsx"),
	]).length,
	1,
	"UI framework runtime fixture must fail",
);
assert.equal(
	findPackageBoundaryViolations([
		fixture(
			"broken",
			"contracts-persistence-import",
			"packages/contracts/src/property.ts",
		),
	]).length,
	1,
	"contracts persistence runtime fixture must fail",
);
assert.equal(
	findPackageBoundaryViolations([
		fixture("broken", "ui-app-persistence-import", "packages/ui/src/card.tsx"),
	]).length,
	1,
	"UI application persistence fixture must fail",
);
assert.equal(
	findPackageBoundaryViolations([
		fixture("broken", "core-ui-import", "src/core/catalog/card.ts"),
	]).length,
	1,
	"core-to-UI fixture must fail",
);
assert.equal(
	findPackageBoundaryViolations([
		fixture("allowed", "core-dto-type-import", "src/core/catalog/dto.ts"),
	]).length,
	0,
	"core pure-type DTO import fixture must remain allowed",
);

assert.equal(
	findMissingLocalApiModes(
		fixture("allowed", "local-api-mode", "src/core/read.ts").content,
	).length,
	0,
	"explicit Local API mode fixture must remain allowed",
);
assert.equal(
	findMissingLocalApiModes(
		fixture("broken", "local-api-mode", "src/core/read.ts").content,
	).length,
	1,
	"missing Local API mode fixture must fail",
);

assert.equal(
	findSqlGovernanceViolations([
		fixture("allowed", "migration-sql", "migrations/fixture.ts"),
	]).length,
	0,
	"migration SQL fixture must remain allowed",
);
assert.equal(
	findSqlGovernanceViolations([
		fixture("broken", "runtime-sql", "src/core/ingest/broken-sql.ts"),
	]).length,
	1,
	"unapproved raw SQL fixture must fail",
);

assert.equal(
	findCacheGraphViolations([
		fixture("allowed", "cache-executor", "src/core/cache/in-process.ts"),
	]).length,
	0,
	"approved lazy cache executor fixture must remain allowed",
);
assert.equal(
	findCacheGraphViolations([
		fixture("broken", "cache-top-level", "src/core/cache/http-revalidate.ts"),
	]).length,
	1,
	"top-level cache runtime fixture must fail",
);

assert.equal(
	findUiPersistenceViolations([
		fixture("allowed", "ui-controlled-state", "packages/ui/src/form.tsx"),
	]).length,
	0,
	"controlled UI state fixture must remain allowed",
);
assert.equal(
	findUiPersistenceViolations([
		fixture("broken", "ui-browser-persistence", "packages/ui/src/form.tsx"),
	]).length,
	1,
	"UI browser persistence fixture must fail",
);

const dependencyRules = new Set(
	dependencyConfig.forbidden.map((rule) => rule.name),
);
for (const rule of [
	"ui-has-no-persistence-dependencies",
	"contracts-have-no-runtime-or-persistence-dependencies",
	"ui-does-not-import-app-persistence",
	"core-does-not-import-ui",
]) {
	assert.ok(
		dependencyRules.has(rule),
		`Dependency Cruiser rule ${rule} is missing`,
	);
}

console.log("architecture guard self-tests: PASS");

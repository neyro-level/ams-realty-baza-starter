import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
	return readFileSync(path, "utf8");
}

const project = read("docs/PROJECT.md");
const architecture = read("docs/03_ARCHITECTURE.md");
const operations = read("docs/OPERATIONS.md");
const releaseChecklist = read("docs/05_RELEASE_CHECKLIST.md");
const envExample = read(".env.example");

for (const file of [
	["docs/PROJECT.md", project],
	["docs/03_ARCHITECTURE.md", architecture],
	["docs/OPERATIONS.md", operations],
	["docs/05_RELEASE_CHECKLIST.md", releaseChecklist],
]) {
	assert.ok(
		file[1].includes("start-baza.ams24.ru"),
		`${file[0]} must pin the internal production domain`,
	);
	assert.ok(
		file[1].includes("noindex"),
		`${file[0]} must keep the internal production instance noindex`,
	);
}

for (const required of [
	"Timeweb Managed PostgreSQL",
	"Timeweb S3",
	"Secret Master",
	"JOBS_AUTORUN=true",
	"CACHE_INVALIDATION_MODE=http",
]) {
	assert.ok(
		`${project}\n${architecture}\n${operations}`.includes(required),
		`production topology missing ${required}`,
	);
}

assert.ok(
	operations.includes("not a fallback for application `DATABASE_URI`"),
	"Operations must forbid reusing ams-server/prod as application runtime secret fallback",
);
assert.ok(
	project.includes("TODO: provision isolated project scope"),
	"Project document must keep secret scope provisioning as an explicit pending mutation",
);

for (const requiredEnv of [
	"DATABASE_URI=",
	"DATABASE_POOL_MAX=",
	"PAYLOAD_SECRET=",
	"REVALIDATE_SECRET=",
	"INTERNAL_HEALTH_SECRET=",
	"S3_ENDPOINT=",
	"S3_BUCKET=",
	"S3_ACCESS_KEY=",
	"S3_SECRET_KEY=",
	"JOBS_AUTORUN=false",
	"CACHE_INVALIDATION_MODE=http",
]) {
	assert.ok(
		envExample.includes(requiredEnv),
		`.env.example missing ${requiredEnv}`,
	);
}

console.log("verify-production-topology: ok");

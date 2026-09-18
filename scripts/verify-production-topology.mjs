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
const payloadConfig = read("payload.config.ts");

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
	"local PostgreSQL",
	"MEDIA_DIR",
	"Secret Master",
	"JOBS_AUTORUN=true",
]) {
	assert.ok(
		`${project}\n${architecture}\n${operations}`.includes(required),
		`starter topology missing ${required}`,
	);
}

assert.ok(
	!payloadConfig.includes("storage-s3"),
	"payload.config.ts must not import storage-s3",
);
assert.ok(
	operations.includes("offsite"),
	"Operations must require offsite backup copy",
);
assert.ok(
	operations.includes("Independent alert channel"),
	"Operations must pin an independent alert channel",
);
assert.ok(
	operations.includes("ALERT_WEBHOOK_URL"),
	"Operations must name the primary alert destination",
);

const compose = read("deploy/compose/start-baza.compose.yml");
assert.ok(
	compose.includes('JOBS_AUTORUN: "true"'),
	"compose must start exactly one jobs owner with JOBS_AUTORUN=true",
);
assert.ok(
	compose.includes("MEDIA_DIR: /var/lib/ams/realtbase/media"),
	"compose must pin persistent MEDIA_DIR",
);
assert.ok(
	compose.includes("/var/lib/ams/realtbase/media:/var/lib/ams/realtbase/media"),
	"compose must persist MEDIA_DIR across recreate",
);

const nginx = read("deploy/nginx/start-baza.ams24.ru.conf");
assert.ok(
	nginx.includes("location /media/"),
	"nginx must alias local media",
);
assert.ok(
	nginx.includes("limit_req zone=ams_login"),
	"nginx must rate-limit login",
);

for (const requiredEnv of [
	"DATABASE_URI=",
	"DATABASE_POOL_MAX=",
	"PAYLOAD_SECRET=",
	"REVALIDATE_SECRET=",
	"INTERNAL_HEALTH_SECRET=",
	"MEDIA_DIR=",
	"JOBS_AUTORUN=false",
	"CACHE_INVALIDATION_MODE=http",
]) {
	assert.ok(
		envExample.includes(requiredEnv),
		`.env.example missing ${requiredEnv}`,
	);
}

for (const forbiddenEnv of [
	"S3_ENDPOINT=",
	"S3_BUCKET=",
	"S3_ACCESS_KEY=",
	"S3_SECRET_KEY=",
]) {
	assert.equal(
		envExample.includes(forbiddenEnv),
		false,
		`.env.example must not require starter S3 env ${forbiddenEnv}`,
	);
}

console.log("verify-production-topology: ok");

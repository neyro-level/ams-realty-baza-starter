import assert from "node:assert/strict";
import {
	buildIndexNowKeyFile,
	buildIndexNowRequest,
	planIndexNowJob,
	planIndexNowRetry,
} from "../src/core/seo/indexnow.ts";
import { runIndexNowTask } from "../src/project/jobs/indexnow-task.ts";

const origin = "https://example.test";
const fixtureKey = "Fixture-Key-2026";

assert.deepEqual(
	planIndexNowJob(
		{
			id: "move-1",
			kind: "canonical_move",
			oldUrl: "/old/",
			newUrl: "/new/",
		},
		origin,
	),
	{
		eventId: "move-1",
		urls: ["https://example.test/old/", "https://example.test/new/"],
		attempt: 1,
	},
);
for (const kind of ["publish", "archive", "gone"] as const) {
	assert.equal(
		planIndexNowJob({ id: kind, kind, url: `/${kind}/` }, origin).urls[0],
		`https://example.test/${kind}/`,
	);
}
assert.throws(
	() =>
		planIndexNowJob(
			{ id: "foreign", kind: "publish", url: "https://evil.test/" },
			origin,
		),
	/parent|belong/i,
);

const request = buildIndexNowRequest({
	publicOrigin: origin,
	key: fixtureKey,
	urls: ["/one/", "/one/", "/two/"],
});
assert.equal(request.endpoint, "https://api.indexnow.org/indexnow");
assert.equal(request.submitted, 2);
assert.deepEqual(JSON.parse(request.body), {
	host: "example.test",
	key: fixtureKey,
	keyLocation: `https://example.test/${fixtureKey}.txt`,
	urlList: ["https://example.test/one/", "https://example.test/two/"],
});
assert.throws(
	() =>
		buildIndexNowRequest({
			publicOrigin: origin,
			key: "short",
			urls: ["/one/"],
		}),
	/8-128/,
);
assert.throws(
	() =>
		buildIndexNowRequest({
			publicOrigin: origin,
			key: fixtureKey,
			keyLocation: "https://evil.test/key.txt",
			urls: ["/one/"],
		}),
	/belong/i,
);
assert.deepEqual(
	buildIndexNowKeyFile({ key: fixtureKey, pathname: `/${fixtureKey}.txt` }),
	{
		body: fixtureKey,
		contentType: "text/plain; charset=utf-8",
	},
);
assert.deepEqual(
	buildIndexNowKeyFile({
		key: fixtureKey,
		pathname: "/verification/indexnow.txt",
		keyLocationPathname: "/verification/indexnow.txt",
	}),
	{ body: fixtureKey, contentType: "text/plain; charset=utf-8" },
);

assert.deepEqual(
	planIndexNowRetry({
		status: 429,
		attempt: 1,
		now: new Date("2026-09-25T10:00:00Z"),
	}),
	{ attempt: 2, waitUntil: new Date("2026-09-25T10:01:00Z") },
);
assert.equal(
	planIndexNowRetry({
		status: 422,
		attempt: 1,
		now: new Date("2026-09-25T10:00:00Z"),
	}),
	null,
);
assert.equal(
	planIndexNowRetry({
		status: 503,
		attempt: 4,
		now: new Date("2026-09-25T10:00:00Z"),
	}),
	null,
);

let capturedBody = "";
let queuedRetry: Record<string, unknown> | undefined;
const job = planIndexNowJob(
	{ id: "publish-1", kind: "publish", url: "/changed/" },
	origin,
);
const result = await runIndexNowTask({
	job,
	env: { NEXT_PUBLIC_SERVER_URL: origin, INDEXNOW_KEY: fixtureKey },
	now: new Date("2026-09-25T10:00:00Z"),
	fetchImpl: async (_url, init) => {
		capturedBody = init.body;
		assert.deepEqual(init.allowedHosts, ["api.indexnow.org"]);
		return new Response("", { status: 429 });
	},
	queueRetry: async (retry) => {
		queuedRetry = retry;
	},
});
assert.equal(JSON.parse(capturedBody).key, fixtureKey);
assert.deepEqual(result.output, {
	eventId: "publish-1",
	status: 429,
	submitted: 1,
	retryQueued: true,
});
assert.equal(JSON.stringify(result).includes(fixtureKey), false);
assert.equal(JSON.stringify(queuedRetry).includes(fixtureKey), false);
assert.deepEqual(queuedRetry, {
	eventId: "publish-1",
	urls: ["https://example.test/changed/"],
	attempt: 2,
	waitUntil: new Date("2026-09-25T10:01:00Z"),
});

let networkRetry: Record<string, unknown> | undefined;
const networkResult = await runIndexNowTask({
	job,
	env: { NEXT_PUBLIC_SERVER_URL: origin, INDEXNOW_KEY: fixtureKey },
	now: new Date("2026-09-25T10:00:00Z"),
	fetchImpl: async () => {
		throw new Error("fixture network failure");
	},
	queueRetry: async (retry) => {
		networkRetry = retry;
	},
});
assert.equal(networkResult.output.status, "network_error");
assert.equal(JSON.stringify(networkResult).includes(fixtureKey), false);
assert.equal(JSON.stringify(networkRetry).includes(fixtureKey), false);

console.log(
	"IndexNow verified: events, same-host, key, retry and secret-safe job payload.",
);

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const queueModule = await import(
	pathToFileURL(join(root, "src/payload/jobs/queues.ts")).href
);
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const expectedQueues = new Map([
	["system", { limit: 5, disableScheduling: false }],
	["imports", { limit: 1, disableScheduling: true }],
	["maintenance", { limit: 5, disableScheduling: false }],
	["lead-deliveries", { limit: 10, disableScheduling: true }],
]);

const autoRun = queueModule.payloadJobsAutoRun;

if (!Array.isArray(autoRun)) {
	throw new Error("payloadJobsAutoRun must be an array.");
}

for (const [queue, expected] of expectedQueues) {
	const entry = autoRun.find((item) => item.queue === queue);

	if (!entry) {
		throw new Error(`Missing autoRun entry for queue "${queue}".`);
	}

	if (entry.allQueues === true) {
		throw new Error(`Queue "${queue}" must not use allQueues.`);
	}

	if (entry.cron !== "* * * * *") {
		throw new Error(`Queue "${queue}" must run every minute.`);
	}

	if (entry.limit !== expected.limit) {
		throw new Error(
			`Queue "${queue}" limit must be ${expected.limit}, got ${entry.limit}.`,
		);
	}

	if (entry.disableScheduling !== expected.disableScheduling) {
		throw new Error(
			`Queue "${queue}" disableScheduling must be ${expected.disableScheduling}.`,
		);
	}
}

for (const entry of autoRun) {
	if (!expectedQueues.has(entry.queue)) {
		throw new Error(`Unexpected autoRun queue "${entry.queue}".`);
	}
}

const scripts = Object.entries(packageJson.scripts ?? {});
const cliScheduleScripts = scripts.filter(([, command]) =>
	/ jobs:(handle-schedules|run)\b/.test(command),
);

if (cliScheduleScripts.length > 0) {
	throw new Error(
		`CLI jobs scheduling scripts are not allowed for REALTY_BASE autoRun queues: ${cliScheduleScripts
			.map(([name]) => name)
			.join(", ")}.`,
	);
}

const payloadConfig = readFileSync(join(root, "payload.config.ts"), "utf8");

if (!payloadConfig.includes("enableConcurrencyControl: true")) {
	throw new Error("Payload jobs must enable concurrency control.");
}

if (!payloadConfig.includes("shouldAutoRun: async () => runtimeEnv.JOBS_AUTORUN")) {
	throw new Error("Payload jobs autoRun must be gated by JOBS_AUTORUN.");
}

console.log("Jobs config verified.");


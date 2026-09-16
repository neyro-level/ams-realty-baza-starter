import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const queueModule = await import(
	pathToFileURL(join(root, "src/payload/jobs/queues.ts")).href
);
const registryModule = await import(
	pathToFileURL(join(root, "src/payload/jobs/registry.ts")).href
);
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const expectedQueues = new Map([
	["system", { limit: 5, disableScheduling: false, staticTasks: ["dispatchDueFeeds"] }],
	["imports", { limit: 1, disableScheduling: true, programmaticTasks: ["importFeed"] }],
	[
		"maintenance",
		{
			limit: 5,
			disableScheduling: false,
			staticTasks: [
				"jobsJanitor",
				"leadRetentionCleanup",
				"catalogLifecycle",
				"recoverLeadDeliveries",
			],
		},
	],
	[
		"lead-deliveries",
		{ limit: 10, disableScheduling: true, programmaticTasks: ["deliverLead"] },
	],
]);
const expectedTaskSlugs = new Set(
	[...expectedQueues.values()].flatMap((queue) => [
		...(queue.staticTasks ?? []),
		...(queue.programmaticTasks ?? []),
	]),
);

const autoRun = queueModule.payloadJobsAutoRun;
const registry = registryModule.payloadJobRegistry;

if (!Array.isArray(autoRun)) {
	throw new Error("payloadJobsAutoRun must be an array.");
}

for (const [queue, expected] of expectedQueues) {
	const entry = autoRun.find((item) => item.queue === queue);
	const registryEntries = registry.filter((item) => item.queue === queue);

	if (!entry) {
		throw new Error(`Missing autoRun entry for queue "${queue}".`);
	}

	if (registryEntries.length === 0) {
		throw new Error(`Missing registry entries for queue "${queue}".`);
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

	const staticTasks = registryEntries
		.filter((item) => item.trigger === "static")
		.map((item) => item.slug)
		.sort();
	const programmaticTasks = registryEntries
		.filter((item) => item.trigger === "programmatic")
		.map((item) => item.slug)
		.sort();

	if (JSON.stringify(staticTasks) !== JSON.stringify([...(expected.staticTasks ?? [])].sort())) {
		throw new Error(`Queue "${queue}" static task registry mismatch.`);
	}

	if (
		JSON.stringify(programmaticTasks) !==
		JSON.stringify([...(expected.programmaticTasks ?? [])].sort())
	) {
		throw new Error(`Queue "${queue}" programmatic task registry mismatch.`);
	}
}

for (const entry of autoRun) {
	if (!expectedQueues.has(entry.queue)) {
		throw new Error(`Unexpected autoRun queue "${entry.queue}".`);
	}
}

for (const entry of registry) {
	if (!expectedTaskSlugs.has(entry.slug)) {
		throw new Error(`Unexpected task slug "${entry.slug}".`);
	}

	if (entry.trigger === "programmatic" && entry.cron) {
		throw new Error(`Programmatic task "${entry.slug}" must not declare cron.`);
	}

	if (entry.trigger === "static" && !entry.cron) {
		throw new Error(`Static task "${entry.slug}" must declare cron.`);
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


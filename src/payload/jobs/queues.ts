import type { JobsConfig } from "payload";

export const payloadJobQueues = {
	system: "system",
	imports: "imports",
	maintenance: "maintenance",
	leadDeliveries: "lead-deliveries",
} as const;

export const payloadJobsAutoRun = [
	{
		cron: "* * * * *",
		queue: payloadJobQueues.system,
		limit: 5,
		disableScheduling: false,
	},
	{
		cron: "* * * * *",
		queue: payloadJobQueues.imports,
		limit: 1,
		disableScheduling: true,
	},
	{
		cron: "* * * * *",
		queue: payloadJobQueues.maintenance,
		limit: 5,
		disableScheduling: false,
	},
	{
		cron: "* * * * *",
		queue: payloadJobQueues.leadDeliveries,
		limit: 10,
		disableScheduling: true,
	},
] satisfies NonNullable<JobsConfig["autoRun"]>;

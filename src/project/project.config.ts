export const projectConfig = {
	profile: "REALTY_BASE",
	dispatcherIntervalMinutes: 5,
	maintenanceIntervalMinutes: 15,
	dispatchBatchSize: 3,
	approvalTtlMinutes: 240,
	leadRetentionDays: null as number | null,
	archiveRetentionDays: null as number | null,
	staleDataSlaMinutes: 30,
	cacheInvalidationMode: "http" as const,
	cacheProofStatus: "http" as const,
	reservedNamespaces: [
		"/novostroyki",
		"/komplex",
		"/journal",
	],
	jobsAutorunExactlyOne: true,
} as const;

export type ProjectConfig = typeof projectConfig;

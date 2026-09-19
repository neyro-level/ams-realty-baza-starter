export const projectConfig = {
	profile: "REALTY_BASE",
	dispatcherIntervalMinutes: 5,
	maintenanceIntervalMinutes: 15,
	dispatchBatchSize: 3,
	ingestBatchSize: 100,
	importHeartbeatIntervalMs: 15_000,
	approvalTtlMinutes: 240,
	leadRetentionDays: null as number | null,
	archiveRetentionDays: null as number | null,
	staleDataSlaMinutes: 30,
	cacheInvalidationMode: "http" as const,
	cacheProofStatus: "http" as const,
	reservedNamespaces: ["/novostroyki", "/komplex", "/journal"],
	indexedCatalogFilterKeys: [
		"category",
		"dealType",
		"city",
		"district",
		"rooms",
	],
	sitemapUrlsPerShard: 50_000,
	sitemapQueryPageSize: 500,
	sitemapGenerationRevalidateSeconds: 3_600,
	jobsAutorunExactlyOne: true,
} as const;

export type ProjectConfig = typeof projectConfig;

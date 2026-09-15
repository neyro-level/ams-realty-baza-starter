/** @type {import("dependency-cruiser").IConfiguration} */
export default {
	forbidden: [
		{
			name: "no-circular",
			severity: "error",
			from: {},
			to: { circular: true },
		},
		{
			name: "no-unresolved",
			severity: "error",
			from: {},
			to: { couldNotResolve: true },
		},
		{
			name: "production-does-not-import-tests",
			severity: "error",
			from: { path: "^(src|packages)/" },
			to: { path: "[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$" },
		},
		{
			name: "ui-has-no-persistence-dependencies",
			severity: "error",
			from: { path: "^packages/ui/" },
			to: { path: "^(?:payload|@payloadcms/|pg$|prisma$|@prisma/)" },
		},
		{
			name: "contracts-have-no-runtime-or-persistence-dependencies",
			severity: "error",
			from: { path: "^packages/contracts/" },
			to: { path: "^(?:next/|payload|@payloadcms/|pg$|prisma$|@prisma/)" },
		},
	],
	options: {
		doNotFollow: { path: ["node_modules"] },
		tsConfig: { fileName: "tsconfig.json" },
		tsPreCompilationDeps: true,
		enhancedResolveOptions: {
			exportsFields: ["exports"],
			conditionNames: ["import", "node", "default", "types"],
			extensions: [".js", ".mjs", ".ts", ".tsx"],
			mainFields: ["module", "main", "types", "typings"],
		},
		skipAnalysisNotInRules: true,
	},
};

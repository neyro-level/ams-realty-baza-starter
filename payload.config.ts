import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import sharp from "sharp";
import { FeedSources } from "./src/payload/collections/FeedSources.ts";
import { ImportIssues } from "./src/payload/collections/ImportIssues.ts";
import { ImportRuns } from "./src/payload/collections/ImportRuns.ts";
import { LeadDeliveries } from "./src/payload/collections/LeadDeliveries.ts";
import { Leads } from "./src/payload/collections/Leads.ts";
import { Media } from "./src/payload/collections/Media.ts";
import { Pages } from "./src/payload/collections/Pages.ts";
import { Properties } from "./src/payload/collections/Properties.ts";
import { Redirects } from "./src/payload/collections/Redirects.ts";
import { Users } from "./src/payload/collections/Users.ts";
import { runtimeEnv } from "./src/payload/env.ts";
import { payloadJobsAutoRun } from "./src/payload/jobs/queues.ts";
import { payloadJobTasks } from "./src/payload/jobs/tasks.ts";

const databaseUri =
	runtimeEnv.DATABASE_URI ??
	"postgresql://payload:not-configured@127.0.0.1:5432/ams_realtbase_not_configured";
const payloadSecret =
	runtimeEnv.PAYLOAD_SECRET ?? "build-only-payload-secret-replace-before-runtime";

export default buildConfig({
	admin: {
		user: Users.slug,
	},
	collections: [
		Users,
		Pages,
		Properties,
		FeedSources,
		ImportRuns,
		ImportIssues,
		Leads,
		LeadDeliveries,
		Media,
		Redirects,
	],
	cors: runtimeEnv.NEXT_PUBLIC_SERVER_URL ? [runtimeEnv.NEXT_PUBLIC_SERVER_URL] : [],
	csrf: runtimeEnv.NEXT_PUBLIC_SERVER_URL ? [runtimeEnv.NEXT_PUBLIC_SERVER_URL] : [],
	db: postgresAdapter({
		migrationDir: "src/payload/migrations",
		pool: {
			connectionString: databaseUri,
			max: runtimeEnv.DATABASE_POOL_MAX,
		},
		push: runtimeEnv.PAYLOAD_DB_PUSH,
	}),
	graphQL: {
		disable: true,
	},
	jobs: {
		enableConcurrencyControl: true,
		autoRun: payloadJobsAutoRun,
		tasks: payloadJobTasks,
		shouldAutoRun: async () => runtimeEnv.JOBS_AUTORUN,
	},
	secret: payloadSecret,
	serverURL: runtimeEnv.NEXT_PUBLIC_SERVER_URL,
	sharp,
	typescript: {
		outputFile: "src/payload/payload-types.ts",
	},
});

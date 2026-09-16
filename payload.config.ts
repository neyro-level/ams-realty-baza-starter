import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Media } from "./src/payload/collections/Media.ts";
import { Users } from "./src/payload/collections/Users.ts";
import { isS3Configured, runtimeEnv } from "./src/payload/env.ts";

const databaseUri =
	runtimeEnv.DATABASE_URI ??
	"postgresql://payload:not-configured@127.0.0.1:5432/ams_realtbase_not_configured";
const payloadSecret =
	runtimeEnv.PAYLOAD_SECRET ?? "build-only-payload-secret-replace-before-runtime";

export default buildConfig({
	admin: {
		user: Users.slug,
	},
	collections: [Users, Media],
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
	plugins: [
		s3Storage({
			enabled: isS3Configured,
			collections: {
				media: true,
			},
			bucket: runtimeEnv.S3_BUCKET ?? "not-configured",
			config: {
				credentials: {
					accessKeyId: runtimeEnv.S3_ACCESS_KEY ?? "not-configured",
					secretAccessKey: runtimeEnv.S3_SECRET_KEY ?? "not-configured",
				},
				endpoint: runtimeEnv.S3_ENDPOINT,
				forcePathStyle: runtimeEnv.S3_FORCE_PATH_STYLE,
				region: runtimeEnv.S3_REGION ?? "auto",
			},
		}),
	],
	secret: payloadSecret,
	serverURL: runtimeEnv.NEXT_PUBLIC_SERVER_URL,
	sharp,
	typescript: {
		outputFile: "src/payload/payload-types.ts",
	},
});

// @ts-nocheck -- copied into a client clone only after the exact adapter is installed.
import { s3Storage } from "@payloadcms/storage-s3";

const required = (name: string): string => {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is required for client S3 activation`);
	return value;
};

export const timewebS3Plugin = s3Storage({
	enabled: true,
	collections: {
		media: true,
	},
	bucket: required("S3_BUCKET"),
	config: {
		endpoint: required("S3_ENDPOINT"),
		region: required("S3_REGION"),
		credentials: {
			accessKeyId: required("S3_ACCESS_KEY_ID"),
			secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
		},
	},
});

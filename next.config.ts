import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import {
	buildImageCspSrc,
	parseAllowedImageHosts,
	toNextImageRemotePatterns,
} from "./src/core/ingest/image-hosts.ts";

const allowedImageHosts = parseAllowedImageHosts(
	process.env.EXTERNAL_IMAGE_HOSTS,
);
const imageCspSrc = buildImageCspSrc(allowedImageHosts);

const baseSecurityHeaders = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "X-Frame-Options", value: "SAMEORIGIN" },
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=()",
	},
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
];

const publicCsp = [
	"default-src 'self'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'self'",
	"object-src 'none'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	`img-src ${imageCspSrc}`,
	"font-src 'self' data:",
	"connect-src 'self'",
].join("; ");

const adminCsp = [
	"default-src 'self'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'self'",
	"object-src 'none'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
	"style-src 'self' 'unsafe-inline'",
	`img-src ${imageCspSrc}`,
	"font-src 'self' data:",
	"connect-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
	trailingSlash: true,
	skipTrailingSlashRedirect: true,
	transpilePackages: ["@ams/realtbase-ui", "@ams/realtbase-contracts"],
	images: {
		remotePatterns: toNextImageRemotePatterns(allowedImageHosts),
	},
	async headers() {
		return [
			{
				source: "/admin",
				headers: [
					...baseSecurityHeaders,
					{ key: "Content-Security-Policy", value: adminCsp },
				],
			},
			{
				source: "/admin/:path*",
				headers: [
					...baseSecurityHeaders,
					{ key: "Content-Security-Policy", value: adminCsp },
				],
			},
			{
				source: "/((?!admin(?:/|$)).*)",
				headers: [
					...baseSecurityHeaders,
					{ key: "Content-Security-Policy", value: publicCsp },
				],
			},
		];
	},
};

export default withPayload(nextConfig);

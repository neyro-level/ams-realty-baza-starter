import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
	transpilePackages: ["@ams/realtbase-ui", "@ams/realtbase-contracts"],
};

export default withPayload(nextConfig);

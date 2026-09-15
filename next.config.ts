import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@ams/realtbase-ui", "@ams/realtbase-contracts"],
};

export default nextConfig;

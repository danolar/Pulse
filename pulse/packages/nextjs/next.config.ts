import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: [
    "better-sqlite3",
    "googleapis",
    "@neondatabase/serverless",
    "drizzle-orm",
    "twilio",
  ],
  typescript: {
    ignoreBuildErrors:
      process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true" || process.env.DOCKER_BUILD === "1",
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;

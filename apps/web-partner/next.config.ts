import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.5.50.43"],
  transpilePackages: ["@agoda/types"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    typescript: {
    ignoreBuildErrors: true,
  },
  // optional: also ignore ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

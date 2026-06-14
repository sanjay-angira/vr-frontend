import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-runtime",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "the-india-decor-data.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;

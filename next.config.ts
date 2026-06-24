import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.vrindavanrasa.com",
      },
      {
        protocol: "https",
        hostname: "the-india-decor-data.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;

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
        hostname: "vrindavan-rasa.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "vrindavan-rasa.s3.amazonaws.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/signup", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;

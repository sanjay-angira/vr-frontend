import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this app (ignore stray lockfiles higher up the tree).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Local Windows SSL interception breaks Next's optimizer fetches to S3.
    // Browser loads S3 directly in dev; production deploys keep optimization.
    // Set NEXT_IMAGE_UNOPTIMIZED=1 for local `next start` if images 500.
    unoptimized:
      process.env.NEXT_IMAGE_UNOPTIMIZED === "1" ||
      process.env.NODE_ENV === "development",
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
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
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
      { source: "/account", destination: "/profile", permanent: false },
      { source: "/account/profile", destination: "/profile", permanent: false },
      { source: "/account/orders", destination: "/orders", permanent: false },
      {
        source: "/account/orders/:id",
        destination: "/orders/:id",
        permanent: false,
      },
      { source: "/account/wishlist", destination: "/wishlist", permanent: false },
      {
        source: "/account/addresses",
        destination: "/addresses",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      // Browsers often request /favicon.ico by default
      { source: "/favicon.ico", destination: "/favicon-32.png" },
    ];
  },
};

export default nextConfig;

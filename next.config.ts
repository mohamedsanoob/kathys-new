import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "dressupfashion.in",
      },
      {
        protocol: "https",
        hostname: "dukaan.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;

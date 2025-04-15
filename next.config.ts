import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript errors
  },
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

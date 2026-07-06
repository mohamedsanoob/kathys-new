import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily disable TypeScript errors
  },
  // Require firebase-admin at runtime instead of bundling it (avoids gRPC
  // native-binding bundling errors in next dev --turbopack and next build).
  serverExternalPackages: ["firebase-admin"],
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

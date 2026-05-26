import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained bundle — reduces RAM usage on S6 Tizen.
  output: 'standalone',
  allowedDevOrigins: ['192.168.75.177', 'localhost:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mif.vu.lt',
      },
      {
        protocol: 'https',
        hostname: 'mif.vu.lt',
      },
      {
        protocol: 'http',
        hostname: '**.mif.vu.lt',
      },
      {
        protocol: 'http',
        hostname: 'mif.vu.lt',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

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
        hostname: "pub-79d67780b43f4e7c91fc78db86657824.r2.dev",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 🔥 acepta cualquier dominio
      },
    ],
  },
};

export default nextConfig;

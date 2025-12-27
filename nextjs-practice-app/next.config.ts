import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3000',
    '192.168.2.14',
  ],
  devIndicators: false,
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Keep Next/Image semantics while avoiding remote domain config during dev
    unoptimized: true,
  },
};

export default nextConfig;

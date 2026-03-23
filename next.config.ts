import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Monorepo: deps are hoisted to ../node_modules. Turbopack root must be the repo root
// so `framer-motion` and other workspace deps resolve; `@/*` still maps via tsconfig.
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { NextConfig } from 'next';

// Load root monorepo .env before Next.js builds/inlines env vars
const rootEnv = resolve(process.cwd(), '../../.env');
if (existsSync(rootEnv) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(rootEnv);
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true, // TODO: Remove when media library is deployed to real Object Storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        // TODO: Remove when media library is deployed to real Object Storage
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;

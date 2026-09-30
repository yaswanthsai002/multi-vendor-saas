import type { NextConfig } from 'next';

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

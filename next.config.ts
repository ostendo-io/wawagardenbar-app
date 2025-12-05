import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Optimize for Docker deployment
  images: {
    formats: ['image/webp'],
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

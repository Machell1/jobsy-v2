import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@jobsy/shared', '@jobsy/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;

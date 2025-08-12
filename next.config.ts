
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Add Firebase Storage domain for bucket name
        protocol: 'https',
        hostname: 'elegance-boutique-m9ypf.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
      { // Add Firebase Storage domain for direct file access
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      { // Add placehold.co for placeholder images
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Add allowedDevOrigins for IDX development environment
  experimental: {
    allowedDevOrigins: [
        "*.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;

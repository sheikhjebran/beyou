
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: "tsconfig.json"
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: false,
    serverActions: {
      bodySizeLimit: '1gb'
    }
  },
  // Configure API route body size limit
  api: {
    bodyParser: {
      sizeLimit: '1gb',
    },
  },
  images: {
    domains: ['localhost', 'beyoushop.in', 'placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'beyoushop.in',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true, // This will serve original images without optimization
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;

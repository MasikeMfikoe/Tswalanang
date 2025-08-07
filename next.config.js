/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable SWC minifier and use Terser instead to avoid potential SWC issues
  swcMinify: false,
  // Optimize build performance and memory usage
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    // Disable potentially problematic features
    esmExternals: false,
  },
  // Configure webpack to be more stable
  webpack: (config, { dev, isServer }) => {
    // Reduce memory usage
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };

    // Disable source maps in production to reduce memory usage
    if (!dev) {
      config.devtool = false;
    }

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
  // Disable image optimization to avoid potential issues
  images: {
    unoptimized: true,
  },
  // Reduce build output
  output: 'standalone',
};

module.exports = nextConfig;

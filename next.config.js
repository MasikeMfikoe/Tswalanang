/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Disable specific Webpack 5 experiments that might cause issues
    config.experiments = {
      ...config.experiments,
      buildHttp: false,
      outputModule: false,
    };
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during `next build`
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark optional native modules as external to prevent build errors
      config.externals.push({
        "osx-temperature-sensor": "osx-temperature-sensor",
      });
    }
    return config;
  },
};

export default nextConfig;

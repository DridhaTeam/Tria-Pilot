import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Transpile ESM packages that Next.js can't handle by default
  transpilePackages: [
    '@radix-ui/react-id',
    '@radix-ui/react-use-callback-ref',
    '@radix-ui/react-select',
    '@radix-ui/react-use-layout-effect',
    '@radix-ui/react-use-previous',
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Handle .mjs files from Radix UI
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules\/@radix-ui/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
};

export default nextConfig;

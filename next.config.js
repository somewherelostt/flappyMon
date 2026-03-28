/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.lighthouse.storage",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
    };

    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      config.externals.push(
        "pino-pretty",
        "lokijs",
        "encoding",
        "@lighthouse-web3/sdk",
        "bls-eth-wasm",
      );
    }

    if (!dev && !isServer) {
      // Production performance tweaks
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }

    return config;
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "radix-ui",
      "wagmi",
      "viem",
      "@rainbow-me/rainbowkit",
    ],
  },
  serverExternalPackages: [
    "@metamask/sdk",
    "@lighthouse-web3/sdk",
    "bls-eth-wasm",
  ],
};

module.exports = nextConfig;

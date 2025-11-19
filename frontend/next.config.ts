import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Required by FHEVM for WebAssembly threads support
    // Combined with additional security headers
    return [
      {
        source: '/',
        headers: [
          // FHEVM required headers
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          // Security headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // API routes additional security
        source: "/api/(.*)",
        headers: [
          {
            key: "X-Rate-Limit",
            value: "100",
          },
        ],
      },
    ];
  },

  // Experimental features for better security
  experimental: {
    serverComponentsExternalPackages: [],
  },

  // Image optimization settings
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Build optimization
  swcMinify: true,

  // Environment variable validation
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  },

  // Webpack configuration for additional security
  webpack: (config, { isServer }) => {
    // Add additional security checks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;


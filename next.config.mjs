/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverComponentsExternalPackages: ["@resvg/resvg-js"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/opengraph-image",
        destination: "/api/branding/og-image",
      },
      {
        source: "/opengraph-image.png",
        destination: "/api/branding/og-image",
      },
      {
        source: "/twitter-image",
        destination: "/api/branding/og-image",
      },
      {
        source: "/twitter-image.png",
        destination: "/api/branding/og-image",
      },
      {
        source: "/icon",
        destination: "/api/branding/icon",
      },
      {
        source: "/apple-icon",
        destination: "/api/branding/apple-icon",
      },
    ];
  },
};

export default nextConfig;

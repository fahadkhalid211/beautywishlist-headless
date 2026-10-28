/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beautywishlistbyhs-shop-774165.hostingersite.com",
      },
      {
        protocol: "https",
        hostname: "new.beautywishlistbyhs.shop",
      },
      {
        protocol: "https",
        hostname: "beautywishlistbyhs.shop",
      },
      {
        protocol: "https",
        hostname: "*.beautywishlistbyhs.shop",
      },
      {
        protocol: "https",
        hostname: "*.hostingersite.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

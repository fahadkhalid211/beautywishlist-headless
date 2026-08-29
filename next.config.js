/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "new.beautywishlistbyhs.shop",
      },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beautywishlistbyhs-shop-774165.hostingersite.com",
      },
      {
        protocol: "https",
        hostname: "new.beautywishlistbyhs.shop",
      },
    ],
  },
};

module.exports = nextConfig;

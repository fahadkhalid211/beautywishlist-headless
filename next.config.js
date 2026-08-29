/** @type {import('next').NextConfig} */
const nextConfig = {
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

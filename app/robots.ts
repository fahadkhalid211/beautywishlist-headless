import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WP_URL || "";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/account", "/wishlist", "/invoice", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

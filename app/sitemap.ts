import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/woocommerce";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WP_URL || "";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/brand`, changeFrequency: "weekly", priority: 0.7 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategories();
    categoryRoutes = categories
      .filter((c: any) => c.count > 0)
      .map((c: any) => ({
        url: `${SITE_URL}/category/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch {
    // skip if WP is unreachable at build time
  }

  try {
    const products = await getProducts(1, 100);
    productRoutes = products.map((p: any) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // skip if WP is unreachable at build time
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

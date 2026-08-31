import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/woocommerce";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_WP_URL ||
  "https://beautywishlistbyhs.shop";

const PER_PAGE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/brand`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const categories = await getCategories();

    categoryRoutes = categories
      .filter((category: any) => category.count > 0)
      .map((category: any) => ({
        url: `${SITE_URL}/category/${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    categoryRoutes = [];
  }

  try {
    const firstPage = await getProducts(1, PER_PAGE);

    productRoutes = [...firstPage].map((product: any) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.date_modified
        ? new Date(product.date_modified)
        : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    let page = 2;

    while (firstPage.length === PER_PAGE) {
      const products = await getProducts(page, PER_PAGE);

      if (!products.length) {
        break;
      }

      productRoutes.push(
        ...products.map((product: any) => ({
          url: `${SITE_URL}/product/${product.slug}`,
          lastModified: product.date_modified
            ? new Date(product.date_modified)
            : undefined,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
      );

      if (products.length < PER_PAGE) {
        break;
      }

      page++;
    }
  } catch {
    productRoutes = [];
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
  ];
}

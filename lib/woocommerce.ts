import { fetchStoreApi } from "@/lib/storeApi";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;
const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

const CATALOG_CACHE_SECONDS = 900;
const CATEGORY_CACHE_SECONDS = 3600;
const SEARCH_CACHE_SECONDS = 300;
const HOMEPAGE_SNAPSHOT_CACHE_SECONDS = 86400;
const REQUEST_TIMEOUT_MS = 8000;
const HOMEPAGE_TIMEOUT_MS = 2000;

export const CACHE_TAGS = {
  catalog: "wc-catalog",
  categories: "wc-categories",
  search: "wc-search",
  homepage: "homepage-snapshot",
} as const;

async function fetchJson<T>(url: string, revalidate: number, tags: string[] = [], timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  const response = await fetchStoreApi(url, {
    next: { revalidate, tags },
    timeoutMs,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Remote API failed: ${response.status}`);
  return response.json() as Promise<T>;
}

async function request<T>(endpoint: string, revalidate = CATALOG_CACHE_SECONDS, tags: string[] = [CACHE_TAGS.catalog], timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  try {
    return await fetchJson<T>(`${API}${endpoint}`, revalidate, tags, timeoutMs);
  } catch (error) {
    console.error("WooCommerce request failed:", error);
    return [] as unknown as T;
  }
}

type PaginatedResult<T> = { items: T[]; total: number; totalPages: number };

export type HomepageSnapshot = {
  categories: any[];
  sale: any[];
  best_sellers: any[];
  new_products: any[];
  hero_image_1?: string;
  hero_image_2?: string;
  banner_image?: string;
  updated_at: string;
  version: string;
};

export type HomepageImages = {
  hero_image_1?: string;
  hero_image_2?: string;
  banner_image?: string;
};

export type ResourceResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found"; data: null }
  | { status: "unavailable"; data: null };

async function requestResource<T>(endpoint: string, revalidate: number, tags: string[] = [], timeoutMs = REQUEST_TIMEOUT_MS): Promise<ResourceResult<T>> {
  try {
    const response = await fetchStoreApi(`${API}${endpoint}`, {
      next: { revalidate, tags },
      timeoutMs,
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) return { status: "not-found", data: null };
    if (!response.ok) return { status: "unavailable", data: null };

    return { status: "ok", data: (await response.json()) as T };
  } catch (error) {
    console.error("WooCommerce resource request failed:", error);
    return { status: "unavailable", data: null };
  }
}

async function requestPaginated<T>(endpoint: string, revalidate = CATALOG_CACHE_SECONDS, tags: string[] = [CACHE_TAGS.catalog], timeoutMs = REQUEST_TIMEOUT_MS): Promise<PaginatedResult<T>> {
  try {
    const response = await fetchStoreApi(`${API}${endpoint}`, {
      next: { revalidate, tags },
      timeoutMs,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`WooCommerce API failed: ${response.status}`);
    const items = (await response.json()) as T[];
    const totalHeader = response.headers.get("x-wp-total") ?? response.headers.get("X-WP-Total");
    const totalPagesHeader = response.headers.get("x-wp-totalpages") ?? response.headers.get("X-WP-TotalPages");
    const total = totalHeader ? Number(totalHeader) : items.length;
    const totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;
    return { items, total, totalPages };
  } catch (error) {
    console.error("WooCommerce paginated request failed:", error);
    return { items: [], total: 0, totalPages: 0 };
  }
}

export async function getHomepageSnapshot(): Promise<HomepageSnapshot> {
  if (!WP_URL) throw new Error("NEXT_PUBLIC_WP_URL is not configured");
  const result = await fetchJson<{ success: boolean; snapshot: HomepageSnapshot }>(`${WP_URL}/wp-json/custom/v1/homepage-snapshot`, HOMEPAGE_SNAPSHOT_CACHE_SECONDS, [CACHE_TAGS.homepage], HOMEPAGE_TIMEOUT_MS);
  if (!result.success || !result.snapshot) throw new Error("Homepage snapshot is unavailable");
  if (Array.isArray(result.snapshot.categories) && result.snapshot.categories.length > 0) {
    result.snapshot.categories = await enrichCategoriesWithImages(result.snapshot.categories);
  }
  return result.snapshot;
}

export async function getProducts(page = 1, perPage = 24) { return request<any[]>(`/products?page=${page}&per_page=${perPage}`); }
export async function getFeaturedProducts(perPage = 8) { return request<any[]>(`/products?featured=true&per_page=${perPage}`); }

export async function getHomepageImages(): Promise<HomepageImages | null> {
  if (!WP_URL) return null;
  try {
    const data = await fetchJson<any>(
      `${WP_URL}/wp-json/custom/v1/homepage-images`,
      HOMEPAGE_SNAPSHOT_CACHE_SECONDS,
      [CACHE_TAGS.homepage, CACHE_TAGS.catalog],
      HOMEPAGE_TIMEOUT_MS
    );
    if (!data || !data.success) return null;
    return {
      hero_image_1: data.hero_image_1 || undefined,
      hero_image_2: data.hero_image_2 || undefined,
      banner_image: data.banner_image || undefined,
    };
  } catch {
    return null;
  }
}

export async function getProductResource(slug: string): Promise<ResourceResult<any>> {
  const result = await requestResource<any[]>(`/products?slug=${encodeURIComponent(slug)}`, CATALOG_CACHE_SECONDS, [CACHE_TAGS.catalog]);
  if (result.status !== "ok") return { status: result.status, data: null };
  return result.data[0] ? { status: "ok", data: result.data[0] } : { status: "not-found", data: null };
}

export async function getProduct(slug: string) {
  const result = await getProductResource(slug);
  return result.status === "ok" ? result.data : null;
}


/**
 * Ensures category images follow the user-defined rule:
 * 1. If an image is assigned to the category in WooCommerce (category.image?.src), display that image.
 * 2. If no image is assigned to the category, display the most recent product's photo in that category.
 */
export async function enrichCategoriesWithImages(categories: any[]): Promise<any[]> {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return categories || [];
  }

  const needsEnrichment = categories.some((c) => c && c.count > 0 && (!c.image || !c.image.src));
  if (!needsEnrichment) {
    return categories;
  }

  try {
    // Fetch products ordered by date descending.
    // Three pages of 100 cover all ~280 products in the catalog.
    const [p1, p2, p3] = await Promise.all([
      request<any[]>("/products?orderby=date&order=desc&per_page=100&page=1", CATEGORY_CACHE_SECONDS, [CACHE_TAGS.categories, CACHE_TAGS.catalog]).catch(() => []),
      request<any[]>("/products?orderby=date&order=desc&per_page=100&page=2", CATEGORY_CACHE_SECONDS, [CACHE_TAGS.categories, CACHE_TAGS.catalog]).catch(() => []),
      request<any[]>("/products?orderby=date&order=desc&per_page=100&page=3", CATEGORY_CACHE_SECONDS, [CACHE_TAGS.categories, CACHE_TAGS.catalog]).catch(() => []),
    ]);

    const allProducts = [...(p1 || []), ...(p2 || []), ...(p3 || [])];
    if (allProducts.length === 0) return categories;

    // Map category ID and slug to the most recent product's first image
    const recentImageMap = new Map<number | string, { id?: number; src: string; alt?: string }>();
    for (const prod of allProducts) {
      const img = prod?.images?.[0];
      if (!img || !img.src) continue;

      const imgPayload = {
        id: img.id,
        src: img.src,
        alt: img.alt || prod.name || "",
      };

      for (const cat of (prod.categories || [])) {
        if (cat.id && !recentImageMap.has(cat.id)) {
          recentImageMap.set(cat.id, imgPayload);
        }
        if (cat.slug && !recentImageMap.has(cat.slug)) {
          recentImageMap.set(cat.slug, imgPayload);
        }
      }
    }

    return categories.map((category) => {
      // 1. If user uploaded a category image in WooCommerce, preserve it
      if (category?.image?.src) {
        return category;
      }

      // 2. If no image is assigned to the category, use the most recent product's photo
      const fallback =
        (category.id ? recentImageMap.get(category.id) : undefined) ||
        (category.slug ? recentImageMap.get(category.slug) : undefined);

      if (fallback) {
        return {
          ...category,
          image: fallback,
        };
      }

      return category;
    });
  } catch (err) {
    console.error("Failed to enrich categories with recent product images:", err);
    return categories;
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const firstPage = await requestPaginated<any>(
      "/products/categories?page=1&per_page=100",
      CATEGORY_CACHE_SECONDS,
      [CACHE_TAGS.categories]
    );

    if (!firstPage.items || firstPage.items.length === 0) {
      return [];
    }

    const totalPages =
      firstPage.totalPages > 1
        ? firstPage.totalPages
        : firstPage.total > firstPage.items.length
        ? Math.ceil(firstPage.total / 100)
        : 1;

    if (totalPages <= 1) {
      return enrichCategoriesWithImages(firstPage.items);
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        request<any[]>(
          `/products/categories?page=${i + 2}&per_page=100`,
          CATEGORY_CACHE_SECONDS,
          [CACHE_TAGS.categories]
        )
      )
    );

    const allCats = [...firstPage.items, ...remainingPages.flat()];
    return enrichCategoriesWithImages(allCats);
  } catch (error) {
    console.error("WooCommerce getCategories failed:", error);
    return [];
  }
}

export async function getCategoryResource(slug: string): Promise<ResourceResult<any>> {
  try {
    const categories = await getCategories();
    if (!categories || categories.length === 0) return { status: "unavailable", data: null };
    const category = categories.find((c: any) => c.slug === slug);
    return category ? { status: "ok", data: category } : { status: "not-found", data: null };
  } catch (error) {
    console.error("WooCommerce getCategoryResource failed:", error);
    return { status: "unavailable", data: null };
  }
}

export async function getCategory(slug: string) {
  const result = await getCategoryResource(slug);
  return result.status === "ok" ? result.data : null;
}

export async function getProductsByCategory(categoryId: number, page = 1, perPage = 24) {
  return requestPaginated<any>(`/products?category=${categoryId}&page=${page}&per_page=${perPage}`);
}

export async function searchProducts(params: { page?: number; perPage?: number; search?: string; category?: string; minPrice?: string; maxPrice?: string; orderby?: string; order?: string; onSale?: boolean; stockStatus?: string; timeoutMs?: number; }) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("per_page", String(params.perPage ?? 24));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.minPrice) query.set("min_price", String(Number(params.minPrice) * 100));
  if (params.maxPrice) query.set("max_price", String(Number(params.maxPrice) * 100));
  if (params.orderby) query.set("orderby", params.orderby);
  if (params.order) query.set("order", params.order);
  if (params.onSale) query.set("on_sale", "true");
  if (params.stockStatus) query.set("stock_status", params.stockStatus);
  return requestPaginated<any>(`/products?${query.toString()}`, SEARCH_CACHE_SECONDS, [CACHE_TAGS.search], params.timeoutMs ?? REQUEST_TIMEOUT_MS);
}

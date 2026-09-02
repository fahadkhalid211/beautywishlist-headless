const API = process.env.NEXT_PUBLIC_WC_STORE_API!;
const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

const CATALOG_CACHE_SECONDS = 900;
const CATEGORY_CACHE_SECONDS = 3600;
const SEARCH_CACHE_SECONDS = 300;
const HOMEPAGE_SNAPSHOT_CACHE_SECONDS = 86400;
const REQUEST_TIMEOUT_MS = 8000;

export const CACHE_TAGS = {
  catalog: "wc-catalog",
  categories: "wc-categories",
  search: "wc-search",
  homepage: "homepage-snapshot",
} as const;

async function fetchJson<T>(
  url: string,
  revalidate: number,
  tags: string[] = []
): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate, tags },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Remote API failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function request<T>(
  endpoint: string,
  revalidate = CATALOG_CACHE_SECONDS,
  tags: string[] = [CACHE_TAGS.catalog]
): Promise<T> {
  return fetchJson<T>(`${API}${endpoint}`, revalidate, tags);
}

type PaginatedResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
};

export type HomepageSnapshot = {
  categories: any[];
  sale: any[];
  best_sellers: any[];
  new_products: any[];
  updated_at: string;
  version: string;
};

async function requestPaginated<T>(
  endpoint: string,
  revalidate = CATALOG_CACHE_SECONDS,
  tags: string[] = [CACHE_TAGS.catalog]
): Promise<PaginatedResult<T>> {
  const response = await fetch(`${API}${endpoint}`, {
    next: { revalidate, tags },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`WooCommerce API failed: ${response.status}`);
  }

  const items = (await response.json()) as T[];
  const total = Number(response.headers.get("X-WP-Total") ?? items.length);
  const totalPages = Number(response.headers.get("X-WP-TotalPages") ?? 1);

  return { items, total, totalPages };
}

export async function getHomepageSnapshot(): Promise<HomepageSnapshot> {
  if (!WP_URL) {
    throw new Error("NEXT_PUBLIC_WP_URL is not configured");
  }

  const result = await fetchJson<{ success: boolean; snapshot: HomepageSnapshot }>(
    `${WP_URL}/wp-json/custom/v1/homepage-snapshot`,
    HOMEPAGE_SNAPSHOT_CACHE_SECONDS,
    [CACHE_TAGS.homepage]
  );

  if (!result.success || !result.snapshot) {
    throw new Error("Homepage snapshot is unavailable");
  }

  return result.snapshot;
}

export async function getProducts(page = 1, perPage = 24) {
  return request<any[]>(`/products?page=${page}&per_page=${perPage}`);
}

export async function getFeaturedProducts(perPage = 8) {
  return request<any[]>(`/products?featured=true&per_page=${perPage}`);
}

export async function getHomepageImages() {
  if (!WP_URL) return null;

  try {
    return await fetchJson<any>(
      `${WP_URL}/wp-json/custom/v1/homepage-images`,
      CATALOG_CACHE_SECONDS,
      [CACHE_TAGS.catalog]
    );
  } catch {
    return null;
  }
}

export async function getProduct(slug: string) {
  const products = await request<any[]>(
    `/products?slug=${encodeURIComponent(slug)}`
  );

  return products[0] ?? null;
}

export async function getCategories() {
  return request<any[]>(
    "/products/categories?per_page=100",
    CATEGORY_CACHE_SECONDS,
    [CACHE_TAGS.categories]
  );
}

export async function getCategory(slug: string) {
  const categories = await getCategories();
  return categories.find((c: any) => c.slug === slug) ?? null;
}

export async function getProductsByCategory(
  categoryId: number,
  page = 1,
  perPage = 24
) {
  return requestPaginated<any>(
    `/products?category=${categoryId}&page=${page}&per_page=${perPage}`
  );
}

export async function searchProducts(params: {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  orderby?: string;
  order?: string;
  onSale?: boolean;
  stockStatus?: string;
}) {
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

  return requestPaginated<any>(
    `/products?${query.toString()}`,
    SEARCH_CACHE_SECONDS,
    [CACHE_TAGS.search]
  );
}

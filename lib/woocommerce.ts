import { unstable_cache } from "next/cache";

const API = process.env.NEXT_PUBLIC_WC_STORE_API!;
const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;

const CATALOG_CACHE_SECONDS = 600;
const CATEGORY_CACHE_SECONDS = 3600;
const SEARCH_CACHE_SECONDS = 300;
const REQUEST_TIMEOUT_MS = 8000;

async function fetchJson<T>(url: string, revalidate = CATALOG_CACHE_SECONDS): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Remote API failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function request<T>(endpoint: string, revalidate = CATALOG_CACHE_SECONDS): Promise<T> {
  const cachedRequest = unstable_cache(
    () => fetchJson<T>(`${API}${endpoint}`, revalidate),
    ["woocommerce", endpoint],
    { revalidate }
  );

  return cachedRequest();
}

type PaginatedResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
};

async function requestPaginated<T>(
  endpoint: string,
  revalidate = CATALOG_CACHE_SECONDS
): Promise<PaginatedResult<T>> {
  const cachedRequest = unstable_cache(
    async () => {
      const response = await fetch(`${API}${endpoint}`, {
        next: { revalidate },
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
    },
    ["woocommerce-paginated", endpoint],
    { revalidate }
  );

  return cachedRequest();
}

export async function getProducts(page = 1, perPage = 24) {
  return request<any[]>(`/products?page=${page}&per_page=${perPage}`);
}

export async function getFeaturedProducts(perPage = 8) {
  return request<any[]>(`/products?featured=true&per_page=${perPage}`);
}

export async function getHomepageImages() {
  if (!WP_URL) return null;

  const cachedRequest = unstable_cache(
    async () => {
      try {
        return await fetchJson<any>(
          `${WP_URL}/wp-json/custom/v1/homepage-images`,
          CATALOG_CACHE_SECONDS
        );
      } catch {
        return null;
      }
    },
    ["wordpress", "homepage-images"],
    { revalidate: CATALOG_CACHE_SECONDS }
  );

  return cachedRequest();
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
    CATEGORY_CACHE_SECONDS
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
    SEARCH_CACHE_SECONDS
  );
}

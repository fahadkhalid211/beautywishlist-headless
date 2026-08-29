const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API}${endpoint}`, {
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(
      `WooCommerce API failed: ${response.status}`
    );
  }

  return response.json();
}

type PaginatedResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
};

async function requestPaginated<T>(endpoint: string): Promise<PaginatedResult<T>> {
  const response = await fetch(`${API}${endpoint}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`WooCommerce API failed: ${response.status}`);
  }

  const items = await response.json();
  const total = Number(response.headers.get("X-WP-Total") ?? items.length);
  const totalPages = Number(response.headers.get("X-WP-TotalPages") ?? 1);

  return { items, total, totalPages };
}

export async function getProducts(
  page = 1,
  perPage = 24
) {
  return request<any[]>(
    `/products?page=${page}&per_page=${perPage}`
  );
}

/**
 * Products marked "Feature this product" in WooCommerce (Product edit
 * screen → Product data → General/Advanced). Gives store owners a direct,
 * code-free lever to control which products appear in homepage hero/banner
 * spots, instead of relying on default sort order.
 */
export async function getFeaturedProducts(perPage = 8) {
  return request<any[]>(
    `/products?featured=true&per_page=${perPage}`
  );
}

/**
 * Admin-configured homepage images (Settings → Homepage Images in
 * WordPress). Returns null fields if nothing has been set yet.
 */
export async function getHomepageImages() {
  const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;
  try {
    const res = await fetch(`${WP_URL}/wp-json/custom/v1/homepage-images`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
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
    "/products/categories?per_page=100"
  );
}

/**
 * Fetches the full category list and matches by slug in JS rather than
 * relying on the Store API's own ?slug= filter on this endpoint, which
 * doesn't reliably filter (it silently falls back to returning every
 * category, so categories[0] always resolved to the same first category
 * regardless of the requested slug — the cause of every /category/[slug]
 * page showing the same single product).
 */
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

  query.set(
    "page",
    String(params.page ?? 1)
  );

  query.set("per_page", String(params.perPage ?? 24));

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.minPrice) {
    query.set(
      "min_price",
      String(Number(params.minPrice) * 100)
    );
  }

  if (params.maxPrice) {
    query.set(
      "max_price",
      String(Number(params.maxPrice) * 100)
    );
  }

  if (params.orderby) {
    query.set("orderby", params.orderby);
  }

  if (params.order) {
    query.set("order", params.order);
  }

  if (params.onSale) {
    query.set("on_sale", "true");
  }

  if (params.stockStatus) {
    query.set(
      "stock_status",
      params.stockStatus
    );
  }

  return requestPaginated<any>(
    `/products?${query.toString()}`
  );
}

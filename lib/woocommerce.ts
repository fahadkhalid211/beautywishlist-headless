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

export async function getProducts(
  page = 1,
  perPage = 24
) {
  return request<any[]>(
    `/products?page=${page}&per_page=${perPage}`
  );
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

export async function getCategory(slug: string) {
  const categories = await request<any[]>(
    `/products/categories?slug=${encodeURIComponent(slug)}`
  );

  return categories[0] ?? null;
}

export async function getProductsByCategory(
  categoryId: number,
  page = 1
) {
  return request<any[]>(
    `/products?category=${categoryId}&page=${page}&per_page=24`
  );
}

export async function searchProducts(params: {
  page?: number;
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

  query.set("per_page", "24");

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

  return request<any[]>(
    `/products?${query.toString()}`
  );
}
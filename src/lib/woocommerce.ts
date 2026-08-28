const API =
  process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function getProducts() {
  const response = await fetch(
    `${API}/products?per_page=12`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!response.ok) {
    throw new Error("WooCommerce API failed");
  }

  return response.json();
}

export async function getCategories() {
  const response = await fetch(
    `${API}/products/categories?per_page=100`,
    {
      next: {
        revalidate: 300,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Categories API failed");
  }

  return response.json();
}
const API = process.env.NEXT_PUBLIC_WC_STORE_API!;

export async function addToCart(
  productId: number,
  quantity = 1
) {
  const response = await fetch(
    `${API}/cart/add-item?id=${productId}&quantity=${quantity}`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to add product");
  }

  return response.json();
}
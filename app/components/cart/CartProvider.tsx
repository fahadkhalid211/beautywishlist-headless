"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

type CartContextType = {
  cart: any;
  addItem: (
    productId: number,
    quantity?: number
  ) => Promise<void>;
  loading: boolean;
};

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function addItem(
    productId: number,
    quantity = 1
  ) {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "WooCommerce cart error:",
          data
        );

        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to add product"
        );
      }

      setCart(data);

      console.log(
        "Product added successfully:",
        data
      );
    } catch (error) {
      console.error(
        "Add to cart failed:",
        error
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be inside CartProvider"
    );
  }

  return context;
}
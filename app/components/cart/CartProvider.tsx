"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartContextType = {
  cart: any;
  itemCount: number;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  loading: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function refreshCart() {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (res.ok) setCart(await res.json());
  }

  useEffect(() => {
    refreshCart();
  }, []);

  async function addItem(productId: number, quantity = 1) {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to add product");
      }
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  const itemCount = cart?.items_count ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, addItem, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be inside CartProvider");
  return context;
}
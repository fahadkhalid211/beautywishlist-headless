"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartContextType = {
  cart: any;
  itemCount: number;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  loading: boolean;
  updatingKey: string | null;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

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

  async function updateItem(key: string, quantity: number) {
    setUpdatingKey(key);
    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to update item");
      }
      setCart(data);
    } finally {
      setUpdatingKey(null);
    }
  }

  async function removeItem(key: string) {
    setUpdatingKey(key);
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Unable to remove item");
      }
      setCart(data);
    } finally {
      setUpdatingKey(null);
    }
  }

  const itemCount = cart?.items_count ?? 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, addItem, updateItem, removeItem, loading, updatingKey }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be inside CartProvider");
  return context;
}
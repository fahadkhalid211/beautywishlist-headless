"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type WishlistItem = {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  price: string;
  currency_prefix: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  isWishlisted: (id: number) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: number) => void;
  hydrated: boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
const STORAGE_KEY = "bw_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private mode, quota, etc.) — fail silently
    }
  }, [items, hydrated]);

  function isWishlisted(id: number) {
    return items.some((i) => i.id === id);
  }

  function toggle(item: WishlistItem) {
    setItems((current) =>
      current.some((i) => i.id === item.id)
        ? current.filter((i) => i.id !== item.id)
        : [...current, item]
    );
  }

  function remove(id: number) {
    setItems((current) => current.filter((i) => i.id !== id));
  }

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggle, remove, hydrated }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be inside WishlistProvider");
  return context;
}

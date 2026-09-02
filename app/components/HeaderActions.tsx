"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "./cart/CartProvider";
import { useWishlist } from "./wishlist/WishlistProvider";

export default function HeaderActions() {
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 400);
      prevCount.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <Link href="/account" aria-label="Account" className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-purple-50 hover:text-purple-700 md:hidden">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
      </Link>

      <Link href="/wishlist" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-full text-ink-soft transition hover:bg-purple-50 hover:text-purple-700 md:hidden">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" /></svg>
        {wishlistItems.length > 0 && (
          <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-purple-600 text-[9px] font-semibold text-white" aria-hidden="true">{wishlistItems.length}</span>
        )}
      </Link>

      <Link href="/account" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-purple-50 hover:text-purple-700 md:flex">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        Account
      </Link>

      <Link href="/wishlist" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-purple-50 hover:text-purple-700 md:flex">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" /></svg>
        Wishlist
        {wishlistItems.length > 0 && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700" aria-hidden="true">{wishlistItems.length}</span>
        )}
      </Link>

      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
        className={`flex items-center gap-2 rounded-full bg-purple-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 md:px-4 ${
          bump ? "scale-110" : "scale-100"
        }`}
        style={{ transition: "transform 200ms ease-out" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 6H6" /><circle cx="9" cy="21" r="1" /><circle cx="17" cy="21" r="1" /></svg>
        <span className="hidden md:inline">Cart</span>
        {itemCount > 0 && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-semibold text-purple-700" aria-hidden="true">{itemCount}</span>
        )}
      </button>
    </div>
  );
}
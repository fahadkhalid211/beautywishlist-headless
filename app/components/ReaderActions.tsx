"use client";

import Link from "next/link";
import { useCart } from "./cart/CartProvider";

export default function HeaderActions() {
  const { itemCount } = useCart();

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <Link href="/account" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-purple-50 hover:text-purple-700 md:flex">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        Account
      </Link>

      <Link href="#" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft transition hover:bg-purple-50 hover:text-purple-700 md:flex">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" /></svg>
        Wishlist
      </Link>

      <Link href="/cart" className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 6H6" /><circle cx="9" cy="21" r="1" /><circle cx="17" cy="21" r="1" /></svg>
        Cart
        {itemCount > 0 && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-semibold text-purple-700">{itemCount}</span>
        )}
      </Link>
    </div>
  );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/app/components/wishlist/WishlistProvider";
import { useCart } from "@/app/components/cart/CartProvider";
import { getFriendlyErrorMessage } from "@/lib/friendlyError";

export default function WishlistPage() {
  const { items, remove, hydrated } = useWishlist();
  const { addItem } = useCart();
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [addingId, setAddingId] = useState<number | null>(null);

  async function handleAddToCart(id: number, inStock: boolean | undefined) {
    setErrors((e) => ({ ...e, [id]: "" }));

    if (inStock === false) {
      setErrors((e) => ({ ...e, [id]: "This product is out of stock — try another one!" }));
      return;
    }

    setAddingId(id);
    try {
      await addItem(id);
    } catch (err: any) {
      setErrors((e) => ({ ...e, [id]: getFriendlyErrorMessage(err?.message, "cart") }));
    } finally {
      setAddingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
        <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink md:text-5xl">Your Wishlist</h1>

        {!hydrated && <p className="mt-10 text-sm text-ink-soft">Loading...</p>}

        {hydrated && items.length === 0 && (
          <div className="mt-10 flex flex-col items-center rounded-3xl border border-line bg-white px-8 py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-purple-50 text-purple-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" />
              </svg>
            </div>
            <p className="mt-5 font-display text-2xl italic text-ink">Your wishlist is empty</p>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link href="/shop" className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
              Start Shopping
            </Link>
          </div>
        )}

        {hydrated && items.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const minorUnit = item.currency_minor_unit ?? 2;
              const displayPrice = Number(item.price) / Math.pow(10, minorUnit);
              const outOfStock = item.is_in_stock === false;

              return (
                <div key={item.id} className="group relative">
                  <Link href={`/product/${item.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-purple-50">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-contain transition duration-500 group-hover:scale-105"
                        />
                      )}
                      {outOfStock && (
                        <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
                          Sold Out
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 line-clamp-2 text-sm font-medium text-ink">{item.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-purple-700">
                      {item.currency_prefix}{displayPrice.toLocaleString("en-PK")}
                    </p>
                  </Link>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item.id, item.is_in_stock)}
                      disabled={addingId === item.id}
                      className="flex-1 rounded-full bg-purple-600 py-2 text-xs font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addingId === item.id ? "Adding..." : outOfStock ? "Sold Out" : "Add to Cart"}
                    </button>
                    <button
                      type="button"
                      aria-label="Remove from wishlist"
                      onClick={() => remove(item.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition hover:border-rose-300 hover:text-rose-500"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {errors[item.id] && (
                    <p className="mt-1.5 rounded-lg bg-rose-50 px-2 py-1 text-[11px] text-rose-600">{errors[item.id]}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

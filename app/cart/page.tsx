"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartProvider";
import QuantitySelector from "@/app/components/QuantitySelector";

function formatMoney(amount: string | number | undefined, minorUnit: number, prefix = "") {
  if (amount === undefined) return "";
  const value = Number(amount) / Math.pow(10, minorUnit);
  return `${prefix}${value.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const { cart, updateItem, removeItem, updatingKey } = useCart();

  const loading = cart === null;
  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const minorUnit = totals?.currency_minor_unit ?? 2;
  const prefix = totals?.currency_prefix ?? "";

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
            <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
              Your Cart
            </h1>
          </div>
          {items.length > 0 && (
            <p className="hidden text-sm text-ink-soft md:block">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {loading && (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl border border-line bg-white" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center rounded-3xl border border-line bg-white px-8 py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-purple-50 text-purple-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
            </div>
            <p className="mt-5 font-display text-2xl italic text-ink">Your cart is empty</p>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              Discover our curated skincare and cosmetics edit and add your favorites here.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-3xl border border-line bg-white">
              {items.map((item: any) => {
                const image = item.images?.[0];
                const isUpdating = updatingKey === item.key;
                const qty = item.quantity?.value ?? item.quantity ?? 1;

                return (
                  <div
                    key={item.key}
                    className={`flex gap-4 border-b border-line p-4 last:border-0 sm:gap-5 sm:p-6 ${isUpdating ? "opacity-50" : ""}`}
                  >
                    <Link
                      href={`/product/${item.slug || ""}`}
                      className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-purple-50 sm:h-28 sm:w-24"
                    >
                      {image && (
                        <Image
                          src={image.src}
                          alt={image.alt || item.name}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug || ""}`}
                            className="line-clamp-2 text-sm font-medium text-ink hover:text-purple-700"
                          >
                            {item.name}
                          </Link>
                          {item.variation?.length > 0 && (
                            <p className="mt-1 text-xs text-ink-soft">
                              {item.variation.map((v: any) => v.value).join(" · ")}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeItem(item.key)}
                          disabled={isUpdating}
                          className="shrink-0 rounded-full p-2 text-ink-soft transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <QuantitySelector
                          quantity={qty}
                          onChange={(n) => {
                            if (n < 1) removeItem(item.key);
                            else updateItem(item.key, n);
                          }}
                          size="sm"
                        />
                        <span className="text-sm font-semibold text-purple-700">
                          {formatMoney(item.totals?.line_total, minorUnit, prefix)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl italic text-ink">Order Summary</h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatMoney(totals?.total_items, minorUnit, prefix)}</span>
                </div>
                {Number(totals?.total_discount) > 0 && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Discount</span>
                    <span className="text-rose-500">
                      −{formatMoney(totals?.total_discount, minorUnit, prefix)}
                    </span>
                  </div>
                )}
                {Number(totals?.total_shipping) > 0 && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Shipping</span>
                    <span className="text-ink">{formatMoney(totals?.total_shipping, minorUnit, prefix)}</span>
                  </div>
                )}
                {Number(totals?.total_tax) > 0 && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Tax</span>
                    <span className="text-ink">{formatMoney(totals?.total_tax, minorUnit, prefix)}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="font-display text-2xl italic text-purple-700">
                  {formatMoney(totals?.total_price, minorUnit, prefix)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-full bg-purple-600 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-purple-700"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="mt-3 block rounded-full border border-line px-6 py-3.5 text-center text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
              >
                Continue Shopping
              </Link>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" />
                </svg>
                Secure checkout &middot; SSL encrypted
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import QuantitySelector from "@/app/components/QuantitySelector";
import { decodeEntities } from "@/lib/decodeEntities";

function formatMoney(amount: string | number | undefined, minorUnit: number, prefix = "") {
  if (amount === undefined) return "";
  const value = Number(amount) / Math.pow(10, minorUnit);
  return `${prefix}${value.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, updateItem, removeItem, updatingKey } = useCart();

  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const minorUnit = totals?.currency_minor_unit ?? 2;
  const prefix = totals?.currency_prefix ?? "";

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-300 ${
        drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-ink/30" onClick={closeDrawer} />

      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="font-display text-xl italic text-ink">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-purple-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-purple-50 text-purple-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-ink-soft">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: any) => {
                const image = item.images?.[0];
                const isUpdating = updatingKey === item.key;
                const qty = item.quantity?.value ?? item.quantity ?? 1;
                const name = decodeEntities(item.name);

                return (
                  <div key={item.key} className={`flex gap-3 rounded-2xl border border-line bg-white p-3 ${isUpdating ? "opacity-50" : ""}`}>
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                      {image && <Image src={image.src} alt={image.alt || name} fill sizes="60px" className="object-contain" />}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-xs font-medium text-ink">{name}</p>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeItem(item.key)}
                          disabled={isUpdating}
                          className="shrink-0 text-ink-soft hover:text-rose-500"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <QuantitySelector
                          quantity={qty}
                          onChange={(n) => (n < 1 ? removeItem(item.key) : updateItem(item.key, n))}
                          size="sm"
                        />
                        <span className="text-xs font-semibold text-purple-700">
                          {formatMoney(item.totals?.line_total, minorUnit, prefix)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line bg-white px-5 py-4">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="text-ink">{formatMoney(totals?.total_items, minorUnit, prefix)}</span>
              </div>
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
            <div className="mb-4 flex items-center justify-between border-t border-line pt-3">
              <span className="text-sm font-medium text-ink">Total</span>
              <span className="font-display text-xl italic text-purple-700">
                {formatMoney(totals?.total_price, minorUnit, prefix)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block rounded-full bg-purple-600 px-6 py-3.5 text-center text-sm font-medium text-white transition hover:bg-purple-700"
            >
              Proceed to Checkout
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="mt-2 w-full rounded-full border border-line px-6 py-3 text-center text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
            >
              Continue Shopping
            </button>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="mt-3 block text-center text-xs font-medium text-purple-700 hover:underline"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

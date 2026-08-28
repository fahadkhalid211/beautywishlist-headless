"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cart", { cache: "no-store" })
      .then((res) => res.json())
      .then(setCart)
      .finally(() => setLoading(false));
  }, []);

  const items = cart?.items ?? [];

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-5xl italic tracking-tight text-ink">Cart</h1>

        <div className="mt-12">
          {loading && <p className="text-ink-soft">Loading...</p>}

          {!loading && items.length === 0 && (
            <div className="rounded-3xl border border-line bg-white p-12 text-center">
              <p className="text-ink-soft">Your cart is empty.</p>
              <Link href="/shop" className="mt-6 inline-block rounded-full bg-purple-600 px-7 py-3 text-sm font-medium text-white">
                Start Shopping
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-line bg-white">
              {items.map((item: any) => (
                <div key={item.key} className="flex items-center justify-between border-b border-line px-6 py-5 last:border-0">
                  <span className="text-sm font-medium text-ink">{item.name}</span>
                  <span className="text-sm text-ink-soft">Qty: {item.quantity?.value ?? item.quantity}</span>
                  <span className="text-sm font-semibold text-purple-700">
                    {item.totals?.line_total ? (Number(item.totals.line_total) / 100).toFixed(2) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
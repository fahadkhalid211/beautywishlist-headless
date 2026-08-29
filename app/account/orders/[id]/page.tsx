"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/components/account/AuthProvider";

type OrderDetail = {
  id: number;
  order_number: string;
  date: string;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  shipping_total: string;
  tax_total: string;
  payment_method: string;
  shipping_address: string;
  billing_address: string;
  customer_note: string;
  items: { name: string; quantity: number; total: string; thumbnail: string | null }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Payment",
  processing: "Processing",
  "on-hold": "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/account/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
        else setError(data.message || "Unable to load order");
      });
  }, [user, orderId]);

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-bg">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-ink-soft">Loading...</section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/account/orders" className="text-ink-soft hover:text-purple-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-3xl italic tracking-tight text-ink md:text-4xl">
            {order ? `Order #${order.order_number}` : "Order Details"}
          </h1>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">{error}</div>
        )}

        {!error && !order && <p className="text-sm text-ink-soft">Loading order...</p>}

        {order && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white px-6 py-4">
              <p className="text-sm text-ink-soft">
                Placed on {new Date(order.date).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            <div className="rounded-3xl border border-line bg-white p-6">
              <h2 className="font-display text-lg italic text-ink">Items</h2>
              <div className="mt-4 space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                      {item.thumbnail && <Image src={item.thumbnail} alt={item.name} fill sizes="60px" className="object-cover" />}
                    </div>
                    <p className="flex-1 text-sm font-medium text-ink">{item.name} × {item.quantity}</p>
                    <span className="text-sm font-semibold text-purple-700">
                      {order.currency} {Number(item.total).toLocaleString("en-PK")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="text-ink">{order.currency} {Number(order.subtotal).toLocaleString("en-PK")}</span>
                </div>
                {Number(order.shipping_total) > 0 && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Shipping</span>
                    <span className="text-ink">{order.currency} {Number(order.shipping_total).toLocaleString("en-PK")}</span>
                  </div>
                )}
                {Number(order.tax_total) > 0 && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Tax</span>
                    <span className="text-ink">{order.currency} {Number(order.tax_total).toLocaleString("en-PK")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-line pt-2">
                  <span className="font-medium text-ink">Total</span>
                  <span className="font-display text-lg italic text-purple-700">
                    {order.currency} {Number(order.total).toLocaleString("en-PK")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-line bg-white p-6">
                <h2 className="font-display text-lg italic text-ink">Shipping Address</h2>
                <div
                  className="mt-3 text-sm leading-6 text-ink-soft"
                  dangerouslySetInnerHTML={{ __html: order.shipping_address }}
                />
              </div>
              <div className="rounded-3xl border border-line bg-white p-6">
                <h2 className="font-display text-lg italic text-ink">Payment Method</h2>
                <p className="mt-3 text-sm text-ink-soft">{order.payment_method}</p>
              </div>
            </div>

            {order.customer_note && (
              <div className="rounded-3xl border border-line bg-white p-6">
                <h2 className="font-display text-lg italic text-ink">Order Note</h2>
                <p className="mt-3 text-sm text-ink-soft">{order.customer_note}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

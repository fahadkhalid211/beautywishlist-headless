"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/account/AuthProvider";

type OrderSummary = {
  id: number;
  order_number: string;
  date: string;
  status: string;
  total: string;
  currency: string;
  item_count: number;
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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-purple-50 text-purple-700",
  "on-hold": "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-600",
  refunded: "bg-rose-50 text-rose-600",
  failed: "bg-rose-50 text-rose-600",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []));
  }, [user]);

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
          <Link href="/account" className="text-ink-soft hover:text-purple-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="font-display text-4xl italic tracking-tight text-ink md:text-5xl">Order History</h1>
        </div>

        {orders === null && <p className="text-sm text-ink-soft">Loading your orders...</p>}

        {orders !== null && orders.length === 0 && (
          <div className="rounded-3xl border border-line bg-white p-12 text-center">
            <p className="text-ink-soft">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-purple-600 px-7 py-3 text-sm font-medium text-white">
              Start Shopping
            </Link>
          </div>
        )}

        {orders !== null && orders.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-line bg-white">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-4 border-b border-line px-6 py-5 transition last:border-0 hover:bg-purple-50/40"
              >
                <div>
                  <p className="text-sm font-medium text-ink">Order #{order.order_number}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {new Date(order.date).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
                    {" · "}
                    {order.item_count} {order.item_count === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || "bg-purple-50 text-purple-700"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <span className="text-sm font-semibold text-purple-700">
                    {order.currency} {Number(order.total).toLocaleString("en-PK")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

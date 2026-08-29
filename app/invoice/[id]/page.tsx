"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type InvoiceOrder = {
  id: number;
  order_number: string;
  order_key: string;
  date: string;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  shipping_total: string;
  shipping_method: string;
  discount_total: string;
  tax_total: string;
  tax_lines: { label: string; amount: string }[];
  fee_lines: { name: string; total: string }[];
  payment_method: string;
  billing_address: string;
  shipping_address: string;
  billing_email: string;
  billing_phone: string;
  customer_note: string;
  items: { name: string; sku: string; quantity: number; unit_price: number; total: string; thumbnail: string | null }[];
  store: { name: string; address: string; email: string };
};

function money(amount: string | number | undefined, currency: string) {
  if (amount === undefined) return "";
  return `${currency} ${Number(amount).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Payment",
  processing: "Processing",
  "on-hold": "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const key = searchParams.get("key") || "";

  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invoice/${orderId}?key=${encodeURIComponent(key)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
        else setError(data.message || "Unable to load this invoice.");
      })
      .catch(() => setError("Unable to load this invoice."));
  }, [orderId, key]);

  if (error) {
    return (
      <main className="min-h-screen bg-bg">
        <section className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="font-display text-2xl italic text-ink">Invoice unavailable</p>
          <p className="mt-3 text-sm text-ink-soft">{error}</p>
          <Link href="/" className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white">
            Back to Home
          </Link>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-bg">
        <section className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-ink-soft">Loading invoice...</section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg print:bg-white">
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Invoice</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
            </svg>
            Print
          </button>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 md:p-10 print:rounded-none print:border-0 print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
            <div>
              <h1 className="font-display text-2xl italic text-ink md:text-3xl">{order.store.name}</h1>
              {order.store.address && <p className="mt-1 text-xs text-ink-soft">{order.store.address}</p>}
              {order.store.email && <p className="text-xs text-ink-soft">{order.store.email}</p>}
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-ink">Invoice #{order.order_number}</p>
              <p className="mt-1 text-xs text-ink-soft">
                {new Date(order.date).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <span className="mt-2 inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Billed To</p>
              <div className="mt-2 text-sm leading-6 text-ink" dangerouslySetInnerHTML={{ __html: order.billing_address }} />
              {order.billing_email && <p className="mt-1 text-sm text-ink-soft">{order.billing_email}</p>}
              {order.billing_phone && <p className="text-sm text-ink-soft">{order.billing_phone}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Shipped To</p>
              <div className="mt-2 text-sm leading-6 text-ink" dangerouslySetInnerHTML={{ __html: order.shipping_address }} />
              {order.shipping_method && <p className="mt-1 text-sm text-ink-soft">Method: {order.shipping_method}</p>}
            </div>
          </div>

          <div className="py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 text-center font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Unit Price</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-line/60">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {item.thumbnail && (
                          <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-purple-50 print:hidden">
                            <Image src={item.thumbnail} alt={item.name} fill sizes="48px" className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-ink">{item.name}</p>
                          {item.sku && <p className="text-xs text-ink-soft">SKU: {item.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center text-ink-soft">{item.quantity}</td>
                    <td className="py-3 text-right text-ink-soft">{money(item.unit_price, order.currency)}</td>
                    <td className="py-3 text-right font-medium text-ink">{money(item.total, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ml-auto mt-4 w-full max-w-xs space-y-2 text-sm">
              <div className="flex items-center justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="text-ink">{money(order.subtotal, order.currency)}</span>
              </div>
              {Number(order.discount_total) > 0 && (
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Discount</span>
                  <span className="text-rose-500">−{money(order.discount_total, order.currency)}</span>
                </div>
              )}
              {order.fee_lines.map((fee, i) => (
                <div key={i} className="flex items-center justify-between text-ink-soft">
                  <span>{fee.name}</span>
                  <span className="text-ink">{money(fee.total, order.currency)}</span>
                </div>
              ))}
              {Number(order.shipping_total) > 0 && (
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Shipping</span>
                  <span className="text-ink">{money(order.shipping_total, order.currency)}</span>
                </div>
              )}
              {order.tax_lines.length > 0
                ? order.tax_lines.map((tax, i) => (
                    <div key={i} className="flex items-center justify-between text-ink-soft">
                      <span>{tax.label}</span>
                      <span className="text-ink">{money(tax.amount, order.currency)}</span>
                    </div>
                  ))
                : Number(order.tax_total) > 0 && (
                    <div className="flex items-center justify-between text-ink-soft">
                      <span>Tax</span>
                      <span className="text-ink">{money(order.tax_total, order.currency)}</span>
                    </div>
                  )}
              <div className="flex items-center justify-between border-t border-line pt-2 text-base">
                <span className="font-medium text-ink">Total</span>
                <span className="font-display text-lg italic text-purple-700">{money(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Payment Method</p>
            <p className="mt-1 text-sm text-ink-soft">{order.payment_method}</p>
          </div>

          {order.customer_note && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Order Note</p>
              <p className="mt-1 text-sm text-ink-soft">{order.customer_note}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center print:hidden">
          <Link href="/shop" className="text-sm text-purple-700 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartProvider";

function formatMoney(amount: string | number | undefined, minorUnit: number, prefix = "") {
  if (amount === undefined) return "";
  const value = Number(amount) / Math.pow(10, minorUnit);
  return `${prefix}${value.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

type Address = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

type BillingAddress = Address & { email: string; phone: string };

const emptyAddress: Address = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "PK",
};

const emptyBilling: BillingAddress = { ...emptyAddress, email: "", phone: "" };

export default function CheckoutPage() {
  const { cart, setCartData, clearCart } = useCart();

  const [billing, setBilling] = useState<BillingAddress>(emptyBilling);
  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [shipping, setShipping] = useState<Address>(emptyAddress);
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bacs">("cod");

  const [addressStep, setAddressStep] = useState<"editing" | "confirmed">("editing");
  const [savingAddress, setSavingAddress] = useState(false);
  const [selectingRate, setSelectingRate] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  const loading = cart === null;
  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const minorUnit = totals?.currency_minor_unit ?? 2;
  const prefix = totals?.currency_prefix ?? "";
  const needsShipping = cart?.needs_shipping ?? false;
  const ratePackage = cart?.shipping_rates?.[0];
  const rates: any[] = ratePackage?.shipping_rates ?? [];
  const selectedRate = rates.find((r) => r.selected);

  useEffect(() => {
    if (rates.length > 0 && !selectedRate) {
      handleSelectRate(rates[0].rate_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.length]);

  function updateBilling(field: keyof BillingAddress, value: string) {
    setBilling((b) => ({ ...b, [field]: value }));
  }

  function updateShipping(field: keyof Address, value: string) {
    setShipping((s) => ({ ...s, [field]: value }));
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingAddress(true);
    try {
      const shipping_address = shipToDifferent
        ? shipping
        : {
            first_name: billing.first_name,
            last_name: billing.last_name,
            address_1: billing.address_1,
            address_2: billing.address_2,
            city: billing.city,
            state: billing.state,
            postcode: billing.postcode,
            country: billing.country,
          };

      const response = await fetch("/api/cart/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing_address: billing, shipping_address }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save address");
      }
      setCartData(data);
      setAddressStep("confirmed");
    } catch (err: any) {
      setError(err.message || "Unable to save address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSelectRate(rateId: string) {
    setSelectingRate(true);
    setError(null);
    try {
      const response = await fetch("/api/cart/shipping-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: 0, rate_id: rateId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to select shipping method");
      }
      setCartData(data);
    } catch (err: any) {
      setError(err.message || "Unable to select shipping method");
    } finally {
      setSelectingRate(false);
    }
  }

  async function handlePlaceOrder() {
    setError(null);
    setPlacingOrder(true);
    try {
      const shipping_address = shipToDifferent
        ? shipping
        : {
            first_name: billing.first_name,
            last_name: billing.last_name,
            address_1: billing.address_1,
            address_2: billing.address_2,
            city: billing.city,
            state: billing.state,
            postcode: billing.postcode,
            country: billing.country,
          };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: billing,
          shipping_address,
          payment_method: paymentMethod,
          customer_note: customerNote,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to place order. Please check your details and try again.");
      }
      setOrderResult(data);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  }

  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;

  if (orderResult) {
    return (
      <main className="min-h-screen bg-bg">
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-purple-50 text-purple-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-purple-600">Order Confirmed</p>
          <h1 className="mt-3 font-display text-4xl italic tracking-tight text-ink">Thank you!</h1>
          <p className="mt-4 text-sm leading-6 text-ink-soft">
            Your order <span className="font-semibold text-ink">#{orderResult.order_number || orderResult.order_id}</span> has been placed successfully.
            {paymentMethod === "cod"
              ? " Please keep the amount ready for cash on delivery."
              : " Bank transfer details have been sent to your email — your order will be processed once payment is received."}
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/shop" className="rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
              Continue Shopping
            </Link>
            {wpUrl && orderResult.order_id && orderResult.order_key && (
              <a
                href={`${wpUrl}/checkout/order-received/${orderResult.order_id}/?key=${orderResult.order_key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-8 py-3.5 text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
              >
                View Order Details
              </a>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
        <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink md:text-5xl">Checkout</h1>

        {loading && <p className="mt-10 text-sm text-ink-soft">Loading your cart...</p>}

        {!loading && items.length === 0 && !orderResult && (
          <div className="mt-10 rounded-3xl border border-line bg-white p-12 text-center">
            <p className="text-ink-soft">Your cart is empty.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-purple-600 px-7 py-3 text-sm font-medium text-white">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              {/* Delivery details */}
              <form onSubmit={handleContinue} className="rounded-3xl border border-line bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl italic text-ink">Delivery Details</h2>
                  {addressStep === "confirmed" && (
                    <button
                      type="button"
                      onClick={() => setAddressStep("editing")}
                      className="text-xs font-medium text-purple-700 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {addressStep === "editing" ? (
                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First name" value={billing.first_name} onChange={(v) => updateBilling("first_name", v)} required />
                      <Field label="Last name" value={billing.last_name} onChange={(v) => updateBilling("last_name", v)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Email" type="email" value={billing.email} onChange={(v) => updateBilling("email", v)} required />
                      <Field label="Phone" type="tel" value={billing.phone} onChange={(v) => updateBilling("phone", v)} required />
                    </div>
                    <Field label="Address line 1" value={billing.address_1} onChange={(v) => updateBilling("address_1", v)} required />
                    <Field label="Address line 2 (optional)" value={billing.address_2} onChange={(v) => updateBilling("address_2", v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" value={billing.city} onChange={(v) => updateBilling("city", v)} required />
                      <Field label="Province / State" value={billing.state} onChange={(v) => updateBilling("state", v)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Postcode" value={billing.postcode} onChange={(v) => updateBilling("postcode", v)} required />
                      <Field label="Country code" value={billing.country} onChange={(v) => updateBilling("country", v.toUpperCase())} required />
                    </div>

                    <label className="flex items-center gap-2 pt-1 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={shipToDifferent}
                        onChange={(e) => setShipToDifferent(e.target.checked)}
                        className="h-4 w-4 rounded border-line text-purple-600 focus:ring-purple-400"
                      />
                      Ship to a different address
                    </label>

                    {shipToDifferent && (
                      <div className="space-y-4 rounded-2xl border border-line p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="First name" value={shipping.first_name} onChange={(v) => updateShipping("first_name", v)} required />
                          <Field label="Last name" value={shipping.last_name} onChange={(v) => updateShipping("last_name", v)} required />
                        </div>
                        <Field label="Address line 1" value={shipping.address_1} onChange={(v) => updateShipping("address_1", v)} required />
                        <Field label="Address line 2 (optional)" value={shipping.address_2} onChange={(v) => updateShipping("address_2", v)} />
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="City" value={shipping.city} onChange={(v) => updateShipping("city", v)} required />
                          <Field label="Province / State" value={shipping.state} onChange={(v) => updateShipping("state", v)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Postcode" value={shipping.postcode} onChange={(v) => updateShipping("postcode", v)} required />
                          <Field label="Country code" value={shipping.country} onChange={(v) => updateShipping("country", v.toUpperCase())} required />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="mt-2 w-full rounded-full bg-purple-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      {savingAddress ? "Saving..." : "Continue"}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-ink-soft">
                    <p className="text-ink">{billing.first_name} {billing.last_name}</p>
                    <p>{billing.address_1}{billing.address_2 ? `, ${billing.address_2}` : ""}</p>
                    <p>{billing.city}, {billing.state} {billing.postcode}</p>
                    <p>{billing.email} &middot; {billing.phone}</p>
                  </div>
                )}
              </form>

              {/* Shipping method */}
              {addressStep === "confirmed" && needsShipping && (
                <div className="rounded-3xl border border-line bg-white p-6">
                  <h2 className="font-display text-xl italic text-ink">Shipping Method</h2>
                  {rates.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">No shipping methods available for this address.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {rates.map((rate) => (
                        <label
                          key={rate.rate_id}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                            rate.selected ? "border-purple-400 bg-purple-50" : "border-line"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping_rate"
                              checked={rate.selected}
                              onChange={() => handleSelectRate(rate.rate_id)}
                              disabled={selectingRate}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-400"
                            />
                            <span className="text-ink">{rate.name}</span>
                          </span>
                          <span className="font-medium text-ink">
                            {Number(rate.price) === 0 ? "Free" : formatMoney(rate.price, minorUnit, prefix)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payment method */}
              {addressStep === "confirmed" && (
                <div className="rounded-3xl border border-line bg-white p-6">
                  <h2 className="font-display text-xl italic text-ink">Payment Method</h2>
                  <div className="mt-4 space-y-3">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                        paymentMethod === "cod" ? "border-purple-400 bg-purple-50" : "border-line"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-400"
                      />
                      <span className="text-ink">Cash on Delivery</span>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                        paymentMethod === "bacs" ? "border-purple-400 bg-purple-50" : "border-line"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "bacs"}
                        onChange={() => setPaymentMethod("bacs")}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-400"
                      />
                      <span className="text-ink">Direct Bank Transfer</span>
                    </label>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-xs font-medium text-ink-soft">Order note (optional)</label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-line px-4 py-3 text-sm text-ink outline-none focus:border-purple-400"
                      placeholder="Notes about your order, e.g. special delivery instructions"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <aside className="h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl italic text-ink">Order Summary</h2>

              <div className="mt-5 space-y-4">
                {items.map((item: any) => {
                  const image = item.images?.[0];
                  const qty = item.quantity?.value ?? item.quantity ?? 1;
                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                        {image && (
                          <Image src={image.src} alt={image.alt || item.name} fill sizes="60px" className="object-cover" />
                        )}
                        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-medium text-white">
                          {qty}
                        </span>
                      </div>
                      <p className="line-clamp-2 flex-1 text-xs font-medium text-ink">{item.name}</p>
                      <span className="text-xs font-semibold text-purple-700">
                        {formatMoney(item.totals?.line_total, minorUnit, prefix)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex items-center justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="text-ink">{formatMoney(totals?.total_items, minorUnit, prefix)}</span>
                </div>
                {needsShipping && (
                  <div className="flex items-center justify-between text-ink-soft">
                    <span>Shipping</span>
                    <span className="text-ink">
                      {selectedRate
                        ? Number(selectedRate.price) === 0
                          ? "Free"
                          : formatMoney(selectedRate.price, minorUnit, prefix)
                        : "—"}
                    </span>
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

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={addressStep !== "confirmed" || placingOrder || (needsShipping && rates.length > 0 && !selectedRate)}
                className="mt-6 w-full rounded-full bg-purple-600 px-6 py-4 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>

              <p className="mt-4 text-center text-xs text-ink-soft">
                By placing your order, you agree to our terms of service.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-purple-400"
      />
    </div>
  );
}

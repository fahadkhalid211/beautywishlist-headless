"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/components/cart/CartProvider";
import FreeShippingProgress from "@/app/components/FreeShippingProgress";

function formatMoney(amount: string | number | undefined, minorUnit: number, prefix = "") {
  if (amount === undefined) return "";
  const value = Number(amount) / Math.pow(10, minorUnit);
  return `${prefix}${value.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

type ContactAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

const emptyAddress: ContactAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "PK",
  email: "",
  phone: "",
};

type BankAccount = {
  account_name: string;
  account_number: string;
  bank_name: string;
  sort_code: string;
  iban: string;
  bic: string;
};

type PaymentMethod = {
  id: "cod" | "bacs";
  title: string;
  description: string;
  fee: number;
  instructions?: string;
  accounts?: BankAccount[];
};

const FALLBACK_METHODS: PaymentMethod[] = [
  { id: "cod", title: "Cash on Delivery", description: "", fee: 0 },
  { id: "bacs", title: "Direct Bank Transfer", description: "", fee: 0 },
];

export default function CheckoutPage() {
  const { cart, setCartData, clearCart } = useCart();

  const [address, setAddress] = useState<ContactAddress>(emptyAddress);
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bacs">("cod");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(FALLBACK_METHODS);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<{
    items: any[];
    totals: any;
    address: ContactAddress;
    paymentMethod: string;
    paymentMethodTitle: string;
    paymentFee: number;
    freeShipping: boolean;
  } | null>(null);

  const loading = cart === null;
  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const minorUnit = totals?.currency_minor_unit ?? 2;
  const prefix = totals?.currency_prefix ?? "";
  const needsShipping = cart?.needs_shipping ?? false;
  const ratePackage = cart?.shipping_rates?.[0];
  const rates: any[] = ratePackage?.shipping_rates ?? [];
  const selectedRate = rates.find((r) => r.selected);
  const canPlaceOrder = step === 2 && (!needsShipping || rates.length === 0 || !!selectedRate);
  const subtotalValue = totals ? Number(totals.total_items) / Math.pow(10, minorUnit) : 0;
  const freeShippingReached = freeShippingThreshold !== null && subtotalValue >= freeShippingThreshold;
  const selectedPaymentFee = step === 2 && !freeShippingReached ? paymentMethods.find((m) => m.id === paymentMethod)?.fee ?? 0 : 0;
  const displayTotal = Number(totals?.total_price ?? 0) + selectedPaymentFee * Math.pow(10, minorUnit);

  useEffect(() => {
    fetch("/api/free-shipping-threshold")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && typeof data.threshold === "number") {
          setFreeShippingThreshold(data.threshold);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.methods) && data.methods.length > 0) {
          setPaymentMethods(data.methods);
        }
      })
      .catch(() => {});
  }, []);

  function updateAddress(field: keyof ContactAddress, value: string) {
    setAddress((a) => ({ ...a, [field]: value }));
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingAddress(true);
    try {
      // Same address is used for both billing and shipping. Phone is included
      // on both objects since WooCommerce may require it on shipping too.
      const response = await fetch("/api/cart/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: address,
          shipping_address: address,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save address");
      }
      setCartData(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Unable to save address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSelectRate(rateId: string) {
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
    }
  }

  useEffect(() => {
    if (step === 2 && rates.length > 0 && !selectedRate) {
      handleSelectRate(rates[0].rate_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, rates.length]);

  async function handlePlaceOrder() {
    setError(null);
    setPlacingOrder(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: address,
          shipping_address: address,
          payment_method: paymentMethod,
          customer_note: customerNote,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to place order. Please check your details and try again.");
      }

      // Snapshot everything needed for the thank-you page before the cart clears.
      setOrderSnapshot({
        items,
        totals,
        address,
        paymentMethod,
        paymentMethodTitle: paymentMethods.find((m) => m.id === paymentMethod)?.title || paymentMethod,
        paymentFee: selectedPaymentFee,
        freeShipping: freeShippingReached,
      });
      setOrderResult(data);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (orderResult && orderSnapshot) {
    const snapTotals = orderSnapshot.totals;
    const snapMinorUnit = snapTotals?.currency_minor_unit ?? 2;
    const snapPrefix = snapTotals?.currency_prefix ?? "";

    return (
      <main className="min-h-screen bg-bg">
        <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-purple-50 text-purple-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-purple-600">Order Confirmed</p>
            <h1 className="mt-3 font-display text-4xl italic tracking-tight text-ink md:text-5xl">Thank you!</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-soft">
              Your order <span className="font-semibold text-ink">#{orderResult.order_number || orderResult.order_id}</span> has been placed successfully.
              {orderSnapshot.paymentMethod === "cod"
                ? " Please keep the amount ready for cash on delivery."
                : " Bank transfer details have been sent to your email — your order will be processed once payment is received."}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-white p-6">
              <h2 className="font-display text-lg italic text-ink">Shipping Details</h2>
              <div className="mt-3 space-y-1 text-sm text-ink-soft">
                <p className="text-ink">{orderSnapshot.address.first_name} {orderSnapshot.address.last_name}</p>
                <p>{orderSnapshot.address.address_1}{orderSnapshot.address.address_2 ? `, ${orderSnapshot.address.address_2}` : ""}</p>
                <p>{orderSnapshot.address.city}, {orderSnapshot.address.state} {orderSnapshot.address.postcode}</p>
                <p>{orderSnapshot.address.email} &middot; {orderSnapshot.address.phone}</p>
                <p className="pt-2 text-ink">
                  Shipping: {orderSnapshot.freeShipping ? "Free" : orderSnapshot.paymentFee > 0 ? formatMoney(orderSnapshot.paymentFee, 0, snapPrefix) : "Free"}
                </p>
                <p className="text-ink">
                  Payment: {orderSnapshot.paymentMethodTitle}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-white p-6">
              <h2 className="font-display text-lg italic text-ink">Order Summary</h2>
              <div className="mt-3 space-y-3">
                {orderSnapshot.items.map((item: any) => {
                  const image = item.images?.[0];
                  const qty = item.quantity?.value ?? item.quantity ?? 1;
                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-purple-50">
                        {image && <Image src={image.src} alt={image.alt || item.name} fill sizes="50px" className="object-cover" />}
                      </div>
                      <p className="line-clamp-1 flex-1 text-xs font-medium text-ink">{item.name} × {qty}</p>
                      <span className="text-xs font-semibold text-purple-700">
                        {formatMoney(item.totals?.line_total, snapMinorUnit, snapPrefix)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="font-display text-xl italic text-purple-700">
                  {formatMoney(
                    Number(snapTotals?.total_price ?? 0) + orderSnapshot.paymentFee * Math.pow(10, snapMinorUnit),
                    snapMinorUnit,
                    snapPrefix
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/shop" className="rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
              Continue Shopping
            </Link>
            {orderResult.order_id && orderResult.order_key && (
              <Link
                href={`/invoice/${orderResult.order_id}?key=${orderResult.order_key}`}
                className="rounded-full border border-line px-8 py-3.5 text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
              >
                View Full Invoice
              </Link>
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

        {!loading && items.length > 0 && (
          <div className="mt-8 flex items-center gap-4">
            <StepBadge number={1} label="Delivery Details" active={step === 1} done={step > 1} />
            <div className={`h-px w-10 ${step > 1 ? "bg-purple-400" : "bg-line"}`} />
            <StepBadge number={2} label="Payment" active={step === 2} done={false} />
          </div>
        )}

        {loading && <p className="mt-10 text-sm text-ink-soft">Loading your cart...</p>}

        {!loading && items.length === 0 && (
          <div className="mt-10 rounded-3xl border border-line bg-white p-12 text-center">
            <p className="text-ink-soft">Your cart is empty.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-purple-600 px-7 py-3 text-sm font-medium text-white">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-6">
            <FreeShippingProgress />
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleContinue} className="rounded-3xl border border-line bg-white p-6">
                  <h2 className="font-display text-xl italic text-ink">Delivery Details</h2>
                  <p className="mt-1 text-xs text-ink-soft">Used for both billing and shipping.</p>

                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First name" value={address.first_name} onChange={(v) => updateAddress("first_name", v)} required />
                      <Field label="Last name" value={address.last_name} onChange={(v) => updateAddress("last_name", v)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Email" type="email" value={address.email} onChange={(v) => updateAddress("email", v)} required />
                      <Field label="Phone" type="tel" value={address.phone} onChange={(v) => updateAddress("phone", v)} required />
                    </div>
                    <Field label="Address line 1" value={address.address_1} onChange={(v) => updateAddress("address_1", v)} required />
                    <Field label="Address line 2 (optional)" value={address.address_2} onChange={(v) => updateAddress("address_2", v)} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="City" value={address.city} onChange={(v) => updateAddress("city", v)} required />
                      <Field label="Province / State" value={address.state} onChange={(v) => updateAddress("state", v)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Postcode" value={address.postcode} onChange={(v) => updateAddress("postcode", v)} required />
                      <Field label="Country code" value={address.country} onChange={(v) => updateAddress("country", v.toUpperCase())} required />
                    </div>

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="mt-2 w-full rounded-full bg-purple-600 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      {savingAddress ? "Saving..." : "Continue to Payment"}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <>
                  <div className="rounded-3xl border border-line bg-white p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl italic text-ink">Delivery Details</h2>
                      <button type="button" onClick={() => setStep(1)} className="text-xs font-medium text-purple-700 hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-ink-soft">
                      <p className="text-ink">{address.first_name} {address.last_name}</p>
                      <p>{address.address_1}{address.address_2 ? `, ${address.address_2}` : ""}</p>
                      <p>{address.city}, {address.state} {address.postcode}</p>
                      <p>{address.email} &middot; {address.phone}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-line bg-white p-6">
                    <h2 className="font-display text-xl italic text-ink">Payment Method</h2>
                    <div className="mt-4 space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                            paymentMethod === method.id ? "border-purple-400 bg-purple-50" : "border-line"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment_method"
                              checked={paymentMethod === method.id}
                              onChange={() => setPaymentMethod(method.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-400"
                            />
                            <span className="text-ink">{method.title}</span>
                          </span>
                          {method.fee > 0 && (
                            <span className="text-xs text-ink-soft">
                              {freeShippingReached ? "Free shipping applied" : `+${formatMoney(method.fee, 0, prefix)} delivery`}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>

                    {paymentMethod === "bacs" && (() => {
                      const bacs = paymentMethods.find((m) => m.id === "bacs");
                      if (!bacs) return null;
                      return (
                        <div className="mt-4 space-y-4 rounded-2xl border border-line bg-purple-50/40 p-4">
                          {bacs.description && (
                            <p className="text-sm text-ink-soft">{bacs.description}</p>
                          )}
                          {bacs.instructions && (
                            <p className="text-sm text-ink-soft">{bacs.instructions}</p>
                          )}
                          {bacs.accounts && bacs.accounts.length > 0 && (
                            <div className="space-y-3">
                              {bacs.accounts.map((acc, i) => (
                                <div key={i} className="rounded-xl bg-white p-3 text-sm">
                                  {acc.bank_name && <p className="font-medium text-ink">{acc.bank_name}</p>}
                                  {acc.account_name && <p className="text-ink-soft">Account Name: {acc.account_name}</p>}
                                  {acc.account_number && <p className="text-ink-soft">Account Number: {acc.account_number}</p>}
                                  {acc.iban && <p className="text-ink-soft">IBAN: {acc.iban}</p>}
                                  {acc.sort_code && <p className="text-ink-soft">Sort Code: {acc.sort_code}</p>}
                                  {acc.bic && <p className="text-ink-soft">BIC/SWIFT: {acc.bic}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

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
                </>
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
                      <div className="relative h-14 w-12 shrink-0">
                        <div className="absolute inset-0 overflow-hidden rounded-xl bg-purple-50">
                          {image && (
                            <Image src={image.src} alt={image.alt || item.name} fill sizes="60px" className="object-contain" />
                          )}
                        </div>
                        <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-medium text-white">
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
                      {step < 2
                        ? "—"
                        : freeShippingReached
                        ? "Free"
                        : selectedPaymentFee > 0
                        ? formatMoney(selectedPaymentFee, 0, prefix)
                        : "Free"}
                    </span>
                  </div>
                )}
                {(totals?.tax_lines ?? []).length > 0
                  ? (totals.tax_lines as any[]).map((line: any) => (
                      <div key={line.name} className="flex items-center justify-between text-ink-soft">
                        <span>{line.name}</span>
                        <span className="text-ink">{formatMoney(line.price, minorUnit, prefix)}</span>
                      </div>
                    ))
                  : Number(totals?.total_tax) > 0 && (
                      <div className="flex items-center justify-between text-ink-soft">
                        <span>Tax</span>
                        <span className="text-ink">{formatMoney(totals?.total_tax, minorUnit, prefix)}</span>
                      </div>
                    )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="font-display text-2xl italic text-purple-700">
                  {formatMoney(displayTotal, minorUnit, prefix)}
                </span>
              </div>

              {step === 2 ? (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder || placingOrder}
                  className="mt-6 w-full rounded-full bg-purple-600 px-6 py-4 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              ) : (
                <p className="mt-6 rounded-2xl bg-purple-50 px-4 py-3 text-center text-xs text-purple-700">
                  Complete delivery details to continue to payment
                </p>
              )}

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

function StepBadge({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-medium ${
          done ? "bg-purple-600 text-white" : active ? "bg-purple-100 text-purple-700 ring-2 ring-purple-400" : "bg-purple-50 text-ink-soft"
        }`}
      >
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          number
        )}
      </span>
      <span className={`text-sm font-medium ${active ? "text-ink" : "text-ink-soft"}`}>{label}</span>
    </div>
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

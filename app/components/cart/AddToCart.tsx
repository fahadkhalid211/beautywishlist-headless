"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import QuantitySelector from "@/app/components/QuantitySelector";
import { getFriendlyErrorMessage } from "@/lib/friendlyError";

export default function AddToCart({
  productId,
  inStock = true,
  maxQuantity,
  compact = false,
  showBuyNow = true,
}: {
  productId: number;
  inStock?: boolean;
  maxQuantity?: number;
  compact?: boolean;
  showBuyNow?: boolean;
}) {
  const router = useRouter();
  const { addItem, closeDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (status === "loading" || isBuyingNow) return;

    if (!inStock) {
      setError("This product is out of stock — try another one!");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      await addItem(productId, quantity);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err: any) {
      setStatus("idle");
      setError(getFriendlyErrorMessage(err?.message, "cart"));
      setTimeout(() => setError(null), 4000);
    }
  }

  async function handleBuyNow(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (status === "loading" || isBuyingNow) return;

    if (!inStock) {
      setError("This product is out of stock — try another one!");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setIsBuyingNow(true);
    setError(null);
    try {
      await addItem(productId, quantity, false);
      closeDrawer();
      router.push("/checkout");
    } catch (err: any) {
      setIsBuyingNow(false);
      setError(getFriendlyErrorMessage(err?.message, "cart"));
      setTimeout(() => setError(null), 4000);
    }
  }

  if (compact) {
    return (
      <div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
            size="sm"
            max={maxQuantity}
            className="w-full justify-between sm:w-fit sm:justify-center"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={status === "loading"}
            className={`w-full rounded-full bg-purple-600 py-2 text-xs font-medium text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-ink/40 sm:flex-1 ${
              status === "done" ? "scale-105 bg-emerald-500 hover:bg-emerald-500" : ""
            } ${!inStock ? "bg-ink/50 hover:bg-ink/50" : ""}`}
          >
            {status === "loading" ? "Adding..." : status === "done" ? "Added ✓" : !inStock ? "Sold Out" : "Add to Cart"}
          </button>
        </div>
        {error && <p className="mt-1.5 rounded-lg bg-rose-50 px-2 py-1 text-[11px] text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-ink">Quantity</p>
        <QuantitySelector quantity={quantity} onChange={setQuantity} max={maxQuantity} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={status === "loading" || isBuyingNow}
          className={`w-full rounded-full border-2 border-purple-600 bg-white px-6 py-4 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 ${
            status === "done" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : ""
          } ${!inStock ? "cursor-not-allowed border-ink/20 text-ink/40 hover:bg-white" : ""}`}
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin text-purple-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding...
            </span>
          ) : status === "done" ? (
            "Added to cart ✓"
          ) : !inStock ? (
            "Sold Out"
          ) : (
            "Add to Cart"
          )}
        </button>

        {/* Buy Now Button */}
        {showBuyNow && (
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={status === "loading" || isBuyingNow || !inStock}
            className={`w-full rounded-full bg-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-900/25 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 ${
              !inStock ? "bg-ink/50 hover:bg-ink/50" : ""
            }`}
          >
            {isBuyingNow ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting...
              </span>
            ) : !inStock ? (
              "Sold Out"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy Now
              </span>
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-2.5 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

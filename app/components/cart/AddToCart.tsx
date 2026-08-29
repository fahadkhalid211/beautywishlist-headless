"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import QuantitySelector from "@/app/components/QuantitySelector";
import { getFriendlyErrorMessage } from "@/lib/friendlyError";

export default function AddToCart({
  productId,
  inStock = true,
  maxQuantity,
  compact = false,
}: {
  productId: number;
  inStock?: boolean;
  maxQuantity?: number;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (status === "loading") return;

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
    <div>
      <div className="mb-4">
        <p className="mb-3 text-sm font-medium text-ink">Quantity</p>
        <QuantitySelector quantity={quantity} onChange={setQuantity} max={maxQuantity} />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={status === "loading"}
        className={`w-full rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50 ${
          status === "done" ? "scale-[1.02] bg-emerald-500 hover:bg-emerald-500" : ""
        } ${!inStock ? "bg-ink/50 hover:bg-ink/50" : ""}`}
      >
        {status === "loading" ? "Adding..." : status === "done" ? "Added to cart ✓" : !inStock ? "Sold Out" : "Add to Cart"}
      </button>
      {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

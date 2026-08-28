"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import QuantitySelector from "@/app/components/QuantitySelector";

export default function AddToCart({
  productId,
  inStock = true,
  compact = false,
}: {
  productId: number;
  inStock?: boolean;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function handleAdd(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (!inStock || status === "loading") return;
    setStatus("loading");
    try {
      await addItem(productId, quantity);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("idle");
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <QuantitySelector quantity={quantity} onChange={setQuantity} size="sm" />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock || status === "loading"}
          className="flex-1 rounded-full bg-purple-600 py-2 text-xs font-medium text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-ink/40"
        >
          {status === "loading" ? "Adding..." : status === "done" ? "Added ✓" : !inStock ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="mb-3 text-sm font-medium text-ink">Quantity</p>
        <QuantitySelector quantity={quantity} onChange={setQuantity} />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock || status === "loading"}
        className="w-full rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
      >
        {status === "loading" ? "Adding..." : status === "done" ? "Added to cart ✓" : !inStock ? "Sold Out" : "Add to Cart"}
      </button>
    </div>
  );
}
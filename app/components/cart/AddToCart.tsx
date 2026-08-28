"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export default function AddToCart({
  productId,
}: {
  productId: number;
}) {
  const { addItem, loading } = useCart();
  const [message, setMessage] = useState("");

  async function handleAdd() {
    setMessage("");

    try {
      await addItem(productId);
      setMessage("Added to cart");
    } catch {
      setMessage("Could not add product");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="w-full bg-black px-8 py-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>

      {message && (
        <p className="mt-3 text-center text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
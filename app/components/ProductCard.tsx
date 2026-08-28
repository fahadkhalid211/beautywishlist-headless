"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Stars from "@/app/components/StarRating";
import { useCart } from "@/app/components/cart/CartProvider";

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const image = product.images?.[0];
  const price = Number(product.prices.price) / 100;
  const regular = product.prices.regular_price ? Number(product.prices.regular_price) / 100 : null;
  const prefix = product.prices.currency_prefix;
  const rating = Number(product.average_rating) || 0;
  const reviewCount = product.review_count ?? 0;
  const discount = product.on_sale && regular ? Math.round(100 - (price / regular) * 100) : null;

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading" || !product.is_in_stock) return;
    setStatus("loading");
    try {
      await addItem(product.id);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-purple-50">
          {image && (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {!product.is_in_stock && (
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">Sold Out</span>
            )}
            {product.is_in_stock && discount ? (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white">-{discount}%</span>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-soft transition hover:text-purple-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" />
            </svg>
          </button>

          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.is_in_stock || status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-600 py-2.5 text-xs font-medium text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-ink/40"
            >
              {status === "loading" ? "Adding..." : status === "done" ? "Added ✓" : !product.is_in_stock ? "Sold Out" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h2>

          {rating > 0 && (
            <div className="mt-1.5">
              <Stars rating={rating} count={reviewCount} />
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            {product.on_sale && regular && (
              <span className="text-sm text-ink-soft line-through">{prefix}{regular.toLocaleString("en-PK")}</span>
            )}
            <span className="text-sm font-semibold text-purple-700">{prefix}{price.toLocaleString("en-PK")}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
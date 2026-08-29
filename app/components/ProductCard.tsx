"use client";

import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/StarRating";
import AddToCart from "@/app/components/cart/AddToCart";
import WishlistButton from "@/app/components/wishlist/WishlistButton";
import { getPriceValue } from "@/lib/money";
import { decodeEntities } from "@/lib/decodeEntities";
export default function ProductCard({ product }: { product: any }) {
  const image = product.images?.[0];
  const minorUnit = product.prices?.currency_minor_unit ?? 2;
  const price = getPriceValue(product.prices, "price");
  const regular = product.prices.regular_price ? getPriceValue(product.prices, "regular_price") : null;
  const prefix = product.prices.currency_prefix;
  const rating = Number(product.average_rating) || 0;
  const reviewCount = product.review_count ?? 0;
  const discount = product.on_sale && regular ? Math.round(100 - (price / regular) * 100) : null;
  const category = product.categories?.[0];
  const productName = decodeEntities(product.name);
  const categoryName = category ? decodeEntities(category.name) : null;

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-purple-50">
          {image && (
            <Image
              src={image.src}
              alt={image.alt || productName}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain transition duration-500 group-hover:scale-105"
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

          <div className="absolute right-3 top-3">
            <WishlistButton
              item={{
                id: product.id,
                slug: product.slug,
                name: productName,
                image: image?.src ?? null,
                price: product.prices.price,
                currency_prefix: prefix,
                currency_minor_unit: minorUnit,
                is_in_stock: product.is_in_stock,
              }}
            />
          </div>

          <div className="absolute inset-x-3 bottom-3 hidden transition duration-300 md:block md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <AddToCart
              productId={product.id}
              inStock={product.is_in_stock}
              maxQuantity={product.manage_stock && typeof product.stock_quantity === "number" ? product.stock_quantity : undefined}
              compact
            />
          </div>
        </div>

        <div className="pt-4">
          {categoryName && (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-purple-500">{categoryName}</p>
          )}
          <h2 className="line-clamp-2 text-sm font-medium text-ink">{productName}</h2>

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

          <div className="mt-3 md:hidden">
            <AddToCart
              productId={product.id}
              inStock={product.is_in_stock}
              maxQuantity={product.manage_stock && typeof product.stock_quantity === "number" ? product.stock_quantity : undefined}
              compact
            />
          </div>
        </div>
      </Link>
    </div>
  );
}
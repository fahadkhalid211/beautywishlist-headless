"use client";

import { useWishlist, WishlistItem } from "./WishlistProvider";

export default function WishlistButton({
  item,
  variant = "icon",
}: {
  item: WishlistItem;
  variant?: "icon" | "full";
}) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(item.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(item);
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex w-full items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-medium transition ${
          wishlisted ? "border-rose-300 bg-rose-50 text-rose-500" : "border-line text-ink-soft hover:border-purple-300 hover:text-purple-700"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" />
        </svg>
        {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      onClick={handleClick}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 transition ${
        wishlisted ? "text-rose-500" : "text-ink-soft hover:text-purple-600"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" />
      </svg>
    </button>
  );
}

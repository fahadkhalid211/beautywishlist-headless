"use client";

export default function QuantitySelector({
  quantity,
  onChange,
  size = "md",
}: {
  quantity: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  const padding = size === "sm" ? "px-3 py-1.5" : "px-5 py-3";

  return (
    <div className="flex w-fit items-center rounded-full border border-line">
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(Math.max(1, quantity - 1)); }} className={`${padding} text-ink-soft`}>−</button>
      <span className={size === "sm" ? "px-2 text-sm" : "px-5"}>{quantity}</span>
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(quantity + 1); }} className={`${padding} text-ink-soft`}>+</button>
    </div>
  );
}
"use client";

export default function QuantitySelector({
  quantity,
  onChange,
  size = "md",
  max,
  className = "w-fit",
}: {
  quantity: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
  max?: number;
  className?: string;
}) {
  const padding = size === "sm" ? "px-3 py-1.5" : "px-5 py-3";
  const atMax = typeof max === "number" && quantity >= max;

  return (
    <div className={`flex items-center rounded-full border border-line bg-white ${className}`}>
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(Math.max(1, quantity - 1)); }} className={`${padding} text-ink-soft`}>−</button>
      <span className={size === "sm" ? "px-2 text-sm" : "px-5"}>{quantity}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(typeof max === "number" ? Math.min(max, quantity + 1) : quantity + 1);
        }}
        disabled={atMax}
        className={`${padding} text-ink-soft disabled:cursor-not-allowed disabled:opacity-40`}
      >
        +
      </button>
    </div>
  );
}
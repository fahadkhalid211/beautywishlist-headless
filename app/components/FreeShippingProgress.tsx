"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart/CartProvider";

export default function FreeShippingProgress() {
  const { cart } = useCart();
  const [threshold, setThreshold] = useState<number | null>(null);
  const [justReached, setJustReached] = useState(false);
  const prevReached = useRef(false);

  useEffect(() => {
    fetch("/api/free-shipping-threshold")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && typeof data.threshold === "number") {
          setThreshold(data.threshold);
        }
      })
      .catch(() => {});
  }, []);

  const totals = cart?.totals;
  const minorUnit = totals?.currency_minor_unit ?? 2;
  const prefix = totals?.currency_prefix ?? "";
  const subtotal = totals ? Number(totals.total_items) / Math.pow(10, minorUnit) : 0;
  const reached = threshold !== null && subtotal >= threshold;
  const progress = threshold ? Math.min(100, (subtotal / threshold) * 100) : 0;
  const remaining = threshold ? Math.max(0, threshold - subtotal) : 0;

  useEffect(() => {
    if (reached && !prevReached.current) {
      setJustReached(true);
      const timer = setTimeout(() => setJustReached(false), 2200);
      return () => clearTimeout(timer);
    }
    prevReached.current = reached;
  }, [reached]);

  if (threshold === null || !totals || subtotal <= 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-4">
      {justReached && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-purple-500"
              style={{
                animation: `bw-confetti-${i % 5} 1.1s ease-out forwards`,
                animationDelay: `${i * 40}ms`,
                backgroundColor: ["#8347C9", "#F3D9EA", "#9B5DE0", "#D8B4FE", "#6D2FB0"][i % 5],
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes bw-confetti-0 { to { transform: translate(-60px, -40px) scale(0); opacity: 0; } }
        @keyframes bw-confetti-1 { to { transform: translate(60px, -40px) scale(0); opacity: 0; } }
        @keyframes bw-confetti-2 { to { transform: translate(-40px, 40px) scale(0); opacity: 0; } }
        @keyframes bw-confetti-3 { to { transform: translate(40px, 40px) scale(0); opacity: 0; } }
        @keyframes bw-confetti-4 { to { transform: translate(0, -60px) scale(0); opacity: 0; } }
      `}</style>

      <div className="flex items-center justify-between text-xs font-medium">
        {reached ? (
          <span className="flex items-center gap-1.5 text-purple-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            You&apos;ve unlocked free shipping!
          </span>
        ) : (
          <span className="text-ink">
            Add <span className="text-purple-700">{prefix}{remaining.toLocaleString("en-PK")}</span> more for free shipping
          </span>
        )}
        <span className="text-ink-soft">{Math.round(progress)}%</span>
      </div>

      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-purple-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

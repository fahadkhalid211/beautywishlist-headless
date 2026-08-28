"use client";

import { useRef } from "react";

export default function Carousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div ref={trackRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>

      <button type="button" onClick={() => scroll(-1)} aria-label="Previous" className="absolute -left-4 top-1/3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-md transition hover:bg-purple-50 md:grid">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>

      <button type="button" onClick={() => scroll(1)} aria-label="Next" className="absolute -right-4 top-1/3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white shadow-md transition hover:bg-purple-50 md:grid">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </div>
  );
}
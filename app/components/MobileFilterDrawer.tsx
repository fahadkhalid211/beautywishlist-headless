"use client";

import { useState } from "react";

export default function MobileFilterDrawer({
  children,
  activeCount = 0,
}: {
  children: React.ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-purple-300 hover:text-purple-700 md:hidden"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-purple-600 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
        <div
          className={`absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-bg p-6 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-xl italic text-purple-700">Filters</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-purple-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="rounded-3xl border border-line bg-white p-5">{children}</div>
        </div>
      </div>
    </>
  );
}

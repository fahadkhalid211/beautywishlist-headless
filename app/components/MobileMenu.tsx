"use client";

import { useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { toPath, MenuItem } from "@/lib/menu";

export default function MobileMenu({ menu }: { menu: MenuItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-purple-50 md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
      </button>

      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
        <div
          className={`absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-xl italic text-purple-700">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-purple-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="mb-6">
            <SearchBar />
          </div>

          <nav className="flex flex-col gap-1">
            {menu.map((item) => (
              <div key={item.id}>
                <Link href={toPath(item.url)} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-purple-50">
                  {item.title}
                </Link>
                {item.children.length > 0 && (
                  <div className="ml-3 flex flex-col border-l border-line pl-3">
                    {item.children.map((child) => (
                      <Link key={child.id} href={toPath(child.url)} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm text-ink-soft hover:bg-purple-50">
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
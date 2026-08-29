"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search-preview?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.products || []);
      setTotal(data.total || 0);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={boxRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Search for products..."
          className="min-w-0 flex-1 rounded-l-full border border-r-0 border-line px-5 py-2.5 text-sm outline-none focus:border-purple-500"
        />
        <button type="submit" className="rounded-r-full bg-purple-600 px-5 py-2.5 text-white transition hover:bg-purple-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        </button>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          {loading && <p className="px-5 py-4 text-sm text-ink-soft">Searching...</p>}
          {!loading && results.length === 0 && <p className="px-5 py-4 text-sm text-ink-soft">No products found.</p>}

          {!loading && results.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0 hover:bg-purple-50"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{p.name}</p>
                <p className="text-xs font-medium text-purple-700">{p.currency_prefix}{(Number(p.price) / Math.pow(10, p.currency_minor_unit ?? 2)).toLocaleString("en-PK")}</p>
              </div>
            </Link>
          ))}

          {!loading && total > 5 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setOpen(false)}
              className="block bg-purple-50 px-5 py-3 text-center text-sm font-medium text-purple-700 hover:bg-purple-100"
            >
              View all {total} results
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
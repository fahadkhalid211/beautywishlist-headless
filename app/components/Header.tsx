import Link from "next/link";
import { getCategories } from "@/lib/woocommerce";
import HeaderActions from "./HeaderActions";

export default async function Header() {
  const categories = await getCategories();
  const topCategories = categories.filter((c: any) => c.count > 0 && c.parent === 0).slice(0, 8);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="bg-purple-700 px-6 py-2 text-center text-xs text-white">
        Free shipping on orders over Rs. 3,000 · 100% Authentic Korean Skincare
      </div>

      <div className="border-b border-line">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
          <Link href="/" className="shrink-0 font-display text-2xl italic text-purple-700">
            Beauty Wishlist
          </Link>

          <form action="/search" method="GET" className="hidden flex-1 items-center md:flex">
            <input name="q" placeholder="Search for products..." className="w-full rounded-l-full border border-r-0 border-line px-5 py-2.5 text-sm outline-none focus:border-purple-500" />
            <button type="submit" className="rounded-r-full bg-purple-600 px-5 py-2.5 text-white transition hover:bg-purple-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </button>
          </form>

          <HeaderActions />
        </div>
      </div>

      <nav className="hidden border-b border-line bg-purple-50/50 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 py-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
          <Link href="/shop" className="text-purple-700">All Products</Link>
          {topCategories.map((c: any) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="transition hover:text-purple-700">{c.name}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
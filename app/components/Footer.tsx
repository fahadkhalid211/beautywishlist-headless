import Link from "next/link";
import { getCategories } from "@/lib/woocommerce";

export default async function Footer() {
  const categories = await getCategories();
  const topCategories = categories.filter((c: any) => c.count > 0).slice(0, 6);

  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl italic text-purple-700">Beauty Wishlist</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink-soft">
            Curated cosmetics and Korean skincare, picked for glow, not gimmicks. Authentic products, delivered with care.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li><Link href="/" className="hover:text-purple-700">Home</Link></li>
            <li><Link href="/shop" className="hover:text-purple-700">Shop</Link></li>
            <li><Link href="/categories" className="hover:text-purple-700">Categories</Link></li>
            <li><Link href="/cart" className="hover:text-purple-700">Cart</Link></li>
            <li><Link href="/account" className="hover:text-purple-700">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Categories</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            {topCategories.map((c: any) => (
              <li key={c.id}><Link href={`/category/${c.slug}`} className="hover:text-purple-700">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Stay in Touch</h3>
          <p className="mt-4 text-sm text-ink-soft">
            100% authentic products. Free shipping on orders over Rs. 3,000.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-soft md:flex-row">
          <p>&copy; {new Date().getFullYear()} Beauty Wishlist. All rights reserved.</p>
          <p>Made with ❤️ by Fahad Khalid</p>
        </div>
      </div>
    </footer>
  );
}
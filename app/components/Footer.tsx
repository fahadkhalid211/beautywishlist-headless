import Link from "next/link";

const FOOTER_CATEGORIES = [
  { name: "Sunscreens", slug: "sunscreens" },
  { name: "Cleansers", slug: "cleansers" },
  { name: "Eye Creams", slug: "eye-creams" },
  { name: "Makeup", slug: "makeup" },
  { name: "Moisturisers", slug: "moisturisers" },
  { name: "Hair", slug: "hairs" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl italic text-purple-700">Beauty Wishlist by HS</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink-soft">
            Curated cosmetics and Korean skincare, picked for glow, not gimmicks. Authentic products, delivered with care.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href="https://www.facebook.com/share/1Fu71NDCEv/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition hover:border-purple-300 hover:text-purple-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.9.2-1.5 1.5-1.5h1.6V4.3C16.3 4.2 15.2 4 14 4c-2.5 0-4.2 1.5-4.2 4.3V10.5H7.3v3h2.5V21h3.7Z"/></svg>
            </a>
            <a href="https://www.instagram.com/beautywishliist_hinashahab" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition hover:border-purple-300 hover:text-purple-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>
            </a>
            <a href="https://youtube.com/@beautywishlistbyhinashahab8966?si=qAwKg0RrgDIbb_R9" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition hover:border-purple-300 hover:text-purple-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.5a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.7.4-4.7ZM10 15V9l5 3-5 3Z"/></svg>
            </a>
          </div>
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
            {FOOTER_CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} prefetch={false} className="hover:text-purple-700">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Customer Support</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li><a href="mailto:beautywishlistbyhs@gmail.com" className="hover:text-purple-700">beautywishlistbyhs@gmail.com</a></li>
            <li><a href="tel:+923035562424" className="hover:text-purple-700">+92 303 5562424</a></li>
          </ul>
          <p className="mt-4 text-sm text-ink-soft">Paid online? Send a screenshot on WhatsApp.</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-ink-soft md:flex-row">
          <p>&copy; {new Date().getFullYear()} Beauty Wishlist. All rights reserved.</p>
          <p>Made with ❤️ by <a href="https://linktr.ee/fahadkhalid211" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-purple-700 hover:underline">Fahad Khalid</a></p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        <Link
          href="/"
          className="text-xl font-semibold tracking-tight"
        >
          Beauty Wishlist
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm hover:opacity-60">
            Home
          </Link>

          <Link href="/shop" className="text-sm hover:opacity-60">
            Shop
          </Link>

          <Link href="/categories" className="text-sm hover:opacity-60">
            Categories
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/search"
            aria-label="Search"
            className="text-sm hover:opacity-60"
          >
            Search
          </Link>

          <Link
            href="/account"
            aria-label="Account"
            className="text-sm hover:opacity-60"
          >
            Account
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="text-sm hover:opacity-60"
          >
            Cart
          </Link>
        </div>

      </div>
    </header>
  );
}
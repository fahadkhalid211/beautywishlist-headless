import Link from "next/link";
import { getMenu } from "@/lib/menu";
import HeaderActions from "./HeaderActions";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";
import NavMenu from "./NavMenu";

export default async function Header() {
  const menu = await getMenu("main-menu");

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="bg-purple-700 px-4 py-2 text-center text-[11px] text-white">
        Paid online? Send a screenshot on WhatsApp. &middot; 100% Authentic Korean Skincare
      </div>

      <div className="border-b border-line">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 md:gap-6 md:px-6">
          <MobileMenu menu={menu} />

          <Link href="/" className="shrink-0 font-display text-lg italic text-purple-700 sm:text-xl md:text-2xl">
            Beauty Wishlist<span className="hidden sm:inline"> by HS</span>
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <HeaderActions />
        </div>
      </div>

      <nav className="hidden border-b border-line bg-purple-50/50 md:block">
        <NavMenu items={menu} />
      </nav>
    </header>
  );
}
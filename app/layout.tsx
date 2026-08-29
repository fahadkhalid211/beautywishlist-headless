import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./components/cart/CartProvider";
import CartDrawer from "./components/cart/CartDrawer";
import { AuthProvider } from "./components/account/AuthProvider";
import { WishlistProvider } from "./components/wishlist/WishlistProvider";
import Footer from "./components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const WP_URL = process.env.NEXT_PUBLIC_WP_URL!;
  let siteIconUrl: string | undefined;

  try {
    const res = await fetch(`${WP_URL}/wp-json/`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      siteIconUrl = data?.site_icon_url || undefined;
    }
  } catch {
    // fall back to Next.js's default favicon handling if this fails
  }

  return {
    title: "Beauty Wishlist by HS",
    description: "Beauty Wishlist online store",
    icons: siteIconUrl ? { icon: siteIconUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
              {children}
              <Footer />
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
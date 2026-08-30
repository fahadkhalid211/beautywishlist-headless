import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./components/cart/CartProvider";
import CartDrawer from "./components/cart/CartDrawer";
import { AuthProvider } from "./components/account/AuthProvider";
import { WishlistProvider } from "./components/wishlist/WishlistProvider";
import Footer from "./components/Footer";
import WhatsAppWidget from "./components/WhatsAppWidget";

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
  const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || WP_URL || "";
  let siteIconUrl: string | undefined;

  if (WP_URL) {
    try {
      const res = await fetch(`${WP_URL}/wp-json/`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        siteIconUrl = data?.site_icon_url || undefined;
      }
    } catch {
      // fall back to Next.js's default favicon handling if this fails
    }
  }

  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title: {
      default: "Beauty Wishlist by HS",
      template: "%s | Beauty Wishlist by HS",
    },
    description: "Curated Korean skincare and cosmetics — 100% authentic, picked for glow, not gimmicks.",
    icons: siteIconUrl ? { icon: siteIconUrl } : undefined,
    openGraph: {
      type: "website",
      siteName: "Beauty Wishlist by HS",
      title: "Beauty Wishlist by HS",
      description: "Curated Korean skincare and cosmetics — 100% authentic, picked for glow, not gimmicks.",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Beauty Wishlist by HS",
      description: "Curated Korean skincare and cosmetics — 100% authentic, picked for glow, not gimmicks.",
    },
    robots: {
      index: true,
      follow: true,
    },
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
              <WhatsAppWidget />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
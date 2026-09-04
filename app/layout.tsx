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
import GlobalErrorListener from "./components/GlobalErrorListener";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["italic"],
  weight: ["400"],
  display: "swap",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://beautywishlistbyhs.shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beauty Wishlist by HS",
    template: "%s | Beauty Wishlist by HS",
  },
  description: "Curated Korean skincare and cosmetics — 100% authentic, picked for glow, not gimmicks.",
  icons: {
    icon: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2025/05/cropped-logo.jpeg",
  },
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
              <GlobalErrorListener />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
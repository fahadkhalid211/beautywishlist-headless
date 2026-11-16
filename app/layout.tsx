import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./components/cart/CartProvider";
import CartDrawer from "./components/cart/CartDrawer";
import { AuthProvider } from "./components/account/AuthProvider";
import { WishlistProvider } from "./components/wishlist/WishlistProvider";
import Footer from "./components/Footer";
import WhatsAppWidget from "./components/WhatsAppWidget";
import PaymentOfferModal from "./components/PaymentOfferModal";
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1191543426349575');
fbq('track','PageView');`}
        </Script>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />
              {children}
              <Footer />
              <CartDrawer />
              <WhatsAppWidget />
              <PaymentOfferModal />
              <GlobalErrorListener />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { CartProvider } from "./components/cart/CartProvider";

export const metadata: Metadata = {
  title: "Beauty Wishlist",
  description: "Beauty Wishlist online store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
	<CartProvider>
        <Header />
        {children}
	</CartProvider>
      </body>
    </html>
  );
}
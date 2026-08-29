import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProductsByCategory } from "@/lib/woocommerce";
import { getPriceValue } from "@/lib/money";
import { stripHtml } from "@/lib/seo";
import AddToCart from "@/app/components/cart/AddToCart";
import WishlistButton from "@/app/components/wishlist/WishlistButton";
import ProductCard from "@/app/components/ProductCard";
import Stars from "@/app/components/StarRating";
import Gallery from "@/app/components/Gallery";
import Carousel from "@/app/components/Carousel";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const description = stripHtml(product.short_description || product.description);
  const image = product.images?.[0]?.src;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.images?.[0]?.alt || product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const category = product.categories?.[0];
  const related = category
    ? (await getProductsByCategory(category.id)).items.filter((p: any) => p.id !== product.id).slice(0, 10)
    : [];
  

  const rating = Number(product.average_rating) || 0;
  const reviewCount = product.review_count ?? 0;
  const images = product.images ?? [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images.map((img: any) => img.src),
    description: stripHtml(product.short_description || product.description, 500),
    sku: product.sku || undefined,
    brand: category ? { "@type": "Brand", name: category.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.prices?.currency_code || "PKR",
      price: getPriceValue(product.prices, "price").toFixed(2),
      availability: product.is_in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WP_URL}/product/${product.slug}`,
    },
    ...(rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount: reviewCount || 1,
          },
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <nav className="mb-8 flex items-center gap-2 text-xs text-ink-soft">
          <Link href="/" className="hover:text-purple-700">Home</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-purple-700">{category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-12 md:grid-cols-2">
          <Gallery images={images} alt={product.name} />

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              {product.on_sale && <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white">Sale</span>}
              {!product.is_in_stock && <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">Sold Out</span>}
            </div>

            <h1 className="mt-4 font-display text-4xl italic tracking-tight text-ink">{product.name}</h1>

            {rating > 0 && (
              <div className="mt-3">
                <Stars rating={rating} count={reviewCount} />
              </div>
            )}

            <p className="mt-5 flex items-baseline gap-3">
              {product.on_sale && product.prices.regular_price && (
                <span className="text-lg text-ink-soft line-through">
                  {product.prices.currency_prefix}{getPriceValue(product.prices, "regular_price").toLocaleString("en-PK")}
                </span>
              )}
              <span className="text-2xl font-semibold text-purple-700">
                {product.prices.currency_prefix}{getPriceValue(product.prices, "price").toLocaleString("en-PK")}
              </span>
            </p>

            {product.short_description && (
              <div className="mt-5 text-sm leading-7 text-ink-soft" dangerouslySetInnerHTML={{ __html: product.short_description }} />
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <AddToCart
                  productId={product.id}
                  inStock={product.is_in_stock}
                  maxQuantity={product.manage_stock && typeof product.stock_quantity === "number" ? product.stock_quantity : undefined}
                />
              </div>
              <div className="sm:w-48">
                <WishlistButton
                  item={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: images[0]?.src ?? null,
                    price: product.prices.price,
                    currency_prefix: product.prices.currency_prefix,
                    currency_minor_unit: product.prices.currency_minor_unit ?? 2,
                    is_in_stock: product.is_in_stock,
                  }}
                  variant="full"
                />
              </div>
            </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-8 sm:grid-cols-4">
              {[
                { title: "Free Shipping", desc: "On orders over Rs. 3,000", icon: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /> },
                { title: "100% Authentic", desc: "Guaranteed original", icon: <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z" /> },
                { title: "Easy Returns", desc: "14-day return policy", icon: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /> },
                { title: "Secure Payments", desc: "SSL encrypted checkout", icon: <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" /> },
              ].map(({ title, desc, icon }) => (
                <div key={title} className="flex items-start gap-3 text-xs text-ink-soft">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-purple-600">{icon}</svg>
                  <div>
                    <p className="font-medium text-ink">{title}</p>
                    <p className="mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-line bg-white p-8">
          <div className="mb-6 flex gap-8 border-b border-line text-sm font-medium text-ink-soft">
            <span className="border-b-2 border-purple-600 pb-3 text-ink">Description</span>
            {rating > 0 && <span className="pb-3">Reviews ({reviewCount})</span>}
          </div>
          <div className="prose prose-sm max-w-none text-ink-soft" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 font-display text-3xl italic text-ink">You may also like</h2>
            <Carousel>
              {related.map((p: any) => (
                <div key={p.id} className="w-[45%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]">
                  <ProductCard product={p} />
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>
    </main>
  );
}
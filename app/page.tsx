import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories, searchProducts } from "@/lib/woocommerce";
import ProductCard from "@/app/components/ProductCard";
import CategoryCircles from "@/app/components/CategoryCircles";
import BrandCarousel from "@/app/components/BrandCarousel";
import ProductCarouselSection from "@/app/components/ProductCarouselSection";
import BrandSpotlightCards from "@/app/components/BrandSpotlightCards";
import JourneyBanner from "@/app/components/JourneyBanner";

export default async function Home() {
  const [products, categories, saleResult, bestSellersResult] = await Promise.all([
    getProducts(),
    getCategories(),
    searchProducts({ onSale: true, perPage: 12 }),
    searchProducts({ orderby: "popularity", order: "desc", perPage: 12 }),
  ]);

  const topCategories = categories
    .filter((c: any) => c.count > 0)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 4);

  const allBrandCategories = categories.filter((c: any) => c.count > 0);
  const saleProducts = saleResult.items;
  const bestSellers = bestSellersResult.items;
  const bannerProducts = products.slice(0, 3);
  const journeyBackdrop = bestSellers[0]?.images?.[0] || products[0]?.images?.[0];

  return (
    <main className="min-h-screen bg-bg">
      <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-24 md:pt-20">
        <div className="blob -left-32 -top-32 h-96 w-96" />
        <div className="blob -right-20 top-10 h-72 w-72 opacity-40" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-8">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-600">New Arrivals</p>
            <h1 className="mt-4 font-display text-5xl italic tracking-tight text-ink md:text-6xl">
              Skincare that feels like a little luxury
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-ink-soft md:mx-0">
              Curated cosmetics and skincare, picked for glow, not gimmicks.
            </p>
            <Link href="/shop" className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
              Shop Now
            </Link>
          </div>

          {bannerProducts.length > 0 && (
            <div className="relative mx-auto h-[420px] w-full max-w-md md:h-[480px]">
              {bannerProducts[0] && (
                <div className="absolute inset-0 -rotate-2 overflow-hidden rounded-[2rem] bg-purple-50 shadow-xl shadow-purple-900/10 transition duration-500 hover:rotate-0">
                  <Image
                    src={bannerProducts[0].images?.[0]?.src}
                    alt={bannerProducts[0].images?.[0]?.alt || bannerProducts[0].name}
                    fill
                    sizes="(max-width: 768px) 90vw, 420px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
                </div>
              )}

              {bannerProducts[1] && (
                <div className="absolute -bottom-6 -right-4 h-40 w-40 rotate-6 overflow-hidden rounded-3xl border-4 border-white bg-blush shadow-xl transition duration-500 hover:rotate-0 sm:h-48 sm:w-48">
                  <Image
                    src={bannerProducts[1].images?.[0]?.src}
                    alt={bannerProducts[1].images?.[0]?.alt || bannerProducts[1].name}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="absolute -left-4 top-6 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-lg shadow-purple-900/10 sm:-left-8">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 15l-5.6 3 1.4-6.2L1 8.5l6.4-.6z" />
                    </svg>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-ink">Loved by shoppers</p>
                  <p className="text-[10px] text-ink-soft">100% Authentic Korean Skincare</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <CategoryCircles categories={topCategories} />

      <BrandCarousel categories={allBrandCategories} />

      <ProductCarouselSection
        eyebrow="Limited Time"
        title="On Sale Now"
        products={saleProducts}
        viewAllHref="/shop?sale=true"
      />

      <ProductCarouselSection
        eyebrow="Customer Favorites"
        title="Best Sellers"
        products={bestSellers}
        viewAllHref="/shop?sort=popularity"
      />

      <BrandSpotlightCards categories={categories} />

      <JourneyBanner backgroundImage={journeyBackdrop} />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl italic text-ink">New In</h2>
          <Link href="/shop" className="text-sm text-purple-700 hover:underline">View all</Link>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import { getCategories, searchProducts, getFeaturedProducts, getHomepageImages, getProducts } from "@/lib/woocommerce";
import ProductCard from "@/app/components/ProductCard";
import CategoryCircles from "@/app/components/CategoryCircles";
import BrandCarousel from "@/app/components/BrandCarousel";
import ProductCarouselSection from "@/app/components/ProductCarouselSection";
import BrandSpotlightCards from "@/app/components/BrandSpotlightCards";
import JourneyBanner from "@/app/components/JourneyBanner";

// Fully static: this page is built once and served as complete HTML to
// everyone, regenerating in the background at most every 5 minutes. No
// per-visitor server computation, no ongoing response stream -- avoids the
// Next.js 16.3.x streaming bug entirely for this page (client disconnects
// mid-stream throw "The destination stream closed early.", a real risk on
// unstable mobile/in-app-browser connections).
// See: https://github.com/vercel/next.js/issues/96704
export const revalidate = 300;

const EMPTY_PAGINATED = { items: [] as any[], total: 0, totalPages: 0 };

export default async function Home() {
  // Each fetch is individually guarded so a single flaky/unreachable call
  // (e.g. WordPress briefly unreachable during a background regeneration)
  // can't fail the whole page -- it just degrades that one section instead.
  const [
    featuredProducts,
    homepageImages,
    categories,
    saleResult,
    bestSellersResult,
    products,
  ] = await Promise.all([
    getFeaturedProducts(4).catch(() => [] as any[]),
    getHomepageImages().catch(() => null),
    getCategories().catch(() => [] as any[]),
    searchProducts({ onSale: true, perPage: 8 }).catch(() => EMPTY_PAGINATED),
    searchProducts({ orderby: "popularity", order: "desc", perPage: 8 }).catch(() => EMPTY_PAGINATED),
    getProducts(1, 8).catch(() => [] as any[]),
  ]);

  const heroImage1 = homepageImages?.hero_image_1
    ? { src: homepageImages.hero_image_1, alt: "Hero banner" }
    : featuredProducts[0]?.images?.[0]
    ? { src: featuredProducts[0].images[0].src, alt: featuredProducts[0].images[0].alt || featuredProducts[0].name }
    : null;

  const heroImage2 = homepageImages?.hero_image_2
    ? { src: homepageImages.hero_image_2, alt: "Hero banner" }
    : featuredProducts[1]?.images?.[0]
    ? { src: featuredProducts[1].images[0].src, alt: featuredProducts[1].images[0].alt || featuredProducts[1].name }
    : null;

  const journeyBackdrop = homepageImages?.banner_image
    ? { src: homepageImages.banner_image, alt: "Beauty Wishlist" }
    : featuredProducts[3]?.images?.[0] || featuredProducts[0]?.images?.[0];

  const topCategories = categories
    .filter((c: any) => c.count > 0)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 4);
  const allBrandCategories = categories.filter((c: any) => c.count > 0);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_WP_URL || "";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Beauty Wishlist by HS",
    url: siteUrl,
    sameAs: [],
  };
  const webSiteSearchJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Beauty Wishlist by HS",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="min-h-screen bg-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSearchJsonLd) }} />

      <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-24 md:pt-20">
        <div className="blob -left-32 -top-32 h-96 w-96" />
        <div className="blob -right-20 top-10 h-72 w-72 opacity-40" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-8">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-600">By Hina Shahab</p>
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

          {heroImage1 && (
            <div className="relative mx-auto h-[420px] w-full max-w-md md:h-[480px]">
              <div className="absolute inset-0 -rotate-2 overflow-hidden rounded-[2rem] bg-purple-50 shadow-xl shadow-purple-900/10 transition duration-500 hover:rotate-0">
                <Image
                  src={heroImage1.src}
                  alt={heroImage1.alt}
                  fill
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
              </div>

              {heroImage2 && (
                <div className="absolute -bottom-6 -right-4 h-40 w-40 rotate-6 overflow-hidden rounded-3xl border-4 border-white bg-blush shadow-xl transition duration-500 hover:rotate-0 sm:h-48 sm:w-48">
                  <Image src={heroImage2.src} alt={heroImage2.alt} fill sizes="192px" className="object-cover" />
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
        products={saleResult.items}
        viewAllHref="/shop?sale=true"
      />
      <ProductCarouselSection
        eyebrow="Customer Favorites"
        title="Best Sellers"
        products={bestSellersResult.items}
        viewAllHref="/shop?sort=popularity"
      />

      <BrandSpotlightCards categories={categories} />

      <JourneyBanner backgroundImage={journeyBackdrop} />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl italic text-ink">New In</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-block rounded-full border border-line px-8 py-4 text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700">
            View All
          </Link>
        </div>
      </section>
    </main>
  );
}

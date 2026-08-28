import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/lib/woocommerce";
import ProductCard from "@/app/components/ProductCard";
import CategoryCircles from "@/app/components/CategoryCircles";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const topCategories = categories
    .filter((c: any) => c.count > 0)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 4);

  const bannerProducts = products.slice(0, 3);

  return (
    <main className="min-h-screen bg-bg">
      <section className="relative overflow-hidden px-6 pb-16 pt-16 md:pb-24 md:pt-20">
        <div className="blob -left-32 -top-32 h-96 w-96" />
        <div className="blob -right-20 top-10 h-72 w-72 opacity-40" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-8">
          <div className="text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-600">New season edit</p>
            <h1 className="mt-4 font-display text-5xl italic tracking-tight text-ink md:text-6xl">
              Skincare that feels like a little luxury
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-ink-soft md:mx-0">
              Curated cosmetics and skincare, picked for glow, not gimmicks.
            </p>
            <Link href="/shop" className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
              Shop the Edit
            </Link>
          </div>

          {bannerProducts.length > 0 && (
            <div className="relative mx-auto grid h-[380px] w-full max-w-md grid-cols-2 gap-4 md:h-[440px]">
              {bannerProducts[0] && (
                <div className="relative col-span-2 overflow-hidden rounded-[2rem] bg-purple-50 shadow-sm">
                  <Image
                    src={bannerProducts[0].images?.[0]?.src}
                    alt={bannerProducts[0].images?.[0]?.alt || bannerProducts[0].name}
                    fill
                    sizes="(max-width: 768px) 90vw, 420px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {bannerProducts[1] && (
                <div className="relative overflow-hidden rounded-[1.5rem] bg-blush shadow-sm">
                  <Image
                    src={bannerProducts[1].images?.[0]?.src}
                    alt={bannerProducts[1].images?.[0]?.alt || bannerProducts[1].name}
                    fill
                    sizes="(max-width: 768px) 45vw, 200px"
                    className="object-cover"
                  />
                </div>
              )}
              {bannerProducts[2] && (
                <div className="relative overflow-hidden rounded-[1.5rem] bg-purple-100 shadow-sm">
                  <Image
                    src={bannerProducts[2].images?.[0]?.src}
                    alt={bannerProducts[2].images?.[0]?.alt || bannerProducts[2].name}
                    fill
                    sizes="(max-width: 768px) 45vw, 200px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-ink shadow-lg shadow-purple-900/10 md:left-4 md:translate-x-0">
                100% Authentic Korean Skincare
              </div>
            </div>
          )}
        </div>
      </section>

      <CategoryCircles categories={topCategories} />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl italic text-ink">Bestsellers</h2>
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
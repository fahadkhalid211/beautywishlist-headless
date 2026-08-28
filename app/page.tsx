import Link from "next/link";
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

  return (
    <main className="min-h-screen bg-bg">
      <section className="relative overflow-hidden px-6 pb-20 pt-24">
        <div className="blob -left-32 -top-32 h-96 w-96" />
        <div className="blob -right-20 top-10 h-72 w-72 opacity-40" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-600">New season edit</p>
          <h1 className="mt-4 font-display text-5xl italic tracking-tight text-ink md:text-6xl">
            Skincare that feels like a little luxury
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-ink-soft">
            Curated cosmetics and skincare, picked for glow, not gimmicks.
          </p>
          <Link href="/shop" className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
            Shop the Edit
          </Link>
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
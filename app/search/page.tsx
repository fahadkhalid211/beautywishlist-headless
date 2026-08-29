import type { Metadata } from "next";
import { searchProducts } from "@/lib/woocommerce";
import ProductCard from "@/app/components/ProductCard";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const products = query ? (await searchProducts({ search: query })).items : [];

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
          <h1 className="mt-3 font-display text-5xl italic tracking-tight text-ink">Search</h1>
        </div>

        <form method="GET" className="mb-12 flex max-w-3xl overflow-hidden rounded-full border border-line bg-white">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="min-w-0 flex-1 px-6 py-4 text-sm outline-none"
          />
          <button type="submit" className="bg-purple-600 px-8 text-sm font-medium text-white transition hover:bg-purple-700">
            Search
          </button>
        </form>

        {query && (
          <p className="mb-8 text-sm text-ink-soft">{products.length} results for &quot;{query}&quot;</p>
        )}

        {!query ? (
          <div className="py-24 text-center">
            <p className="text-ink-soft">Search Beauty Wishlist products.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="font-display text-2xl italic text-ink">No products found</h2>
            <p className="mt-3 text-sm text-ink-soft">Try another search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
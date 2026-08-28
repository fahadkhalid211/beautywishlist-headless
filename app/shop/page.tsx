import Link from "next/link";
import { getCategories, searchProducts } from "@/lib/woocommerce";
import ProductCard from "@/app/components/ProductCard";
import SortSelect from "@/app/components/SortSelect";

type SearchParams = {
  category?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  sale?: string;
  stock?: string;
};

function buildHref(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged: SearchParams = { ...params, ...overrides };
  const query = new URLSearchParams();

  if (merged.category) query.set("category", merged.category);
  if (merged.min_price) query.set("min_price", merged.min_price);
  if (merged.max_price) query.set("max_price", merged.max_price);
  if (merged.sort) query.set("sort", merged.sort);
  if (merged.sale) query.set("sale", merged.sale);
  if (merged.stock) query.set("stock", merged.stock);

  const qs = query.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  let orderby = "date";
  let order = "desc";
  if (params.sort === "price-low") { orderby = "price"; order = "asc"; }
  if (params.sort === "price-high") { orderby = "price"; order = "desc"; }
  if (params.sort === "newest") { orderby = "date"; order = "desc"; }
  if (params.sort === "name") { orderby = "title"; order = "asc"; }

  const [products, categories] = await Promise.all([
    searchProducts({
      category: params.category,
      minPrice: params.min_price,
      maxPrice: params.max_price,
      orderby,
      order,
      onSale: params.sale === "true",
      stockStatus: params.stock === "true" ? "instock" : undefined,
    }),
    getCategories(),
  ]);

  const visibleCategories = categories.filter((c: any) => c.count > 0);

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
          <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink">Shop</h1>
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-line bg-white p-6">
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-ink">Categories</h3>
              <div className="space-y-1">
                <Link
                  href={buildHref(params, { category: undefined })}
                  className={`flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition ${
                    !params.category ? "bg-purple-50 font-medium text-purple-700" : "text-ink-soft hover:bg-purple-50/60"
                  }`}
                >
                  All Categories
                </Link>
                {visibleCategories.map((c: any) => {
                  const active = params.category === String(c.id);
                  return (
                    <Link
                      key={c.id}
                      href={buildHref(params, { category: active ? undefined : String(c.id) })}
                      className={`flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition ${
                        active ? "bg-purple-50 font-medium text-purple-700" : "text-ink-soft hover:bg-purple-50/60"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-ink-soft/70">{c.count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <form method="GET">
              {params.category && <input type="hidden" name="category" value={params.category} />}

              <div className="mb-6 border-t border-line pt-6">
                <h3 className="mb-3 text-sm font-semibold text-ink">Price Range (PKR)</h3>
                <div className="flex items-center gap-2">
                  <input name="min_price" type="number" min="0" placeholder="Min" defaultValue={params.min_price || ""} className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-purple-500" />
                  <span className="text-ink-soft">–</span>
                  <input name="max_price" type="number" min="0" placeholder="Max" defaultValue={params.max_price || ""} className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="mb-6 space-y-3 border-t border-line pt-6">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="sale" value="true" defaultChecked={params.sale === "true"} className="accent-purple-600" />
                  On Sale
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="stock" value="true" defaultChecked={params.stock === "true"} className="accent-purple-600" />
                  In Stock Only
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-full bg-purple-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-purple-700">
                  Apply
                </button>
                <Link href="/shop" className="rounded-full border border-line px-4 py-3 text-sm text-ink-soft transition hover:border-purple-300">
                  Clear
                </Link>
              </div>
            </form>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-3">
              <p className="text-sm text-ink-soft">{products.length} products</p>
              <SortSelect />
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl border border-line bg-white py-32 text-center">
                <h2 className="font-display text-2xl italic text-ink">No products found</h2>
                <p className="mt-3 text-sm text-ink-soft">Try changing your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

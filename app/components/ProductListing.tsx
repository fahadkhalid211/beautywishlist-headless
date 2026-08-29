import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import SortSelect from "@/app/components/SortSelect";
import Pagination from "@/app/components/Pagination";
import { buildListingHref, ListingFilters } from "@/lib/urlHelpers";

export default function ProductListing({
  title,
  description,
  products,
  categories,
  activeCategorySlug,
  basePath,
  filters,
  currentPage,
  totalPages,
  totalProducts,
}: {
  title: string;
  description?: string;
  products: any[];
  categories: any[];
  activeCategorySlug?: string;
  basePath: string;
  filters: ListingFilters;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}) {
  const visibleCategories = categories.filter((c: any) => c.count > 0);

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
          <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink">{title}</h1>
          {description && (
            <div
              className="mt-4 max-w-2xl text-sm leading-7 text-ink-soft"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-line bg-white p-6">
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-ink">Categories</h3>
              <div className="space-y-1">
                <Link
                  href={buildListingHref("/shop", filters, { page: undefined })}
                  className={`flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition ${
                    !activeCategorySlug ? "bg-purple-50 font-medium text-purple-700" : "text-ink-soft hover:bg-purple-50/60"
                  }`}
                >
                  All Categories
                </Link>
                {visibleCategories.map((c: any) => {
                  const active = c.slug === activeCategorySlug;
                  return (
                    <Link
                      key={c.id}
                      href={buildListingHref(`/category/${c.slug}`, filters, { page: undefined })}
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

            <form method="GET" action={basePath}>
              {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}

              <div className="mb-6 border-t border-line pt-6">
                <h3 className="mb-3 text-sm font-semibold text-ink">Price Range (PKR)</h3>
                <div className="flex items-center gap-2">
                  <input name="min_price" type="number" min="0" placeholder="Min" defaultValue={filters.min_price || ""} className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-purple-500" />
                  <span className="text-ink-soft">–</span>
                  <input name="max_price" type="number" min="0" placeholder="Max" defaultValue={filters.max_price || ""} className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="mb-6 space-y-3 border-t border-line pt-6">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="sale" value="true" defaultChecked={filters.sale === "true"} className="accent-purple-600" />
                  On Sale
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" name="stock" value="true" defaultChecked={filters.stock === "true"} className="accent-purple-600" />
                  In Stock Only
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 rounded-full bg-purple-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-purple-700">
                  Apply
                </button>
                <Link href={basePath} className="rounded-full border border-line px-4 py-3 text-sm text-ink-soft transition hover:border-purple-300">
                  Clear
                </Link>
              </div>
            </form>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white px-5 py-3">
              <p className="text-sm text-ink-soft">{totalProducts} products</p>
              <SortSelect />
            </div>

            {products.length === 0 ? (
              <div className="rounded-3xl border border-line bg-white py-32 text-center">
                <h2 className="font-display text-2xl italic text-ink">No products found</h2>
                <p className="mt-3 text-sm text-ink-soft">Try changing your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination basePath={basePath} filters={filters} currentPage={currentPage} totalPages={totalPages} />
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

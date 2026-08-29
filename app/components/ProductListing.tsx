import ProductCard from "@/app/components/ProductCard";
import ProductFilters from "@/app/components/ProductFilters";
import MobileFilterDrawer from "@/app/components/MobileFilterDrawer";
import SortSelect from "@/app/components/SortSelect";
import Pagination from "@/app/components/Pagination";
import { ListingFilters } from "@/lib/urlHelpers";

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
  const activeFilterCount = [filters.min_price, filters.max_price, filters.sale, filters.stock].filter(Boolean).length;

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
          <aside className="hidden h-fit rounded-3xl border border-line bg-white p-6 md:block">
            <ProductFilters categories={categories} activeCategorySlug={activeCategorySlug} basePath={basePath} filters={filters} />
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-3">
              <p className="text-sm text-ink-soft">{totalProducts} products</p>
              <div className="flex items-center gap-2">
                <MobileFilterDrawer activeCount={activeFilterCount}>
                  <ProductFilters categories={categories} activeCategorySlug={activeCategorySlug} basePath={basePath} filters={filters} />
                </MobileFilterDrawer>
                <SortSelect />
              </div>
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

import Link from "next/link";
import { buildListingHref, ListingFilters } from "@/lib/urlHelpers";
import { decodeEntities } from "@/lib/decodeEntities";

export default function ProductFilters({
  categories,
  activeCategorySlug,
  basePath,
  filters,
}: {
  categories: any[];
  activeCategorySlug?: string;
  basePath: string;
  filters: ListingFilters;
}) {
  const visibleCategories = categories.filter((c: any) => c.count > 0);

  return (
    <>
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-ink">Categories</h3>
        <div className="space-y-1">
          <Link
            href={buildListingHref("/shop", filters, { page: undefined })}
            prefetch={false}
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
                prefetch={false}
                className={`flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition ${
                  active ? "bg-purple-50 font-medium text-purple-700" : "text-ink-soft hover:bg-purple-50/60"
                }`}
              >
                <span>{decodeEntities(c.name)}</span>
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
          <Link href={basePath} prefetch={false} className="rounded-full border border-line px-4 py-3 text-sm text-ink-soft transition hover:border-purple-300">
            Clear
          </Link>
        </div>
      </form>
    </>
  );
}

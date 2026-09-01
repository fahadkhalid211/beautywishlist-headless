import Link from "next/link";
import { buildListingHref, ListingFilters } from "@/lib/urlHelpers";

export default function Pagination({
  basePath,
  filters,
  currentPage,
  totalPages,
}: {
  basePath: string;
  filters: ListingFilters;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const windowSize = 1;

  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - windowSize && p <= currentPage + windowSize)
    ) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={buildListingHref(basePath, filters, { page: String(Math.max(1, currentPage - 1)) })}
        aria-disabled={currentPage === 1}
        prefetch={false}
        className={`grid h-10 w-10 place-items-center rounded-full border border-line text-sm transition ${
          currentPage === 1 ? "pointer-events-none opacity-40" : "text-ink-soft hover:border-purple-300 hover:text-purple-700"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="px-1 text-sm text-ink-soft">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildListingHref(basePath, filters, { page: String(p) })}
            prefetch={false}
            className={`grid h-10 w-10 place-items-center rounded-full text-sm font-medium transition ${
              p === currentPage ? "bg-purple-600 text-white" : "border border-line text-ink-soft hover:border-purple-300 hover:text-purple-700"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildListingHref(basePath, filters, { page: String(Math.min(totalPages, currentPage + 1)) })}
        aria-disabled={currentPage === totalPages}
        prefetch={false}
        className={`grid h-10 w-10 place-items-center rounded-full border border-line text-sm transition ${
          currentPage === totalPages ? "pointer-events-none opacity-40" : "text-ink-soft hover:border-purple-300 hover:text-purple-700"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </nav>
  );
}

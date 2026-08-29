export type ListingFilters = {
  min_price?: string;
  max_price?: string;
  sale?: string;
  stock?: string;
  sort?: string;
  page?: string;
};

export function buildListingHref(
  basePath: string,
  filters: ListingFilters,
  overrides: Partial<ListingFilters> = {}
) {
  const merged = { ...filters, ...overrides };
  const query = new URLSearchParams();

  if (merged.min_price) query.set("min_price", merged.min_price);
  if (merged.max_price) query.set("max_price", merged.max_price);
  if (merged.sale) query.set("sale", merged.sale);
  if (merged.stock) query.set("stock", merged.stock);
  if (merged.sort) query.set("sort", merged.sort);
  if (merged.page && merged.page !== "1") query.set("page", merged.page);

  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

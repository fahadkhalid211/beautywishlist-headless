import { getCategories, searchProducts } from "@/lib/woocommerce";
import ProductListing from "@/app/components/ProductListing";

type SearchParams = {
  min_price?: string;
  max_price?: string;
  sort?: string;
  sale?: string;
  stock?: string;
  page?: string;
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  let orderby = "date";
  let order = "desc";
  if (params.sort === "price-low") { orderby = "price"; order = "asc"; }
  if (params.sort === "price-high") { orderby = "price"; order = "desc"; }
  if (params.sort === "newest") { orderby = "date"; order = "desc"; }
  if (params.sort === "name") { orderby = "title"; order = "asc"; }

  const [{ items: products, total, totalPages }, categories] = await Promise.all([
    searchProducts({
      page: currentPage,
      minPrice: params.min_price,
      maxPrice: params.max_price,
      orderby,
      order,
      onSale: params.sale === "true",
      stockStatus: params.stock === "true" ? "instock" : undefined,
    }),
    getCategories(),
  ]);

  return (
    <ProductListing
      title="Shop"
      products={products}
      categories={categories}
      basePath="/shop"
      filters={params}
      currentPage={currentPage}
      totalPages={totalPages}
      totalProducts={total}
    />
  );
}

import { notFound } from "next/navigation";
import { getCategory, getCategories, searchProducts } from "@/lib/woocommerce";
import ProductListing from "@/app/components/ProductListing";

type SearchParams = {
  min_price?: string;
  max_price?: string;
  sort?: string;
  sale?: string;
  stock?: string;
  page?: string;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const currentPage = Math.max(1, Number(query.page) || 1);

  const category = await getCategory(slug);
  if (!category) notFound();

  let orderby = "date";
  let order = "desc";
  if (query.sort === "price-low") { orderby = "price"; order = "asc"; }
  if (query.sort === "price-high") { orderby = "price"; order = "desc"; }
  if (query.sort === "newest") { orderby = "date"; order = "desc"; }
  if (query.sort === "name") { orderby = "title"; order = "asc"; }

  const [{ items: products, total, totalPages }, categories] = await Promise.all([
    searchProducts({
      category: String(category.id),
      page: currentPage,
      minPrice: query.min_price,
      maxPrice: query.max_price,
      orderby,
      order,
      onSale: query.sale === "true",
      stockStatus: query.stock === "true" ? "instock" : undefined,
    }),
    getCategories(),
  ]);

  return (
    <ProductListing
      title={category.name}
      description={category.description}
      products={products}
      categories={categories}
      activeCategorySlug={slug}
      basePath={`/category/${slug}`}
      filters={query}
      currentPage={currentPage}
      totalPages={totalPages}
      totalProducts={total}
    />
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory, getCategories, searchProducts } from "@/lib/woocommerce";
import { stripHtml } from "@/lib/seo";
import { decodeEntities } from "@/lib/decodeEntities";
import ProductListing from "@/app/components/ProductListing";

type SearchParams = {
  min_price?: string;
  max_price?: string;
  sort?: string;
  sale?: string;
  stock?: string;
  page?: string;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};

  const name = decodeEntities(category.name);
  const description = category.description
    ? stripHtml(category.description)
    : `Shop ${name} at Beauty Wishlist by HS.`;
  const image = category.image?.src;

  return {
    title: name,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image, alt: category.image?.alt || name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

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
  if (query.sort === "popularity") { orderby = "popularity"; order = "desc"; }

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
      title={decodeEntities(category.name)}
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

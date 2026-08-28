import { notFound } from "next/navigation";
import { getCategory, getProductsByCategory } from "@/lib/woocommerce";
import ProductCard from "@/app/components/ProductCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-purple-600">Category</p>
        <h1 className="mt-3 font-display text-5xl italic tracking-tight text-ink">{category.name}</h1>

        {category.description && (
          <div
            className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        )}

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
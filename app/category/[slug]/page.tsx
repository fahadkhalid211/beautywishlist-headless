import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategory,
  getProductsByCategory,
} from "@/lib/woocommerce";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const products =
    await getProductsByCategory(category.id);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          Category
        </p>

        <h1 className="mt-3 text-5xl font-light tracking-tight">
          {category.name}
        </h1>

        {category.description && (
          <div
            className="mt-5 max-w-2xl text-sm leading-7 text-neutral-500"
            dangerouslySetInnerHTML={{
              __html: category.description,
            }}
          />
        )}

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product: any) => {
            const image = product.images?.[0];

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  {image && (
                    <Image
                      src={image.src}
                      alt={image.alt || product.name}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>

                <h2 className="mt-4 text-sm font-medium">
                  {product.name}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  {product.prices.currency_prefix}
                  {(Number(product.prices.price) / 100).toLocaleString(
                    "en-PK"
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
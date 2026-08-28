import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/woocommerce";

export default async function CategoriesPage() {
  const categories = await getCategories();

  const visibleCategories = categories.filter(
    (category: any) => category.count > 0
  );

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
          Beauty Wishlist
        </p>

        <h1 className="mt-3 text-5xl font-light tracking-tight">
          Categories
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">
          Explore products by category.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visibleCategories.map((category: any) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                {category.image?.src ? (
                  <Image
                    src={category.image.src}
                    alt={category.image.alt || category.name}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                    {category.name}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <h2 className="text-sm font-medium">
                  {category.name}
                </h2>

                <span className="text-xs text-neutral-400">
                  {category.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
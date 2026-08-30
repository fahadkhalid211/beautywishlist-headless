import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/woocommerce";
import { decodeEntities } from "@/lib/decodeEntities";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all skincare and cosmetics categories at Beauty Wishlist by HS.",
  alternates: { canonical: "/categories" },
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const visibleCategories = categories.filter((c: any) => c.count > 0);

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
        <h1 className="mt-3 font-display text-5xl italic tracking-tight text-ink">Categories</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-ink-soft">Explore products by category.</p>

        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visibleCategories.map((category: any) => {
            const name = decodeEntities(category.name);
            return (
              <Link key={category.id} href={`/category/${category.slug}`} className="group">
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-purple-50">
                  {category.image?.src ? (
                    <Image
                      src={category.image.src}
                      alt={category.image.alt || name}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-lg italic text-purple-400">
                      {name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <h2 className="text-sm font-medium text-ink">{name}</h2>
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-purple-700">{category.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
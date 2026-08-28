import Image from "next/image";
import Link from "next/link";

export default function CategoryCircles({ categories }: { categories: any[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Explore</p>
          <h2 className="mt-2 font-display text-3xl italic text-ink">Shop by Category</h2>
        </div>
        <Link href="/categories" className="text-sm text-purple-700 hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="group flex flex-col items-center text-center">
            <div className="relative aspect-square w-full max-w-[160px] overflow-hidden rounded-full bg-purple-50 ring-1 ring-line transition group-hover:ring-purple-300">
              {category.image?.src ? (
                <Image
                  src={category.image.src}
                  alt={category.image.alt || category.name}
                  fill
                  sizes="(max-width: 768px) 40vw, 160px"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-base italic text-purple-400">
                  {category.name}
                </div>
              )}
            </div>
            <h3 className="mt-4 text-sm font-medium text-ink transition group-hover:text-purple-700">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

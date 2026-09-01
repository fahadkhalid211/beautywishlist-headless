import Link from "next/link";
import Image from "next/image";
import Carousel from "@/app/components/Carousel";
import { decodeEntities } from "@/lib/decodeEntities";

export default function BrandCarousel({ categories }: { categories: any[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Shop by Brand</p>
        <h2 className="mt-2 font-display text-3xl italic text-ink">Korean Beauty Brands</h2>
      </div>

      <Carousel>
        {categories.map((c: any) => {
          const name = decodeEntities(c.name);
          return (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              prefetch={false}
              className="group flex w-24 shrink-0 snap-start flex-col items-center text-center sm:w-28"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full bg-purple-50 ring-1 ring-line transition group-hover:ring-purple-300">
                {c.image?.src ? (
                  <Image src={c.image.src} alt={c.image.alt || name} fill sizes="112px" className="object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-lg italic text-purple-400">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-xs font-medium text-ink transition group-hover:text-purple-700">{name}</p>
            </Link>
          );
        })}
      </Carousel>
    </section>
  );
}

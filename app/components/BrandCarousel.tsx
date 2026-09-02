import Link from "next/link";

type StaticBrand = {
  name: string;
  href: string;
};

const BRANDS: StaticBrand[] = [
  { name: "Korean Brands", href: "/category/korean-brands/" },
  { name: "Cleansers", href: "/category/cleansers/" },
  { name: "Moisturizers", href: "/category/moisturisers/" },
  { name: "Makeup", href: "/category/makeup/" },
  { name: "CeraVe", href: "/category/cerave/" },
  { name: "Medicube", href: "/category/medicube/" },
  { name: "The Ordinary", href: "/category/the-ordinary/" },
];

export default function BrandCarousel() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-24">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Shop by Brand</p>
          <h2 className="mt-2 font-display text-3xl italic text-ink">Beauty Brands You’ll Love</h2>
        </div>
        <Link href="/brand" prefetch={false} className="shrink-0 text-sm text-purple-700 hover:underline">
          View More
        </Link>
      </div>

      <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {BRANDS.map((brand) => (
          <Link
            key={brand.name}
            href={brand.href}
            prefetch={false}
            className="group flex w-full flex-col items-center text-center"
          >
            <div className="relative aspect-square w-full max-w-40 overflow-hidden rounded-full bg-purple-50 ring-1 ring-line transition group-hover:ring-purple-300">
              <div className="flex h-full items-center justify-center font-display text-lg italic text-purple-400">
                {brand.name.charAt(0)}
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-xs font-medium text-ink transition group-hover:text-purple-700">
              {brand.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

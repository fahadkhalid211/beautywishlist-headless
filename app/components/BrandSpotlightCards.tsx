import Link from "next/link";
import Image from "next/image";

type SpotlightBrand = {
  name: string;
  description: string;
  gradient: string;
};

const SPOTLIGHT_BRANDS: SpotlightBrand[] = [
  {
    name: "CeraVe",
    description: "Dermatologist-developed formulas with essential ceramides to restore and maintain your skin's natural barrier.",
    gradient: "from-sky-100 to-purple-50",
  },
  {
    name: "The Ordinary",
    description: "Clinical, no-nonsense formulations with clearly communicated ingredients — skincare stripped back to what works.",
    gradient: "from-amber-50 to-purple-50",
  },
  {
    name: "Beauty of Joseon",
    description: "Traditional Korean herbal ingredients meet modern skincare science, inspired by centuries-old beauty rituals.",
    gradient: "from-rose-50 to-purple-50",
  },
];

function findCategory(categories: any[], name: string) {
  const target = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return categories.find((c: any) => c.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(target));
}

export default function BrandSpotlightCards({ categories }: { categories: any[] }) {
  const cards = SPOTLIGHT_BRANDS.map((brand) => ({
    ...brand,
    category: findCategory(categories, brand.name),
  })).filter((c) => c.category);

  if (cards.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Featured Brands</p>
        <h2 className="mt-2 font-display text-3xl italic text-ink">Brands We Love</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((brand) => (
          <Link
            key={brand.name}
            href={`/category/${brand.category.slug}`}
            className="group overflow-hidden rounded-3xl border border-line bg-white transition hover:border-purple-300 hover:shadow-lg hover:shadow-purple-900/5"
          >
            <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${brand.gradient}`}>
              {brand.category.image?.src ? (
                <Image
                  src={brand.category.image.src}
                  alt={brand.category.image.alt || brand.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-display text-4xl italic text-purple-300">{brand.name}</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl italic text-ink">{brand.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{brand.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-700">
                Shop {brand.name}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { decodeEntities } from "@/lib/decodeEntities";

type FeaturedBrandConfig = {
  slug: string;
  name: string;
  fallbackImage?: string;
};

const FEATURED_BRANDS: FeaturedBrandConfig[] = [
  {
    slug: "cerave",
    name: "CeraVe",
    fallbackImage: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2026/09/cbwns1.jpg",
  },
  {
    slug: "medicube",
    name: "Medicube",
    fallbackImage: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2025/06/download-2025-06-10T143926.393.jpg",
  },
  {
    slug: "the-ordinary",
    name: "The Ordinary",
    fallbackImage: "/images/ord.avif",
  },
  {
    slug: "anua",
    name: "Anua",
    fallbackImage: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2026/07/anuapdrnm1.jpg",
  },
  {
    slug: "dr-althea",
    name: "Dr. Althea",
    fallbackImage: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2025/05/34511.jpg",
  },
  {
    slug: "beauty-of-joseon",
    name: "Beauty of Joseon",
    fallbackImage: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2025/05/download-2024-04-11T183440.722.jpg",
  },
  {
    slug: "purito",
    name: "Purito",
    fallbackImage: "https://new.beautywishlistbyhs.shop/wp-content/uploads/2025/05/pbccc.jpg",
  },
];

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findCategory(categories: any[], slug: string, name: string) {
  if (!categories || !Array.isArray(categories) || categories.length === 0) return null;
  const targetSlug = normalize(slug);
  const targetName = normalize(name);

  return (
    categories.find((c: any) => normalize(c?.slug || "") === targetSlug) ||
    categories.find((c: any) => {
      const cName = normalize(c?.name || "");
      return cName.length > 0 && (cName.includes(targetName) || targetName.includes(cName));
    }) ||
    null
  );
}

export default function BrandCarousel({ categories = [] }: { categories?: any[] }) {
  const brands = FEATURED_BRANDS.map((brand) => {
    const matchedCategory = findCategory(categories, brand.slug, brand.name);
    const slug = matchedCategory?.slug || brand.slug;
    const name = decodeEntities(matchedCategory?.name || brand.name);
    // Prioritize official WooCommerce category image
    const imageSrc = matchedCategory?.image?.src || brand.fallbackImage;
    const imageAlt = matchedCategory?.image?.alt || `${name} brand skincare`;

    return {
      name,
      slug,
      href: `/category/${slug}`,
      imageSrc,
      imageAlt,
    };
  });

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
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={brand.href}
            prefetch={false}
            className="group flex w-full flex-col items-center text-center"
          >
            <div className="relative aspect-square w-full max-w-40 overflow-hidden rounded-full bg-purple-50 ring-1 ring-line transition group-hover:ring-purple-300">
              {brand.imageSrc ? (
                <Image
                  src={brand.imageSrc}
                  alt={brand.imageAlt}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 160px"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-lg italic text-purple-400">
                  {brand.name.charAt(0)}
                </div>
              )}
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

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCategories } from "@/lib/woocommerce";
import { decodeEntities } from "@/lib/decodeEntities";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Browse every brand we carry at Beauty Wishlist by HS, from A to Z.",
  alternates: { canonical: "/brand" },
};

export const dynamic = "force-dynamic";

export default async function BrandPage() {
  const categories = await getCategories();
  const visible = categories
    .filter((c: any) => c.count > 0)
    .map((c: any) => ({ ...c, name: decodeEntities(c.name) }));

  const groups = new Map<string, any[]>();
  for (const category of visible) {
    const letter = /^[a-z]/i.test(category.name) ? category.name.charAt(0).toUpperCase() : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(category);
  }

  const letters = Array.from(groups.keys()).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  for (const letter of letters) {
    groups.get(letter)!.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
        <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink">All Brands</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
          Browse every brand we carry, from A to Z.
        </p>

        {letters.length === 0 ? (
          <p className="mt-10 text-sm text-ink-soft">No categories found.</p>
        ) : (
          <>
            <div className="sticky top-20 z-10 -mx-6 mt-8 overflow-x-auto bg-bg px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2">
                {letters.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
                  >
                    {letter}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-12">
              {letters.map((letter) => (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                  <h2 className="mb-5 font-display text-2xl italic text-purple-700">{letter}</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {groups.get(letter)!.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition hover:border-purple-300 hover:shadow-md hover:shadow-purple-900/5"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-purple-50">
                          {category.image?.src ? (
                            <Image
                              src={category.image.src}
                              alt={category.image.alt || category.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-display text-sm italic text-purple-400">
                              {category.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="line-clamp-2 text-sm font-medium text-ink transition group-hover:text-purple-700">
                          {category.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

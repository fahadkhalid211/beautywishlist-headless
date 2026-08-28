import Image from "next/image";
import Link from "next/link";
import { searchProducts } from "@/lib/woocommerce";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

  const products = query
    ? await searchProducts({
        search: query,
      })
    : [];

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            Beauty Wishlist
          </p>

          <h1 className="mt-3 text-5xl font-light tracking-tight">
            Search
          </h1>
        </div>

        <form
          method="GET"
          className="mb-12 flex max-w-3xl"
        >
          <input
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="min-w-0 flex-1 border border-neutral-300 px-5 py-4 text-sm outline-none"
          />

          <button
            type="submit"
            className="bg-black px-8 text-sm text-white"
          >
            Search
          </button>
        </form>

        {query && (
          <p className="mb-8 text-sm text-neutral-500">
            {products.length} results for "{query}"
          </p>
        )}

        {!query ? (
          <div className="py-24 text-center">
            <p className="text-neutral-500">
              Search Beauty Wishlist products.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-2xl font-medium">
              No products found
            </h2>

            <p className="mt-3 text-sm text-neutral-500">
              Try another search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
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
                        alt={
                          image.alt ||
                          product.name
                        }
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
                    {(
                      Number(
                        product.prices.price
                      ) / 100
                    ).toLocaleString("en-PK")}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

      </section>
    </main>
  );
}
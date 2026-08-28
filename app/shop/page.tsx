import Image from "next/image";
import Link from "next/link";
import {
  getCategories,
  searchProducts,
} from "@/lib/woocommerce";

type SearchParams = {
  category?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  sale?: string;
  stock?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  let orderby = "date";
  let order = "desc";

  if (params.sort === "price-low") {
    orderby = "price";
    order = "asc";
  }

  if (params.sort === "price-high") {
    orderby = "price";
    order = "desc";
  }

  if (params.sort === "newest") {
    orderby = "date";
    order = "desc";
  }

  if (params.sort === "name") {
    orderby = "title";
    order = "asc";
  }

  const [products, categories] = await Promise.all([
    searchProducts({
      category: params.category,
      minPrice: params.min_price,
      maxPrice: params.max_price,
      orderby,
      order,
      onSale: params.sale === "true",
      stockStatus:
        params.stock === "true"
          ? "instock"
          : undefined,
    }),
    getCategories(),
  ]);

  const visibleCategories = categories.filter(
    (category: any) => category.count > 0
  );

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            Beauty Wishlist
          </p>

          <h1 className="mt-3 text-5xl font-light tracking-tight">
            Shop
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">
            Discover beauty products from our collection.
          </p>
        </div>

        <form
          method="GET"
          className="mb-12 border-y border-neutral-200 py-6"
        >
          <div className="grid gap-6 md:grid-cols-4">

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-400">
                Category
              </label>

              <select
                name="category"
                defaultValue={params.category || ""}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  All Categories
                </option>

                {visibleCategories.map(
                  (category: any) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-400">
                Minimum Price
              </label>

              <input
                name="min_price"
                type="number"
                min="0"
                placeholder="PKR 0"
                defaultValue={params.min_price || ""}
                className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-400">
                Maximum Price
              </label>

              <input
                name="max_price"
                type="number"
                min="0"
                placeholder="PKR 100000"
                defaultValue={params.max_price || ""}
                className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-400">
                Sort
              </label>

              <select
                name="sort"
                defaultValue={params.sort || ""}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  Recommended
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name: A-Z
                </option>
              </select>
            </div>

          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6">

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="sale"
                value="true"
                defaultChecked={params.sale === "true"}
              />

              On Sale
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="stock"
                value="true"
                defaultChecked={params.stock === "true"}
              />

              In Stock
            </label>

            <button
              type="submit"
              className="ml-auto bg-black px-7 py-3 text-sm text-white transition hover:bg-neutral-800"
            >
              Apply Filters
            </button>

            <Link
              href="/shop"
              className="border border-neutral-300 px-7 py-3 text-sm"
            >
              Clear
            </Link>

          </div>
        </form>

        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {products.length} products
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-32 text-center">
            <h2 className="text-2xl font-medium">
              No products found
            </h2>

            <p className="mt-3 text-sm text-neutral-500">
              Try changing your filters.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block bg-black px-7 py-3 text-sm text-white"
            >
              View All Products
            </Link>
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
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}

                    {product.on_sale && (
                      <span className="absolute left-3 top-3 bg-black px-3 py-1 text-xs text-white">
                        Sale
                      </span>
                    )}

                    {!product.is_in_stock && (
                      <span className="absolute left-3 top-3 bg-white px-3 py-1 text-xs text-black">
                        Sold Out
                      </span>
                    )}

                  </div>

                  <div className="pt-4">

                    <h2 className="text-sm font-medium">
                      {product.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-2">

                      {product.on_sale &&
                        product.prices.regular_price && (
                          <span className="text-sm text-neutral-400 line-through">
                            {
                              product.prices.currency_prefix
                            }

                            {(
                              Number(
                                product.prices
                                  .regular_price
                              ) / 100
                            ).toLocaleString(
                              "en-PK"
                            )}
                          </span>
                        )}

                      <span className="text-sm text-neutral-600">
                        {
                          product.prices
                            .currency_prefix
                        }

                        {(
                          Number(
                            product.prices.price
                          ) / 100
                        ).toLocaleString(
                          "en-PK"
                        )}
                      </span>

                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </section>
    </main>
  );
}
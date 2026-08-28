import Link from "next/link";
import { getProducts } from "@/lib/woocommerce";

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="mb-10 text-4xl font-bold">
        Beauty Wishlist
      </h1>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product: any) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group block"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
              {product.images?.[0] && (
                <img
                  src={product.images[0].src}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              )}
            </div>

            <h2 className="mt-3 font-medium">
              {product.name}
            </h2>

            <p className="mt-1 text-gray-500">
              {product.prices.currency_prefix}
              {(Number(product.prices.price) / 100).toLocaleString(
                "en-PK"
              )}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
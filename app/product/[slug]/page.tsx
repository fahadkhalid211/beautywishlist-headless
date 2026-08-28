import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/woocommerce";
import AddToCart from "@/app/components/cart/AddToCart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const image = product.images?.[0];

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2">

        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {image && (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              priority
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center">

          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Beauty Wishlist
          </p>

          <h1 className="mt-4 text-4xl font-medium tracking-tight">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl">
            {product.prices.currency_prefix}
            {(Number(product.prices.price) / 100).toLocaleString(
              "en-PK"
            )}
          </p>

          {product.short_description && (
            <div
              className="mt-8 text-sm leading-7 text-neutral-600"
              dangerouslySetInnerHTML={{
                __html: product.short_description,
              }}
            />
          )}

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium">
              Quantity
            </p>

            <div className="flex w-fit items-center border">
              <button className="px-5 py-3">
                −
              </button>

              <span className="px-5">
                1
              </span>

              <button className="px-5 py-3">
                +
              </button>
            </div>
          </div>

          <div className="mt-8">
  <AddToCart productId={product.id} />
</div>

          <div
            className="prose prose-sm mt-10 max-w-none text-neutral-600"
            dangerouslySetInnerHTML={{
              __html: product.description,
            }}
          />

        </div>
      </div>
    </main>
  );
}
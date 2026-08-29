import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import Carousel from "@/app/components/Carousel";

export default function ProductCarouselSection({
  eyebrow,
  title,
  products,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  products: any[];
  viewAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-purple-600">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl italic text-ink">{title}</h2>
        </div>
        <Link href={viewAllHref} className="shrink-0 text-sm text-purple-700 hover:underline">
          View all
        </Link>
      </div>

      <Carousel>
        {products.map((product: any) => (
          <div key={product.id} className="w-[45%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]">
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>
    </section>
  );
}

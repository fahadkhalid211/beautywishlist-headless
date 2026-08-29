import Link from "next/link";
import Image from "next/image";

export default function JourneyBanner({ backgroundImage }: { backgroundImage?: { src: string; alt: string } }) {
  return (
    <section className="relative isolate mb-24 overflow-hidden">
      <div className="relative h-[420px] w-full sm:h-[380px]">
        {backgroundImage && (
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-purple-900/50" />
        <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-[2px]" />

        <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-200">Beauty Wishlist</p>
          <h2 className="mt-4 font-display text-4xl italic tracking-tight text-white md:text-5xl">
            Your Beauty Journey Starts Here
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/80">
            From your first cleanser to your holy-grail serum, we&apos;re here for every step —
            curated skincare and cosmetics that grow with your routine, not against your skin.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-medium text-ink transition hover:bg-purple-50"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

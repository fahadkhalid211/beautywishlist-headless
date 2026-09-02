import Link from "next/link";

export default function BackendUnavailable({ itemType }: { itemType: "products" | "category" }) {
  const label = itemType === "category" ? "category" : "product";

  return (
    <main className="min-h-[60vh] bg-bg">
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist by HS</p>
        <h1 className="mt-3 font-display text-3xl italic text-ink sm:text-4xl">
          We&apos;re refreshing the {label} data
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-ink-soft">
          The storefront is still online, but our product service is temporarily not responding. Please try again in a moment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-purple-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-line bg-white px-6 py-3 text-sm font-medium text-ink transition hover:border-purple-300 hover:text-purple-700"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

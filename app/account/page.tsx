export default function AccountPage() {
  const wpAccountUrl = `${process.env.NEXT_PUBLIC_WP_URL}/my-account/`;

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
        <h1 className="mt-3 font-display text-4xl italic tracking-tight text-ink">My Account</h1>
        <p className="mt-4 text-sm leading-6 text-ink-soft">
          Manage orders, addresses and account details on your WooCommerce account page.
        </p>
        <a href={wpAccountUrl} className="mt-8 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700">
          Go to My Account
        </a>
      </section>
    </main>
  );
}
export default function CartPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-5xl font-light">
          Cart
        </h1>

        <div className="mt-12 border-t border-neutral-200 pt-12">
          <p className="text-neutral-500">
            Your cart is empty.
          </p>
        </div>
      </section>
    </main>
  );
}
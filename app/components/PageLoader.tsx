export default function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-purple-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-600" />
        </div>
        <p className="font-display text-sm italic text-ink-soft">Loading...</p>
      </div>
    </main>
  );
}

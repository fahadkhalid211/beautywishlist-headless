"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6">
      <div className="blob -left-32 -top-32 h-96 w-96" />
      <div className="blob -right-20 bottom-0 h-72 w-72 opacity-40" />

      <div className="relative mx-auto max-w-lg text-center">
        <p className="font-display text-6xl italic tracking-tight text-purple-300">Oops</p>
        <h1 className="mt-4 font-display text-3xl italic tracking-tight text-ink md:text-4xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-ink-soft">
          We couldn&apos;t load this page just now. Please try again in a moment.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-line px-8 py-3.5 text-sm font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

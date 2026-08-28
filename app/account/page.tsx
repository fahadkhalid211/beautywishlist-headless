"use client";

import { useState } from "react";

export default function AccountPage() {
  const wpAccountUrl = `${process.env.NEXT_PUBLIC_WP_URL}/my-account/`;
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);

  return (
    <main className="min-h-screen bg-bg">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-purple-600">Beauty Wishlist</p>
            <h1 className="mt-2 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
              My Account
            </h1>
          </div>
          <a
            href={wpAccountUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-soft transition hover:border-purple-300 hover:text-purple-700 md:inline-flex"
          >
            Open in new tab
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-line bg-white">
          {!loaded && !blocked && (
            <div className="flex h-[70vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
            </div>
          )}

          {blocked && (
            <div className="flex h-[70vh] flex-col items-center justify-center px-8 text-center">
              <p className="font-display text-2xl italic text-ink">Account page can&apos;t be embedded</p>
              <p className="mt-2 max-w-sm text-sm text-ink-soft">
                Your WordPress site is blocking embedding (X-Frame-Options / CSP). Open your account in a new tab instead.
              </p>
              <a
                href={wpAccountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-purple-600 px-8 py-4 text-sm font-medium text-white transition hover:bg-purple-700"
              >
                Go to My Account
              </a>
            </div>
          )}

          <iframe
            src={wpAccountUrl}
            title="My Account"
            className={`h-[80vh] w-full ${loaded ? "block" : "hidden"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setBlocked(true)}
            referrerPolicy="origin"
          />
        </div>

        <a
          href={wpAccountUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft transition hover:text-purple-700 md:hidden"
        >
          Open in new tab
        </a>
      </section>
    </main>
  );
}

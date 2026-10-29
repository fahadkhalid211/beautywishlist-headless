"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "bw_pay_online_offer_dismissed";

export default function PaymentOfferModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(true);

  useEffect(() => {
    // Show on page load if not dismissed in this session
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Short delay so page loads smoothly before popup appears
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case of restricted iframe/storage
      const timer = setTimeout(() => setIsOpen(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setIsStickyVisible(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Sticky Tab at Middle-Left Side of Screen (Vertical) */}
      {isStickyVisible && !isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Pay Online get 4% Off promotion"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 rounded-r-2xl bg-gradient-to-b from-purple-700 via-purple-600 to-purple-700 py-3.5 px-2 sm:px-2.5 text-white shadow-xl shadow-purple-950/30 border-y border-r border-purple-300/40 transition-all duration-300 hover:translate-x-1 hover:shadow-purple-900/40 focus:outline-none focus:ring-2 focus:ring-purple-400 group cursor-pointer"
        >
          {/* Discount Tag Icon */}
          <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-amber-300 backdrop-blur-xs transition-transform group-hover:scale-110">
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.75 2.25a.75.75 0 0 0-.53.22L3.47 11.22a.75.75 0 0 0 0 1.06l8.25 8.25c.293.293.767.293 1.06 0l8.75-8.75a.75.75 0 0 0 .22-.53V3.75a1.5 1.5 0 0 0-1.5-1.5h-7.5ZM17.25 7a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" />
            </svg>
          </span>

          {/* Vertical Text */}
          <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] sm:text-xs font-semibold tracking-wider text-white whitespace-nowrap py-1">
            Pay Online get 4% Off
          </span>
        </button>
      )}

      {/* Modal Backdrop & Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-online-offer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white border border-purple-100 shadow-2xl shadow-purple-950/25 animate-in zoom-in-95 duration-200">
            {/* Background luxury gradient aura */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-purple-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blush/40 blur-3xl" />

            {/* Close Button (Cross) */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close offer modal"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 text-ink-soft transition hover:bg-purple-50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="relative p-6 sm:p-8 text-center">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-semibold text-purple-700 tracking-wide uppercase">
                <span className="text-amber-500">✨</span> Exclusive Savings
              </div>

              {/* Decorative Luxury Discount Icon */}
              <div className="mt-5 mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-700 via-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/25">
                <div className="flex flex-col items-center">
                  <span className="font-display text-2xl italic font-bold tracking-tight">4%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-200">OFF</span>
                </div>
              </div>

              {/* Headline */}
              <h2
                id="pay-online-offer-title"
                className="mt-4 font-display text-3xl italic tracking-tight text-ink sm:text-4xl"
              >
                Pay Online &amp; Get 4% Off
              </h2>

              {/* Description */}
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                Enjoy an automatic <strong className="font-semibold text-purple-700">4% discount</strong> on your entire order whenever you pay online via <strong className="font-semibold text-ink">Direct Bank Transfer</strong> at checkout.
              </p>

              {/* Benefits list */}
              <div className="mt-5 space-y-2 rounded-2xl bg-purple-50/70 p-3.5 text-left text-xs text-ink sm:text-sm border border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">✓</span>
                  <span>Instant 4% off applied right at checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">✓</span>
                  <span>Pay with any Pakistani Bank, Nayapay, or SadaPay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[10px] text-white">✓</span>
                  <span>100% Authentic Korean skincare guaranteed</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  href="/shop"
                  onClick={handleClose}
                  className="w-full rounded-full bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-purple-900/20 transition hover:bg-purple-700 text-center"
                >
                  Shop Now &amp; Save 4%
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs font-medium text-ink-soft hover:text-purple-700 transition py-1"
                >
                  Continue browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

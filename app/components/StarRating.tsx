export default function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i < full ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
            <path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L10 15l-5.6 3 1.4-6.2L1 8.5l6.4-.6z" />
          </svg>
        ))}
      </div>
      {typeof count === "number" && <span className="text-xs text-ink-soft">({count})</span>}
    </div>
  );
}
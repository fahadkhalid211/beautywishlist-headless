"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body style={{ margin: 0, fontFamily: "Helvetica, Arial, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FBF7FC",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", color: "#362B3F", margin: 0 }}>Something went wrong</h1>
            <p style={{ color: "#7A6C84", marginTop: "12px", fontSize: "14px" }}>
              We couldn&apos;t load this page just now. Please try again in a moment.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "24px",
                background: "#8347C9",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "14px 32px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

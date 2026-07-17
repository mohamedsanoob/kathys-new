"use client";

import { useEffect } from "react";

/**
 * Top-level error boundary — the last resort when the root layout itself throws
 * (or when a route error isn't caught by a nearer error.tsx). Replaces the
 * layout, so it ships its own <html>/<body> and inline styles (no Tailwind
 * guaranteed at this level).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            maxWidth: 480,
            margin: "80px auto",
            padding: 24,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: 20, margin: "0 0 8px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#666", margin: "0 0 24px" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "8px 16px",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

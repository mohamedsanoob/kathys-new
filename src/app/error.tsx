"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary. Without this, any client-side render throw
 * (e.g. a missing field on an order/cart object after returning from PhonePe)
 * escalates to Next.js's generic "Application error" page. This keeps the app
 * shell intact and gives the user a way back, while logging the real error.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto p-6 min-h-[50vh] flex flex-col items-center justify-center text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

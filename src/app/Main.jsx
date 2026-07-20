"use client";

import { useScrollContainer } from "@/context/ScrollContext";

export default function Main({ children }) {
  const { scrollContainerRef } = useScrollContainer();

  // min-h-0 is required so a flex child can shrink and scroll internally
  // instead of growing the page / fighting body scroll.
  return (
    <main
      className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain"
      ref={scrollContainerRef}
    >
      {children}
    </main>
  );
}

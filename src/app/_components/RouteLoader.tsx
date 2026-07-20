"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Full-screen loader shown during client-side route transitions.
//
// The App Router gives no navigation "start" event, so we detect starts via
// document-level click delegation on <a> (every next/link renders one) and
// detect completion via pathname + search changing.
//
// A ~200ms grace delay means fast/prefetched routes never flash the overlay —
// it only appears when a navigation actually drags on (e.g. a server-rendered
// route waiting on Firestore).
const SHOW_DELAY_MS = 200;
const MAX_SHOW_MS = 8000;

export default function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() || "";
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Start on any internal link click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      )
        return;

      setLoading(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Delay showing so quick navigations don't flash a full-screen overlay.
  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    const safety = setTimeout(() => setLoading(false), MAX_SHOW_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(safety);
    };
  }, [loading]);

  // The new route committed — stop (pathname OR search).
  useEffect(() => {
    setLoading(false);
  }, [pathname, search]);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes route-loader-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div
        aria-busy="true"
        aria-live="polite"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        style={{ animation: "route-loader-fade-in 150ms ease-out" }}
      >
        <Loader2 className="h-12 w-12 animate-spin text-green-700" />
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type AdBannerTypes = {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
};

const AdBanner = ({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
}: AdBannerTypes) => {
  // Render the <ins> only after mount. The AdSense script mutates the <ins>
  // at runtime (injects data-adsbygoogle-status / data-ad-status and an
  // <iframe> child), so SSR-ing the <ins> causes a hydration mismatch.
  // Server renders null, client's first render is null too → they match.
  const [mounted, setMounted] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pushed.current) return;
    try {
      // Ensure the global adsbygoogle array exists, then push the ad request.
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error: any) {
      console.error("AdSense error:", error.message);
    }
    pushed.current = true; // avoid double-push in React StrictMode (dev)
  }, [mounted]);

  if (!mounted) return null;

  return (
    <ins
      className="adsbygoogle"
      suppressHydrationWarning
      style={{ display: "block", width: "100%" }}
      data-ad-client="ca-pub-3165206582082381"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    />
  );
};

export default AdBanner;

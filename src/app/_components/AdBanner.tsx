"use client";

import React, { useEffect, useRef } from "react";

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
  const effectRan = useRef(false);

  useEffect(() => {
    // This check prevents the effect from running twice in development
    // due to React's StrictMode.
    if (effectRan.current === true) {
      return;
    }

    try {
      // Ensure the global adsbygoogle array exists, then push the ad request.
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error: any) {
      console.error("AdSense error:", error.message);
    }

    // Mark the effect as having run once.
    effectRan.current = true;
  }, []); // The empty dependency array is correct.

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%" }} // Ensure the container has dimensions
      data-ad-client="ca-pub-3165206582082381"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    ></ins>
  );
};

export default AdBanner;
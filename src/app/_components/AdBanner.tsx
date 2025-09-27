"use client";

import React, { useEffect } from "react";

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
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (error: any) {
      console.log(error.message);
    }
  }, []);

  return (
<ins
  className="adsbygoogle"
  style={{
    display: "inline-block",
    width: "200px",
    height: "300px"
  }}
  data-ad-client="ca-pub-8258677943197720"
  data-ad-slot={dataAdSlot}
  data-ad-format={dataAdFormat}
  data-full-width-responsive={dataFullWidthResponsive.toString()}
/>

  );
};

export default AdBanner;
// app/components/TrackPageView.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag === 'undefined') return;
    
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
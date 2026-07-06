
"use client";

import { useScrollContainer } from "@/context/ScrollContext";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function Main({children}) {

 const { scrollContainerRef } = useScrollContainer();

  return (
   <main className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
                  {children}
               </main>
  );
}

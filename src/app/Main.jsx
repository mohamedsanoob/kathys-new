
"use client";

import { useCategoryContext } from "@/context/CategoryContext";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";



 

export default function Main({children}) {

 const {
       scrollContainerRef
    } = useCategoryContext();

  return (
   <main className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
                <Suspense
                  fallback={
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </main>
  );
}

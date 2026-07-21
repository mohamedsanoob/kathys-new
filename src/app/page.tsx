import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import Collections from "./_components/Collections";
import Footer from "./_components/Footer";
import Help from "./_components/Help";
import { getCollectionsWithProductsServer } from "@/lib/queries";

// Keep dynamic so build doesn't need Firebase creds. Home data is cached via
// Next `unstable_cache` (5 min) inside getCollectionsWithProductsServer.
export const dynamic = "force-dynamic";

const Rating = nextDynamic(() => import("./_components/Rating"), {
  loading: () => <div className="min-h-[280px]" aria-hidden />,
});

function CollectionsSkeleton() {
  return (
    <div className="max-w-[1290px] mx-auto px-4 py-8 space-y-16 animate-pulse">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <div className="h-7 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

async function HomeCollections() {
  // `undefined` = SSR failed → client may retry.
  // `[]` = loaded successfully with no sections.
  let collections:
    | Awaited<ReturnType<typeof getCollectionsWithProductsServer>>
    | undefined = undefined;
  try {
    collections = await getCollectionsWithProductsServer();
  } catch (error) {
    console.error("Home collections SSR failed:", error);
  }

  return <Collections initialData={collections} />;
}

export default function Home() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <Suspense fallback={<CollectionsSkeleton />}>
        <HomeCollections />
      </Suspense>
      <Rating />
      <Help />
      <Footer />
    </div>
  );
}

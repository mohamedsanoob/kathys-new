import Image from "next/image";
import Link from "next/link";
import { getAllCategoriesServer } from "@/lib/queries";
import AdBanner from "../_components/AdBanner";
import CategoryCouponPromo from "../_components/CategoryCouponPromo";

// Reads Firestore via the Admin SDK; render server-side per request instead of
// prerendering at build (avoids needing Firebase creds at build time).
export const dynamic = "force-dynamic";

// Async Server Component — data is fetched on the server and the HTML is
// streamed with content already present (no client spinner). The route-level
// loading.tsx shows a skeleton while this resolves.
export default async function CategoriesList() {
  const categories = await getAllCategoriesServer();

  return (
    <div className="p-4 md:w-[92%] md:m-auto">
      <h1 className="text-1xl mb-3">All Category</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories
          ?.filter((category) => !category?.isSubcategory)
          .map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative block rounded-lg overflow-hidden hover:shadow-md transition-all"
              aria-label={category.categoryName}
              prefetch={true}
            >
              <CategoryCouponPromo categoryId={category.id} variant="badge" />
              {/* Category Banner Image */}
              <div className="aspect-square bg-gray-100 relative">
                {category.images?.[0] ? (
                  <Image
                    src={category.images[0]}
                    alt={category.categoryName}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    priority={true}
                    quality={50}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>

              {/* Category Name Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                <h3 className="text-white font-medium text-center w-full drop-shadow-md">
                  {category.categoryName}
                </h3>
              </div>
            </Link>
          ))}
      </div>
      <AdBanner
        dataAdFormat="auto"
        dataFullWidthResponsive={true}
        dataAdSlot="8608034205"
      />
    </div>
  );
}

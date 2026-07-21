import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductByIdServer, getRelatedProductsServer } from "@/lib/queries";
import ProductClient from "./_components/ProductClient";
import RelatedProducts from "./_components/RelatedProducts";

// Dynamic route — product is fetched first; related products stream in after
// so they don't block landing the main product UI.
export const dynamic = "force-dynamic";

function RelatedProductsFallback() {
  return (
    <div className="flex flex-col gap-4 px-4 sm:px-0 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <hr className="border-gray-200" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="w-full h-[250px] md:h-[440px] bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function RelatedProductsSection({
  categories,
  excludeId,
}: {
  categories: string[];
  excludeId: string;
}) {
  const related = categories.length
    ? await getRelatedProductsServer(categories)
    : [];
  const filtered = related
    .filter((p) => p.id !== excludeId)
    .slice(0, 4);

  return (
    <RelatedProducts categories={categories} initialProducts={filtered} />
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) {
  const { product_id } = await params;

  const product = await getProductByIdServer(product_id);
  if (!product) notFound();

  return (
    <ProductClient product={product}>
      <Suspense fallback={<RelatedProductsFallback />}>
        <RelatedProductsSection
          categories={product.categories || []}
          excludeId={product_id}
        />
      </Suspense>
    </ProductClient>
  );
}

import { notFound } from "next/navigation";
import { getProductByIdServer, getRelatedProductsServer } from "@/lib/queries";
import ProductClient from "./_components/ProductClient";

// Dynamic route — server-rendered on demand. Product + related products are
// fetched on the server (no client spinner on first paint); interactive UI
// lives in ProductClient.
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) {
  const { product_id } = await params;

  const product = await getProductByIdServer(product_id);
  if (!product) notFound();

  const relatedProducts = product.categories?.length
    ? await getRelatedProductsServer(product.categories)
    : [];

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}

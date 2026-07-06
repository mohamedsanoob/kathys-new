import { notFound } from "next/navigation";
import {
  getCategoryByIdServer,
  getProductsByCategoryServer,
  getColorsByCategoryServer,
  getSizesByCategoryServer,
  getMinMaxPriceByCategoryServer,
} from "@/lib/queries";
import CategoryClient, { CategoryClientData } from "./_components/CategoryClient";

// Dynamic route — server-rendered on demand. The first page (category +
// products + filter facets) is pre-fetched on the server so first paint has
// content; pagination/filter changes are handled client-side.
export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const currentCategory = await getCategoryByIdServer(id);
  if (!currentCategory) notFound();

  const sortBy = typeof sp.sortBy === "string" ? sp.sortBy : "latest";
  const minPrice = sp.minPrice ? parseInt(String(sp.minPrice)) : undefined;
  const maxPrice = sp.maxPrice ? parseInt(String(sp.maxPrice)) : undefined;
  const color = typeof sp.color === "string" ? sp.color : undefined;
  const sizesParam = typeof sp.sizes === "string" ? sp.sizes : undefined;
  const sizes = sizesParam ? sizesParam.split(",") : undefined;

  const subCategories = (currentCategory.subCategories as string[]) || [];

  const [productsData, subCategoriesDetails, colors, sizesFacets, price] =
    await Promise.all([
      getProductsByCategoryServer({
        categoryId: id,
        limit: 10,
        sortBy,
        minPrice,
        maxPrice,
        colorFilter: color,
        sizeFilter: sizes,
      }),
      Promise.all(subCategories.map((subId) => getCategoryByIdServer(subId))).then(
        (arr) => arr.filter(Boolean) as NonNullable<(typeof arr)[number]>[]
      ),
      getColorsByCategoryServer(id),
      getSizesByCategoryServer(id),
      getMinMaxPriceByCategoryServer(id),
    ]);

  const initialData: CategoryClientData = {
    products: productsData.products,
    totalCount: productsData.totalCount,
    currentCategory,
    subCategoriesDetails,
    lastProductId: productsData.lastProductId,
    facets: { colors, sizes: sizesFacets, price },
  };

  return <CategoryClient initialData={initialData} />;
}

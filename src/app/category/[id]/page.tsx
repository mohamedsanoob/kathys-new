"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory, getCategoryById } from "@/actions/actions";

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<{
    products: any[];
    totalCount: number;
    categories: any;
  } | null>(null);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [subCategoriesDetails, setSubCategoriesDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const limit = ITEMS_PER_PAGE;
        const cursor = null;

        // Fetch main data
        const productsData = await getProductsByCategory(id, limit, cursor);
        setData(productsData);

        // Fetch current category details
        const category = await getCategoryById(id);
        setCurrentCategory(category);

        // Fetch all subcategory details
        if (productsData.categories?.subCategories?.length) {
          const subCategoriesPromises =
            productsData.categories.subCategories.map((subCategoryId: string) =>
              getCategoryById(subCategoryId)
            );
          const subCategories = await Promise.all(subCategoriesPromises);
          setSubCategoriesDetails(subCategories.filter(Boolean));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || !currentCategory) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <p>No data found</p>
      </div>
    );
  }

  const initialProducts = data.products.map((product) => ({
    ...product,
    createdDate: product.createdDate ? product.createdDate.toMillis() : null,
    updatedDate: product.updatedDate ? product.updatedDate.toMillis() : null,
  }));

  return (
    <div className="flex flex-col max-w-[1290px] mx-auto md:mt-[1rem] p-1">
      {subCategoriesDetails.length > 0 && (
        <div className="mb-5 mt-3 px-2 md:px-0">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10">
            {subCategoriesDetails.map((subCategory) => (
              <Link
                key={subCategory.id}
                href={`/category/${subCategory.id}`}
                className="group relative overflow-hidden rounded-md aspect-square hover:shadow-md transition-all duration-200"
              >
                {subCategory.images?.[0] && (
                  <div className="absolute inset-0">
                    <Image
                      src={subCategory.images[0]}
                      alt={subCategory.categoryName}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      sizes="(max-width: 640px) 100px, (max-width: 768px) 80px, 70px"
                      // 1) Let off-screen images lazy-load (default in Next.js), only critical ones use eager.
                      loading="lazy"
                      // 2) Drop quality to 65 for ~30% smaller files without visible artifacts.
                      quality={65}
                      // 3) Show a tiny blurred SVG while the full image loads.
                    />
                    <div className="absolute inset-0 bg-opacity-25 group-hover:bg-opacity-15 transition-all duration-150" />
                  </div>
                )}
                <div className="relative h-full flex items-end p-2">
                  <span className="text-white font-medium text-sm drop-shadow-sm line-clamp-2">
                    {subCategory.categoryName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        <FilterSection categoryName={id} />
        <ProductsSection
          initialProducts={initialProducts}
          totalProducts={data.totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          categoryName={id}
          categoryImageDesktop={currentCategory?.desktopBanner}
          categoryImageMobile={currentCategory?.mobileBanner}
        />
      </div>
    </div>
  );
};

export default Page;

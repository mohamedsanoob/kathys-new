"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory, getCategoryById } from "@/actions/actions";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const { id } = useParams<{ id: string }>();
const router = useRouter();
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
  {/* Back Button - Made more mobile-friendly */}
  <div className="mb-3 px-2 mt-3 md:px-0">
    <button
      onClick={() => router.back()}
      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition md:px-4 md:py-2"
    >
      ← Back
    </button>
  </div>

  {/* Subcategories Scrollable Section - Enhanced for mobile */}
  {subCategoriesDetails.length > 0 && (
    <div className="mb-5 px-2 md:px-0">
      <div className="relative">
        {/* Scrollable container with mobile touch-friendly padding */}
        <div className="overflow-x-auto pb-4 -mx-2 px-2 md:-mx-4 md:px-4 touch-pan-x">
          <div className="inline-flex gap-2 w-max min-w-full md:gap-3">
            {subCategoriesDetails.map((subCategory) => (
              <Link
                key={subCategory.id}
                href={`/category/${subCategory.id}`}
                className="group relative flex-shrink-0 overflow-hidden rounded-lg hover:shadow-lg transition-all duration-200 bg-gray-500"
                style={{ 
                  width: '120px', 
                  height: '120px',
                  '@media (minWidth: 768px)': {
                    width: '160px',
                    height: '160px'
                  }
                }}
              >
                {subCategory.images?.[0] && (
                  <div className="absolute inset-0">
                    <Image
                      src={subCategory?.images[0]}
                      alt={subCategory?.categoryName}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105 md:group-hover:scale-110"
                      sizes="(max-width: 640px) 120px, 160px"
                      loading="lazy"
                      quality={70}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20 group-hover:from-black/40 group-hover:to-black/10 transition-all duration-300" />
                  </div>
                )}
                <div className="relative h-full flex items-end p-2 md:p-3">
                  <span className="text-white font-semibold text-xs md:text-sm drop-shadow-lg line-clamp-2 text-left">
                    {subCategory.categoryName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )}

  {/* Main Content - Improved mobile layout */}
  <div className="flex flex-col md:flex-row">
    {/* Filter Section - Consider adding mobile filter drawer/off-canvas */}
    <FilterSection categoryName={id} />
    
    {/* Products Section */}
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

"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";
import { useRouter } from "next/navigation";
import { useCategoryContext } from "@/context/CategoryContext";


const Page = () => {
  const router = useRouter();
  const {
    loading,
    error,
    products,
    currentCategory,
    subCategoriesDetails,
  } = useCategoryContext();

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

  if (!currentCategory) {
    return (
      <div className="flex justify-center items-center h-[100vh]">
        <p>Category not found</p>
      </div>
    );
  }

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
    className="group relative flex-shrink-0 overflow-hidden rounded-lg hover:shadow-lg transition-all duration-200 bg-gray-500 w-[120px] h-[120px] md:w-[160px] md:h-[160px]"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 group-hover:to-transparent transition-all duration-300" />
      </div>
    )}
    <div className="relative z-10 h-full flex items-end p-2 md:p-3">
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


      <div className="flex flex-col md:flex-row">
        <FilterSection categoryName={currentCategory?.id} />
        {/* ProductsSection no longer needs any props */}
        <ProductsSection />
      </div>
    </div>
  );
};

export default Page;
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
      {/* Back Button ... (code is unchanged) */}
      {/* Subcategories ... (code is unchanged) */}

      <div className="flex flex-col md:flex-row">
        <FilterSection categoryName={currentCategory?.id} />
        {/* ProductsSection no longer needs any props */}
        <ProductsSection />
      </div>
    </div>
  );
};

export default Page;
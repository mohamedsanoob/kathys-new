import { getCategoryByName, getProductsByCategory } from "@/actions/actions";
import Navbar from "@/app/_components/Navbar";
import React from "react";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";

interface Product {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  // updatedDate: {
  //   seconds: number;
  //   nanoseconds: number;
  // };
  // createdDate: {
  //   seconds: number;
  //   nanoseconds: number;
  // };
  id: string;
  quantity: number;
  categories: string[];
  variants: {
    optionValue: string[];
    optionName: string;
  }[];
  productCategory: string;
  productDiscountedPrice: number;
  active: boolean;
  productName: string;
  description: string;
  variantDetails: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: {
      name: string;
      value: string;
    }[];
    sku: string;
  }[];
  taxRate: number;
  productUnit: string;
}

const Page = async ({ params }: { params: Promise<{ categoryName: string }> }) => {
  const { categoryName } = await params;
  const categoryData = await getCategoryByName(categoryName);
  const productsInCategory = await getProductsByCategory(categoryData?.products || []);

  return (
    <div>
      <Navbar />
      <div className="flex gap-12 max-w-[1290px] m-auto mt-[3.75rem]">
        <FilterSection />
        <ProductsSection products={productsInCategory as Product[]} />
      </div>
    </div>
  );
};

export default Page;

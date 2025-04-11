import { getProductsByCategory } from "@/actions/actions";
import Navbar from "@/app/_components/Navbar";
import React from "react";
import FilterSection from "./_components/FilterSection";
import ProductsSection from "./_components/ProductsSection";
import { Timestamp } from "firebase/firestore"; // Import Timestamp type
import { Product } from "@/types/product";

// interface Product {
//   skuId: string;
//   unitQuantity: number;
//   shippingCost: number;
//   images: string[];
//   productPrice: number;
//   createdDate?: { seconds: number; nanoseconds: number } | number | null; // Allow number for conversion
//   updatedDate?: { seconds: number; nanoseconds: number } | number | null; // Allow number for conversion
//   id: string;
//   quantity: number;
//   categories: string[];
//   variants: {
//     optionValue: string[];
//     optionName: string;
//   }[];
//   productCategory: string;
//   productDiscountedPrice: number;
//   active: boolean;
//   productName: string;
//   description: string;
//   variantDetails: {
//     price: number;
//     discountedPrice: number;
//     inventory: number;
//     combination: {
//       name: string;
//       value: string;
//     }[];
//     sku: string;
//   }[];
//   taxRate: number;
//   productUnit: string;
// }

const ITEMS_PER_PAGE = 2;

const Page = async ({
  params,
}: {
  params: Promise<{ categoryName: string }>;
}) => {
  const { categoryName } = await params;
  const limit = ITEMS_PER_PAGE;
  const cursor = null;

  const {
    products: fetchedProducts,
    totalCount,
    // lastDocumentId,
  } = await getProductsByCategory(categoryName, limit, cursor);

  // Convert Firebase Timestamps to milliseconds before passing to the client
  const initialProducts = fetchedProducts.map((product) => ({
    ...product,
    createdDate: product.createdDate
      ? (product.createdDate as Timestamp).toMillis()
      : null,
    updatedDate: product.updatedDate
      ? (product.updatedDate as Timestamp).toMillis()
      : null,
  }));

  return (
    <div>
      <Navbar />
      <div className="flex gap-12 max-w-[1290px] m-auto mt-[3.75rem]">
        <FilterSection />
        <ProductsSection
          initialProducts={initialProducts as Product[]}
          totalProducts={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          categoryName={categoryName}
          // initialLastDocumentId={lastDocumentId}
        />
      </div>
    </div>
  );
};

export default Page;

"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import ProductImage from "./ProductImage";
import ProductDetails from "./ProductDetails";
import ProductDescription from "./ProductDescription";
import AdBanner from "@/app/_components/AdBanner";

// Interactive shell for the product page. Product data is server-fetched for
// first paint; related products stream in via children (Suspense) so they
// don't block landing.
export default function ProductClient({
  product,
  children,
}: {
  product: Product;
  children?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 md:gap-16 max-w-[1290px] m-auto">
      <div className="w-[90%] md:w-full m-auto mt-4 md:mt-6 mb-[-1rem] md:mb-[-2.4rem]">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="mt-2 mb-1">{product.productName}</p>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <ProductImage images={product?.images} />
        <ProductDetails product={product} />
      </div>
      <div className="w-full min-h-[90px] flex justify-center items-center my-16">
        <AdBanner
          dataAdFormat="auto"
          dataFullWidthResponsive={true}
          dataAdSlot="8608034205"
        />
      </div>
      <ProductDescription
        description={product.description}
        variants={product?.variants || []}
      />
      {children}
    </div>
  );
}

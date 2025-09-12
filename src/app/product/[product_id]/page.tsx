"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductImage from "./_components/ProductImage";
import ProductDetails from "./_components/ProductDetails";
import ProductDescription from "./_components/ProductDescription";
import RelatedProducts from "./_components/RelatedProducts";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getProductById } from "@/actions/actions";
import { useRouter } from "next/navigation";

interface Product {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  updatedDate?: {
    seconds: number;
    nanoseconds: number;
  };
  createdDate: {
    seconds: number;
    nanoseconds: number;
  };
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

const ProductPage = () => {
    const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = params?.product_id as string;
        if (!productId) {
          throw new Error("Product ID not found");
        }
        const data = await getProductById(productId);
        setProduct(data as Product);
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
          <Link href="/products" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-3">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the product you're looking for. It may have been 
            removed or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/" 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back 
            </Link>
            <Link 
              href="/products" 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Convert Date objects to simple values (milliseconds since epoch)
  const simpleProduct = {
    ...product,
    createdDate: product.createdDate
      ? new Date(
          product.createdDate.seconds * 1000 +
            product.createdDate.nanoseconds / 1000000
        ).getTime()
      : 0,
    updatedDate: product.updatedDate
      ? new Date(
          product.updatedDate.seconds * 1000 +
            product.updatedDate.nanoseconds / 1000000
        ).getTime()
      : null,
  };

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
        <ProductDetails product={simpleProduct} />
      </div>
      <ProductDescription
        description={product.description}
        variants={product?.variants || []}
      />
      <RelatedProducts categories={product.categories} />
    </div>
  );
};

export default ProductPage;
"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCollectionsWithProducts } from "@/actions/actions";

interface Product {
  id: string;
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  images: string[];
}

interface Category {
  id: string;
  categoryName: string;
  description?: string;
  products: Product[];
}

const Collections = () => {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // You'll need to create or adjust this function to work on client-side
       const data = await getCollectionsWithProducts();
        setCategoriesWithProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch collections");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
       <div className="flex justify-center items-center h-[100vh]">
          <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
        </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1290px] mx-auto px-4 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1290px] mx-auto px-4">
      {categoriesWithProducts?.map((category) => (
        <div key={category.id} className="mb-16 last:mb-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between py-8 md:py-12">
            <h4 className="text-lg sm:text-xl md:text-2xl font-medium">
              {category.categoryName}
            </h4>
            {category?.description && (
              <div dangerouslySetInnerHTML={{ __html: category.description }} />
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8">
            {category.products?.map((product, index) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="flex flex-col gap-2 group"
                prefetch={false}
              >
                <div className="relative h-[250px] md:h-[440px]">
                  <Image
                    src={product.images[0]}
                    alt={product.productName}
                    fill
                    className="w-full h-[250px] md:h-[440px] object-cover shadow-md"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    priority={index < 4} // Prioritize first 4 images
                  />
                  <div className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white w-fit rounded-full h-fit transition-all shadow-sm">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <p className="text-sm sm:text-base mt-2 line-clamp-2">
                  {product.productName}
                </p>
                <div className="flex gap-2 items-center mt-1">
                  {product.productPrice && product.productDiscountedPrice !== undefined && 
                   product.productDiscountedPrice !== product.productPrice ? (
                    <>
                      <p className="line-through text-xs sm:text-sm text-gray-400">
                        ₹{product.productPrice.toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm font-semibold">
                        ₹{product.productDiscountedPrice.toLocaleString("en-IN")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold">
                      ₹{product.productPrice?.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View More Button */}
          {category.products?.length > 3 && (
            <div className="flex items-center justify-center">
              <Link
                href={`/category/${category.id}`}
                className="border border-gray-400 py-2 px-4 sm:py-3 sm:px-6 flex gap-2 items-center text-sm sm:text-base hover:bg-gray-400 hover:text-white transition rounded-md"
                prefetch={false}
              >
                <span>View more {category.categoryName} collections</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Collections;
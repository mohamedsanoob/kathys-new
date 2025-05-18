"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCollectionsWithProducts } from "@/actions/actions";

interface VariantCombination {
  value: string;
  name: string;
  originalValue: string;
}

interface VariantDetail {
  combination: VariantCombination[];
  price: number;
  inventory: number;
  sku: string;
  discountedPrice: number;
}

interface ProductVariant {
  optionName: string;
  optionValue: string[];
}

interface Product {
  id: string;
  unitQuantity: number;
  productCategory: string;
  variants: ProductVariant[];
  productPrice: number;
  productName: string;
  description: string;
  quantity: number;
  active: boolean;
  productDiscountedPrice: number;
  variantDetails: VariantDetail[];
  productUnit: string;
  images: string[];
  taxRate: number;
  categories: string[];
  shippingCost: number;
  skuId: string;
  createdDate: {
    seconds: number;
    nanoseconds: number;
  };
  updatedDate: {
    seconds: number;
    nanoseconds: number;
  };
}

interface Category {
  id: string;
  categoryName: string;
  description?: string;
  products: Product[];
}

const Collections = () => {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<
    Category[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCollectionsWithProducts();
        setCategoriesWithProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch collections"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isOutOfStock = (product: Product): boolean => {
    // If product has variants but no variantDetails, it's out of stock
    if (
      product.variants?.length > 0 &&
      (!product.variantDetails || product.variantDetails.length === 0)
    ) {
      return true;
    }

    // For products with variants, check if all variants have inventory <= 0
    if (product.variants?.length > 0 && product.variantDetails?.length > 0) {
      return product.variantDetails.every((variant) => variant.inventory <= 0);
    }

    // For non-variant products, check the quantity
    return product.quantity <= 0;
  };

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
            {category.products?.map((product, index) => {
              const outOfStock = isOutOfStock(product);

              return (
                <Link
                  href={outOfStock ? "#" : `/product/${product.id}`}
                  key={product.id}
                  className={`flex flex-col gap-2 group relative ${
                    outOfStock ? "cursor-not-allowed" : ""
                  }`}
                  prefetch={false}
                  aria-disabled={outOfStock}
                >
                  <div className="relative h-[250px] md:h-[440px]">
                    <Image
                      src={product.images[0]}
                      alt={product.productName}
                      fill
                      className="w-full h-[250px] md:h-[440px] object-cover shadow-md"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      // 1) Only “eager‐load” the first few above‐the‐fold images:
                      loading={index < 4 ? "eager" : "lazy"}
                      // 2) Keep quality between 60–75 for a sweet spot of fidelity vs size:
                      quality={65}
                    />
                    {outOfStock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                    <div
                      className={`absolute top-2 right-2 p-2 ${
                        outOfStock
                          ? "bg-gray-300"
                          : "bg-white/80 hover:bg-white"
                      } w-fit rounded-full h-fit transition-all shadow-sm`}
                    >
                      <ShoppingBag
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          outOfStock ? "text-gray-500" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <p
                    className={`text-sm sm:text-base mt-2 line-clamp-2 ${
                      outOfStock ? "text-gray-400" : ""
                    }`}
                  >
                    {product.productName}
                  </p>
                  <div className="flex gap-2 items-center mt-1">
                    {product.productPrice &&
                    product.productDiscountedPrice !== undefined &&
                    product.productDiscountedPrice !== product.productPrice ? (
                      <>
                        <p
                          className={`line-through text-xs sm:text-sm ${
                            outOfStock ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          ₹{product.productPrice.toLocaleString("en-IN")}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            outOfStock ? "text-gray-400" : ""
                          }`}
                        >
                          ₹
                          {product.productDiscountedPrice.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </>
                    ) : (
                      <p
                        className={`text-sm font-semibold ${
                          outOfStock ? "text-gray-400" : ""
                        }`}
                      >
                        ₹{product.productPrice?.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
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

"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getRelatedProducts } from "@/actions/actions";
import { Product } from "@/types/product";

const RelatedProducts = ({
  categories,
  initialProducts,
}: {
  categories?: string[];
  initialProducts?: Product[];
}) => {
  const hasInitial = !!initialProducts;
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialProducts ?? []);
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    if (hasInitial) return; // server already pre-fetched these
    if (!categories?.length) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const data = await getRelatedProducts(categories);
        if (active) setRelatedProducts(data);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRelatedProducts();
    return () => {
      active = false;
    };
  }, [categories, hasInitial]);

  const isOutOfStock = (product: Product): boolean => {
    if (product.variants?.length > 0 && (!product.variantDetails || product.variantDetails.length === 0)) {
      return true;
    }
    if (product.variants?.length > 0 && product.variantDetails?.length > 0) {
      return product.variantDetails.every((variant) => variant.inventory <= 0);
    }
    return product.quantity <= 0;
  };

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-0">
      <h2 className="text-lg sm:text-xl font-semibold">Related Products</h2>
      <hr className="border-gray-200" />

      {loading ? (
        <p>Loading...</p>
      ) : relatedProducts.length === 0 ? null : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8">
          {relatedProducts.map((product) => {
            const outOfStock = isOutOfStock(product);
            return (
              <Link href={`/product/${product.id}`} key={product.id} className="flex flex-col gap-2">
                <div className="relative">
                  <div className="relative w-full h-[250px] md:h-[440px] shadow-md">
                    {product?.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.productName || "Product image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={80}
                        priority={false}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                  </div>
                  {outOfStock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                  <div className="absolute top-2 right-2 p-2 bg-white w-fit rounded-full h-fit">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm sm:text-base">{product.productName}</p>
                <div className="flex gap-2 items-center mt-1">
                  {product.productPrice &&
                  product.productDiscountedPrice !== undefined &&
                  product.productDiscountedPrice !== product.productPrice ? (
                    <>
                      <p className={`line-through text-xs sm:text-sm ${outOfStock ? "text-gray-300" : "text-gray-400"}`}>
                        ₹{product.productPrice.toLocaleString("en-IN")}
                      </p>
                      <p className={`text-sm font-semibold ${outOfStock ? "text-gray-400" : ""}`}>
                        ₹{product.productDiscountedPrice.toLocaleString("en-IN")}
                      </p>
                    </>
                  ) : (
                    <p className={`text-sm font-semibold ${outOfStock ? "text-gray-400" : ""}`}>
                      ₹{product.productPrice?.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;

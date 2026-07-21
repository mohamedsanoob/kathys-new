"use client";
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import { useParams, useSearchParams } from 'next/navigation';
import {
  categoryDataCacheKey,
  markCategoryScrollRestore,
} from '@/lib/categoryScrollRestore';

const ProductGridItem = ({ product }: { product: Product }) => {
  const { id: categoryId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  // Check if product is out of stock
  const isOutOfStock = () => {
    // If product has variants but no variantDetails, it's out of stock
    if (product.variants?.length > 0 && (!product.variantDetails || product.variantDetails.length === 0)) {
      return true;
    }
    
    // For products with variants, check if all variants have inventory <= 0
    if (product.variants?.length > 0 && product.variantDetails?.length > 0) {
      return product.variantDetails.every(variant => variant.inventory <= 0);
    }
    
    // For non-variant products, check the quantity
    return product.quantity <= 0;
  };

  const outOfStock = isOutOfStock();

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={outOfStock ? '#' : "/product/" + product.id}
        className={`w-full h-75 aspect-square relative bg-gray-50 overflow-hidden ${outOfStock ? 'cursor-not-allowed' : ''}`}
        aria-disabled={outOfStock}
        onClick={() => {
          if (!outOfStock && categoryId) {
            markCategoryScrollRestore(
              categoryDataCacheKey(categoryId, searchParams)
            );
          }
        }}
      >
         {product?.images?.[0] ? (
        <Image
          src={product.images[0]}
          alt={product.productName || 'Product image'}
          width={600}
          height={600}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span>No image available</span>
        </div>
      )}
        {outOfStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            Out of Stock
          </div>
        )}
      </Link>
      <p className={`text-sm md:text-base line-clamp-2 ${outOfStock ? 'text-gray-400' : ''}`}>
        {product.productName}
      </p>
      <div className="flex gap-2 items-center mt-1">
        {product.productPrice && product.productDiscountedPrice !== undefined && 
         product.productDiscountedPrice !== product.productPrice ? (
          <>
            <p className={`line-through text-xs sm:text-sm ${outOfStock ? 'text-gray-300' : 'text-gray-400'}`}>
              ₹{product.productPrice.toLocaleString("en-IN")}
            </p>
            <p className={`text-sm font-semibold ${outOfStock ? 'text-gray-400' : ''}`}>
              ₹{product.productDiscountedPrice.toLocaleString("en-IN")}
            </p>
          </>
        ) : (
          <p className={`text-sm font-semibold ${outOfStock ? 'text-gray-400' : ''}`}>
            ₹{product.productPrice?.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductGridItem;
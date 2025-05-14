"use client";
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const ProductListItem = ({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) => {
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
    <div className="border-b pb-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <Link
          href={outOfStock ? '#' : "/product/" + product.id}
          className={`w-full md:w-60 relative aspect-square md:h-80 flex-shrink-0 bg-gray-50 overflow-hidden ${outOfStock ? 'cursor-not-allowed' : ''}`}
          aria-disabled={outOfStock}
        >
          <Image
            src={product.images[0]}
            alt={product.productName}
            width={600}
            height={600}
            className="object-cover w-full h-full"
          />
          {outOfStock && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              Out of Stock
            </div>
          )}
        </Link>
        <div className="flex flex-col gap-3 md:gap-6 w-full">
          <div className="flex flex-col gap-2">
            <p className={`text-lg md:text-2xl ${outOfStock ? 'text-gray-400' : ''}`}>
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

          <div 
            className={`prose prose-sm max-w-none ${outOfStock ? 'text-gray-400' : ''}`} 
            dangerouslySetInnerHTML={{ __html: product?.description }} 
          />
         
          <hr className="text-gray-200" />
          <Link
            href={outOfStock ? '#' : "/product/" + product.id}
            className={`hidden md:block text-white font-medium px-4 md:px-8 py-2 w-fit transition-colors ${
              outOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-900 hover:bg-green-800'
            }`}
            aria-disabled={outOfStock}
          >
            {outOfStock ? 'Out of Stock' : 'View Product'}
          </Link>
          <div className={`text-sm ${outOfStock ? 'text-gray-400' : ''}`}>
            <p className="flex gap-2">
              <span className="font-medium">SKU:</span> <span>{product?.skuId}</span>
            </p>
            {product.variants?.length > 0 && (
              <p className="flex gap-2 mt-1">
                <span className="font-medium">Available Sizes:</span>
                <span>
                  {product.variants
                    .find(v => v.optionName === 'Size')
                    ?.optionValue
                    .filter(size => {
                      const variant = product.variantDetails?.find(vd => 
                        vd.combination.some(c => c.name === 'Size' && c.value === size)
                      );
                      return variant && variant.inventory > 0;
                    })
                    .join(', ')}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
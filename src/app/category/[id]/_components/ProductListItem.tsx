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
  
}) => (
  <div className="border-b pb-6">
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      <Link
        href={"/product/" + product.id}
        className="w-full md:w-60 relative aspect-square md:h-80 flex-shrink-0 bg-gray-50 overflow-hidden"
      >
        <Image
          src={product.images[0]}
          alt={product.productName}
          width={600}
          height={600}
          className="object-cover w-full h-full"
        />
      </Link>
      <div className="flex flex-col gap-3 md:gap-6 w-full">
        <div className="flex flex-col gap-2">
          <p className="text-lg md:text-2xl">{product.productName}</p>
        
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
        </div>

        <div dangerouslySetInnerHTML={{ __html: product?.description }} />
       
        <hr className="text-gray-200" />
        <Link    href={"/product/" + product.id} className="hidden md:block text-white font-medium bg-green-900 px-4 md:px-8 py-2 w-fit hover:bg-green-900 transition-colors">
          View Product
        </Link>
        <div className="text-sm">
          <p className="flex gap-2">
            <span className="font-medium">SKU:</span> <span>{product?.skuId}</span>
          </p>
       
        </div>
      </div>
    </div>
  </div>
);


export default ProductListItem

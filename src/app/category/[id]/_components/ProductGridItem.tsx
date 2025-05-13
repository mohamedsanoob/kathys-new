"use client";
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const ProductGridItem = ({ product }: { product: Product }) => (
  <div className="flex flex-col gap-2">
    <Link
      href={"/product/" + product.id}
      className="w-full h-75  aspect-square relative bg-gray-50 overflow-hidden"
    >
      <Image
        src={product.images[0]}
        alt={product.productName}
        fill
        className="object-cover"
      />
    </Link>
    <p className="text-sm md:text-base line-clamp-2">{product.productName}</p>
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
);

export default ProductGridItem

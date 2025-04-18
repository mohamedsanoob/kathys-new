import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

const ProductGridItem = ({ product }: { product: Product }) => (
  <div className="flex flex-col gap-2">
    <Link
      href={"/product/" + product.id}
      className="w-full h-56 md:h-auto aspect-square relative bg-gray-50 overflow-hidden"
    >
      <Image
        src={product.images[0]}
        alt={product.productName}
        fill
        className="object-cover"
      />
    </Link>
    <p className="text-sm md:text-base line-clamp-2">{product.productName}</p>
    <div className="flex gap-3">
      <p className="line-through text-xs md:text-sm text-gray-400">
        ₹{product.productPrice.toFixed(2)}
      </p>
      <p className="text-xs md:text-sm font-semibold">
        ₹{product.productDiscountedPrice.toFixed(2)}
      </p>
    </div>
  </div>
);

export default ProductGridItem

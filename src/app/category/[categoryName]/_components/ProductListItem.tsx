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
          <div className="flex gap-3 md:gap-4 text-base md:text-xl">
            <p className="line-through text-gray-400">
              ₹{product.productPrice.toFixed(2)}
            </p>
            <p className="font-semibold">
              ₹{product.productDiscountedPrice.toFixed(2)}
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-sm md:text-base">
          Beautiful Ajrakh Printed 3 Pcs Cotton Side slit kurtis with bottom and
          Dupatta with elegant Mirror works – With Lining
        </p>
        <hr className="text-gray-200" />
        <button className="hidden md:block text-white font-medium bg-amber-600 px-4 md:px-8 py-2 w-fit rounded-sm hover:bg-amber-700 transition-colors">
          Select options
        </button>
        <div className="text-sm">
          <p className="flex gap-2">
            <span className="font-medium">SKU:</span> <span>N/A</span>
          </p>
          <p className="flex gap-2">
            <span className="font-medium">Category:</span>{" "}
            <span>{categoryName}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);


export default ProductListItem

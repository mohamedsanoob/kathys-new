"use client";
import { LayoutGrid, List } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Product {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice: number;
}

const ProductsSection = ({ products, }: { products: Product[] }) => {
  const [grid, setGrid] = useState(false);

  return (
    <div className="w-3/4">
      <Image
        src="https://dressupfashion.in/wp-content/uploads/2024/11/web3.jpg.webp"
        alt="image"
        width={1000}
        height={1000}
        className="w-full"
      />
      <div className="flex justify-between items-center my-8">
        <div className="flex gap-4">
          <LayoutGrid
            onClick={() => setGrid(true)}
            className={`cursor-pointer w-5 h-5 ${grid && "text-gray-400"}`}
          />
          <List
            onClick={() => setGrid(false)}
            className={`cursor-pointer w-5 h-5 ${!grid && "text-gray-400"}`}
          />
          <p>
            Showing 1–{products.length} of {products.length} results
          </p>
        </div>
        <select>
          <option>Sort by Price: Low to High</option>
          <option>Sort by Price: High to Low</option>
          <option>Sort by Newest</option>
          <option>Sort by Oldest</option>
        </select>
      </div>
      <div className={`grid  gap-4 ${grid ? "grid-cols-4" : "grid-cols-1"}`}>
        {products.map((product) =>
          grid ? (
            <div key={product.id} className="flex flex-col gap-2">
              <Image
                src={product.images[0]}
                alt={product.productName}
                width={250}
                height={250}
                className="w-[250px]"
              />
              <p className="text-center">{product.productName}</p>
              <div className="flex gap-4">
                <p className="line-through text-sm text-gray-400">
                  ₹ {product.productPrice.toFixed(2)}
                </p>
                <p className="text-sm font-semibold">
                  ₹ {product.productDiscountedPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div key={product.id}>
              <div className="flex gap-8">
                <Image
                  src={product.images[0]}
                  alt={product.productName}
                  width={250}
                  height={250}
                />
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <p className="text-2xl">{product.productName}</p>
                    <div className="flex gap-4 text-xl">
                      <p className="line-through text-gray-400">
                        ₹ {product.productPrice.toFixed(2)}
                      </p>
                      <p className="font-semibold">
                        ₹ {product.productDiscountedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500">
                    Beautiful Ajrakh Printed 3 Pcs Cotton Side slit kurtis with
                    bottom and Dupatta with elegant Mirror works – With Lining
                  </p>
                  <hr className="text-gray-300" />
                  <button className="text-white font-[500] bg-amber-600 px-8 py-2 w-fit cursor-pointer transition-transform hover:scale-105 duration-200 ease-in-out">
                    Select options
                  </button>
                  <div>
                    <p>
                      SKU <span>N/A</span>
                    </p>
                    <p>
                      Category <span>Category name take from params</span>
                    </p>
                  </div>
                </div>
              </div>

              <hr className="text-gray-300 mt-8 mb-4" />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProductsSection;

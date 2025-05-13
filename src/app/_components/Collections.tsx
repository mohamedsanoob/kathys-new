export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import { getCollectionsWithProducts } from "@/actions/actions";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const Collections = async () => {
  const categoriesWithProducts = await getCollectionsWithProducts();

  console.log(categoriesWithProducts,"=======>category")

  return (
    <div className="max-w-[1290px] mx-auto px-4">
      {categoriesWithProducts?.map((category) => (
        <div key={category.id} className="mb-16 last:mb-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between py-8 md:py-12">
            <h4 className="text-lg sm:text-xl md:text-2xl font-medium">
              {category.categoryName}
            </h4>
       { category?.description && <div dangerouslySetInnerHTML={{ __html: category?.description }} ></div> }     
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8">
            {category.products?.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="flex flex-col gap-2 group"
                prefetch={false} // Set based on your needs
              >
                <div className="relative  h-[250px] md:h-[440px]">
                  <Image
                    src={product.images[0]}
                    alt={product.productName}
                    fill
                    className="w-full h-[250px] md:h-[440px] object-cover shadow-md"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    priority={category.products.indexOf(product) < 4} // Prioritize first 4 images
                  />
                  <div className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white w-fit rounded-full h-fit transition-all shadow-sm">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <p className="text-sm sm:text-base mt-2 line-clamp-2">{product.productName}</p>
                <div className="flex gap-2 items-center mt-1">
                  {product.productPrice && (
                    <p className="line-through text-xs sm:text-sm text-gray-400">
                      ₹{product.productPrice.toLocaleString("en-IN")}
                    </p>
                  )}
                  <p className="text-sm font-semibold">
                    ₹{product.productDiscountedPrice?.toLocaleString("en-IN")}
                  </p>
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
                prefetch={false} // Set based on your needs
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
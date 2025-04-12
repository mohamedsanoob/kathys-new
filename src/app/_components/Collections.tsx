import { getCollectionsWithProducts } from "@/actions/actions";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Collections = async () => {
  const categoriesWithProducts = await getCollectionsWithProducts();

  return (
    <div className="max-w-[1290px] mx-auto px-4">
      {categoriesWithProducts?.map((category) => (
        <div key={category.id}>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-4 py-8 md:py-12">
            <h4 className="text-lg sm:text-xl md:text-2xl font-medium">
              {category.categoryName}
            </h4>
            <p className="text-sm sm:text-base text-gray-500 max-w-md">
              {category.description} Some description will come here
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8">
            {category.products?.map((product) => (
              <Link
                href={`product/${product.id}`}
                key={product.id}
                className="flex flex-col gap-2"
              >
                <Image
                  src={product.images[0]}
                  alt={product.productName}
                  width={250}
                  height={250}
                  className="w-full h-[300px] md:h-[440px] object-cover"
                />
                <p className="text-sm sm:text-base">{product.productName}</p>
                <div className="flex gap-2 items-center">
                  <p className="line-through text-xs sm:text-sm text-gray-400">
                    ₹ {product.productPrice?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm font-semibold">
                    ₹ {product.productDiscountedPrice?.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View More Button */}
          <div className="flex items-center justify-center">
            {category.products?.length > 3 && (
              <Link
                href={`category/${category?.categoryName}`}
                className="border border-gray-400 py-2 px-4 sm:py-3 sm:px-6 flex gap-2 items-center text-sm sm:text-base hover:bg-gray-400 hover:text-white transition rounded-md"
              >
                <p>View more {category.categoryName} collections</p>
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Collections;

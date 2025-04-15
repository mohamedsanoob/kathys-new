import { getRelatedProducts } from "@/actions/actions";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const RelatedProducts = async ({ categories }: { categories: string[] }) => {
  const relatedProducts = await getRelatedProducts(categories);

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-0">
      <h2 className="text-lg sm:text-xl font-semibold">Related Products</h2>
      <hr className="border-gray-200" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8">
        {relatedProducts?.map((product) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="flex flex-col gap-2"
          >
            <div className="relative">
              <Image
                src={product.images[0]}
                alt={product.productName}
                width={250}
                height={250}
                className="w-full h-[250px] md:h-[440px] object-cover shadow-md"
              />
              <div className="absolute top-2 right-2 p-2 bg-white w-fit rounded-full h-fit">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
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
    </div>
  );
};

export default RelatedProducts;

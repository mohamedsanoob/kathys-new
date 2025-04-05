import { getRelatedProducts } from "@/actions/actions";
import Image from "next/image";
import Link from "next/link";

const RelatedProducts = async ({ categories }: { categories: string[] }) => {
  console.log(categories, "categories");
  const relatedProducts = await getRelatedProducts(categories);
  console.log(relatedProducts, "related products");
  return (
    <div className="flex flex-col gap-4">
      <p>Related Products</p>
      <hr className="text-gray-300" />
      <div className={`grid  gap-4 grid-cols-4 pt-4`}>
        {relatedProducts?.slice(0, 4).map((product) => (
          <Link
            // href={`category/${category.categoryName}`}
            href={`/product/${product.id}`}
            key={product.id}
            className="flex flex-col gap-2"
          >
            <div>
              <Image
                src={product.images[0]}
                alt="product"
                width={1000}
                height={1000}
              />
            </div>
            <p>{product.productName}</p>
            <div className="flex gap-4 items-center">
              <p className="line-through text-sm text-gray-400">
                ₹ {product.productPrice.toFixed(2)}
              </p>
              <p className="text-sm font-[600]">
                ₹ {product.productDiscountedPrice.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;

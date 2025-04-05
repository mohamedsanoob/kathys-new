import { getAllCollections, getAllProducts } from "@/actions/actions";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Collections = async () => {
  const [categories, products] = await Promise.all([
    getAllCollections(),
    getAllProducts(),
  ]);

  console.log(categories, "categories");
  console.log(products, "products");

  return (
    <div className="max-w-[1290px] m-auto">
      <div>
        {categories?.map((category) => (
          <div key={category.id}>
            <div className="flex justify-between items-center py-12">
              <h4 className="text-2xl  font-[500]">{category.categoryName}</h4>
              <p className="text-sm text-gray-500">
                {category.description} Some description will come here
              </p>
            </div>
            <div className="flex gap-8 mb-8">
              {products
                ?.filter((product) => product.categories?.includes(category.id))
                ?.slice(0, 3)
                .map((product) => (
                  <Link
                    // href={`category/${category.categoryName}`}
                    href={`product/${product.id}`}
                    key={product.id}
                    className="flex flex-col gap-2"
                  >
                    <div>
                      <Image
                        src={product.images[0]}
                        alt="product"
                        width={1000}
                        height={1000}
                        className="w-[250px]"
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
            <div className="flex items-center justify-center">
              {products?.filter((product) =>
                product.categories?.includes(category.id)
              )?.length > 3 && (
                <Link
                  href={`category/${category?.categoryName}`}
                  className="border border-gray-400 py-3 px-3 flex gap-2 hover:bg-gray-400 hover:text-white cursor-pointer"
                >
                  <p>View more {category.categoryName} collections</p>
                  <ArrowRight />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collections;

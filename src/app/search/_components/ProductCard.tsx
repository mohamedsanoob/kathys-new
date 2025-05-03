import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  images: string[];
  categories: string[];
  active?: boolean;
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="flex justify-between gap-4 pb-6">
      <div className="flex gap-4">
        <Image
          width={300}
          height={300}
          src={product.images[0]}
          alt={product.productName}
          className="w-10 h-10 object-cover"
        />
        <Link href={`/product/${product.id}`} className="text-lg font-medium text-gray-900 items-center">
          {product.productName}
        </Link>
      </div>
      <div className="">
        {product.productDiscountedPrice ? (
          <>
            <span className="text-lg font-medium text-gray-900">
              ${product.productDiscountedPrice.toFixed(2)}
            </span>
            <span className="ml-2 text-sm text-gray-500 line-through">
              ${product.productPrice.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-md font-medium text-gray-900">
            ${product.productPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};
export default ProductCard;

import { getProductById } from "@/actions/actions";
import Navbar from "@/app/_components/Navbar";
import ProductImage from "./_components/ProductImage";
import ProductDetails from "./_components/ProductDetails";
import ProductDescription from "./_components/ProductDescription";
import RelatedProducts from "./_components/RelatedProducts";

interface Product {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  // updatedDate: {
  //   seconds: number;
  //   nanoseconds: number;
  // };
  // createdDate: {
  //   seconds: number;
  //   nanoseconds: number;
  // };
  id: string;
  quantity: number;
  categories: string[];
  variants: {
    optionValue: string[];
    optionName: string;
  }[];
  productCategory: string;
  productDiscountedPrice: number;
  active: boolean;
  productName: string;
  description: string;
  variantDetails: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: {
      name: string;
      value: string;
    }[];
    sku: string;
  }[];
  taxRate: number;
  productUnit: string;
}


const page = async ({
  params,
}: {
  params: Promise<{ product_id: string }>;
}) => {
  const { product_id } = await params;

  try {
    const product = (await getProductById(product_id)) as Product | null;

    if (!product) {
      return <div>Product not found</div>;
    }

    return (
      <div>
        <Navbar />
        <div className="flex flex-col gap-16 max-w-[1290px] m-auto">
          <div className="flex justify-between">
            <ProductImage images={product.images} />
            <ProductDetails product={product} />
          </div>
          <ProductDescription
            description={product.description}
            variants={product?.variants || []}
          />
          <RelatedProducts categories={product.categories} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return <div>Error loading product.</div>;
  }
};

export default page;

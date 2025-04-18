import { getProductById } from "@/actions/actions";
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
  updatedDate?: {
    // Make it optional as it might be undefined
    seconds: number;
    nanoseconds: number;
  };
  createdDate: {
    seconds: number;
    nanoseconds: number;
  };
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

interface SimpleProduct {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  updatedDate?: number | null; // Simple value for date
  createdDate: number; // Simple value for date
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

    // Convert Date objects to simple values (milliseconds since epoch)
    const simpleProduct: SimpleProduct = {
      ...product,
      createdDate: product.createdDate
        ? new Date(
            product.createdDate.seconds * 1000 +
              product.createdDate.nanoseconds / 1000000
          ).getTime()
        : 0, // Or some other default value
      updatedDate: product.updatedDate
        ? new Date(
            product.updatedDate.seconds * 1000 +
              product.updatedDate.nanoseconds / 1000000
          ).getTime()
        : null,
    };

    return (
      <div className="flex flex-col gap-8 md:gap-16 max-w-[1290px] m-auto">
        <p className="w-[90%] md:w-full m-auto mt-4 md:mt-16 mb-[-1rem]">{product.productName}</p>
        <div className="flex flex-col md:flex-row gap-10">
          <ProductImage images={product.images} />
          <ProductDetails product={simpleProduct as unknown as Product} />
        </div>
        <ProductDescription
          description={product.description}
          variants={product?.variants || []}
        />
        <RelatedProducts categories={product.categories} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return <div>Error loading product.</div>;
  }
};

export default page;

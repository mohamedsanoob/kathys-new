// types/product.ts
export interface Product {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  createdDate?: { seconds: number; nanoseconds: number } | number | null;
  updatedDate?: { seconds: number; nanoseconds: number } | number | null;
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

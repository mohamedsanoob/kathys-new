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
      originalValue?: string;
    }[];
    sku: string;
  }[];
  taxRate: number;
  productUnit: string;
  // Optional fields — present on some products / added by cart hydration
  position?: number;
  sizes?: string[];
  docId?: string;
  currentInventory?: number;
  outOfStock?: boolean;
}

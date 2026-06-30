"use client";
import Image from "next/image";
import { X } from "lucide-react";
import {
  getCartItemSalePrice,
  getCartItemOriginalPrice,
} from "@/actions/actions";

interface VariantDetail {
  combination?: { name: string; value: string }[];
  inventory?: number;
  sku?: string;
  discountedPrice?: number;
  price?: number;
}

interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails?: VariantDetail;
  currentInventory?: number;
  outOfStock?: boolean;
}

interface CartItemsProps {
  products: (CartProduct & {
    currentInventory?: number;
    outOfStock?: boolean;
  })[];
  onQuantityChange: (productId: string, variantSku: string | undefined, newQuantity: number) => Promise<void>;
  onRemoveItem: (productId: string, variantSku: string | undefined) => Promise<void>;
  loadingStates: Record<string, boolean>; // { 'productId-sku': boolean }
}

const CartItems: React.FC<CartItemsProps> = ({ 
  products, 
  onQuantityChange, 
  onRemoveItem,
  loadingStates 
}) => {
  const getStockStatus = (product: CartProduct) => {
    const inventory = product.variantDetails?.inventory ?? product.currentInventory;
    const isOutOfStock = product.outOfStock || (inventory !== undefined && product.quantity > inventory);
    
    return {
      isOutOfStock,
      inventory
    };
  };

  const handleQuantityChange = async (product: CartProduct, newQuantity: number) => {
    await onQuantityChange(product.id, product.variantDetails?.sku, newQuantity);
  };

  const handleRemove = async (product: CartProduct) => {
    await onRemoveItem(product.id, product.variantDetails?.sku);
  };

  const getLoadingState = (product: CartProduct, action: 'decrement' | 'increment' | 'remove') => {
    const key = `${product.id}-${product.variantDetails?.sku || 'no-variant'}-${action}`;
    return loadingStates[key] || false;
  };




  return (
    <table className="w-full">
      <thead>
        <tr className="text-center text-gray-400 font-medium border-b border-gray-300">
          <th className="py-2 h-20">Product</th>
          <th className="py-2">Price</th>
          <th className="py-2">Quantity</th>
          <th className="py-2">Subtotal</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {products?.map((product) => {
          const { isOutOfStock, inventory } = getStockStatus(product);
          const variantCombination = product.variantDetails?.combination || [];
          const itemKey = `${product.id}-${product.variantDetails?.sku || 'no-variant'}`;


          
          return (
            <tr 
              key={itemKey} 
              className={`py-4 border-b border-gray-200 ${isOutOfStock ? 'bg-red-50' : ''}`}
            >
              <td className="flex items-center gap-4 py-2">
                {product.images?.[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.productName}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-semibold text-md">
                    {product.productName}
                    {variantCombination.length > 0 && (
                      <>
                        {" - "}
                        {variantCombination
                          .map((attr) => attr.value)
                          .join(", ")}
                      </>
                    )}
                  </p>
                  {isOutOfStock && (
                    <p className="text-red-500 text-sm">
                      {inventory !== undefined 
                        ? `Out of Stock (Available: ${inventory})`
                        : 'Out of Stock'}
                    </p>
                  )}
                </div>
              </td>
              <td className="py-2 text-center">
                <p className="text-lg">
                  {getCartItemOriginalPrice(product) >
                    getCartItemSalePrice(product) && (
                    <span className="text-gray-400 line-through mr-2 text-base">
                      ₹{" "}
                      {getCartItemOriginalPrice(product).toLocaleString(
                        "en-IN",
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      )}
                    </span>
                  )}
                  ₹{" "}
                  {getCartItemSalePrice(product).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </td>
              <td className="py-2 text-center">
                <div className="border border-gray-200 text-lg flex items-center justify-center gap-4 w-fit rounded-md mx-auto">
                  <button
                    onClick={() => handleQuantityChange(product, product.quantity - 1)}
                    disabled={
                      product.quantity <= 1 || 
                      isOutOfStock ||
                      getLoadingState(product, 'decrement')
                    }
                    className={`w-10 h-10 flex items-center justify-center font-bold ${
                      getLoadingState(product, 'decrement') 
                        ? 'text-gray-400 cursor-wait' 
                        : 'text-gray-600 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {getLoadingState(product, 'decrement') ? '...' : '−'}
                  </button>
                  <span className={`text-lg w-max font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-800'}`}>
                    {product.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(product, product.quantity + 1)}
                    disabled={
                      isOutOfStock || 
                      (inventory !== undefined && product.quantity >= inventory) ||
                      getLoadingState(product, 'increment')
                    }
                    className={`w-10 h-10 flex items-center justify-center font-bold ${
                      getLoadingState(product, 'increment') 
                        ? 'text-gray-400 cursor-wait' 
                        : 'text-gray-600 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {getLoadingState(product, 'increment') ? '...' : '+'}
                  </button>
                </div>
              </td>
              <td className={`py-2 text-lg text-center ${isOutOfStock ? 'text-red-500' : ''}`}>
                ₹{" "}
                {(getCartItemSalePrice(product) * product.quantity).toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </td>
              <td className="py-2 text-center">
                <button
                  onClick={() => handleRemove(product)}
                  disabled={getLoadingState(product, 'remove')}
                  className={`text-gray-500 hover:text-red-500 ${
                    getLoadingState(product, 'remove') ? 'cursor-wait' : ''
                  }`}
                >
                  {getLoadingState(product, 'remove') ? '...' : <X className="w-5 h-5" />}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CartItems;
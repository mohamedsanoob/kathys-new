"use client";

import { useCallback, useEffect, useState } from "react";
import Checkout from "./_components/Checkout";
import { getCartProducts, updateCartItem, removeCartItem } from "@/actions/actions";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails?: {
    price: number;
    discountedPrice?: number;
    inventory?: number;
    combination?: {
      name: string;
      value: string;
    }[];
    sku?: string;
  };
  currentInventory?: number;
  outOfStock?: boolean;
  unitQuantity: number;
  productCategory: string;
  variants?: { optionValue: string[]; optionName: string }[];
  description: string;
  active: boolean;
  productUnit: string;
  taxRate: number;
  categories: string[];
  shippingCost: number;
  skuId: string;
}

const CartPage = () => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshCart } = useCart();

  const fetchCartProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const products = await getCartProducts();
      setCartProducts(products.filter(Boolean));
    } catch (error) {
      console.error("Failed to fetch cart products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartProducts();
  }, [fetchCartProducts]);

  const handleRemoveProduct = async (productId: string, sku?: string) => {
    try {
      await removeCartItem(productId, sku);
      window.dispatchEvent(new Event("cart-updated"));
      await fetchCartProducts();
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  const handleQuantityChange = async (
    productId: string,
    sku: string | undefined,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem([{ productId, variantSku: sku, quantity: newQuantity }]);
      window.dispatchEvent(new Event("cart-updated"));
      
      setCartProducts(prev => prev.map(product => {
        if (product.id === productId && 
            (!sku || product.variantDetails?.sku === sku)) {
          return {
            ...product,
            quantity: newQuantity,
            outOfStock: product.currentInventory !== undefined && 
                       newQuantity > product.currentInventory
          };
        }
        return product;
      }));
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const total = cartProducts.reduce((sum, product) => {
    const price = product.productDiscountedPrice || product.productPrice;
    return sum + (price * product.quantity);
  }, 0);

  const hasOutOfStockItems = cartProducts.some(
    product => product.outOfStock
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 p-4">
        <p className="text-2xl font-semibold text-gray-700">Your cart is empty!</p>
        <Link href="/" passHref>
          <button className="bg-[#1e6553] hover:bg-[#1e6553]/90 text-white font-semibold px-6 py-3 rounded transition duration-200">
            Go to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:pt-10 h-[100%]">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 p-4 md:p-8 lg:px-[6%] flex-1 overflow-y-scroll">
        {/* Mobile View */}
        <div className="lg:hidden w-full">
          {cartProducts.map((product, index) => (
            <div key={index} className="py-4 flex flex-col border-b border-gray-300">
              <div className="flex items-start gap-4">
                <Link href={`/product/${product.id}`} passHref>
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.productName}
                      width={80}
                      height={80}
                      className="w-16 h-20 object-cover rounded cursor-pointer"
                    />
                  )}
                </Link>
                <div className="flex-1">
                  <Link href={`/product/${product.id}`} passHref>
                    <p className="font-semibold text-sm hover:text-[#1e6553] cursor-pointer">
                      {product.productName}
                      {product.variantDetails?.combination && (
                        <>
                          {" - "}
                          {product.variantDetails.combination
                            .map(attr => attr.value)
                            .join(", ")}
                        </>
                      )}
                    </p>
                  </Link>
                  {product.outOfStock && (
                    <p className="text-red-500 text-xs mt-1">
                      Out of Stock (Available: {product.currentInventory})
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">
                      ₹{" "}
                      {(product.productDiscountedPrice || product.productPrice)
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                    <button
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveProduct(product.id, product.variantDetails?.sku)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="border border-gray-200 text-sm flex items-center gap-2 w-fit rounded-md">
                  <button
                    onClick={() => handleQuantityChange(
                      product.id, 
                      product.variants?.length>0 ? product.variantDetails?.sku : undefined, 
                      product.quantity - 1
                    )}
                    disabled={product.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                  >
                    −
                  </button>
                  <span className="text-sm w-max font-medium text-gray-800">
                    {product.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(
                      product.id, 
                      product.variants?.length>0 ? product.variantDetails?.sku : undefined, 
                      product.quantity + 1
                    )}
                    disabled={
                      product.currentInventory !== undefined &&
                      product.quantity >= product.currentInventory
                    }
                    className="w-8 h-8 flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-medium">
                  ₹{" "}
                  {(
                    (product.productDiscountedPrice || product.productPrice) *
                    product.quantity
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block w-full lg:w-[70%]">
          <table className="w-full">
            <thead>
              <tr className="text-center text-gray-400 font-medium border-b border-gray-300">
                <th className="py-2 w-120 text-[0.875rem] opacity-60">Product</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">Price</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">Quantity</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">Subtotal</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60"></th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.map((product, index) => (
                <tr key={index} className="h-[100px] border-b border-gray-300">
                  <td>
                    <div className="flex items-center gap-4 h-[100%]">
                      <Link href={`/products/${product.id}`} passHref>
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.productName}
                            width={80}
                            height={80}
                            className="w-10 h-20 object-cover rounded cursor-pointer"
                          />
                        )}
                      </Link>
                      <div>
                        <Link href={`/product/${product.id}`} passHref>
                          <p className="font-semibold text-[1rem] hover:text-[#1e6553] cursor-pointer">
                            {product.productName}
                            {product.variantDetails?.combination && (
                              <>
                                {" - "}
                                {product.variantDetails.combination
                                  .map(attr => attr.value)
                                  .join(", ")}
                              </>
                            )}
                          </p>
                        </Link>
                        {product.outOfStock && (
                          <p className="text-red-500 text-sm">
                            Out of Stock (Available: {product.currentInventory})
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-left text-[1rem]">
                    ₹ {(product.productDiscountedPrice || product.productPrice)
                      .toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                  <td className="text-left">
                    <div className="border border-gray-200 text-lg flex items-center gap-2 w-fit rounded-md">
                      <button
                        onClick={() => handleQuantityChange(
                          product.id, 
                          product.variants?.length>0 ? product.variantDetails?.sku : undefined, 
                          product.quantity - 1
                        )}
                        disabled={product.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                      >
                        −
                      </button>
                      <span className="text-[1rem] font-medium text-gray-800">
                        {product.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(
                          product.id, 
                          product.variants?.length>0 ? product.variantDetails?.sku : undefined, 
                          product.quantity + 1
                        )}
                        disabled={
                          product.currentInventory !== undefined &&
                          product.quantity >= product.currentInventory
                        }
                        className="w-10 h-10 flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="text-left text-[1rem]">
                    ₹ {(
                      (product.productDiscountedPrice || product.productPrice) * 
                      product.quantity
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-center">
                    <button
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveProduct(product.id, product.variantDetails?.sku)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Checkout Section */}
        <div className="w-full lg:w-[30%]">
          <Checkout 
            total={total} 
            disabled={hasOutOfStockItems || cartProducts.length === 0} 
          />
        </div>
      </div>

      {/* Mobile Checkout Bar */}
      <div className="bg-white border-t border-gray-200 py-3 px-4 md:hidden fixed md:static  bottom-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center w-1/2">
            <p className="font-semibold">Total: ₹{total.toFixed(2)}</p>
          </div>
          <Link 
            href={(hasOutOfStockItems || cartProducts.length === 0) ? "#" : "/checkout"} 
            style={{ width: "100%" }}
          >
            <button
              className={`h-12 w-full ${
                hasOutOfStockItems || cartProducts.length === 0 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#1e6553] hover:bg-[#1e6553]/90"
              } text-white font-semibold rounded-md transition-colors duration-200`}
              disabled={hasOutOfStockItems || cartProducts.length === 0}
            >
              Continue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
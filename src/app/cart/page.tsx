"use client";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import Checkout from "./_components/Checkout";
import {
  getCartProducts,
  getProductById,
  // updateCartItem,
} from "@/actions/actions";
import Image from "next/image";
import { X } from "lucide-react";
import Help from "../_components/Help";

interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails: VariantDetail;
  currentInventory?: number;
  outOfStock?: boolean;
}

interface VariantDetail {
  price: number;
  discountedPrice: number;
  inventory: number;
  combination: {
    name: string;
    value: string;
  }[];
  sku: string;
}

const CartPage = () => {
  const [cartProductsWithDetails, setCartProductsWithDetails] = useState<
    (CartProduct & { currentInventory?: number; outOfStock?: boolean })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<{
    [key: string]: number;
  }>({});

  const fetchCartAndProductDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartItems = await getCartProducts();
      const productsWithDetails = await Promise.all(
        cartItems.map(
          async (item: {
            id: string;
            quantity: number;
            variantDetails?: VariantDetail;
          }) => {
            const productDetails = await getProductById(item.id);

            if (productDetails) {
              const variant = productDetails.variantDetails.find(
                (v) =>
                  v.sku === item.variantDetails?.sku &&
                  v.combination.every(
                    (comb, index) =>
                      comb.value ===
                      item.variantDetails?.combination[index]?.value
                  )
              );
              const currentInventory = variant?.inventory;
              return {
                ...productDetails,
                quantity: item.quantity,
                variantDetails: item.variantDetails,
                currentInventory,
                outOfStock:
                  currentInventory !== undefined &&
                  item.quantity > currentInventory,
              };
            }
            return null;
          }
        )
      );

      setCartProductsWithDetails(productsWithDetails.filter(Boolean));
      setPendingUpdates({});
    } catch (error) {
      console.error("Failed to fetch cart and product details:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartAndProductDetails();
  }, [fetchCartAndProductDetails]);

  const handleLocalQuantityChange = (
    productId: string,
    variantSku: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setCartProductsWithDetails((prevProducts) =>
      prevProducts.map((product) => {
        if (
          product.id === productId &&
          product.variantDetails.sku === variantSku
        ) {
          const updatedProduct = { ...product, quantity: newQuantity };
          updatedProduct.outOfStock =
            updatedProduct.currentInventory !== undefined &&
            newQuantity > updatedProduct.currentInventory;
          return updatedProduct;
        }
        return product;
      })
    );

    setPendingUpdates((prevUpdates) => ({
      ...prevUpdates,
      [`${productId}-${variantSku}`]: newQuantity,
    }));
  };

  const handleIncrement = (product: CartProduct) => {
    if (
      product.currentInventory !== undefined &&
      product.quantity < product.currentInventory
    ) {
      handleLocalQuantityChange(
        product.id,
        product.variantDetails.sku,
        product.quantity + 1
      );
    } else if (
      product.currentInventory !== undefined &&
      product.quantity >= product.currentInventory
    ) {
      console.log("Maximum quantity reached");
    } else {
      handleLocalQuantityChange(
        product.id,
        product.variantDetails.sku,
        product.quantity + 1
      );
    }
  };

  const handleDecrement = (product: CartProduct) => {
    if (product.quantity > 1) {
      handleLocalQuantityChange(
        product.id,
        product.variantDetails.sku,
        product.quantity - 1
      );
    }
  };

  const total = cartProductsWithDetails.reduce((sum, product) => {
    return (
      sum +
      (product.productDiscountedPrice || product.productPrice) *
        product.quantity
    );
  }, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col"  style={{position:"relative",height:"100vh"}}>
      <Navbar />
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-16 p-4 md:p-8 lg:p-20 flex-1" style={{overflowY:"scroll",marginTop:"50px"
      }}>
        {/* Cart Items - Mobile View */}
        <div className="lg:hidden w-full">
   
          {cartProductsWithDetails?.map((product, index) => (
            <div
              key={index}
              className="border-b border-gray-200 py-4 flex flex-col"
            >
              <div className="flex items-start gap-4">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.productName}
                    width={80}
                    height={80}
                    className="w-16 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {product.productName}
                    {" - "}
                    {product.variantDetails.combination
                      .map((attr) => `${attr.value}`)
                      .join(", ")}
                  </p>
                  {product.outOfStock && (
                    <p className="text-red-500 text-xs mt-1">
                      Out of Stock (Available: {product.currentInventory})
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-medium">
                      ₹{" "}
                      {(
                        product.productDiscountedPrice || product?.productPrice
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <button className="text-gray-500 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="border border-gray-200 text-sm flex items-center gap-2 w-fit rounded-md">
                  <button
                    onClick={() => handleDecrement(product)}
                    disabled={product.quantity <= 1}
                    className="w-8 h-8 cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                  >
                    −
                  </button>
                  <span className="text-sm w-max font-medium text-gray-800">
                    {product?.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(product)}
                    disabled={
                      product.currentInventory !== undefined &&
                      product.quantity >= product.currentInventory
                    }
                    className="w-8 h-8 cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
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

        {/* Cart Items - Desktop View */}
        <div className="hidden lg:block w-full lg:w-[70%]">
          <table className="w-full">
            <thead>
              <tr className="text-center text-gray-400 font-medium border-b border-gray-300">
                <th className="py-2 w-120 text-[0.875rem] opacity-60">Product</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">
                  Price
                </th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">
                  Quantity
                </th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">
                  Subtotal
                </th>
                <th className="py-2 text-[0.875rem] text-left opacity-60"></th>
              </tr>
            </thead>
            <tbody>
              {cartProductsWithDetails?.map((product, index) => (
                <tr key={index} className="border-b border-gray-200 h-[100px]">
                  <td>
                    <div className="flex items-center gap-4 h-[100%]">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.productName}
                          width={80}
                          height={80}
                          className="w-10 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-[1rem]">
                          {product.productName}
                          {" - "}
                          {product.variantDetails.combination
                            .map((attr) => `${attr.value}`)
                            .join(", ")}
                        </p>
                        {product.outOfStock && (
                          <p className="text-red-500 text-sm">
                            Out of Stock (Available: {product.currentInventory})
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-left">
                    <p className="text-[1rem]">
                      ₹{" "}
                      {(
                        product.productDiscountedPrice || product?.productPrice
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </td>
                  <td className="text-left">
                    <div className="border border-gray-200 text-lg flex items-center gap-2 w-fit rounded-md">
                      <button
                        onClick={() => handleDecrement(product)}
                        disabled={product.quantity <= 1}
                        className="w-10 h-10 cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                      >
                        −
                      </button>
                      <span className="text-[1rem] w-max font-medium text-gray-800">
                        {product?.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(product)}
                        disabled={
                          product.currentInventory !== undefined &&
                          product.quantity >= product.currentInventory
                        }
                        className="w-10 h-10 cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="ext-[1rem] text-left">
                    ₹{" "}
                    {(
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
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Checkout Section - Always visible but position changes */}
        <div className="w-full lg:w-[30%]">
          <Checkout total={total} />
        </div>
      </div>

      
    </div>
  );
};

export default CartPage;
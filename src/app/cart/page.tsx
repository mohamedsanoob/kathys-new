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
  }>({}); // Track local quantity changes

  console.log(pendingUpdates)

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
      setPendingUpdates({}); // Clear any pending updates on fresh fetch
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

    // Track the local update
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

  // Function to persist the local updates (you might trigger this on checkout or a "save cart" button)
  // const persistCartUpdates = async () => {
  //   try {
  //     for (const key in pendingUpdates) {
  //       const [productId, variantSku] = key.split("-");
  //       const newQuantity = pendingUpdates[key];
  //       await updateCartItem(productId, variantSku, newQuantity);
  //     }
  //     // After successful update, refresh the cart to ensure data consistency
  //     await fetchCartAndProductDetails();
  //     setPendingUpdates({}); // Clear pending updates
  //   } catch (error) {
  //     console.error("Failed to update cart items:", error);
  //     // Optionally revert local changes or show an error message
  //   }
  // };

  if (isLoading) {
    return <div>Loading cart...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="flex gap-16 max-w-[1290px] m-auto">
        <table className="w-full">
          <thead>
            <tr className="text-center text-gray-400 font-medium border-b border-gray-300">
              <th className="py-2">Product</th>
              <th className="py-2">Price</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Subtotal</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {cartProductsWithDetails?.map((product, index) => (
              <tr key={index} className="py-4 border-b border-gray-200">
                <td className="flex items-center gap-4 py-2">
                  {product.images[0] && (
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
                </td>
                <td className="py-2 text-center">
                  <p className="text-lg">
                    ₹{" "}
                    {(
                      product.productDiscountedPrice || product?.productPrice
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </td>
                <td className="py-2 text-center">
                  <div className=" border border-gray-200 text-lg flex items-center gap-4 w-fit rounded-md">
                    <button
                      onClick={() => handleDecrement(product)}
                      disabled={product.quantity <= 1}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400"
                    >
                      −
                    </button>
                    <span className="text-lg w-max font-medium text-gray-800">
                      {product?.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrement(product)}
                      disabled={
                        product.currentInventory !== undefined &&
                        product.quantity >= product.currentInventory
                      }
                      className="w-10 h-10 cursor-pointer flex items-center justify-center  font-bold text-gray-600 disabled:text-gray-400"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-2 text-lg text-center">
                  ₹{" "}
                  {(
                    (product.productDiscountedPrice || product.productPrice) *
                    product.quantity
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-2 text-center">
                  <button
                    // onClick={() =>
                    //   handleRemoveItem(product.id, product.variantDetails.sku)
                    // }
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Checkout />
        {/* {Object.keys(pendingUpdates).length > 0 && (
          <button
            onClick={persistCartUpdates}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Save Cart Updates
          </button>
        )} */}
      </div>
    </div>
  );
};

export default CartPage;

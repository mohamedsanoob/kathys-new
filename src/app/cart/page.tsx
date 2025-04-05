"use client";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import CartItems from "./_components/CartItems";
import Checkout from "./_components/Checkout";
import { getCartProducts, getProductById } from "@/actions/actions";

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

interface VariantDetail{
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

const fetchCartAndProductDetails = useCallback(async () => {
  setIsLoading(true);
  try {
    const cartItems = await getCartProducts();
    const productsWithDetails = await Promise.all(
      cartItems.map(
        async (item: {
          id: string;
          quantity: number;
          variantDetails?: VariantDetail; // Using your VariantDetail interface
        }) => {
          const productDetails = await getProductById(item.id);

          console.log(productDetails, "product details");
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
            const outOfStock =
              currentInventory === undefined ||
              item.quantity > currentInventory;
            return {
              ...productDetails,
              quantity: item.quantity,
              variantDetails: item.variantDetails,
              currentInventory,
              outOfStock,
            };
          }
          return null; // Handle cases where product might be deleted
        }
      )
    );

    setCartProductsWithDetails(productsWithDetails.filter(Boolean)); // Filter out null products
  } catch (error) {
    console.error("Failed to fetch cart and product details:", error);
  } finally {
    setIsLoading(false);
  }
}, []); // Add getProductById to dependencies

  useEffect(() => {
    fetchCartAndProductDetails();
  }, [fetchCartAndProductDetails]);

  if (isLoading) {
    return <div>Loading cart...</div>; // Or a more sophisticated loading indicator
  }

  return (
    <div>
      <Navbar />
      <div className="flex gap-16 max-w-[1290px] m-auto">
        <CartItems
          products={cartProductsWithDetails}
          onQuantityChange={fetchCartAndProductDetails}
        />{" "}
        {/* Pass the updated product info and a way to refresh */}
        <Checkout
        />{" "}
        {/* Only allow checkout for in-stock items */}
      </div>
    </div>
  );
};

export default CartPage;

"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { getCartProducts } from "@/actions/actions";

interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails: VariantDetail;
  currentInventory?: number;
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

export const useCart = () => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartItems = await getCartProducts();
      const filteredItems = cartItems.filter(Boolean);
      setCartProducts(filteredItems);
      return filteredItems;
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setLastUpdated(Date.now());
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await fetchCart();
    } catch (error) {
      console.error("Failed to refresh cart:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [fetchCart, isUpdating]);

  // ✅ use ref to always hold latest refreshCart function
  const refreshCartRef = useRef(refreshCart);
  useEffect(() => {
    refreshCartRef.current = refreshCart;
  }, [refreshCart]);

  // ✅ Attach event listener once, and always use latest refreshCart
  useEffect(() => {
    const handleCartUpdated = () => {
      refreshCartRef.current();
    };
    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("cart-remove-all", () => {
      setCartProducts([]);
    });
    return () => {
      window.removeEventListener("cart-remove-all", () => {
        setCartProducts([]);
      });
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalQuantity = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.quantity, 0),
    [cartProducts]
  );

  const totalPrice = useMemo(
    () =>
      cartProducts.reduce(
        (sum, item) =>
          sum +
          (item.productDiscountedPrice ?? item.productPrice) * item.quantity,
        0
      ),
    [cartProducts]
  );

  return useMemo(
    () => ({
      cartProducts,
      totalQuantity,
      totalPrice,
      isLoading,
      isUpdating,
      refreshCart,
      lastUpdated,
    }),
    [
      cartProducts,
      totalQuantity,
      totalPrice,
      isLoading,
      isUpdating,
      refreshCart,
      lastUpdated,
    ]
  );
};

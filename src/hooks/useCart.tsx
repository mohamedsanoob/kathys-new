"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { getCartProducts } from "@/actions/actions";
import { useAuth } from "@/context/AuthContext";

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
  const { currentUser, loading: authLoading } = useAuth();
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

  const refreshCartRef = useRef(refreshCart);
  useEffect(() => {
    refreshCartRef.current = refreshCart;
  }, [refreshCart]);

  useEffect(() => {
    const handleCartUpdated = () => {
      refreshCartRef.current();
    };
    const handleCartRemoveAll = () => {
      setCartProducts([]);
    };
    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("cart-remove-all", handleCartRemoveAll);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("cart-remove-all", handleCartRemoveAll);
    };
  }, []);

  // Wait for Firebase auth to hydrate so we don't briefly read the guest cart
  // for a logged-in user (which looks like items "re-appeared" on refresh).
  useEffect(() => {
    if (authLoading) return;
    fetchCart();
  }, [authLoading, currentUser?.uid, fetchCart]);

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
      isLoading: authLoading || isLoading,
      isUpdating,
      refreshCart,
      lastUpdated,
    }),
    [
      cartProducts,
      totalQuantity,
      totalPrice,
      authLoading,
      isLoading,
      isUpdating,
      refreshCart,
      lastUpdated,
    ]
  );
};

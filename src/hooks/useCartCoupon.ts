"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppliedCoupon } from "@/lib/appliedCouponStorage";
import {
  buildCartFingerprint,
  clearAppliedCoupon,
  loadStoredCoupon,
  saveAppliedCoupon,
} from "@/lib/appliedCouponStorage";
import { validateCartCoupon, type CouponCartItem } from "@/lib/validateCartCoupon";
import type { CouponStatus } from "@/app/_components/CouponField";

export function useCartCoupon(
  cartItems: CouponCartItem[],
  cartReady: boolean,
  userId?: string | null
) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const cartFingerprintRef = useRef<string | null>(null);
  const restoredRef = useRef(false);

  const cartFingerprint = buildCartFingerprint(cartItems);

  // Restore coupon once cart is loaded (avoids empty-cart → loaded wipe)
  useEffect(() => {
    if (!cartReady || restoredRef.current) return;
    restoredRef.current = true;
    cartFingerprintRef.current = cartFingerprint;

    const stored = loadStoredCoupon();
    if (
      stored &&
      (!stored.cartFingerprint || stored.cartFingerprint === cartFingerprint)
    ) {
      setAppliedCoupon(stored.coupon);
      setCouponInput(stored.coupon.code);
      setCouponStatus("applied");
      setCouponMessage(stored.coupon.message || "Coupon applied");
      if (!stored.cartFingerprint) {
        saveAppliedCoupon(stored.coupon, cartFingerprint);
      }
    }
  }, [cartReady, cartFingerprint]);

  // Clear only when cart contents change after initial restore
  useEffect(() => {
    if (!cartReady || !restoredRef.current) return;
    if (cartFingerprintRef.current === cartFingerprint) return;

    cartFingerprintRef.current = cartFingerprint;
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponStatus("idle");
    setCouponMessage("");
    clearAppliedCoupon();
  }, [cartReady, cartFingerprint]);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim();
    if (!code || couponStatus === "validating" || cartItems.length === 0) {
      return;
    }

    setCouponStatus("validating");
    setCouponMessage("");

    try {
      const result = await validateCartCoupon(code, cartItems, userId);

      if (result.ok) {
        setAppliedCoupon(result.coupon);
        setCouponStatus("applied");
        setCouponMessage(result.coupon.message || "Coupon applied successfully");
        saveAppliedCoupon(result.coupon, cartFingerprint);
        cartFingerprintRef.current = cartFingerprint;
      } else {
        setAppliedCoupon(null);
        setCouponStatus("error");
        setCouponMessage(result.message);
        clearAppliedCoupon();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setAppliedCoupon(null);
      setCouponStatus("error");
      setCouponMessage(
        err.response?.data?.message ||
          "Failed to apply coupon. Please try again."
      );
      clearAppliedCoupon();
    }
  }, [cartFingerprint, cartItems, couponInput, couponStatus, userId]);

  const applyCouponByCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed || couponStatus === "validating" || cartItems.length === 0) {
        return;
      }

      setCouponInput(trimmed.toUpperCase());
      setCouponStatus("validating");
      setCouponMessage("");

      try {
        const result = await validateCartCoupon(trimmed, cartItems, userId);

        if (result.ok) {
          setAppliedCoupon(result.coupon);
          setCouponStatus("applied");
          setCouponMessage(result.coupon.message || "Coupon applied successfully");
          saveAppliedCoupon(result.coupon, cartFingerprint);
          cartFingerprintRef.current = cartFingerprint;
        } else {
          setAppliedCoupon(null);
          setCouponStatus("error");
          setCouponMessage(result.message);
          clearAppliedCoupon();
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setAppliedCoupon(null);
        setCouponStatus("error");
        setCouponMessage(
          err.response?.data?.message ||
            "Failed to apply coupon. Please try again."
        );
        clearAppliedCoupon();
      }
    },
    [cartFingerprint, cartItems, couponStatus, userId]
  );

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponStatus("idle");
    setCouponMessage("");
    clearAppliedCoupon();
  }, []);

  return {
    couponInput,
    setCouponInput,
    appliedCoupon,
    couponStatus,
    couponMessage,
    handleApplyCoupon,
    handleRemoveCoupon,
    applyCouponByCode,
    couponDiscount: appliedCoupon?.discount ?? 0,
  };
}

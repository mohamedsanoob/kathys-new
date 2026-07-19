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

  // Restore coupon once cart is loaded (avoids empty-cart → loaded wipe).
  // Re-validate so eligibleLineCount / discount stay accurate for delivery.
  // Depend only on cartReady + fingerprint — cartItems identity changes every render.
  useEffect(() => {
    if (!cartReady || restoredRef.current) return;
    restoredRef.current = true;
    cartFingerprintRef.current = cartFingerprint;

    const stored = loadStoredCoupon();
    if (
      !stored ||
      (stored.cartFingerprint && stored.cartFingerprint !== cartFingerprint)
    ) {
      return;
    }

    const code = stored.coupon.code;
    const itemsSnapshot = cartItems;
    const userSnapshot = userId;
    const fingerprintSnapshot = cartFingerprint;
    setCouponInput(code);
    setCouponStatus("validating");

    let cancelled = false;
    (async () => {
      try {
        const result = await validateCartCoupon(code, itemsSnapshot, userSnapshot);
        if (cancelled) return;
        if (result.ok) {
          setAppliedCoupon(result.coupon);
          setCouponStatus("applied");
          setCouponMessage(result.coupon.message || "Coupon applied");
          saveAppliedCoupon(result.coupon, fingerprintSnapshot);
        } else {
          setAppliedCoupon(null);
          setCouponStatus("idle");
          setCouponMessage("");
          clearAppliedCoupon();
        }
      } catch {
        if (cancelled) return;
        // Fall back to stored discount; delivery uses line count 0 → standard fee
        setAppliedCoupon(stored.coupon);
        setCouponStatus("applied");
        setCouponMessage(stored.coupon.message || "Coupon applied");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot cartItems/userId at restore time
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
    eligibleLineCount: appliedCoupon?.eligibleLineCount ?? 0,
  };
}

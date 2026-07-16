"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Tag } from "lucide-react";
import {
  fetchAvailableCoupons,
  type AvailableCoupon,
  type CouponCartItem,
} from "@/lib/validateCartCoupon";
import type { CouponStatus } from "@/app/_components/CouponField";
import DiscountOfferTag from "@/app/_components/DiscountOfferTag";

interface AvailableCouponsProps {
  cartItems: CouponCartItem[];
  cartReady: boolean;
  userId?: string | null;
  appliedCode?: string | null;
  couponStatus: CouponStatus;
  onSelectCoupon: (code: string) => void;
}

const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
};

const AvailableCoupons = ({
  cartItems,
  cartReady,
  userId,
  appliedCode,
  couponStatus,
  onSelectCoupon,
}: AvailableCouponsProps) => {
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState("");

  const loadCoupons = useCallback(async () => {
    if (!cartReady || cartItems.length === 0) {
      setCoupons([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const list = await fetchAvailableCoupons(cartItems, userId);
      setCoupons(list);
    } catch {
      setError("Could not load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [cartItems, cartReady, userId]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  if (!cartReady || cartItems.length === 0) return null;

  return (
    <div className="w-full border border-dashed border-red-300/40 rounded-md overflow-hidden discount-offer-surface">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="relative z-[1] w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-red-50/80 hover:bg-red-100/80 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
          <Tag className="h-4 w-4 text-red-600" />
          Available coupons
          {!loading && coupons.length > 0 && (
            <span className="text-xs font-normal text-gray-500">
              ({coupons.length})
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="p-2 space-y-2 max-h-56 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            </div>
          ) : error ? (
            <p className="text-xs text-red-500 px-1 py-2">{error}</p>
          ) : coupons.length === 0 ? (
            <p className="text-xs text-gray-500 px-1 py-2">
              No active coupons right now.
            </p>
          ) : (
            coupons.map((coupon) => {
              const isApplied =
                appliedCode?.toUpperCase() === coupon.code.toUpperCase();
              const validTill = fmtDate(coupon.endDate);

              return (
                <div
                  key={coupon.code}
                  className={`rounded-md border px-3 py-2.5 ${
                    coupon.applicable
                      ? "discount-offer-surface border-red-300/40"
                      : "border-gray-200 bg-gray-50 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 relative z-[1]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-red-700 tracking-wide">
                          {coupon.code}
                        </span>
                        <DiscountOfferTag>{coupon.discountLabel}</DiscountOfferTag>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {coupon.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-gray-500">
                        {coupon.minOrderValue > 0 && (
                          <span>Min order ₹{coupon.minOrderValue}</span>
                        )}
                        {validTill && <span>Valid till {validTill}</span>}
                      </div>
                      {!coupon.applicable && coupon.message && (
                        <p className="text-[11px] text-amber-700 mt-1">
                          {coupon.message}
                        </p>
                      )}
                      {coupon.applicable && coupon.discount > 0 && (
                        <p className="text-[11px] text-red-600 mt-1">
                          Save ₹{coupon.discount.toFixed(2)} on this order
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={
                        !coupon.applicable ||
                        isApplied ||
                        couponStatus === "validating"
                      }
                      onClick={() => onSelectCoupon(coupon.code)}
                      className={`shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        isApplied
                          ? "discount-offer-tag cursor-default"
                          : coupon.applicable
                            ? "discount-offer-tag hover:opacity-95"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isApplied
                        ? "Applied"
                        : couponStatus === "validating"
                          ? "..."
                          : "Apply"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableCoupons;

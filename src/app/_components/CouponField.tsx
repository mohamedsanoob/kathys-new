"use client";

import { Tag, X, Check, Loader2, AlertCircle } from "lucide-react";
import type { AppliedCoupon } from "@/lib/appliedCouponStorage";

export type CouponStatus = "idle" | "validating" | "applied" | "error";

interface CouponFieldProps {
  couponInput: string;
  setCouponInput: (value: string) => void;
  appliedCoupon: AppliedCoupon | null;
  couponStatus: CouponStatus;
  couponMessage: string;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

const CouponField = ({
  couponInput,
  setCouponInput,
  appliedCoupon,
  couponStatus,
  couponMessage,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponFieldProps) => {
  const couponDiscount = appliedCoupon?.discount ?? 0;

  return (
    <div className="w-full">
      {appliedCoupon ? (
        <div className="flex items-center justify-between gap-2 border border-[#1e6553]/30 bg-[#1e6553]/5 rounded-md px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className="h-4 w-4 text-[#1e6553] shrink-0" />
            <span className="text-sm font-medium text-[#1e6553] truncate">
              {appliedCoupon.code}
            </span>
            <span className="text-xs text-gray-500 shrink-0">
              (-₹{couponDiscount.toFixed(2)})
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Remove coupon"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={couponInput || ""}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onApplyCoupon();
                }
              }}
              placeholder="Coupon code"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#1e6553]"
            />
          </div>
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={!(couponInput || "").trim() || couponStatus === "validating"}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0 ${
              (couponInput || "").trim() && couponStatus !== "validating"
                ? "bg-[#1e6553] text-white hover:bg-[#1a5947]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {couponStatus === "validating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
      )}

      {couponStatus === "applied" && couponMessage && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-[#1e6553]">
          <Check className="h-3 w-3" /> {couponMessage}
        </p>
      )}
      {couponStatus === "error" && couponMessage && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-600">
          <AlertCircle className="h-3 w-3" /> {couponMessage}
        </p>
      )}
    </div>
  );
};

export default CouponField;

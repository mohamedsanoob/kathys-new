"use client";

import CouponField from "@/app/_components/CouponField";
import AvailableCoupons from "@/app/_components/AvailableCoupons";
import type { AppliedCoupon } from "@/lib/appliedCouponStorage";
import type { CouponStatus } from "@/app/_components/CouponField";
import type { CouponCartItem } from "@/lib/validateCartCoupon";

interface CouponSectionProps {
  cartItems: CouponCartItem[];
  cartReady: boolean;
  userId?: string | null;
  couponInput: string;
  setCouponInput: (value: string) => void;
  appliedCoupon: AppliedCoupon | null;
  couponStatus: CouponStatus;
  couponMessage: string;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onSelectCoupon: (code: string) => void;
}

const CouponSection = ({
  cartItems,
  cartReady,
  userId,
  couponInput,
  setCouponInput,
  appliedCoupon,
  couponStatus,
  couponMessage,
  onApplyCoupon,
  onRemoveCoupon,
  onSelectCoupon,
}: CouponSectionProps) => (
  <div className="flex flex-col gap-3 w-full">
    <CouponField
      couponInput={couponInput}
      setCouponInput={setCouponInput}
      appliedCoupon={appliedCoupon}
      couponStatus={couponStatus}
      couponMessage={couponMessage}
      onApplyCoupon={onApplyCoupon}
      onRemoveCoupon={onRemoveCoupon}
    />
    {!appliedCoupon && (
      <AvailableCoupons
        cartItems={cartItems}
        cartReady={cartReady}
        userId={userId}
        appliedCode={appliedCoupon?.code}
        couponStatus={couponStatus}
        onSelectCoupon={onSelectCoupon}
      />
    )}
  </div>
);

export default CouponSection;

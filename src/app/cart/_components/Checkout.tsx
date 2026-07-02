import React from "react";
import Link from "next/link";
import CouponSection from "@/app/_components/CouponSection";
import type { AppliedCoupon } from "@/lib/appliedCouponStorage";
import type { CouponStatus } from "@/app/_components/CouponField";
import type { CouponCartItem } from "@/lib/validateCartCoupon";

interface CheckoutProps {
  total: number;
  deliveryFee: number;
  disabled: boolean;
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

const Checkout = ({
  total,
  deliveryFee,
  disabled,
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
}: CheckoutProps) => {
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const grandTotal = Math.max(0, total + deliveryFee - couponDiscount);

  const format = (amount: number) =>
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-4 md:p-6 lg:p-[20px_30px] flex flex-col w-full lg:w-[100%] gap-4 md:gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] lg:shadow-[5px_5px_0_#f8f8f8] border border-[#dee0ea] h-auto sticky top-4 mb-2.5">
      <div className="border-b border-[#dee0ea] pb-2.5">
        <h5 className="text-base font-medium lg:font-normal">Cart Totals</h5>
      </div>

      <CouponSection
        cartItems={cartItems}
        cartReady={cartReady}
        userId={userId}
        couponInput={couponInput}
        setCouponInput={setCouponInput}
        appliedCoupon={appliedCoupon}
        couponStatus={couponStatus}
        couponMessage={couponMessage}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
        onSelectCoupon={onSelectCoupon}
      />

      <div className="flex justify-between w-full border-b border-[#dee0ea] py-3 md:py-[15px_0_10px_0]">
        <h6 className="text-sm font-medium lg:font-normal">Subtotal</h6>
        <h6 className="text-sm font-medium lg:font-normal">₹ {format(total)}</h6>
      </div>

      {couponDiscount > 0 && (
        <div className="flex justify-between w-full border-b border-[#dee0ea] py-3 md:py-[15px_0_10px_0] text-[#1e6553]">
          <h6 className="text-sm font-medium lg:font-normal">Coupon discount</h6>
          <h6 className="text-sm font-medium lg:font-normal">
            -₹ {format(couponDiscount)}
          </h6>
        </div>
      )}

      <div className="flex justify-between w-full border-b border-[#dee0ea] py-3 md:py-[15px_0_10px_0]">
        <h6 className="text-sm font-medium lg:font-normal">Shipping</h6>
        <h6 className="text-sm font-medium lg:font-normal">
          ₹ {format(deliveryFee)}
        </h6>
      </div>

      <div className="flex justify-between items-center mt-2">
        <h6 className="text-base font-medium lg:font-normal">Total</h6>
        <h6 className="font-semibold text-lg md:text-xl">₹ {format(grandTotal)}</h6>
      </div>

      {disabled && (
        <p className="text-red-500 text-sm mt-2">
          Please remove out-of-stock items or adjust quantities to proceed
        </p>
      )}

      <Link href={disabled ? "#" : "/checkout"} style={{ width: "100%" }}>
        <button
          className={`hidden md:block h-12 w-full ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#1e6553] hover:bg-[#1e6553]"
          } text-white font-semibold rounded-md mt-4 transition-colors duration-200`}
          disabled={disabled}
          style={{ cursor: "pointer" }}
        >
          Continue
        </button>
      </Link>
    </div>
  );
};

export default Checkout;

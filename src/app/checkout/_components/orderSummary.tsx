import { useEffect } from "react";
import { CartProduct } from "@/types/checkout";
import CouponSection from "@/app/_components/CouponSection";
import type { AppliedCoupon } from "@/lib/appliedCouponStorage";
import type { CouponStatus } from "@/app/_components/CouponField";
import { computeDeliveryFee } from "@/lib/deliveryFee";

export type { AppliedCoupon, CouponStatus };

export interface OrderSummaryProps {
  cartProducts: CartProduct[];
  total: number;
  termsAgreed: boolean;
  setTermsAgreed: (v: boolean) => void;
  termsError: boolean;
  setTermsError: (v: boolean) => void;
  handlePlaceOrder: () => void;
  isValid: boolean;
  currentUser: any;
  selectedAddress: string | null | undefined;
  paymentMode: "online" | "cod" | "cof" | "" | undefined;
  showPaymentMode: boolean;
  setPaymentModeError: (v: boolean) => void;
  paymentModeError: boolean;
  showAddressForm: boolean;
  isKerala?: boolean;
  // Coupon
  couponInput: string;
  setCouponInput: (v: string) => void;
  appliedCoupon: AppliedCoupon | null;
  couponStatus: CouponStatus;
  couponMessage: string;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  onSelectCoupon?: (code: string) => void;
}

const OrderSummary = ({
  cartProducts,
  total,
  termsAgreed,
  termsError,
  handlePlaceOrder,
  isValid,
  currentUser,
  showAddressForm,
  paymentMode,
  selectedAddress,
  showPaymentMode,
  setPaymentModeError,
  paymentModeError,
  isKerala = true,
  couponInput,
  setCouponInput,
  appliedCoupon,
  couponStatus,
  couponMessage,
  onApplyCoupon,
  onRemoveCoupon,
  onSelectCoupon,
}: OrderSummaryProps) => {
  const normalizedPaymentMode = paymentMode || "";

  const deliveryFee = computeDeliveryFee({
    paymentMode: normalizedPaymentMode,
    isKerala: isKerala ?? false,
    eligibleLineCount: appliedCoupon?.eligibleLineCount ?? 0,
    couponApplied: !!appliedCoupon,
  });

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const grandTotal = Math.max(0, total + deliveryFee - couponDiscount);

  useEffect(() => {
    if (normalizedPaymentMode !== "") {
      setPaymentModeError(false);
    }
  }, [normalizedPaymentMode, setPaymentModeError]);

  return (
    <div className="w-full lg:w-1/3 h-max bg-white p-6 rounded-lg shadow-sm">
      <div className="w-full flex flex-col">
        <h6 className="font-medium text-lg mb-4">Your order</h6>

        {/* Coupon code */}
        <div className="mb-4">
          <CouponSection
            cartItems={cartProducts.map((p) => ({
              id: p.id,
              productPrice: p.productPrice || 0,
              productDiscountedPrice: p.productDiscountedPrice || 0,
              quantity: p.quantity,
              categories: p.categories || [],
              variantDetails: p.variantDetails
                ? {
                    price: p.variantDetails.price || 0,
                    discountedPrice: p.variantDetails.discountedPrice || 0,
                    sku: p.variantDetails.sku || "",
                  }
                : undefined,
            }))}
            cartReady={true}
            userId={currentUser?.uid}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            appliedCoupon={appliedCoupon}
            couponStatus={couponStatus}
            couponMessage={couponMessage}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
            onSelectCoupon={
              onSelectCoupon ||
              ((code) => {
                setCouponInput(code);
                setTimeout(() => onApplyCoupon(), 0);
              })
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-start pb-2 text-sm font-medium">Product</th>
                <th className="text-end pb-2 text-sm font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="text-start py-3 text-sm">
                    {product.productName} -{" "}
                    {product.variantDetails?.combination
                      ?.map((c) => c.value)
                      .join(", ")}{" "}
                    × {product.quantity}
                  </td>
                  <td className="text-end py-3 text-sm">
                    ₹
                    {(
                      (product?.variantDetails?.discountedPrice ||
                        product?.variantDetails?.price ||
                        0) * product.quantity
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Subtotal</td>
                <td className="text-end py-3 text-sm">₹{total.toFixed(2)}</td>
              </tr>

              {couponDiscount > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="text-start py-3 text-sm font-medium text-[#1e6553]">
                    Coupon Discount
                  </td>
                  <td className="text-end py-3 text-sm text-[#1e6553]">
                    -₹{couponDiscount.toFixed(2)}
                  </td>
                </tr>
              )}

              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">
                  Delivery Fee
                </td>
                <td className="text-end py-3 text-sm">
                  ₹{deliveryFee.toFixed(2)}
                </td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Total</td>
                <td className="text-end py-3 text-lg font-semibold">
                  ₹{grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-500">
            Your personal data will be used to process your order, support your
            experience throughout this website, and for other purposes described
            in our privacy policy
          </p>

          {termsError && (
            <p className="text-red-500 text-xs">
              Please agree to the terms and conditions
            </p>
          )}

          {showPaymentMode && paymentModeError && (
            <p className="text-red-500 text-xs">Please select a payment method</p>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={
              currentUser
                ? !selectedAddress || !termsAgreed || showAddressForm
                : !isValid || !termsAgreed
            }
            className={`hidden md:block w-full py-3 rounded-md text-white font-semibold ${
              (
                currentUser
                  ? selectedAddress &&
                    termsAgreed &&
                    !showAddressForm &&
                    (!showPaymentMode || paymentMode)
                  : isValid && termsAgreed && (!showPaymentMode || paymentMode)
              )
                ? "bg-[#1e6553] hover:bg-[#1e6553]"
                : "bg-gray-400 cursor-not-allowed"
            } transition-colors`}
          >
            {showPaymentMode
              ? paymentMode
                ? `Pay ₹${grandTotal.toFixed(2)}`
                : "Select Payment Method"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

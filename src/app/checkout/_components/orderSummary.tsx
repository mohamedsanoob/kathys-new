import { useEffect } from "react";
import { Tag, X, Check, Loader2, AlertCircle } from "lucide-react";
import { CartProduct } from "@/types/checkout";

export interface AppliedCoupon {
  code: string;
  discount: number;
  message?: string;
}

export type CouponStatus = "idle" | "validating" | "applied" | "error";

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
  paymentMode: "online" | "cod" | "cof" | "";
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
}: OrderSummaryProps) => {
  // Calculate delivery fee (₹150 for COD, otherwise 0)
  const deliveryFee =
    paymentMode === "cof"
      ? 0
      : paymentMode === "cod"
        ? 150
        : isKerala
          ? 75
          : 100;

  const couponDiscount = appliedCoupon?.discount ?? 0;
  const grandTotal = Math.max(0, total + deliveryFee - couponDiscount);

  useEffect(() => {
    if (paymentMode !== "") {
      setPaymentModeError(false);
    }
  }, [paymentMode]);

  return (
    <div className="w-full lg:w-1/3 h-max bg-white p-6 rounded-lg shadow-sm">
      <div className="w-full flex flex-col">
        <h6 className="font-medium text-lg mb-4">Your order</h6>

        {/* Coupon code */}
        <div className="mb-4">
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
                className="text-gray-400 hover:text-red-500 transition-colors"
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
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
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
                disabled={
                  !couponInput.trim() || couponStatus === "validating"
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  couponInput.trim() && couponStatus !== "validating"
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

          {/* Status messages */}
          {couponStatus === "applied" && couponMessage && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[#1e6553]">
              <Check className="h-3 w-3" /> {couponMessage}
            </p>
          )}
          {couponStatus === "error" && couponMessage && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" /> {couponMessage}
            </p>
          )}
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
                    {product.variantDetails.combination.map((c) => c.value).join(", ")} × {product.quantity}
                  </td>
                  <td className="text-end py-3 text-sm">
                    ₹{((product?.variantDetails?.discountedPrice || product?.variantDetails?.price) * product.quantity).toFixed(2)}
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
                <td className="text-start py-3 text-sm font-medium">Delivery Fee</td>
                <td className="text-end py-3 text-sm">₹{deliveryFee.toFixed(2)}</td>
              </tr>

              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Total</td>
                <td className="text-end py-3 text-lg font-semibold">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-500">
            Your personal data will be used to process your order, support your experience
            throughout this website, and for other purposes described in our privacy policy
          </p>

          {termsError && (
            <p className="text-red-500 text-xs">Please agree to the terms and conditions</p>
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
              (currentUser ? selectedAddress && termsAgreed && !showAddressForm && (!showPaymentMode || paymentMode)
                : isValid && termsAgreed && (!showPaymentMode || paymentMode))
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

// Delivery-fee rule — shared by the checkout page (order payload), the order
// summary (display), and the cart page (estimate). Mirrored server-side in the
// backend (kathys-backend/functions/lib/delivery.js); keep both in sync.

// Rates when a coupon is applied (also the per-item rate the multiplier uses)
export const COUPON_DELIVERY_FEE_KERALA = 60;
export const COUPON_DELIVERY_FEE_OUTSIDE_KERALA = 80;
// Standard rates when no coupon is applied
export const STANDARD_DELIVERY_FEE_KERALA = 75;
export const STANDARD_DELIVERY_FEE_OUTSIDE_KERALA = 100;

/** Kerala pincodes start with 67, 68 or 69. */
export function isKeralaPincode(pincode?: string | null): boolean {
  if (!pincode || pincode.length < 2) return false;
  const firstTwo = parseInt(pincode.substring(0, 2), 10);
  return firstTwo >= 67 && firstTwo <= 69;
}

export interface ComputeDeliveryFeeArgs {
  paymentMode: "online" | "cod" | "cof" | "";
  isKerala: boolean;
  /** Total quantity of all items in the cart (sum of line-item quantities). */
  totalQuantity: number;
  couponApplied: boolean;
}

/**
 * Delivery fee for an order.
 * - Collect-from-store (pickup) is always free.
 * - With a coupon: ₹60 Kerala / ₹80 outside, charged per item when there is more
 *   than one item (base fee × total quantity).
 * - Without a coupon: standard ₹75 Kerala / ₹100 outside, flat per order.
 */
export function computeDeliveryFee({
  paymentMode,
  isKerala,
  totalQuantity,
  couponApplied,
}: ComputeDeliveryFeeArgs): number {
  if (paymentMode === "cof") return 0;

  if (couponApplied) {
    const base = isKerala
      ? COUPON_DELIVERY_FEE_KERALA
      : COUPON_DELIVERY_FEE_OUTSIDE_KERALA;
    const multiplier = totalQuantity > 1 ? totalQuantity : 1;
    return base * multiplier;
  }

  return isKerala
    ? STANDARD_DELIVERY_FEE_KERALA
    : STANDARD_DELIVERY_FEE_OUTSIDE_KERALA;
}

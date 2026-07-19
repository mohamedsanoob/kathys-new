import axios from "axios";
import type { AppliedCoupon } from "./appliedCouponStorage";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api";

export interface CouponCartItem {
  id: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  categories?: string[];
  variantDetails?: {
    price?: number;
    discountedPrice?: number;
  };
}

export async function validateCartCoupon(
  code: string,
  items: CouponCartItem[],
  userId?: string | null
): Promise<
  | { ok: true; coupon: AppliedCoupon }
  | { ok: false; message: string }
> {
  const response = await axios.post(`${BASE_URL}/payment/coupon/validate`, {
    code: code.trim(),
    items: items.map((p) => ({
      product_id: p.id,
      price: p.productPrice,
      discountedPrice:
        p.variantDetails?.discountedPrice ||
        p.variantDetails?.price ||
        p.productDiscountedPrice ||
        p.productPrice,
      quantity: p.quantity,
      categories: p.categories || [],
    })),
    userId: userId || null,
  });

  const data = response.data;

  if (data.valid && Number(data.discount) > 0) {
    return {
      ok: true,
      coupon: {
        code: data.code,
        discount: data.discount,
        message: data.message,
        eligibleLineCount: Number(data.eligibleLineCount) || 0,
      },
    };
  }

  if (data.valid) {
    return {
      ok: false,
      message: "This coupon doesn't apply to the items in your cart",
    };
  }

  return {
    ok: false,
    message: data.message || "Invalid coupon code",
  };
}

export interface AvailableCoupon {
  code: string;
  description: string;
  discountLabel: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  endDate: string | null;
  applicable: boolean;
  discount: number;
  message: string;
}

export async function fetchAvailableCoupons(
  items: CouponCartItem[],
  userId?: string | null
): Promise<AvailableCoupon[]> {
  if (!items.length) return [];

  const response = await axios.post(`${BASE_URL}/payment/coupon/available`, {
    items: items.map((p) => ({
      product_id: p.id,
      price: p.productPrice,
      discountedPrice:
        p.variantDetails?.discountedPrice ||
        p.variantDetails?.price ||
        p.productDiscountedPrice ||
        p.productPrice,
      quantity: p.quantity,
      categories: p.categories || [],
    })),
    userId: userId || null,
  });

  return Array.isArray(response.data?.coupons) ? response.data.coupons : [];
}

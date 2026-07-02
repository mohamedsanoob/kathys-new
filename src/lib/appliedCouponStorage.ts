export interface AppliedCoupon {
  code: string;
  discount: number;
  message?: string;
}

interface StoredCouponState {
  coupon: AppliedCoupon;
  cartFingerprint: string;
}

const STORAGE_KEY = "appliedCartCoupon";

export function buildCartFingerprint(
  items: {
    id: string;
    quantity: number;
    productPrice?: number;
    productDiscountedPrice?: number;
    categories?: string[];
    variantDetails?: {
      sku?: string;
      price?: number;
      discountedPrice?: number;
    };
  }[]
): string {
  return items
    .map((p) => {
      const unit =
        p.variantDetails?.discountedPrice ||
        p.variantDetails?.price ||
        p.productDiscountedPrice ||
        p.productPrice ||
        0;
      return `${p.id}:${p.variantDetails?.sku || ""}:${p.quantity}:${unit}`;
    })
    .sort()
    .join("|");
}

export function saveAppliedCoupon(
  coupon: AppliedCoupon | null,
  cartFingerprint = ""
) {
  if (typeof window === "undefined") return;
  if (coupon && cartFingerprint) {
    const payload: StoredCouponState = { coupon, cartFingerprint };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function loadAppliedCoupon(): AppliedCoupon | null {
  return loadStoredCoupon()?.coupon ?? null;
}

export function loadStoredCoupon(): StoredCouponState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredCouponState | AppliedCoupon;

    // Legacy: coupon only (no fingerprint)
    if ("code" in parsed && !("coupon" in parsed)) {
      const legacy = parsed as AppliedCoupon;
      if (legacy?.code && Number(legacy.discount) > 0) {
        return { coupon: legacy, cartFingerprint: "" };
      }
      return null;
    }

    const state = parsed as StoredCouponState;
    if (
      state?.coupon?.code &&
      Number(state.coupon.discount) > 0 &&
      state.cartFingerprint
    ) {
      return state;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearAppliedCoupon() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Loader2, Tag } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAvailableCoupons,
  type AvailableCoupon,
  type CouponCartItem,
} from "@/lib/validateCartCoupon";

interface VariantDetail {
  price: number;
  discountedPrice: number;
  sku: string;
}

interface ProductCouponsProps {
  product: {
    id: string;
    productPrice: number;
    productDiscountedPrice: number;
    categories: string[];
  };
  selectedVariant?: VariantDetail | null;
  hasVariants?: boolean;
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

const ProductCoupons = ({
  product,
  selectedVariant,
  hasVariants = false,
}: ProductCouponsProps) => {
  const { currentUser } = useAuth();
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState("");

  const cartItem = useMemo<CouponCartItem | null>(() => {
    if (hasVariants && !selectedVariant) return null;

    return {
      id: product.id,
      productPrice: product.productPrice,
      productDiscountedPrice: product.productDiscountedPrice,
      quantity: 1,
      categories: product.categories || [],
      variantDetails: selectedVariant
        ? {
            price: selectedVariant.price,
            discountedPrice: selectedVariant.discountedPrice,
            sku: selectedVariant.sku,
          }
        : undefined,
    };
  }, [hasVariants, product, selectedVariant]);

  const loadCoupons = useCallback(async () => {
    if (!cartItem) {
      setCoupons([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const list = await fetchAvailableCoupons([cartItem], currentUser?.uid);
      setCoupons(list);
    } catch {
      setError("Could not load coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [cartItem, currentUser?.uid]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Coupon ${code} copied`);
    } catch {
      toast.info(`Coupon code: ${code}`);
    }
  };

  const applicableCount = coupons.filter((c) => c.applicable).length;

  // Only show the box when at least one coupon is actually applicable to this
  // product. While loading, on error, or with no applicable coupons, coupons is
  // empty so this renders nothing — keeping the section hidden.
  if (applicableCount === 0) return null;

  return (
    <div className="mb-6 w-full border border-dashed border-[#1e6553]/30 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-[#1e6553]/5 hover:bg-[#1e6553]/10 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#1e6553]" />
          Offers & coupons
          {!loading && coupons.length > 0 && (
            <span className="text-xs font-normal text-gray-500">
              ({applicableCount} applicable
              {coupons.length > applicableCount
                ? ` · ${coupons.length} total`
                : ""}
              )
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
        <div className="p-3 space-y-2 max-h-64 overflow-y-auto bg-white">
          {hasVariants && !selectedVariant ? (
            <p className="text-sm text-gray-500 py-2">
              Select product options to see applicable coupons.
            </p>
          ) : loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#1e6553]" />
            </div>
          ) : error ? (
            <p className="text-xs text-red-500 py-2">{error}</p>
          ) : coupons.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              No active coupons for this product right now.
            </p>
          ) : (
            coupons.map((coupon) => {
              const validTill = fmtDate(coupon.endDate);

              return (
                <div
                  key={coupon.code}
                  className={`rounded-md border px-3 py-2.5 ${
                    coupon.applicable
                      ? "border-[#1e6553]/30 bg-[#1e6553]/5"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#1e6553] tracking-wide">
                          {coupon.code}
                        </span>
                        <span className="text-xs font-medium text-gray-800 bg-white border border-gray-200 rounded px-2 py-0.5">
                          {coupon.discountLabel}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {coupon.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 mt-1.5 text-[11px] text-gray-500">
                        {coupon.minOrderValue > 0 && (
                          <span>Min order ₹{coupon.minOrderValue}</span>
                        )}
                        {validTill && <span>Valid till {validTill}</span>}
                      </div>
                      {coupon.applicable && coupon.discount > 0 && (
                        <p className="text-xs text-[#1e6553] font-medium mt-1.5">
                          Save ₹{coupon.discount.toFixed(2)} when you buy this
                          item
                        </p>
                      )}
                      {!coupon.applicable && coupon.message && (
                        <p className="text-[11px] text-amber-700 mt-1">
                          {coupon.message}
                        </p>
                      )}
                    </div>
                    {coupon.applicable && (
                      <button
                        type="button"
                        onClick={() => copyCode(coupon.code)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-white border border-[#1e6553]/40 text-[#1e6553] hover:bg-[#1e6553]/10 transition-colors"
                        title="Copy coupon code"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {coupons.some((c) => c.applicable) && (
            <p className="text-[11px] text-gray-400 pt-1">
              Copy a code and apply it in your cart or at checkout.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCoupons;

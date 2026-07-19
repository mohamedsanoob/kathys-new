"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Tag, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { useCategoryCouponPromos } from "@/hooks/useCategoryCouponPromos";
import type { CategoryCouponPromo } from "@/lib/categoryCouponPromos";

type PromoVariant = "banner" | "badge" | "ribbon";

interface CategoryCouponPromoProps {
  categoryId: string;
  variant?: PromoVariant;
  className?: string;
}

const fmtDate = (iso: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return null;
  }
};

const promoHeadline = (promo: CategoryCouponPromo) =>
  `${promo.discountLabel} available`;

const CategoryCouponPromo = ({
  categoryId,
  variant = "banner",
  className = "",
}: CategoryCouponPromoProps) => {
  const { loaded, promosForCategory } = useCategoryCouponPromos();
  const promos = promosForCategory(categoryId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [categoryId, promos.length]);

  useEffect(() => {
    if (promos.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % promos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promos.length]);

  const copyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Coupon ${code} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(`Coupon code: ${code}`);
    }
  }, []);

  if (!loaded || promos.length === 0) return null;

  const active = promos[activeIndex] || promos[0];

  if (variant === "ribbon") {
    return (
      <div
        className={`absolute top-2 right-2 z-20 pointer-events-none ${className}`}
      >
        <span className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] md:text-xs font-semibold bg-red-600 text-white shadow-sm">
          <Tag className="h-3 w-3 shrink-0" />
          {active.discountLabel}
        </span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          copyCode(active.code);
        }}
        className={`absolute top-2 left-2 z-20 flex items-center gap-1 rounded px-2 py-1 text-[10px] md:text-xs font-semibold bg-red-600 text-white shadow-sm ${className}`}
      >
        <Tag className="h-3 w-3 shrink-0" />
        <span>{promoHeadline(active)}</span>
      </button>
    );
  }

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
            <Tag className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">
              {promoHeadline(active)}
            </p>
            <p className="text-xs text-red-700/70 mt-0.5 truncate">
              Tap to view code
              {promos.length > 1 ? ` · ${promos.length} offers` : ""}
            </p>
          </div>

          <ChevronRight
            className={`h-5 w-5 shrink-0 text-red-500 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-red-200 bg-white">
          <div className="p-3 space-y-2">
            {promos.map((promo) => {
              const validTill = fmtDate(promo.endDate);
              return (
                <div
                  key={promo.code}
                  className="flex items-center justify-between gap-3 rounded-md border border-red-100 bg-red-50/60 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-red-800 tracking-wide">
                        {promo.code}
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-red-600 text-white">
                        {promo.discountLabel}
                      </span>
                    </div>
                    {promo.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {promo.description}
                      </p>
                    )}
                    {validTill && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        Valid till {validTill}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCode(promo.code)}
                    className="shrink-0 flex items-center gap-1.5 rounded-md bg-red-600 text-white px-3 py-2 text-xs font-medium hover:bg-red-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              );
            })}
            <p className="text-[11px] text-gray-400 text-center pt-1">
              Apply at cart or checkout
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCouponPromo;

"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Sparkles, Tag, ChevronRight } from "lucide-react";
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
  `${promo.discountLabel.toUpperCase()} AVAILABLE`;

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
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className={`absolute top-2 right-2 z-20 pointer-events-none ${className}`}
      >
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
          <span className="relative inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-[#1e6553] via-emerald-500 to-[#1e6553] bg-[length:200%_100%] animate-[shimmer_2.5s_ease-in-out_infinite] shadow-lg">
            <Sparkles className="h-3 w-3 shrink-0" />
            {active.discountLabel}
          </span>
        </div>
      </motion.div>
    );
  }

  if (variant === "badge") {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          copyCode(active.code);
        }}
        className={`absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-[#1e6553] to-emerald-600 shadow-md ring-2 ring-white/30 ${className}`}
      >
        <Tag className="h-3 w-3 shrink-0 animate-pulse" />
        <AnimatePresence mode="wait">
          <motion.span
            key={active.code}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {promoHeadline(active)}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e6553]/10 via-emerald-100/80 to-[#1e6553]/10 animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" />
      <div className="absolute inset-0 border border-[#1e6553]/25 rounded-xl pointer-events-none" />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="relative w-full text-left px-4 py-3 md:py-3.5 group"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e6553] to-emerald-500 text-white shadow-md"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={active.code}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
                className="text-sm md:text-base font-bold text-[#1e6553] tracking-tight"
              >
                {promoHeadline(active)}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-gray-600 mt-0.5 truncate">
              Tap to view code
              {promos.length > 1 ? ` · ${promos.length} offers` : ""}
            </p>
          </div>

          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="shrink-0 text-[#1e6553]"
          >
            <ChevronRight
              className={`h-5 w-5 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden border-t border-[#1e6553]/15 bg-white/70 backdrop-blur-sm"
          >
            <div className="p-3 space-y-2">
              {promos.map((promo) => {
                const validTill = fmtDate(promo.endDate);
                return (
                  <div
                    key={promo.code}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#1e6553]/20 bg-white px-3 py-2.5 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#1e6553] tracking-wider">
                          {promo.code}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
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
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyCode(promo.code)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#1e6553] text-white hover:bg-[#1a5947] transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? "Copied!" : "Copy"}
                    </motion.button>
                  </div>
                );
              })}
              <p className="text-[11px] text-gray-400 text-center pt-1">
                Apply at cart or checkout
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategoryCouponPromo;

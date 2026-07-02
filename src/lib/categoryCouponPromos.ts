import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api";

export interface CategoryCouponPromo {
  code: string;
  discountLabel: string;
  description: string;
  discountType: string;
  discountValue: number;
  endDate: string | null;
}

export type CategoryPromoMap = Record<string, CategoryCouponPromo[]>;

const CACHE_MS = 5 * 60 * 1000;
let cache: { data: CategoryPromoMap; ts: number } | null = null;
let inflight: Promise<CategoryPromoMap> | null = null;

export async function fetchCategoryCouponPromos(): Promise<CategoryPromoMap> {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return cache.data;
  }

  if (inflight) return inflight;

  inflight = axios
    .get(`${BASE_URL}/payment/coupon/category-promos`)
    .then((res) => {
      const promos: CategoryPromoMap =
        res.data?.promos && typeof res.data.promos === "object"
          ? res.data.promos
          : {};
      cache = { data: promos, ts: Date.now() };
      return promos;
    })
    .catch(() => ({}))
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function getPromosForCategory(
  promos: CategoryPromoMap,
  categoryId: string
): CategoryCouponPromo[] {
  if (!categoryId) return [];
  return promos[categoryId] || [];
}

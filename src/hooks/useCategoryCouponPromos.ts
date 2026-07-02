"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchCategoryCouponPromos,
  getPromosForCategory,
  type CategoryCouponPromo,
  type CategoryPromoMap,
} from "@/lib/categoryCouponPromos";

export function useCategoryCouponPromos() {
  const [promos, setPromos] = useState<CategoryPromoMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCategoryCouponPromos().then((data) => {
      if (active) {
        setPromos(data);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const promosForCategory = useCallback(
    (categoryId: string): CategoryCouponPromo[] =>
      getPromosForCategory(promos, categoryId),
    [promos]
  );

  return { promos, loaded, promosForCategory };
}

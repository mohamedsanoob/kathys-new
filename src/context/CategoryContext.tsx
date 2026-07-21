"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  RefObject,
} from "react";
import { useScrollContainer } from "@/context/ScrollContext";
import { useParams, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { getProductsByCategory, getCategoryById } from "@/actions/actions";
import { toMillis } from "@/lib/dates";

const serializeProduct = (product: any) => ({
  ...product,
  createdDate: toMillis(product.createdDate),
  updatedDate: toMillis(product.updatedDate),
});

/** UI-only search params that must not bust the product cache / refetch. */
const UI_ONLY_PARAMS = new Set(["filter"]);

const dataCacheKey = (id: string, searchParams: URLSearchParams) => {
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (!UI_ONLY_PARAMS.has(key)) params.set(key, value);
  });
  params.sort();
  return `${id}?${params.toString()}`;
};

export interface CategoryInitialData {
  products: any[];
  totalCount: number;
  currentCategory: any;
  subCategoriesDetails: any[];
  lastProductId: string | null;
  hasMore?: boolean;
}

interface CategoryState {
  products: any[];
  totalCount: number;
  currentCategory: any;
  subCategoriesDetails: any[];
  lastDoc: any;
  lastProductId: string | null;
  hasMore: boolean;
  scrollPosition: number;
}

interface CategoryContextProps extends CategoryState {
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  ITEMS_PER_PAGE: number;
  loadMoreProducts: () => void;
  setScrollPosition: (position: number) => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

const CategoryContext = createContext<CategoryContextProps | undefined>(
  undefined
);

const globalCategoryCache: Partial<Record<string, CategoryState>> = {};

export const CategoryProvider = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: CategoryInitialData;
}) => {
  const { scrollContainerRef } = useScrollContainer();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const ITEMS_PER_PAGE = 10;

  const cacheKey = dataCacheKey(id || "", searchParams);

  const [state, setState] = useState<CategoryState>(() => {
    if (globalCategoryCache[cacheKey]) {
      return globalCategoryCache[cacheKey]!;
    }
    return initialData
      ? {
          products: initialData.products,
          totalCount: initialData.totalCount,
          currentCategory: initialData.currentCategory,
          subCategoriesDetails: initialData.subCategoriesDetails,
          lastDoc: null,
          lastProductId: initialData.lastProductId,
          hasMore:
            initialData.hasMore ??
            initialData.products.length === ITEMS_PER_PAGE,
          scrollPosition: 0,
        }
      : {
          products: [],
          totalCount: 0,
          currentCategory: null,
          subCategoriesDetails: [],
          lastDoc: null,
          lastProductId: null,
          hasMore: true,
          scrollPosition: 0,
        };
  });
  const [loading, setLoading] = useState<boolean>(
    !initialData && !globalCategoryCache[cacheKey]
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seededRef = useRef<boolean>(
    !!initialData || !!globalCategoryCache[cacheKey]
  );
  const fetchGenRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const cacheKeyRef = useRef(cacheKey);
  cacheKeyRef.current = cacheKey;
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  // Reset provider state when navigating to a different category/filter set.
  const prevCacheKeyRef = useRef(cacheKey);
  useEffect(() => {
    if (prevCacheKeyRef.current === cacheKey) return;
    prevCacheKeyRef.current = cacheKey;

    if (globalCategoryCache[cacheKey]) {
      setState(globalCategoryCache[cacheKey]!);
      setLoading(false);
      setError(null);
      seededRef.current = true;
      return;
    }

    seededRef.current = false;
    setState({
      products: [],
      totalCount: 0,
      currentCategory: null,
      subCategoriesDetails: [],
      lastDoc: null,
      lastProductId: null,
      hasMore: true,
      scrollPosition: 0,
    });
    setLoading(true);
    setError(null);
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    if (!id) return;

    const sp = searchParamsRef.current;
    const currentCacheKey = dataCacheKey(id, sp);

    if (globalCategoryCache[currentCacheKey]) {
      setState(globalCategoryCache[currentCacheKey]!);
      setLoading(false);
      return;
    }

    const gen = ++fetchGenRef.current;
    setLoading(true);
    setError(null);

    try {
      const sortBy = sp.get("sortBy") || "latest";
      const minPrice = sp.get("minPrice");
      const maxPrice = sp.get("maxPrice");
      const color = sp.get("color");
      const sizes = sp.get("sizes");

      const [categoryDetails, productsData] = await Promise.all([
        getCategoryById(id),
        getProductsByCategory(
          id,
          ITEMS_PER_PAGE,
          null,
          sortBy,
          minPrice ? parseInt(minPrice) : undefined,
          maxPrice ? parseInt(maxPrice) : undefined,
          color || "",
          sizes ? sizes.split(",") : []
        ),
      ]);

      if (gen !== fetchGenRef.current) return;
      if (cacheKeyRef.current !== currentCacheKey) return;

      let subCategories: any[] = [];
      if (productsData.categories?.subCategories?.length) {
        subCategories = (
          await Promise.all(
            productsData.categories.subCategories.map((subId: string) =>
              getCategoryById(subId)
            )
          )
        ).filter(Boolean);
      }

      if (gen !== fetchGenRef.current) return;
      if (cacheKeyRef.current !== currentCacheKey) return;

      const newState: CategoryState = {
        products: productsData.products.map(serializeProduct),
        totalCount: productsData.totalCount,
        currentCategory: categoryDetails,
        subCategoriesDetails: subCategories,
        lastDoc: productsData.lastVisible,
        lastProductId: null,
        hasMore: productsData.hasMore,
        scrollPosition: 0,
      };

      setState(newState);
      globalCategoryCache[currentCacheKey] = newState;
    } catch (err) {
      if (gen !== fetchGenRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      if (gen === fetchGenRef.current) setLoading(false);
    }
    // Depend on cacheKey (ignores UI-only params like ?filter=) so opening
    // the filter drawer does not re-fetch or remount and yank scroll.
  }, [id, cacheKey]);

  useEffect(() => {
    if (seededRef.current) {
      seededRef.current = false;
      return;
    }
    fetchData();
  }, [fetchData]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMoreRef.current || !state.hasMore || !id) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const sortBy = searchParams.get("sortBy") || "latest";
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const color = searchParams.get("color");
      const sizes = searchParams.get("sizes");

      let cursorDoc: any = state.lastDoc;
      if (!cursorDoc && state.lastProductId) {
        const snap = await getDoc(doc(db, "products", state.lastProductId));
        cursorDoc = snap.exists() ? snap : null;
      }
      if (!cursorDoc) {
        setState((prev) => {
          const updated = { ...prev, hasMore: false };
          globalCategoryCache[dataCacheKey(id, searchParams)] = updated;
          return updated;
        });
        return;
      }

      const {
        products: newProducts,
        lastVisible,
        hasMore,
      } = await getProductsByCategory(
        id,
        ITEMS_PER_PAGE,
        cursorDoc,
        sortBy,
        minPrice ? parseInt(minPrice) : undefined,
        maxPrice ? parseInt(maxPrice) : undefined,
        color || "",
        sizes ? sizes.split(",") : []
      );

      setState((prev) => {
        const existingIds = new Set(prev.products.map((p) => p.id));
        const uniqueNew = newProducts
          .map(serializeProduct)
          .filter((p) => !existingIds.has(p.id));

        const updatedState: CategoryState = {
          ...prev,
          products: [...prev.products, ...uniqueNew],
          lastDoc: lastVisible,
          lastProductId: null,
          hasMore: hasMore && uniqueNew.length > 0 ? hasMore : hasMore,
        };

        // If Firestore says more but we got zero new unique items, stop.
        if (uniqueNew.length === 0) {
          updatedState.hasMore = false;
        }

        globalCategoryCache[dataCacheKey(id, searchParams)] = updatedState;
        return updatedState;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more products"
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [
    id,
    searchParams,
    state.hasMore,
    state.lastDoc,
    state.lastProductId,
  ]);

  const setScrollPosition = useCallback(
    (position: number) => {
      setState((prev) => {
        const updatedState = { ...prev, scrollPosition: position };
        if (id) {
          globalCategoryCache[dataCacheKey(id, searchParams)] = updatedState;
        }
        return updatedState;
      });
    },
    [id, searchParams]
  );

  return (
    <CategoryContext.Provider
      value={{
        ...state,
        loading,
        loadingMore,
        error,
        ITEMS_PER_PAGE,
        loadMoreProducts,
        setScrollPosition,
        scrollContainerRef,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategoryContext must be used within CategoryProvider");
  }
  return context;
};

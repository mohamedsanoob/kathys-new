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

// Helper to serialize Firestore Timestamps
// Raw Firestore docs may hold Timestamp objects here, so type loosely for serialization
const serializeProduct = (product: any) => ({
  ...product,
  createdDate: product.createdDate ? product.createdDate.toMillis() : null,
  updatedDate: product.updatedDate ? product.updatedDate.toMillis() : null,
});

export interface CategoryInitialData {
  products: any[];
  totalCount: number;
  currentCategory: any;
  subCategoriesDetails: any[];
  /** id of the last product in the seeded first page — used to rebuild the
   *  pagination cursor on the first `loadMore` (admin snapshots can't cross
   *  the RSC boundary, so we pass an id and fetch the snapshot client-side). */
  lastProductId: string | null;
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

// Module-level cache to survive component unmounts (e.g. navigating to product page and back)
const globalCategoryCache: Record<string, CategoryState> = {};

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

  const params = new URLSearchParams(searchParams);
  params.sort();
  const cacheKey = `${id}?${params.toString()}`;

  const [state, setState] = useState<CategoryState>(() => {
    if (globalCategoryCache[cacheKey]) {
      return globalCategoryCache[cacheKey];
    }
    return initialData
      ? {
          products: initialData.products,
          totalCount: initialData.totalCount,
          currentCategory: initialData.currentCategory,
          subCategoriesDetails: initialData.subCategoriesDetails,
          lastDoc: null,
          lastProductId: initialData.lastProductId,
          hasMore: initialData.products.length === ITEMS_PER_PAGE,
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
  const [loading, setLoading] = useState(!initialData && !globalCategoryCache[cacheKey]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When seeded with server-prefetched data, skip the FIRST client fetch
  // (initialData already reflects the current id + searchParams). Subsequent
  // id/searchParams changes fetch normally. If we restored from cache, also skip.
  const seededRef = useRef(!!initialData || !!globalCategoryCache[cacheKey]);

  const fetchData = useCallback(async () => {
    if (!id) return;

    // Create a unique key based on category and filters
    const params = new URLSearchParams(searchParams);
    params.sort();
    const currentCacheKey = `${id}?${params.toString()}`;

    // Use cached data if available (including scroll position)
    if (globalCategoryCache[currentCacheKey]) {
      setState(globalCategoryCache[currentCacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sortBy = searchParams.get("sortBy") || "latest";
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const color = searchParams.get("color");
      const sizes = searchParams.get("sizes");

      const [categoryDetails, productsData] = await Promise.all([
        getCategoryById(id),
        getProductsByCategory(
          id,
          ITEMS_PER_PAGE,
          null, // Always fetch from the start for a new filter/category
          sortBy,
          minPrice ? parseInt(minPrice) : undefined,
          maxPrice ? parseInt(maxPrice) : undefined,
          color || "",
          sizes ? sizes.split(",") : []
        ),
      ]);

      let subCategories = [];
      if (productsData.categories?.subCategories?.length) {
        subCategories = (
          await Promise.all(
            productsData.categories.subCategories.map((subId: string) =>
              getCategoryById(subId)
            )
          )
        ).filter(Boolean);
      }

      const newState = {
        products: productsData.products.map(serializeProduct),
        totalCount: productsData.totalCount,
        currentCategory: categoryDetails,
        subCategoriesDetails: subCategories,
        lastDoc: productsData.lastVisible,
        lastProductId: null,
        hasMore: productsData.products.length === ITEMS_PER_PAGE,
        scrollPosition: 0, // Reset scroll position for new data
      };

      setState(newState);
      globalCategoryCache[currentCacheKey] = newState; // Cache the new state
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id, searchParams]);

  useEffect(() => {
    if (seededRef.current) {
      seededRef.current = false;
      return; // server already pre-fetched the first page
    }
    fetchData();
  }, [fetchData]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !state.hasMore || !id) return;
    setLoadingMore(true);

    try {
      const sortBy = searchParams.get("sortBy") || "latest";
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const color = searchParams.get("color");
      const sizes = searchParams.get("sizes");

      // Rebuild the cursor: prefer the last snapshot; otherwise reconstruct
      // it from the seeded last product id (first loadMore after a seed).
      let cursorDoc: any = state.lastDoc;
      if (!cursorDoc && state.lastProductId) {
        cursorDoc = await getDoc(doc(db, "products", state.lastProductId));
      }
      if (!cursorDoc) {
        return; // nothing to paginate from
      }

      const { products: newProducts, lastVisible } = await getProductsByCategory(
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

        const updatedState = {
          ...prev,
          products: [...prev.products, ...uniqueNew],
          lastDoc: lastVisible,
          lastProductId: null, // real cursor now held in lastDoc
          hasMore: newProducts.length === ITEMS_PER_PAGE,
          // Keep the existing scroll position when loading more
        };

        const params = new URLSearchParams(searchParams);
        params.sort();
        const currentCacheKey = `${id}?${params.toString()}`;
        globalCategoryCache[currentCacheKey] = updatedState; // Update cache

        return updatedState;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  }, [id, searchParams, loadingMore, state.hasMore, state.lastDoc, state.lastProductId]);

  const setScrollPosition = useCallback((position: number) => {
    setState((prev) => {
      const updatedState = { ...prev, scrollPosition: position };

      // Update cache with new scroll position
      const params = new URLSearchParams(searchParams);
      params.sort();
      const currentCacheKey = `${id}?${params.toString()}`;
      globalCategoryCache[currentCacheKey] = updatedState;

      return updatedState;
    });
  }, [id, searchParams]);

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

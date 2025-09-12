"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getProductsByCategory, getCategoryById } from "@/actions/actions";

// Helper to serialize Firestore Timestamps
const serializeProduct = (product) => ({
  ...product,
  createdDate: product.createdDate ? product.createdDate.toMillis() : null,
  updatedDate: product.updatedDate ? product.updatedDate.toMillis() : null,
});

interface CategoryState {
  products: any[];
  totalCount: number;
  currentCategory: any;
  subCategoriesDetails: any[];
  lastDoc: any;
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
}

const CategoryContext = createContext<CategoryContextProps | undefined>(
  undefined
);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const ITEMS_PER_PAGE = 10;

  const [state, setState] = useState<CategoryState>({
    products: [],
    totalCount: 0,
    currentCategory: null,
    subCategoriesDetails: [],
    lastDoc: null,
    hasMore: true,
    scrollPosition: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Record<string, CategoryState>>({});

  const fetchData = useCallback(async () => {
    if (!id) return;

    // Create a unique key based on category and filters
    const params = new URLSearchParams(searchParams);
    params.sort();
    const cacheKey = `${id}?${params.toString()}`;

    // Use cached data if available (including scroll position)
    if (cacheRef.current[cacheKey]) {
      console.log('Loading from cache, scroll position:', cacheRef.current[cacheKey].scrollPosition);
      setState(cacheRef.current[cacheKey]);
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
        subCategories = (await Promise.all(
          productsData.categories.subCategories.map((subId) => getCategoryById(subId))
        )).filter(Boolean);
      }
      
      const newState = {
        products: productsData.products.map(serializeProduct),
        totalCount: productsData.totalCount,
        currentCategory: categoryDetails,
        subCategoriesDetails: subCategories,
        lastDoc: productsData.lastVisible,
        hasMore: productsData.products.length === ITEMS_PER_PAGE,
        scrollPosition: 0, // Reset scroll position for new data
      };

      setState(newState);
      cacheRef.current[cacheKey] = newState; // Cache the new state
      console.log('Fresh data loaded, scroll position reset to 0');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id, searchParams]);

  useEffect(() => {
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

      const { products: newProducts, lastVisible } = await getProductsByCategory(
        id, ITEMS_PER_PAGE, state.lastDoc, sortBy,
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
          hasMore: newProducts.length === ITEMS_PER_PAGE,
          // Keep the existing scroll position when loading more
        };

        const params = new URLSearchParams(searchParams);
        params.sort();
        const cacheKey = `${id}?${params.toString()}`;
        cacheRef.current[cacheKey] = updatedState; // Update cache

        return updatedState;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  }, [id, searchParams, loadingMore, state.hasMore, state.lastDoc]);

  const setScrollPosition = useCallback((position: number) => {
    setState((prev) => {
      const updatedState = { ...prev, scrollPosition: position };
      
      // Update cache with new scroll position
      const params = new URLSearchParams(searchParams);
      params.sort();
      const cacheKey = `${id}?${params.toString()}`;
      cacheRef.current[cacheKey] = updatedState;
      
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
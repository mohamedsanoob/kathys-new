"use client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { getProductsByCategory } from "@/actions/actions";
import { Product } from "@/types/product";
import Image from "next/image";
import { LayoutGrid, List, ListFilter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import namer from "color-namer";
import ProductListItem from "./ProductListItem";
import ProductGridItem from "./ProductGridItem";

interface ProductsSectionProps {
  initialProducts: Product[];
  totalProducts: number;
  itemsPerPage: number;
  categoryName: string;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  initialProducts,
  totalProducts,
  itemsPerPage,
  categoryName,
}) => {
  const [isGridView, setIsGridView] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<null | undefined | any>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [hasMore, setHasMore] = useState(
    initialProducts.length === itemsPerPage
  );
  const loaderRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Memoize params to avoid unnecessary recalculations
  const { minPriceParam, maxPriceParam, colorParam } = useMemo(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const color = searchParams.get("color");
    return {
      minPriceParam: minPrice ? parseInt(minPrice) : undefined,
      maxPriceParam: maxPrice ? parseInt(maxPrice) : undefined,
      colorParam: color ? `#${color}` : "",
    };
  }, [searchParams]);

  const toggleFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", "open");
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { products: initialFetchProducts, lastVisible } =
        await getProductsByCategory(
          categoryName,
          itemsPerPage,
          null,
          sortBy,
          minPriceParam,
          maxPriceParam
        );

      setProducts(initialFetchProducts);
      setLastDoc(lastVisible);
      setHasMore(initialFetchProducts.length === itemsPerPage);
    } finally {
      setLoading(false);
    }
  }, [categoryName, itemsPerPage, sortBy, minPriceParam, maxPriceParam]);

  const fetchMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const { products: newProducts, lastVisible } =
        await getProductsByCategory(
          categoryName,
          itemsPerPage,
          lastDoc,
          sortBy,
          minPriceParam,
          maxPriceParam
        );

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNewProducts = newProducts.filter(
          (p) => !existingIds.has(p.id)
        );
        return [...prev, ...uniqueNewProducts];
      });

      setLastDoc(lastVisible);
      setHasMore(newProducts.length === itemsPerPage);
    } finally {
      setLoadingMore(false);
    }
  }, [
    categoryName,
    itemsPerPage,
    lastDoc,
    sortBy,
    loadingMore,
    hasMore,
    minPriceParam,
    maxPriceParam,
  ]);

  // Initial load and filter changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Infinite scroll setup
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          fetchMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [fetchMoreProducts, hasMore, loadingMore]);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value;
      setSortBy(newSort);
    },
    []
  );

  const clearSingleFilter = useCallback(
    (key: string) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete(key);
      router.push(`?${newParams.toString()}`);
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    router.push(window.location.pathname);
  }, [router]);

  const getColorNamesFromHex = useCallback((hexColor: string) => {
    const result = namer(hexColor);
    return result.ntc[0].name;
  }, []);

  // Memoize product list rendering
  const productList = useMemo(() => {
    if (isGridView) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductGridItem key={product.id} product={product} />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            product={product}
            categoryName={categoryName}
          />
        ))}
      </div>
    );
  }, [isGridView, products, categoryName]);

  return (
    <div className="flex-1 w-full overflow-hidden px-2 md:px-0">
      {/* Banner Image */}
      <div className="w-full relative aspect-[3/1] mb-4">
        <Image
          src="https://dressupfashion.in/wp-content/uploads/2024/11/web3.jpg.webp"
          alt="Category Banner"
          fill
          className="object-cover rounded"
          priority
        />
      </div>

      {/* Controls Bar */}
      <div className="flex justify-between items-center my-4">
        <div className="md:flex gap-4 hidden">
          <LayoutGrid
            onClick={() => setIsGridView(true)}
            className={`cursor-pointer w-5 h-5 ${
              isGridView ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <List
            onClick={() => setIsGridView(false)}
            className={`cursor-pointer w-5 h-5 ${
              !isGridView ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-sm">
            Showing 1–{products.length} of {totalProducts} results
          </p>
        </div>

        <button
          onClick={toggleFilter}
          className="flex items-center gap-2 md:hidden bg-gray-100 px-3 py-1.5 rounded"
        >
          <ListFilter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
        </button>

        <div className="flex items-center space-x-2">
          <label className="text-sm" htmlFor="sort">
            Sort By:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="py-1 px-2 text-sm"
            disabled={loading}
          >
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {searchParams.size > 0 && (
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={clearAllFilters}
            className="text-sm flex items-center gap-2 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="font-bold text-bold w-4 h-4" />
            Clear All
          </button>

          {colorParam && (
            <button
              onClick={() => clearSingleFilter("color")}
              className="text-sm flex items-center gap-2 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              <X className="font-bold text-bold w-4 h-4" />
              {getColorNamesFromHex(colorParam)}
            </button>
          )}

          {minPriceParam && (
            <button
              onClick={() => clearSingleFilter("minPrice")}
              className="text-sm flex items-center gap-2 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              <X className="font-bold text-bold w-4 h-4" />
              Min: ₹{minPriceParam}
            </button>
          )}

          {maxPriceParam && (
            <button
              onClick={() => clearSingleFilter("maxPrice")}
              className="text-sm flex items-center gap-2 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              <X className="font-bold text-bold w-4 h-4" />
              Max: ₹{maxPriceParam}
            </button>
          )}
        </div>
      )}

      {/* Loading state for initial load */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-t-amber-500 border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && productList}

      {/* Load More */}
      <div ref={loaderRef} className="mt-8 flex justify-center items-center">
        {loadingMore ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-t-amber-500 border-gray-200 rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading more...</span>
          </div>
        ) : hasMore ? (
          <button
            onClick={fetchMoreProducts}
            className="px-4 py-2 border rounded bg-gray-50 hover:bg-gray-100 transition-colors"
            disabled={loadingMore}
          >
            Load More
          </button>
        ) : (
          products.length > 0 && (
            <p className="text-gray-500 text-sm">No more products to show</p>
          )
        )}
      </div>
    </div>
  );
};
export default ProductsSection;

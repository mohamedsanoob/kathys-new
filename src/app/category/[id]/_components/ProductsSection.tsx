"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { LayoutGrid, List, Loader2 } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductListItem from "./ProductListItem";
import ProductGridItem from "./ProductGridItem";
import { useCategoryContext } from "@/context/CategoryContext";

const ProductsSection: React.FC = () => {
  const {
    products,
    totalCount,
    currentCategory,
    loading,
    loadingMore,
    hasMore,
    loadMoreProducts,
    scrollPosition,
    setScrollPosition,
    scrollContainerRef
  } = useCategoryContext();

  const [isGridView, setIsGridView] = useState(true);
  const [scrollRestored, setScrollRestored] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sortBy") || "latest";

  // Save scroll position
  useEffect(() => {
    if (loading || isRestoringRef.current) return;
    const container = scrollContainerRef.current;
  
    if (!container) return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {

      if (throttleTimeout === null && !isRestoringRef.current) {
        throttleTimeout = setTimeout(() => {
          const scrollPos = container.scrollTop;
          if (scrollPos > 10 && setScrollPosition) {
            setScrollPosition(scrollPos);
            console.log("Scroll position saved:", scrollPos);
          }
          throttleTimeout = null;
        }, 200);
      }
    };

    // Save initial scroll if already scrolled
    if (container.scrollTop > 10 && !scrollRestored && setScrollPosition) {
      setScrollPosition(container.scrollTop);
    }

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [loading, scrollRestored, setScrollPosition]);

  // Restore scroll position (bounded — never block infinite scroll forever)
  useEffect(() => {
    if (loading || scrollRestored || !scrollPosition) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    isRestoringRef.current = true;
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // ~1s at 60fps

    const finish = () => {
      if (cancelled) return;
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      container.scrollTo({
        top: Math.min(scrollPosition, maxScroll),
        behavior: "instant",
      });
      setScrollRestored(true);
      setTimeout(() => {
        if (!cancelled) isRestoringRef.current = false;
      }, 100);
    };

    const restoreScroll = () => {
      if (cancelled) return;
      attempts += 1;
      if (
        (container.scrollHeight > container.clientHeight &&
          container.scrollHeight > scrollPosition) ||
        attempts >= MAX_ATTEMPTS
      ) {
        finish();
        return;
      }
      requestAnimationFrame(restoreScroll);
    };

    const t = setTimeout(restoreScroll, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
      isRestoringRef.current = false;
    };
  }, [loading, scrollRestored, scrollPosition, scrollContainerRef]);

  // Reset scroll restore flag on navigation
  useEffect(() => {
    setScrollRestored(false);
    isRestoringRef.current = false;
  }, [pathname, searchParams]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;
    const container = scrollContainerRef.current;
    const sentinel = loaderRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          !isRestoringRef.current
        ) {
          loadMoreProducts();
        }
      },
      {
        root: container,
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreProducts, hasMore, loadingMore, loading, scrollContainerRef]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (newSortBy === "latest") {
      current.delete("sortBy");
    } else {
      current.set("sortBy", newSortBy);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    if (setScrollPosition) setScrollPosition(0); // reset scroll on sort

    router.push(`${pathname}${query}`);
  };

  // Keep render order aligned with Firestore cursor order (no client re-sort).
  const productList = useMemo(() => {
    if (isGridView) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductGridItem key={p.id} product={p} />
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-6">
        {products.map((p) => (
          <ProductListItem
            key={p.id}
            product={p}
            categoryName={currentCategory?.name}
          />
        ))}
      </div>
    );
  }, [isGridView, products, currentCategory?.name]);

  return (
    <div
 
      className="flex-1 w-full  px-2 md:px-0 h-screen" // full scrollable container
    >
      {(currentCategory?.imageMobile || currentCategory?.imageDesktop) && (
        <div className="w-full relative aspect-[4/1] mb-4">
          <div className="md:hidden w-full h-full">
            {currentCategory?.imageMobile && (
              <Image src={currentCategory.imageMobile} alt="banner" fill className="object-cover rounded" />
            )}
          </div>
          <div className="hidden md:block w-full h-full">
            {currentCategory?.imageDesktop && (
              <Image src={currentCategory.imageDesktop} alt="banner" fill className="object-cover rounded" />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center my-4">
        <div className="hidden md:flex items-center gap-4">
          <LayoutGrid
            onClick={() => setIsGridView(true)}
            className={`cursor-pointer w-5 h-5 ${isGridView ? "text-green-900" : "text-gray-400"}`}
          />
          <List
            onClick={() => setIsGridView(false)}
            className={`cursor-pointer w-5 h-5 ${!isGridView ? "text-green-900" : "text-gray-400"}`}
          />
          <p className="text-sm">
            Showing 1–{products.length} of {totalCount} results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Sort By:</label>
          <select value={sortBy} onChange={handleSortChange} className="py-1 px-2 text-sm">
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {products.length > 0 ? productList : <p>No products found for the selected criteria.</p>}

      <div ref={loaderRef} className="mt-8 flex justify-center items-center h-20">
        {loadingMore && <Loader2 className="animate-spin h-12 w-12 text-green-700" />}
        {!loadingMore && !hasMore && products.length > 0 && (
          <p className="text-gray-500 text-sm">No more products</p>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;

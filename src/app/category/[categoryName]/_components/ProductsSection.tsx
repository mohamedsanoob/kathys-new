"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProductsByCategory } from "@/actions/actions";
import { Product } from "@/types/product";
import Image from "next/image";
import { LayoutGrid, List } from "lucide-react";

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
  const [grid, setGrid] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [hasMore, setHasMore] = useState(initialProducts.length === itemsPerPage);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { products: newProducts, lastVisible } = await getProductsByCategory(
        categoryName,
        itemsPerPage,
        lastDoc,
        sortBy
      );

      // Filter out duplicates before adding new products
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewProducts];
      });

      setLastDoc(lastVisible);
      setHasMore(newProducts.length === itemsPerPage);
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryName, itemsPerPage, lastDoc, sortBy, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchMoreProducts, hasMore, loading]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
  };

  return (
    <div className="flex-1">
      <Image
        src="https://dressupfashion.in/wp-content/uploads/2024/11/web3.jpg.webp"
        alt="image"
        width={1000}
        height={1000}
        className="w-full"
      />
      <div className="flex justify-between items-center my-8">
        <div className="flex gap-4">
          <LayoutGrid
            onClick={() => setGrid(true)}
            className={`cursor-pointer w-5 h-5 ${grid && "text-gray-400"}`}
          />
          <List
            onClick={() => setGrid(false)}
            className={`cursor-pointer w-5 h-5 ${!grid && "text-gray-400"}`}
          />
          <p>
            Showing 1–{products.length} of {totalProducts} results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort">Sort By:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className="border rounded py-1 px-2"
          >
            <option value="latest">Latest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className={`grid gap-4 ${grid ? "grid-cols-4" : "grid-cols-1"}`}>
        {products.map((product) =>
          grid ? (
            <div key={product.id} className="flex flex-col gap-2">
              <Image
                src={product.images[0]}
                alt={product.productName}
                width={250}
                height={250}
                className="w-[250px]"
              />
              <p className="text-center">{product.productName}</p>
              <div className="flex gap-4">
                <p className="line-through text-sm text-gray-400">
                  ₹ {product.productPrice.toFixed(2)}
                </p>
                <p className="text-sm font-semibold">
                  ₹ {product.productDiscountedPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div key={product.id}>
              <div className="flex gap-8">
                <Image
                  src={product.images[0]}
                  alt={product.productName}
                  width={250}
                  height={250}
                />
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <p className="text-2xl">{product.productName}</p>
                    <div className="flex gap-4 text-xl">
                      <p className="line-through text-gray-400">
                        ₹ {product.productPrice.toFixed(2)}
                      </p>
                      <p className="font-semibold">
                        ₹ {product.productDiscountedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500">
                    Beautiful Ajrakh Printed 3 Pcs Cotton Side slit kurtis with
                    bottom and Dupatta with elegant Mirror works – With Lining
                  </p>
                  <hr className="text-gray-300" />
                  <button className="text-white font-[500] bg-amber-600 px-8 py-2 w-fit cursor-pointer transition-transform hover:scale-105 duration-200 ease-in-out">
                    Select options
                  </button>
                  <div>
                    <p>
                      SKU <span>N/A</span>
                    </p>
                    <p>
                      Category <span>Category name take from params</span>
                    </p>
                  </div>
                </div>
              </div>
              <hr className="text-gray-300 mt-8 mb-4" />
            </div>
          )
        )}
      </div>
      <div ref={loaderRef} className="mt-8 flex justify-center items-center space-x-2">
        {loading ? (
          <span className="ml-2">Loading...</span>
        ) : hasMore ? (
          <button
            onClick={fetchMoreProducts}
            className="px-4 py-2 border rounded"
          >
            Load More
          </button>
        ) : (
          <p className="text-gray-500">No more products to show</p>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
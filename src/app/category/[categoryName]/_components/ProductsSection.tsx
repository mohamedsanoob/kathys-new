"use client";
import { useCallback, useEffect, useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(
    initialProducts.length > 0 && initialProducts.length === itemsPerPage
      ? initialProducts[initialProducts.length - 1].id
      : undefined
  );
  const [totalPages, setTotalPages] = useState(
    Math.ceil(totalProducts / itemsPerPage)
  );

  // Use useCallback to memoize the fetchProducts function
  const fetchProducts = useCallback(
    async (page: number, sortOption: string, cursor?: string | null) => {
      console.log(
        "Fetching page:",
        page,
        "with cursor:",
        cursor,
        "and sort:",
        sortOption
      );
      setLoading(true);
      try {
        const { products: newProducts, lastDocumentId: newLastId } =
          await getProductsByCategory(
            categoryName,
            itemsPerPage,
            cursor, // Pass the cursorId
            sortOption
          );
        console.log(
          "Fetched products:",
          newProducts.length,
          "Last ID:",
          newLastId
        );
        console.log(newProducts, "newProducts");
        console.log(lastDocumentId, "lastDocumentId before update");

        setProducts(newProducts); // Replace existing products with the new page
        setCurrentPage(page);
        setSortBy(sortOption);
        setLastDocumentId(newLastId); // Update the lastDocumentId
        console.log(lastDocumentId, "lastDocumentId after update");
      } catch (error) {
        console.error("Error fetching products:", error);
        // Handle error
      } finally {
        setLoading(false);
      }
    },
    [categoryName, itemsPerPage] // Dependencies for useCallback
  );

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      !loading
    ) {
      const cursor = newPage > currentPage ? lastDocumentId : undefined;
      fetchProducts(newPage, sortBy, cursor);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = event.target.value;
    setCurrentPage(1);
    setProducts([]);
    setLastDocumentId(undefined);
    fetchProducts(1, newSortBy, null);
  };

  useEffect(() => {
    // Initial load or when dependencies change (especially fetchProducts)
    if (products.length === 0 && totalProducts > 0) {
      fetchProducts(1, sortBy, null);
    }
    setTotalPages(Math.ceil(totalProducts / itemsPerPage));
  }, [fetchProducts, sortBy, totalProducts, products.length, itemsPerPage]);

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
            Showing 1–{products.length} of {products.length} results
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
      <div className={`grid  gap-4 ${grid ? "grid-cols-4" : "grid-cols-1"}`}>
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
      <div className="mt-8 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading || !lastDocumentId}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
        {loading && <span className="ml-2">Loading...</span>}
      </div>
    </div>
  );
};

export default ProductsSection;

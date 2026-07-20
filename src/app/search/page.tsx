"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // Import your actual search function
import { searchProducts } from "@/actions/search";
import ProductCard from "./_components/ProductCard";

// Use the Product type from your Firestore implementation

type Product = {
  id: string;
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  images: string[];
  categories: string[];
  active?: boolean;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const genRef = useRef(0);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    const gen = ++genRef.current;
    setIsLoading(true);
    setSearchError(null);
    try {
      const data = await searchProducts(query);
      if (gen !== genRef.current) return;
      setResults(data);
      setHasSearched(true);
      router.replace(`/search?q=${encodeURIComponent(query)}`, {
        scroll: false,
      });
    } catch (error) {
      console.error("Search failed:", error);
      if (gen !== genRef.current) return;
      setResults([]);
      setHasSearched(true);
      setSearchError("Search failed. Please try again.");
    } finally {
      if (gen === genRef.current) setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    router.replace("/search", { scroll: false });
  };

  return (
    <div className="flex flex-col">
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
              Find Your Perfect Product
            </h1>
            <p className="text-gray-600">
              Search our collection of high-quality items
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="block w-full pl-10 pr-12 py-3 border-b border-gray-300 bg-white text-base placeholder-gray-500 focus:outline-none transition-all duration-200 ease-in-out"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>

          {/* Search Results */}
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : hasSearched ? (
              <>
                {searchError && (
                  <p className="text-center text-red-600 mb-4">{searchError}</p>
                )}
                <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto">
                  <h2 className="text-lg font-medium text-gray-900">
                    {searchError
                      ? "Search unavailable"
                      : results.length > 0
                      ? `Found ${results.length} ${
                          results.length === 1 ? "item" : "items"
                        }`
                      : "No results found"}
                  </h2>
                  {results.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Showing results for &quot;{initialQuery}&quot;
                    </p>
                  )}
                </div>

                {results.length > 0 ? (
                  <div className="max-w-2xl mx-auto max-h-[50dvh] overflow-y-auto">
                    {results.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search or filter to find what
                      you&apos;re looking for.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Start searching
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter a product name to find what you need.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

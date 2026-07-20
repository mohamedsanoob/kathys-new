"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserWishlist, removeFromWishlist } from "@/actions/wishList";
import { getProductById } from "@/actions/actions";
import { Product } from "@/types/product";

type WishlistItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  discountedPrice: number;
  addedAt: string;
  variant: {
    sku: string;
    combination: {
      name: string;
      value: string;
    }[];
  };
  stockStatus: "In Stock" | "Out of Stock" | "Low Stock";
  product?: Product;
};

export default function WishListItems() {
  const { currentUser, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!currentUser?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const wishlistItems = await getUserWishlist(currentUser.uid);
        const enrichedItems = await Promise.all(
          wishlistItems.map(async (item) => {
            const product = await getProductById(item.id);
            let stockStatus: "In Stock" | "Out of Stock" | "Low Stock" =
              "In Stock";

            if (product) {
              const variant = product.variantDetails.find(
                (v) => v.sku === item.variant.sku
              );
              if (variant) {
                if (variant.inventory <= 0) stockStatus = "Out of Stock";
                else if (variant.inventory < 5) stockStatus = "Low Stock";
              }
            }

            return {
              ...item,
              stockStatus,
              image: item.image || product?.images[0] || "/default-product.jpg",
              product: product || undefined,
            };
          })
        );

        if (!cancelled) setItems(enrichedItems);
      } catch (err) {
        console.error("Wishlist error:", err);
        if (!cancelled) setError("Failed to load wishlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWishlist();
    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading]);

  const handleRemoveItem = async (productId: string) => {
    try {
      if (!currentUser?.uid) return;

      setItems((prev) => prev.filter((item) => item.id !== productId));
      await removeFromWishlist(currentUser.uid, productId);
    } catch (err) {
      console.error("Remove error:", err);
      setError("Failed to remove item");
    }
  };

  const getStockStatusClass = (status: WishlistItem["stockStatus"]) => {
    switch (status) {
      case "In Stock": return "text-green-600";
      case "Out of Stock": return "text-red-600";
      case "Low Stock": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return <div className="p-4 text-center">Loading wishlist...</div>;
  }
  if (!currentUser) {
    return (
      <div className="p-4 text-center text-gray-600">
        Please sign in to view your wishlist.
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;
  if (items.length === 0) {
    return <div className="p-4 text-center">Your wishlist is empty</div>;
  }

  return (
    <div className="p-4 pb-20 md:pb-0">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/product/${item.id}`} passHref>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain cursor-pointer hover:opacity-90"
                    />
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/product/${item.id}`} passHref>
                    <div className="text-sm font-semibold hover:text-blue-600 cursor-pointer">
                      {item.name}
                    </div>
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.variant.combination.map((c, i) => (
                      <span key={i} className="mr-2">{c.name}: {c.value}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold">₹{item.discountedPrice}</div>
                  {item.price > item.discountedPrice && (
                    <div className="text-xs text-gray-500 line-through">₹{item.price}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStockStatusClass(item.stockStatus)}`}>
                    {item.stockStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.addedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <Link href={`/product/${item.id}`} passHref>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="w-20 h-20 object-contain cursor-pointer hover:opacity-90"
                />
              </Link>
              <div className="flex-1 ml-4">
                <Link href={`/product/${item.id}`} passHref>
                  <h3 className="font-medium hover:text-blue-600 cursor-pointer">
                    {item.name}
                  </h3>
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  {item.variant.combination.map((c, i) => (
                    <span key={i} className="mr-2">{c.name}: {c.value}</span>
                  ))}
                </div>
                <div className="mt-2">
                  <span className="font-bold">₹{item.discountedPrice}</span>
                  {item.price > item.discountedPrice && (
                    <span className="text-xs line-through text-gray-500 ml-2">₹{item.price}</span>
                  )}
                </div>
                <div className="mt-1">
                  <span className={`text-xs ${getStockStatusClass(item.stockStatus)}`}>
                    {item.stockStatus}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-600 hover:text-red-800 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
              Added on {formatDate(item.addedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
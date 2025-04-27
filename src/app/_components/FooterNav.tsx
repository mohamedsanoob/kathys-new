"use client";
import { cn } from "@/lib/utils";
import { Home, Search, Heart, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
// Assuming you have a utility for classNames

const FooterNav = () => {
  const { product_id } = useParams();
  const pathname = usePathname();

  // Determine active route
  const isActive = (route: string) => {
    return (
      pathname === route ||
      (route === "/categories" && pathname.startsWith("/categories")) ||
      (route === "/wishlist" && pathname.startsWith("/wishlist")) ||
      (route === "/cart" && pathname.startsWith("/cart"))
    );
  };

  return (
    <div
      className={cn(
        "w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden",
        "",
        product_id !== undefined && "hidden"
      )}
    >
      <div className="flex justify-between items-center px-4 py-3">
        <Link href="/" className="flex flex-col items-center">
          <Home
            size={20}
            className={cn(
              "transition-colors",
              isActive("/") ? "text-green-600" : "text-gray-600"
            )}
          />
          <span
            className={cn(
              "text-xs mt-1 transition-colors",
              isActive("/") ? "text-green-600 font-medium" : "text-gray-600"
            )}
          >
            Home
          </span>
        </Link>

        <Link href="/categories" className="flex flex-col items-center">
          <Menu
            size={20}
            className={cn(
              "transition-colors",
              isActive("/categories") ? "text-green-600" : "text-gray-600"
            )}
          />
          <span
            className={cn(
              "text-xs mt-1 transition-colors",
              isActive("/categories")
                ? "text-green-600 font-medium"
                : "text-gray-600"
            )}
          >
            Categories
          </span>
        </Link>

        <Link href="/search" className="flex flex-col items-center">
          <Search
            size={20}
            className={cn(
              "transition-colors",
              isActive("/search") ? "text-green-600" : "text-gray-600"
            )}
          />
          <span
            className={cn(
              "text-xs mt-1 transition-colors",
              isActive("/search")
                ? "text-green-600 font-medium"
                : "text-gray-600"
            )}
          >
            Search
          </span>
        </Link>

        <Link href="/wishlist" className="flex flex-col items-center">
          <div className="relative">
            <Heart
              size={20}
              className={cn(
                "transition-colors",
                isActive("/wishlist") ? "text-green-600" : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "absolute -top-1 -right-1 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center",
                isActive("/wishlist") ? "bg-green-600" : "bg-red-600"
              )}
            >
              0
            </span>
          </div>
          <span
            className={cn(
              "text-xs mt-1 transition-colors",
              isActive("/wishlist")
                ? "text-green-600 font-medium"
                : "text-gray-600"
            )}
          >
            Wishlist
          </span>
        </Link>

        <Link href="/cart" className="flex flex-col items-center">
          <div className="relative">
            <ShoppingBag
              size={20}
              className={cn(
                "transition-colors",
                isActive("/cart") ? "text-green-600" : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "absolute -top-1 -right-1 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center",
                isActive("/cart") ? "bg-green-600" : "bg-red-600"
              )}
            >
              0
            </span>
          </div>
          <span
            className={cn(
              "text-xs mt-1 transition-colors",
              isActive("/cart") ? "text-green-600 font-medium" : "text-gray-600"
            )}
          >
            Cart
          </span>
        </Link>
      </div>
    </div>
  );
};

export default FooterNav;

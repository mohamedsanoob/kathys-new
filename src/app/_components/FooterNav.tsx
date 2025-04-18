"use client";
import { Home, Search, Heart, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const FooterNav = () => {
  const { product_id } = useParams();
  console.log(product_id, "product_id");
  return (
    <div
      className={`${
        product_id !== undefined && "hidden"
      } w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden z-100`}
      style={{ position: "absolute", bottom: "0" }}
    >
      <div className="flex justify-between items-center px-4 py-3">
        <Link href="/" className="flex flex-col items-center">
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link href="/categories" className="flex flex-col items-center">
          <Menu size={20} />
          <span className="text-xs mt-1">Categories</span>
        </Link>

        <Link href="/search" className="flex flex-col items-center">
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </Link>

        <Link href="/wishlist" className="flex flex-col items-center">
          <div className="relative">
            <Heart size={20} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </div>
          <span className="text-xs mt-1">Wishlist</span>
        </Link>

        <Link href="/cart" className="flex flex-col items-center">
          <div className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </div>
          <span className="text-xs mt-1">Cart</span>
        </Link>
      </div>
    </div>
  );
};

export default FooterNav;

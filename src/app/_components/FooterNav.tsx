"use client";
import { cn } from "@/lib/utils";
import { Home, Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PhoneAuthModal from "./PhoneAuthModal";

const FooterNav = () => {
  const { currentUser } = useAuth();
  const { product_id } = useParams();
  const pathname = usePathname();
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  const handlePhoneVerified = (phoneNumber: string) => {
    console.log("Verified phone number:", phoneNumber);
    // Do something with the verified phone number
  };

  // Determine active route
  const isActive = (route: string) => {
    return (
      pathname === route ||
      (route === "/categories" && pathname.startsWith("/categories")) ||
      (route === "/wishlist" && pathname.startsWith("/wishlist")) ||
      (route === "/cart" && pathname.startsWith("/cart"))
    );
  };

  // Theme color
  const themeColor = "#1e6553";

  return (
    <>
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
                isActive("/") ? "text-[#1e6553]" : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive("/") ? "text-[#1e6553] font-medium" : "text-gray-600"
              )}
            >
              HOME
            </span>
          </Link>

          <Link href="/search" className="flex flex-col items-center">
            <Search
              size={20}
              className={cn(
                "transition-colors",
                isActive("/search") ? "text-[#1e6553]" : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive("/search")
                  ? "text-[#1e6553] font-medium"
                  : "text-gray-600"
              )}
            >
              SEARCH
            </span>
          </Link>

          <Link href="/wishlist" className="flex flex-col items-center">
            <div className="relative">
              <Heart
                size={20}
                className={cn(
                  "transition-colors",
                  isActive("/wishlist") ? "text-[#1e6553]" : "text-gray-600"
                )}
              />
              <span
                className={cn(
                  "absolute -top-1 -right-1 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center",
                  isActive("/wishlist") ? "bg-[#1e6553]" : "bg-red-600"
                )}
              >
                0
              </span>
            </div>
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive("/wishlist")
                  ? "text-[#1e6553] font-medium"
                  : "text-gray-600"
              )}
            >
              WISHLIST
            </span>
          </Link>

          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => {
              if (currentUser) {
                // Navigate to account if user is logged in
                window.location.href = '/account';
              } else {
                // Show phone auth modal if not logged in
                setShowPhoneAuth(true);
              }
            }}
          >
            <User
              size={20}
              className={cn(
                "transition-colors",
                isActive("/account") ? "text-[#1e6553]" : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive("/account")
                  ? "text-[#1e6553] font-medium"
                  : "text-gray-600"
              )}
            >
              {currentUser ? "ACCOUNT" : "LOGIN"}
            </span>
          </div>

          <Link href="/categories" className="flex flex-col items-center">
            <Menu
              size={20}
              className={cn(
                "transition-colors",
                isActive("/categories") ? "text-[#1e6553]" : "text-gray-600"
              )}
            />
            <span
              className={cn(
                "text-xs mt-1 transition-colors",
                isActive("/categories")
                  ? "text-[#1e6553] font-medium"
                  : "text-gray-600"
              )}
            >
              CATEGORIES
            </span>
          </Link>
        </div>
      </div>

      <PhoneAuthModal
        isOpen={showPhoneAuth}
        onClose={() => setShowPhoneAuth(false)}
        onSuccess={handlePhoneVerified}
      />
    </>
  );
};

export default FooterNav;
"use client";
import { Heart, Search, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import PhoneAuthModal from "./PhoneAuthModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import useTrackView from "@/hooks/useTrackView";

const Navbar = () => {
useTrackView()
    const { currentUser } = useAuth();
    const router = useRouter();
    const { totalQuantity, totalPrice, isLoading, isUpdating } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPhoneAuth, setShowPhoneAuth] = useState(false);

  const handlePhoneVerified = (phoneNumber: string) => {
    console.log("Verified phone number:", phoneNumber);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Fixed Navbar for Mobile */}
      <nav className=" shadow-sm bg-white w-full border-b border-gray-100">
        <div className="relative flex items-center justify-between mx-auto h-14 md:h-[5.25rem] px-4 sm:px-6 lg:px-8 max-w-[1290px]">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#1e6553] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e6553] rounded-md transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Centered Logo */}
          <div className="absolute transform left-1/2 -translate-x-1/2 md:static md:transform-none h-full w-50px">
            <Link href="/" className="flex items-center h-full w-full">
              <Image
                src='/kathys-logo.webp'
                alt="logo"
                width={1000}
                height={1000}
                className="h-full w-full object-contain"
                priority
              />
            </Link>
          </div>

          {/* Mobile Cart Section */}
          <div className="md:hidden flex items-center gap-2 z-10">
            {!isLoading && !isUpdating && (
              <p className="text-sm font-medium">₹{totalPrice.toFixed(2)}</p>
            )}
            <Link href="/cart" className="relative">
              <ShoppingBag className="text-gray-700" size={20} />
              {!isLoading && !isUpdating && totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1e6553] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {totalQuantity}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <ul className="flex items-center gap-6 font-medium tracking-wide ml-4">
              <li className="cursor-pointer hover:text-[#1e6553] transition-colors py-2 border-b border-gray-50">
                <Link href="/" className="block">
                  HOME
                </Link>
              </li>
              <li className="cursor-pointer hover:text-[#1e6553] transition-colors py-2 border-b border-gray-50">
                <Link href="/categories" className="block">
                  CATEGORIES
                </Link>
              </li>
              <li
                className="cursor-pointer hover:text-[#1e6553] transition-colors py-2 border-b border-gray-50"
                onClick={() => {
                  if (currentUser) {
                    router.push("/account");
                  } else {
                    setShowPhoneAuth(true);
                  }
                }}
              >
                {currentUser ? "ACCOUNT" : "LOGIN/REGISTER"}
              </li>
              {/* <li className="cursor-pointer hover:text-[#1e6553] transition-colors py-2">
                                <Link href="/contact" className="block">CONTACT</Link>
                            </li> */}
            </ul>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-5">
            <div className="cursor-pointer hover:text-[#1e6553] transition-colors">
              <Link href="/search">
                <Search size={22} />
              </Link>
            </div>
            <div className="relative cursor-pointer hover:text-[#1e6553] transition-colors">
              <Link href="/wishlist">
                <Heart size={22} />
              </Link>
            </div>
            <div className="relative cursor-pointer hover:text-[#1e6553] transition-colors">
              <Link href="/cart">
                <ShoppingBag size={22} />
                {!isLoading && !isUpdating && totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#1e6553] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 w-4/5 h-screen bg-white z-50 shadow-lg border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center border-b border-gray-100 p-4">
            <h2 className="font-medium text-lg">Menu</h2>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#1e6553] focus:outline-none"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <ul className="flex flex-col gap-4 font-medium p-4 flex-grow overflow-y-auto">
            <li className="cursor-pointer hover:text-[#1e6553] transition-colors py-2 border-b border-gray-50">
              <Link href="/" className="block" onClick={toggleMobileMenu}>
                HOME
              </Link>
            </li>
            <li className="cursor-pointer hover:text-[#1e6553] transition-colors py-2 border-b border-gray-50">
              <Link
                href="/categories"
                className="block"
                onClick={toggleMobileMenu}
              >
                CATEGORIES
              </Link>
            </li>
            <li
              className="cursor-pointer hover:text-[#1e6553] transition-colors py-2 border-b border-gray-50"
              onClick={() => {
                if (currentUser) {
                  router.push("/account");
                } else {
                  setShowPhoneAuth(true);
                }
                toggleMobileMenu();
              }}
            >
              {currentUser ? "ACCOUNT" : "LOGIN/REGISTER"}
            </li>
          </ul>
        </div>
      </div>

      {/* Auth Modal */}
      <PhoneAuthModal
        isOpen={showPhoneAuth}
        onClose={() => setShowPhoneAuth(false)}
        onSuccess={handlePhoneVerified}
      />
    </>
  );
};

export default Navbar;

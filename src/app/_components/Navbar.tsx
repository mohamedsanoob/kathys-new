"use client";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="shadow-sm bg-white z-10 w-full border-b border-gray-100">
      <div className="relative flex items-center justify-between mx-auto h-14 md:h-[5.25rem] px-4 sm:px-6 lg:px-8 max-w-[1290px]">
        {/* Mobile Menu Button */}
        <div className="md:hidden z-10">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md transition-colors"
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

        {/* Centered Logo for Mobile */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:static md:transform-none">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="logo"
              width={30}
              height={30}
              className="md:w-[50px] md:h-[50px] drop-shadow-sm"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <ul className="flex items-center gap-6 font-medium tracking-wide ml-4">
            <li className="cursor-pointer hover:text-indigo-600 transition-colors">
              HOME
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors">
              SHOP ALL
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors">
              ETHNIC
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors">
              WESTERN
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors">
              <Link href="/login">LOGIN/REGISTER</Link>
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors">
              CONTACT
            </li>
          </ul>
        </div>

        {/* Mobile Cart Section */}
        <div className="md:hidden flex items-center gap-2 z-10">
          <p className="text-sm font-medium">₹0.00</p>
          <div className="relative">
            <ShoppingBag className="text-gray-700" size={20} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              3
            </span>
          </div>
        </div>

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            href="/account"
            className="cursor-pointer hover:text-indigo-600 transition-colors"
          >
            <User size={22} />
          </Link>
          <div className="cursor-pointer hover:text-indigo-600 transition-colors">
            <Search size={22} />
          </div>
          <div className="relative cursor-pointer hover:text-indigo-600 transition-colors">
            <Heart size={22} />
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
              3
            </span>
          </div>
          <div className="relative cursor-pointer hover:text-indigo-600 transition-colors">
            <Link href="/cart">
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-20 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 left-0 w-4/5 h-screen bg-white z-30 shadow-lg border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center border-b border-gray-100 p-4">
            <h2 className="font-medium text-lg">Menu</h2>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-black focus:outline-none"
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
            <li className="cursor-pointer hover:text-indigo-600 transition-colors py-2 border-b border-gray-50">
              <Link href="/" className="block" onClick={toggleMobileMenu}>
                HOME
              </Link>
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors py-2 border-b border-gray-50">
              <Link href="/shop" className="block" onClick={toggleMobileMenu}>
                SHOP ALL
              </Link>
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors py-2 border-b border-gray-50">
              <Link href="/ethnic" className="block" onClick={toggleMobileMenu}>
                ETHNIC
              </Link>
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors py-2 border-b border-gray-50">
              <Link
                href="/western"
                className="block"
                onClick={toggleMobileMenu}
              >
                WESTERN
              </Link>
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors py-2 border-b border-gray-50">
              <Link href="/login" className="block" onClick={toggleMobileMenu}>
                LOGIN/REGISTER
              </Link>
            </li>
            <li className="cursor-pointer hover:text-indigo-600 transition-colors py-2">
              <Link
                href="/contact"
                className="block"
                onClick={toggleMobileMenu}
              >
                CONTACT
              </Link>
            </li>
          </ul>

          {/* Add margin to prevent overlap with footer nav */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

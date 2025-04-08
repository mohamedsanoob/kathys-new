'use client'
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="shadow-md sticky top-0 bg-white z-10">
      <div className="flex items-center justify-between max-w-[1290px] mx-auto h-14 md:h-[5.25rem] px-4 sm:px-6 lg:px-8">
        {/* Logo and Desktop Navigation */}
        <div className="flex items-center">
          <div className="flex gap-4 items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="logo"
                width={30}
                height={30}
                // md:width={50}
                // md:height={50}
              />
            </Link>
            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-4 font-[500]">
              <li className="cursor-pointer hover:text-gray-600">HOME</li>
              <li className="cursor-pointer hover:text-gray-600">SHOP ALL</li>
              <li className="cursor-pointer hover:text-gray-600">ETHNIC</li>
              <li className="cursor-pointer hover:text-gray-600">WESTERN</li>
              <li className="cursor-pointer hover:text-gray-600">
                <Link href="/login">LOGIN/REGISTER</Link>
              </li>
              <li className="cursor-pointer hover:text-gray-600">CONTACT</li>
            </ul>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Icons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/account" className="cursor-pointer">
            <User />
          </Link>
          <Search className="cursor-pointer" />
          <div className="relative">
            <Heart className="cursor-pointer" />
            <p className="absolute top-[-30%] right-[-20%] text-[0.6rem] text-white bg-red-600 rounded-full px-[0.3rem] ">
              3
            </p>
          </div>
          <div className="relative">
            <Link href="/cart" className="cursor-pointer">
              <ShoppingBag />
              <p className="absolute top-[-30%] right-[-20%] text-[0.6rem] text-white bg-red-600 rounded-full px-[0.3rem] ">
                3
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-50 py-2">
          <ul className="flex flex-col items-center gap-2 font-[500]">
            <li className="cursor-pointer hover:text-gray-600">
              <Link href="/">HOME</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-600">
              <Link href="/shop">SHOP ALL</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-600">
              <Link href="/ethnic">ETHNIC</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-600">
              <Link href="/western">WESTERN</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-600">
              <Link href="/login">LOGIN/REGISTER</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-600">
              <Link href="/contact">CONTACT</Link>
            </li>
            <li className="flex items-center gap-4 mt-2">
              <Link href="/account" className="cursor-pointer">
                <User />
              </Link>
              <Search className="cursor-pointer" />
              <div className="relative">
                <Heart className="cursor-pointer" />
                <p className="absolute top-[-30%] right-[-20%] text-[0.6rem] text-white bg-red-600 rounded-full px-[0.3rem] ">
                  3
                </p>
              </div>
              <div className="relative">
                <Link href="/cart" className="cursor-pointer">
                  <ShoppingBag />
                  <p className="absolute top-[-30%] right-[-20%] text-[0.6rem] text-white bg-red-600 rounded-full px-[0.3rem] ">
                    3
                  </p>
                </Link>
              </div>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

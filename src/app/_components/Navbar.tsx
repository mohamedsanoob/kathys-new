import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="shadow-md">
      <div className="flex items-center justify-between max-w-[1290px]  m-auto   h-[5.25rem]">
        <div className="flex items-center">
          <div className="flex gap-4 items-center">
            <Image src="/logo.png" alt="logo" width={50} height={50} />
            <ul className="flex items-center gap-4 font-[500]">
              <li className="cursor-pointer hover:text-gray-600">HOME</li>
              <li className="cursor-pointer hover:text-gray-600">SHOP ALL</li>
              <li className="cursor-pointer hover:text-gray-600">ETHNIC</li>
              <li className="cursor-pointer hover:text-gray-600">WESTERN</li>
              <li className="cursor-pointer hover:text-gray-600">
                LOGIN/REGISTER
              </li>
              <li className="cursor-pointer hover:text-gray-600">CONTACT</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/account" className="cursor-pointer">
            <User />
          </Link>
          <Search />
          <div className="relative">
            <Heart />
            <p className="absolute top-[-30%] right-[-20%] text-xs text-white bg-red-600 rounded-full px-1 ">
              3
            </p>
          </div>
          <div className="relative">
            <Link href="/cart">
              <ShoppingBag />
              <p className="absolute top-[-30%] right-[-20%] text-xs text-white bg-red-600 rounded-full px-1 ">
                3
              </p>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

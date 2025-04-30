"use client"; // Add this directive since we're using event handlers

import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { LogOut, Logs, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
  { item: "MY ORDERS", icon: Logs, query: "orders" },
  { item: "MY ADDRESSES", icon: MapPin, query: "addresses" },
  { item: "SIGN OUT", icon: LogOut, query: "signout" },
];

const HomeItems = ({ activeCategory }: { activeCategory: string }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Use Next.js router for better navigation
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col py-2 sticky top-0 md:h-[calc(100dvh-40dvh)] gap-1">
      {categories.map((category) => {
        if (category.query === "signout") {
          return (
            <div
              key={category.item}
              onClick={handleSignOut}
              className={`
                group py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-md
                flex items-center md:justify-between
                ${
                  activeCategory === category.query
                    ? "bg-gray-100 font-medium text-black"
                    : "text-gray-700"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <category.icon className="w-5 h-5" />
                <p className="text-base font-normal">{category.item}</p>
              </div>
              <ChevronRight 
                className={`md:hidden w-4 h-4 ml-auto ${
                  activeCategory === category.query 
                    ? "text-black" 
                    : "text-gray-400 group-hover:text-gray-600"
                }`} 
              />
            </div>
          );
        }

        return (
          <Link
            key={category.item}
            href={`/account?category=${encodeURIComponent(category.query)}`}
            className={`
              group py-3 px-4 cursor-pointer hover:bg-gray-50 rounded-md
              flex items-center md:justify-between
              ${
                activeCategory === category.query
                  ? "bg-gray-100 font-medium text-black"
                  : "text-gray-700"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <category.icon className="w-5 h-5" />
              <p className="text-base font-normal">{category.item}</p>
            </div>
            <ChevronRight 
              className={`md:hidden w-4 h-4 ml-auto ${
                activeCategory === category.query 
                  ? "text-black" 
                  : "text-gray-400 group-hover:text-gray-600"
              }`} 
            />
          </Link>
        );
      })}
    </div>
  );
};

export default HomeItems;
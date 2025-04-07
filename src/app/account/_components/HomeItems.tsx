import { LogOut, Logs, MapPin } from "lucide-react";
import Link from "next/link";

const categories = [
  { item: "MY ORDERS", icon: Logs, query: "orders" },
  { item: "MY ADDRESSES", icon: MapPin, query: "addresses" },
  { item: "SIGN OUT", icon: LogOut, query: "signout" },
];

const HomeItems = ({ activeCategory }: { activeCategory: string }) => {
  return (
    <div className="flex flex-col py-2 sticky top-0 h-[calc(100dvh_-_14dvh) gap-4">
      {categories.map((category) => (
        <Link
          key={category.item}
          href={`/account?category=${encodeURIComponent(category.query)}`}
          className={`py-2 px-4 cursor-pointer hover:text-gray-500 border-r-4 flex items-center gap-2 ${
            activeCategory === category.query
              ? "border-black text-black bg-gradient-to-r from-white to-gray-200"
              : "border-transparent"
          }`}
        >
          <category.icon className="w-6 h-6" />
          <p className="text-lg font-normal">{category.item}</p>
        </Link>
      ))}
    </div>
  );
};

export default HomeItems;

"use client";
import {
  getColorsByCategory,
  getMinMaxPriceByCategory,
} from "@/actions/actions";
import { Slider } from "@mui/material";
import namer from "color-namer";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FilterSection = ({ categoryName }: { categoryName: string }) => {
  const searchParams = useSearchParams();

  const [filterColors, setFilterColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [value, setValue] = useState<[number, number]>([0, 100]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const [isOpen,setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const colors = await getColorsByCategory(categoryName);
        const priceData = await getMinMaxPriceByCategory(categoryName);
        const min = priceData.minPrice ?? 0;
        const max = priceData.maxPrice ?? 100;
        setFilterColors(colors);
        setPriceRange([min, max]);

        // Initialize price range from URL if present
        const minPriceParam = searchParams.get("minPrice");
        const maxPriceParam = searchParams.get("maxPrice");
        setIsMobileMenuOpen(searchParams.get("filter") === "open");
        if (minPriceParam && maxPriceParam) {
          setValue([parseInt(minPriceParam), parseInt(maxPriceParam)]);
        } else {
          setValue([min, max]);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, [categoryName, searchParams]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setValue(newValue as [number, number]);
  };

  const getColorNamesFromHex = (hexColor: string) => {
    const result = namer(hexColor);
    return result.ntc[0].name;
  };

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("minPrice", value[0].toString());
    newParams.set("maxPrice", value[1].toString());
    newParams.delete("filter");
    router.push(`?${newParams.toString()}`);
    
  };

  const handleColorFilter = (color: string) => {
    console.log(color, "co");
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("color", color.slice(1));
    newParams.delete("filter");
    router.push(`?${newParams.toString()}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("filter");
    router.replace(`?${newParams.toString()}`);
  };

  return (
    <div className={`w-1/4 ${!isMobileMenuOpen && "hidden"}`}>
      <div
        className={`fixed top-0 left-0 w-4/5 h-screen bg-white z-30 shadow-lg border-r border-gray-100 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="font-medium text-lg">Filter products</h2>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-black focus:outline-none border border-gray-200 rounded-full p-1"
              aria-label="Close menu"
            >
              <svg
                className="h-4 w-4 font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Price Filter Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Filter by Price</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center font-medium text-sm">
                <p className="text-gray-500">
                  Price:{" "}
                  <span className="text-black">
                    ${value[0]} - ${value[1]}
                  </span>
                </p>
                <button
                  onClick={handlePriceFilter}
                  className="bg-gray-100 hover:bg-gray-200 py-1 px-3 text-sm transition-colors"
                >
                  Filter
                </button>
              </div>
              <Slider
                value={value}
                onChange={handleChange}
                min={priceRange[0]}
                max={priceRange[1]}
                sx={{
                  color: "green",
                  "& .MuiSlider-thumb": {
                    width: 16,
                    height: 16,
                  },
                  "& .MuiSlider-rail": {
                    height: 2,
                  },
                  "& .MuiSlider-track": {
                    height: 2,
                  },
                }}
              />
            </div>
          </div>

          {/* Color Filter Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Filter by Color</h3>
            <div className="grid grid-cols-1 gap-3">
              {filterColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorFilter(color)}
                  className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <span
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                    aria-label={getColorNamesFromHex(color)}
                  />
                  <span className="text-sm text-gray-700">
                    {getColorNamesFromHex(color)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;

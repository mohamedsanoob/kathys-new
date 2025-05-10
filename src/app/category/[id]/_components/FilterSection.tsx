"use client";
import {
  getColorsByCategory,
  getMinMaxPriceByCategory,
  getSizesByCategory,
} from "@/actions/actions";
import { Checkbox, Slider } from "@mui/material";
import namer from "color-namer";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const FilterSection = ({ categoryName }: { categoryName: string }) => {
  const searchParams = useSearchParams();
  const [filterColors, setFilterColors] = useState<{ color: string; count: number }[]>([]);
  const [filterSizes, setFilterSizes] = useState<{ size: string; count: number }[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [value, setValue] = useState<[number, number]>([0, 100]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const getColorNamesFromHex = useCallback((hexColor: string) => {
    const result = namer(hexColor);
    return result.ntc[0].name;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colors, priceData, sizes] = await Promise.all([
          getColorsByCategory(categoryName),
          getMinMaxPriceByCategory(categoryName),
          getSizesByCategory(categoryName)
        ]);

        const min = priceData.minPrice ?? 0;
        const max = priceData.maxPrice ?? 100;

        setFilterColors(colors);
        setFilterSizes(sizes);
        setPriceRange([min, max]);

        const minPriceParam = searchParams.get("minPrice");
        const maxPriceParam = searchParams.get("maxPrice");
        const sizesParam = searchParams.get("sizes");
        
        setValue(
          minPriceParam && maxPriceParam
            ? [parseInt(minPriceParam), parseInt(maxPriceParam)]
            : [min, max]
        );

        if (sizesParam) {
          setSelectedSizes(sizesParam.split(','));
        }else{
              setSelectedSizes([]);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, [categoryName, searchParams]);


  console.log(selectedSizes,"asdasd")

  useEffect(() => {
    setIsMobileMenuOpen(searchParams.get("filter") === "open");
  }, [searchParams]);

  const handleChange = useCallback((_event: Event, newValue: number | number[]) => {
    setValue(newValue as [number, number]);
  }, []);

  const handlePriceFilter = useCallback(() => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("minPrice", value[0].toString());
    newParams.set("maxPrice", value[1].toString());
    
    router.push(`?${newParams.toString()}`);
  }, [value, router]);

  const handleColorFilter = useCallback((color: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("color", color);
     newParams.set("filter", "");
    router.push(`?${newParams.toString()}`);
  }, [router]);

  const handleSizeFilter = useCallback((size: string) => {
    const newParams = new URLSearchParams(window.location.search);
    let updatedSizes = [...selectedSizes];
    
    if (updatedSizes.includes(size)) {
      updatedSizes = updatedSizes.filter(s => s !== size);
    } else {
      updatedSizes.push(size);
    }

    if (updatedSizes.length > 0) {
      newParams.set("sizes", updatedSizes.join(','));
    } else {
      newParams.delete("sizes");
    }

    setSelectedSizes(updatedSizes);
      newParams.set("filter", "");
    router.push(`?${newParams.toString()}`);
      
  }, [selectedSizes, router]);

  const toggleMobileMenu = useCallback(() => {
    const newIsOpen = !isMobileMenuOpen;
    setIsMobileMenuOpen(newIsOpen);
    
    setTimeout(() => {
      const newParams = new URLSearchParams(window.location.search);
      if (newIsOpen) {
        newParams.set("filter", "open");
      } else {
        newParams.delete("filter");
      }
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }, 0);
  }, [isMobileMenuOpen, router]);

  const mobileMenuVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 }
  };

  return (
    <>
      {/* Desktop Filter Section */}
      <div className="hidden md:block w-full md:w-1/4 pr-6">
        <div className="sticky space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg text-gray-900">Filter by Price</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Price: ₹{value[0]} - ₹{value[1]}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePriceFilter}
                  className="bg-gray-100 hover:bg-gray-200 py-1 px-3 text-sm rounded transition-colors"
                >
                  Apply
                </motion.button>
              </div>
              <Slider
                value={value}
                onChange={handleChange}
                min={priceRange[0]}
                max={priceRange[1]}
                sx={{
                  color: "#10B981",
                  "& .MuiSlider-thumb": { width: 16, height: 16 },
                  "& .MuiSlider-rail": { height: 2 },
                  "& .MuiSlider-track": { height: 2 },
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg text-gray-900">Filter by Color</h3>
            <div className="grid grid-cols-1 gap-3">
              {filterColors.map((color, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleColorFilter(color?.color?.name)}
                  className="flex items-center justify-between p-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: color?.color?.hex }}
                      aria-label={getColorNamesFromHex(color?.color?.hex)}
                    />
                    <span className="text-sm text-gray-700">
                      {color?.color?.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ({color.count})
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Size Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-semibold text-lg text-gray-900">Filter by Size</h3>
            <div className="grid grid-cols-1 gap-3">
              {filterSizes.map((sizeItem, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`size-${sizeItem.size}`}
                    checked={selectedSizes.includes(sizeItem.size)}
                    onChange={() => handleSizeFilter(sizeItem.size)}
                  />
                  <label
                    htmlFor={`size-${sizeItem.size}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center justify-between w-full"
                  >
                    <span>{sizeItem.size}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({sizeItem.count})
                    </span>
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Filter */}
      <div className="md:hidden">
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                key="overlay"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black z-999 md:hidden"
                onClick={toggleMobileMenu}
                transition={{ duration: 0.2 }}
              />

              <motion.div
                key="menu"
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-0 left-0 w-4/5 h-screen bg-white z-30 shadow-lg border-r border-gray-100"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="font-medium text-lg">Filters</h2>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMobileMenu}
                      className="text-gray-700 hover:text-black focus:outline-none"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <h3 className="font-semibold text-gray-900">Filter by Price</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center font-medium text-sm">
                        <p className="text-gray-500">
                          Price: <span className="text-black">₹{value[0]} - ₹{value[1]}</span>
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePriceFilter}
                          className="bg-gray-100 hover:bg-gray-200 py-1 px-3 text-sm transition-colors rounded"
                        >
                          Apply
                        </motion.button>
                      </div>
                      <Slider
                        value={value}
                        onChange={handleChange}
                        min={priceRange[0]}
                        max={priceRange[1]}
                        sx={{
                          color: "#10B981",
                          "& .MuiSlider-thumb": { width: 16, height: 16 },
                          "& .MuiSlider-rail": { height: 2 },
                          "& .MuiSlider-track": { height: 2 },
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="font-semibold text-gray-900">Filter by Color</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {filterColors.map((color, index) => (
                        <motion.button
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleColorFilter(color?.color?.hex)}
                          className="flex items-center justify-between p-1 rounded hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full border border-gray-200"
                              style={{ backgroundColor: color?.color?.hex }}
                              aria-label={getColorNamesFromHex(color?.color?.hex)}
                            />
                            <span className="text-sm text-gray-700">
                              {getColorNamesFromHex(color?.color?.hex)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({color.count})
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Mobile Size Filter */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <h3 className="font-semibold text-gray-900">Filter by Size</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {filterSizes.map((sizeItem, index) => (
                        <motion.div
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`mobile-size-${sizeItem.size}`}
                            checked={selectedSizes.includes(sizeItem.size)}
                            onChange={() => handleSizeFilter(sizeItem.size)}
                          />
                          <label
                            htmlFor={`mobile-size-${sizeItem.size}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center justify-between w-full"
                          >
                            <span>{sizeItem.size}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({sizeItem.count})
                            </span>
                          </label>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FilterSection;
"use client";
import {
  getColorsByCategory,
  getMinMaxPriceByCategory,
} from "@/actions/actions";
import { Slider } from "@mui/material";
import namer from "color-namer";
import { useEffect, useState } from "react";

const FilterSection = ({ categoryName }: { categoryName: string }) => {
  const [filterColors, setFilterColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [value, setValue] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const colors = await getColorsByCategory(categoryName);
        const priceData = await getMinMaxPriceByCategory(categoryName);
        const min = priceData.minPrice ?? 0;
        const max = priceData.maxPrice ?? 100;
        setFilterColors(colors);
        setPriceRange([min, max]);
        setValue([min, max]);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchData();
  }, [categoryName]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setValue(newValue as [number, number]);
  };

  const getColorNamesFromHex = (hexColor: string) => {
    const result = namer(hexColor);
    return result.ntc[0].name;
  };

  const handleFilter=()=>{
    
  }
  

  return (
    <div className="w-1/4">
      <h3 className="font-semibold mb-2">Filter by Price</h3>
      <div>
        <div className="flex justify-between">
          <p>
            Price: {value[0]} - {value[1]}
          </p>
          <button onClick={handleFilter} className="bg-gray-200 py-1 px-3">Filter</button>
        </div>
        <Slider
          value={value}
          onChange={handleChange}
          min={priceRange[0]}
          max={priceRange[1]}
          sx={{ color: "green" }}
          // marks={marks}
        />
      </div>
      <h3 className="font-semibold mt-6 mb-2">Filter by Color</h3>
      <div className="flex flex-col gap-2">
        {filterColors.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: color,
                width: "1.2rem",
                height: "1.2rem",
                borderRadius: "50%",
              }}
            />
            <p>{getColorNamesFromHex(color)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;

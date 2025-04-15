"use client";
import { useState } from "react";
import Information from "./Information";
import Description from "./Description";

interface Variants {
  optionValue: string[];
  optionName: string;
}

const ProductDescription = ({
  description,
  variants,
}: {
  description: string;
  variants: Variants[];
}) => {
  const [tab, setTab] = useState("description");

  return (
    <div className="flex flex-col md:gap-4 w-[90%] md:w-full m-auto">
      {/* Tabs Navigation */}
      <div className="flex gap-4 md:gap-8 overflow-x-auto md:pb-2 w-full hide-scrollbar">
        <button
          onClick={() => setTab("description")}
          className={`whitespace-nowrap text-lg md:text-2xl font-medium px-2 py-1 rounded-lg transition-colors ${
            tab === "description"
              ? "text-black bg-gray-100"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setTab("information")}
          className={`whitespace-nowrap text-lg md:text-2xl font-medium px-2 py-1 rounded-lg transition-colors ${
            tab === "information"
              ? "text-black bg-gray-100"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Information
        </button>
        {/* <button
          onClick={() => setTab("reviews")}
          className={`whitespace-nowrap text-lg md:text-2xl font-medium px-2 py-1 rounded-lg transition-colors ${
            tab === "reviews"
              ? "text-black bg-gray-100"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Reviews
        </button> */}
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-200 my-2" />

      {/* Tab Content */}
      <div className="w-full overflow-hidden">
        {tab === "information" ? (
          <Information variants={variants} />
        ) : (
          // ) : tab === "reviews" ? (
          //   <div className="text-gray-700">
          //     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          //     malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum
          //     dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
          //     lacus ex, sit amet
          //   </div>
          <Description description={description} />
        )}
      </div>

      {/* Custom scrollbar hide - add to global CSS */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductDescription;

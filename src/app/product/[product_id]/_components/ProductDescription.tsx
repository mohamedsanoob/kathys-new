"use client";
import Link from "next/link";
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
  variants: Variants[]; // Corrected to expect an array of Variants
}) => {
  console.log(description, "description");
  console.log(variants, "varinstss");
  const [tab, setTab] = useState("description");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-8 text-2xl font-medium">
        <Link
          href={`?value=${encodeURIComponent("description")}`}
          onClick={() => setTab("description")}
          className={`cursor-pointer ${
            tab === "description" ? "text-black" : "text-gray-400"
          }`}
        >
          Description
        </Link>
        <p
          onClick={() => setTab("information")}
          className={`cursor-pointer ${
            tab === "information" ? "text-black" : "text-gray-400"
          }`}
        >
          Information
        </p>
        <p
          onClick={() => setTab("reviews")}
          className={`cursor-pointer ${
            tab === "reviews" ? "text-black" : "text-gray-400"
          }`}
        >
          Reviews
        </p>
      </div>
      <hr className="text-gray-300" />
      <div>
        {tab === "information" ? (
          <Information variants={variants} />
        ) : tab === "reviews" ? (
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada
            lacus ex, sit amet
          </div>
        ) : (
          <Description description={description} />
        )}
      </div>
    </div>
  );
};

export default ProductDescription;

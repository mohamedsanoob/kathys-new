"use client";
import { Heart, Share, X, Loader2 } from "lucide-react";
import { useState, useCallback } from "react"; // Import useCallback
import namer from "color-namer";
import { addProductToCart, getCartProducts } from "@/actions/actions";

interface Product {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  id: string;
  quantity: number;
  categories: string[];
  variants: {
    optionValue: string[];
    optionName: string;
  }[];
  productCategory: string;
  productDiscountedPrice: number;
  active: boolean;
  productName: string;
  description: string;
  variantDetails: VariantDetail[];
  taxRate: number;
  productUnit: string;
}

interface Combination {
  name: string;
  value: string;
}

interface VariantDetail {
  combination: Combination[];
  discountedPrice: number;
  inventory: number;
  price: number;
  sku: string;
}

interface CartProduct {
  skuId: string;
  unitQuantity: number;
  shippingCost: number;
  images: string[];
  productPrice: number;
  // updatedDate: {
  //   seconds: number;
  //   nanoseconds: number;
  // };
  // createdDate: {
  //   seconds: number;
  //   nanoseconds: number;
  // };
  id: string;
  quantity: number;
  categories: string[];
  variants: {
    optionValue: string[];
    optionName: string;
  }[];
  productCategory: string;
  productDiscountedPrice: number;
  active: boolean;
  productName: string;
  description: string;
  variantDetails: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: {
      name: string;
      value: string;
    }[];
    sku: string;
  }[];
  taxRate: number;
  productUnit: string;
}

const ProductDetails = ({ product }: { product: Product }) => {
  const [selectedVariant, setSelectedVariant] = useState<VariantDetail | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [productCount, setProductCount] = useState(1);
  const [existingCartQty, setExistingCartQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const areCombinationsEqual = useCallback(
    (comb1: Combination[], comb2: Combination[]): boolean => {
      if (!comb1 || !comb2 || comb1.length !== comb2.length) {
        return false;
      }
      for (const c1 of comb1) {
        const found = comb2.some(
          (c2) => c1.name === c2.name && c1.value === c2.value
        );
        if (!found) {
          return false;
        }
      }
      return true;
    },
    []
  );

  const handleOptionClick = useCallback(
    (optionName: string, optionValue: string) => {
      const newSelectedOptions = {
        ...selectedOptions,
        [optionName]: optionValue,
      };
      setSelectedOptions(newSelectedOptions);

      const matchingVariantDetail = product.variantDetails.find((detail) =>
        detail.combination.every(
          (comb) => newSelectedOptions[comb.name] === comb.value
        )
      );
      console.log(matchingVariantDetail, "matchingVariantDetail");
      setSelectedVariant(matchingVariantDetail || null);

      if (matchingVariantDetail) {
        setIsLoading(true);
        getCartProducts()
          .then((res) => {
            console.log(res, "cartIn produ");

            const cartMatch = res.find((cartItem: CartProduct) => {
              return (
                cartItem.id === product.id &&
                cartItem.variantDetails?.some((variant) =>
                  areCombinationsEqual(
                    variant.combination,
                    matchingVariantDetail.combination
                  )
                )
              );
            });


            console.log(cartMatch, "cartMatch");
            const qty = cartMatch?.quantity || 0;
            setExistingCartQty(qty);

            const maxQtyLeft = matchingVariantDetail.inventory - qty;
            if (productCount > maxQtyLeft) {
              setProductCount(maxQtyLeft);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setExistingCartQty(0);
        setProductCount(1);
      }
    },
    [
      selectedOptions,
      product.variantDetails,
      areCombinationsEqual,
      product.id,
      productCount,
    ]
  );

  const handleClearOptions = useCallback(() => {
    setSelectedOptions({});
    setSelectedVariant(null);
    setExistingCartQty(0);
    setProductCount(1);
  }, []);

  const increase = useCallback(() => {
    if (!selectedVariant) return;
    const totalQty = productCount + existingCartQty;
    if (totalQty < selectedVariant.inventory) {
      setProductCount((prev) => prev + 1);
    }
  }, [productCount, existingCartQty, selectedVariant]);

  const decrease = useCallback(() => {
    setProductCount((prev) => Math.max(0, prev - 1));
  }, []);

  const getColorNamesFromHex = useCallback((hexColors: string) => {
    const result = namer(hexColors);
    return result.ntc[0].name;
  }, []);

 const handleAddToCart = useCallback(async () => {
   if (!selectedVariant) {
     console.warn("Please select all product options before adding to cart.");
     return;
   }
   setIsLoading(true);
   console.log(product, "product");
   console.log(selectedVariant, "selected variant");
   try {
     await addProductToCart({
       productId: product.id,
       variantDetails: selectedVariant,
       quantity: productCount,
     });
     // Optionally provide feedback to the user (e.g., a success message)

     // After successful addition, update existingCartQty
     setExistingCartQty((prevQty) => prevQty + productCount);
     // Optionally reset productCount if needed
     setProductCount(1);
   } catch (error) {
     console.error("Failed to add to cart:", error);
     // Optionally show an error message to the user
   } finally {
     setIsLoading(false);
   }
 }, [product, selectedVariant, productCount]);

  console.log(productCount,'counttttt')

  return (
    <div className="w-[55%]">
      <h1 className="text-2xl font-[500] text-gray-800 mb-2">
        {product.productName}
      </h1>
      <div className="flex gap-4 mb-3">
        <p className="line-through text-lg  text-gray-400">
          ₹ {product.productPrice.toFixed(2)}
        </p>
        <p className="text-xl font-[600]">
          ₹ {product.productDiscountedPrice.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {product.variants?.map((variant) => (
          <div key={variant.optionName} className="flex flex-col gap-1">
            <p className="font-medium">
              {variant.optionName}: {selectedOptions[variant.optionName]}
            </p>
            <div className="flex gap-2 flex-wrap">
              {variant.optionValue.map((value) =>
                variant?.optionName === "color" ? (
                  <div key={value}>
                    <div
                      onClick={() =>
                        handleOptionClick(variant.optionName, value)
                      }
                      className={`w-8.5 h-8.5 cursor-pointer flex justify-center items-center border-2 ${
                        selectedOptions[variant.optionName] === value
                          ? "border-red-700"
                          : "border-gray-200"
                      } rounded-full`}
                    >
                      <div
                        style={{ backgroundColor: value }}
                        className={` w-6 h-6 rounded-full cursor-pointer`}
                      />
                    </div>
                    <p className="text-center text-xs text-gray-600">
                      {getColorNamesFromHex(value)}
                    </p>
                  </div>
                ) : (
                  <p
                    key={value}
                    onClick={() => handleOptionClick(variant.optionName, value)}
                    className={`border py-1 px-8 flex items-center cursor-pointer ${
                      selectedOptions[variant.optionName] === value
                        ? "bg-amber-600 text-white border-none"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {value}
                  </p>
                )
              )}
            </div>
          </div>
        ))}
        {Object.keys(selectedOptions).length > 0 && (
          <p
            onClick={handleClearOptions}
            className="cursor-pointer flex items-center gap-1 text-sm text-gray-600"
          >
            <X className="w-4 h-4" /> Clear
          </p>
        )}
        {selectedVariant && (
          <p
            className={`px-2 py-0.5 ${
              selectedVariant?.inventory > 0
                ? "text-green-700 bg-green-100"
                : "text-red-700 bg-red-100"
            }  font-medium rounded-md  w-fit text-sm`}
          >
            {selectedVariant?.inventory > 0 ? "In stock" : "Out of stock"}
          </p>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <div className=" border border-gray-200 text-lg flex items-center gap-4 w-fit rounded-md">
          <button
            onClick={decrease}
            disabled={productCount <= 1}
            className="w-10 h-10 cursor-pointer flex items-center justify-center font-bold text-gray-600"
          >
            −
          </button>
          <span className="text-lg w-max font-medium text-gray-800">
            {productCount}
            {existingCartQty > 0 && ` (+${existingCartQty} in cart)`}
          </span>
          <button
            onClick={increase}
            disabled={
              !selectedVariant ||
              productCount + existingCartQty >= selectedVariant.inventory
            }
            className="w-10 h-10 cursor-pointer flex items-center justify-center  font-bold text-gray-600"
          >
            +
          </button>
        </div>
        <button
          disabled={
            !selectedVariant ||
            productCount + existingCartQty > selectedVariant.inventory ||
            isLoading ||
            productCount === 0
          }
          onClick={handleAddToCart}
          className={`w-full px-4 text-white py-2 bg-black font-bold cursor-pointer transition-opacity duration-200 rounded-md flex items-center justify-center gap-2 ${
            !selectedVariant ||
            productCount + existingCartQty > selectedVariant.inventory ||
            isLoading ||
            productCount === 0
              ? "opacity-50 cursor-not-allowed"
              : "opacity-100"
          }`}
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
      <div className="flex gap-8 mt-6 text-gray-600 text-sm">
        <div className="flex gap-2 items-center cursor-pointer">
          <Heart className="w-5 h-5" />
          <p>Add to wish list</p>
        </div>
        <div className="flex gap-2 items-center cursor-pointer">
          <Share className="w-5 h-5" />
          <p>Share this product</p>
        </div>
      </div>
      <hr className="text-gray-300 my-4" />
      <div className="text-gray-600 text-sm">
        <p>
          SKU:
          <span className="text-black font-medium">
            {selectedVariant?.sku || "N/A"}
          </span>
        </p>
        <p>
          Category:
          <span className="text-black font-medium">
            {" "}
            {product.productCategory || "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;

"use client";
import { Heart, Share, X, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
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
  variantDetails?: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: {
      name: string;
      value: string;
    }[];
    sku: string;
  };
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
      setSelectedVariant(matchingVariantDetail || null);

      if (matchingVariantDetail) {
        setIsLoading(true);
        getCartProducts()
          .then((res) => {
            const cartMatch = res.find((cartItem: CartProduct) => {
              return (
                cartItem.id === product.id &&
                cartItem.variantDetails &&
                areCombinationsEqual(
                  cartItem.variantDetails.combination,
                  matchingVariantDetail.combination
                )
              );
            });
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
    [selectedOptions, areCombinationsEqual, productCount, product]
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
    setProductCount((prev) => Math.max(1, prev - 1));
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
    try {
      await addProductToCart({
        productId: product.id,
        variantDetails: selectedVariant,
        quantity: productCount,
      });
      setExistingCartQty((prevQty) => prevQty + productCount);
      setProductCount(1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [product, selectedVariant, productCount]);

  return (
    <div className="w-full lg:w-[55%] px-4 lg:px-8">
      {/* Product Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
        {product.productName}
      </h1>

      {/* Price Section */}
      <div className="flex items-center gap-4 mb-4">
        <p className="text-xl font-bold text-gray-900">
          ₹{product.productDiscountedPrice.toFixed(2)}
        </p>
        {product.productDiscountedPrice < product.productPrice && (
          <p className="text-lg line-through text-gray-500">
            ₹{product.productPrice.toFixed(2)}
          </p>
        )}
      </div>

      {/* Variants Section */}
      <div className="space-y-6 mb-6">
        {product.variants?.map((variant) => (
          <div key={variant.optionName} className="space-y-2">
            <h3 className="font-medium text-gray-900 capitalize">
              {variant.optionName}:{" "}
              <span className="text-gray-700">
                {selectedOptions[variant.optionName] || "Select"}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {variant.optionValue.map((value) =>
                variant?.optionName === "color" ? (
                  <div key={value} className="flex flex-col items-center">
                    <button
                      onClick={() =>
                        handleOptionClick(variant.optionName, value)
                      }
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedOptions[variant.optionName] === value
                          ? "border-amber-600 ring-2 ring-amber-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`Select color ${value}`}
                    >
                      <div
                        style={{ backgroundColor: value }}
                        className="w-7 h-7 rounded-full"
                      />
                    </button>
                    <span className="text-xs text-gray-500 mt-1">
                      {getColorNamesFromHex(value)}
                    </span>
                  </div>
                ) : (
                  <button
                    key={value}
                    onClick={() => handleOptionClick(variant.optionName, value)}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                      selectedOptions[variant.optionName] === value
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {value}
                  </button>
                )
              )}
            </div>
          </div>
        ))}

        {/* Clear Selection */}
        {Object.keys(selectedOptions).length > 0 && (
          <button
            onClick={handleClearOptions}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" /> Clear selection
          </button>
        )}

        {/* Stock Status */}
        {selectedVariant && (
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedVariant?.inventory > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {selectedVariant?.inventory > 0 ? "In Stock" : "Out of Stock"}
            {selectedVariant?.inventory > 0 && (
              <span className="ml-1">
                ({selectedVariant.inventory} available)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:shadow-none p-4 md:p-0 md:static z-2">
        <div className="flex flex-col md:flex-col gap-4 max-w-4xl mx-auto">
          <div className="flex flex-row md:flex-col gap-4 items-stretch">
            {/* Quantity selector row */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={decrease}
                  disabled={productCount <= 1}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-gray-900">
                  {productCount}
                </span>
                <button
                  onClick={increase}
                  disabled={
                    !selectedVariant ||
                    productCount + existingCartQty >= selectedVariant.inventory
                  }
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {existingCartQty > 0 && (
                <span className="text-sm text-gray-500">
                  ({existingCartQty} in cart)
                </span>
              )}
            </div>

            {/* Add to Cart button - now in same row on mobile */}
            <button
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                productCount + existingCartQty > selectedVariant.inventory ||
                isLoading ||
                productCount === 0
              }
              className={`py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors flex-1 ${
                !selectedVariant ||
                productCount + existingCartQty > selectedVariant.inventory ||
                isLoading ||
                productCount === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Adding...
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Actions */}
      <div className="flex gap-6 mb-6 mt-6">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Heart className="w-5 h-5" />
          <span className="text-sm">Add to Wishlist</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <Share className="w-5 h-5" />
          <span className="text-sm">Share</span>
        </button>
      </div>

      <hr className="border-t border-gray-200 my-4" />

      {/* Product Meta */}
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-900">SKU:</span>{" "}
          {selectedVariant?.sku || "N/A"}
        </p>
        <p>
          <span className="font-medium text-gray-900">Category:</span>{" "}
          {product.productCategory || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;

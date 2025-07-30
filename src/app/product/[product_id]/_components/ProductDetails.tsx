"use client";
import { Heart, Share, X, Loader2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { addProductToCart, getCartProducts, addProductToBuyNowCart } from "@/actions/actions";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "react-toastify";
import PhoneAuthModal from "@/app/_components/PhoneAuthModal";
import ShowShareModal from "@/app/_components/ShowShareModel";


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
    optionValue: Array<{ name: string; hex?: string } | string>;
    optionName: string;
  }[];
  productCategory: string;
  productDiscountedPrice: number;
  active: boolean;
  productName: string;
  description: string;
  variantDetails?: VariantDetail[];
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
  productDiscountedPrice?: number; // Make this optional
  active: boolean;
  productName: string;
  description: string;
  variantDetails?: {
    price: number;
    discountedPrice: number;
    inventory: number;
    combination: Combination[];
    sku: string;
  };
  taxRate: number;
  productUnit: string;
}

const ProductDetails = ({ product }: { product: Product }) => {
     
  const { refreshCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<VariantDetail | null>(
    null
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [productCount, setProductCount] = useState(1);
  const [existingCartQty, setExistingCartQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();
  console.log(currentUser, "currentUser");

  const areCombinationsEqual = useCallback(
    (comb1: Combination[], comb2: Combination[]): boolean => {
      if (!comb1 || !comb2 || comb1.length !== comb2.length) return false;
      return comb1.every((c1) =>
        comb2.some((c2) => c1.name === c2.name && c1.value === c2.value)
      );
    },
    []
  );

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!currentUser) return;

      try {
        const wishlistRef = doc(db, "wishlists", currentUser.uid);
        const docSnap = await getDoc(wishlistRef);

        if (docSnap.exists()) {
          const wishlistData = docSnap.data();
          const productExists = wishlistData.products.some(
            (item: { id: string }) => item.id === product.id
          );
          setIsInWishlist(productExists);
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [currentUser, product.id]);

  useEffect(() => {
    const hasVariants =
      !!product.variantDetails && product.variantDetails.length > 0;
    setHasVariants(hasVariants);

    if (!hasVariants) {
      setSelectedVariant({
        combination: [],
        discountedPrice: product.productDiscountedPrice,
        price: product.productPrice,
        inventory: product.quantity,
        sku: product.skuId,
      });
    } else if (product.variantDetails && product.variantDetails.length > 0) {
      const firstVariant = product.variantDetails[0];
      const initialOptions: Record<string, string> = {};

      firstVariant.combination.forEach((comb) => {
        initialOptions[comb.name] = comb.value;
      });

      setSelectedOptions(initialOptions);
      setSelectedVariant(firstVariant);
    }
  }, [product]);

  useEffect(() => {
    setIsLoading(true);
    getCartProducts()
      .then((res: CartProduct[]) => {
        const cartMatch = res.find((cartItem) => {
          if (!hasVariants) {
            return (
              cartItem.id === product.id &&
              (!cartItem.variantDetails ||
                cartItem.variantDetails.combination.length === 0)
            );
          } else {
            return (
              cartItem.id === product.id &&
              cartItem.variantDetails &&
              selectedVariant &&
              areCombinationsEqual(
                cartItem.variantDetails.combination,
                selectedVariant.combination
              )
            );
          }
        });
        setExistingCartQty(cartMatch?.quantity || 0);
      })
      .finally(() => setIsLoading(false));
  }, [selectedVariant, product, hasVariants, areCombinationsEqual]);

  const handleOptionClick = useCallback(
    (optionName: string, optionValue: string) => {
      if (!hasVariants) return;

      const newSelectedOptions = {
        ...selectedOptions,
        [optionName]: optionValue,
      };
      setSelectedOptions(newSelectedOptions);

      const matchingVariantDetail = product.variantDetails?.find((detail) =>
        detail.combination.every(
          (comb) => newSelectedOptions[comb.name] === comb.value
        )
      );
      setSelectedVariant(matchingVariantDetail || null);

      if (matchingVariantDetail) {
        setIsLoading(true);
        getCartProducts()
          .then((res: CartProduct[]) => {
            const cartMatch = res.find((cartItem) => {
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
              setProductCount(Math.max(1, maxQtyLeft));
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setExistingCartQty(0);
        setProductCount(1);
      }
    },
    [selectedOptions, productCount, product, hasVariants, areCombinationsEqual]
  );

  const handleClearOptions = useCallback(() => {
    if (!hasVariants) return;
    setSelectedOptions({});
    setSelectedVariant(null);
    setExistingCartQty(0);
    setProductCount(1);
  }, [hasVariants]);

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

  const handleAddToCart = useCallback(async () => {
    if (hasVariants && !selectedVariant) return;

    setIsLoading(true);
    try {
      await addProductToCart({
        productId: product.id,
        variantDetails:
          hasVariants && selectedVariant ? selectedVariant : undefined,
        quantity: productCount,
      });

      window.dispatchEvent(new Event("cart-updated"));
      await refreshCart();

      setExistingCartQty((prev) => prev + productCount);
      setProductCount(1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [product, selectedVariant, productCount, hasVariants, refreshCart]);

  const handleBuyNow = useCallback(async () => {
    if (hasVariants && !selectedVariant) return;

    setIsBuyNowLoading(true);
    try {
      await addProductToBuyNowCart({
        productId: product.id,
        variantDetails:
          hasVariants && selectedVariant ? selectedVariant : undefined,
        quantity: productCount,
      });

      router.push('/checkout?buyNow=true');

    } catch (error) {
      console.error("Failed to add to buy now cart:", error);
      toast.error("Failed to proceed to buy now.");
    } finally {
      setIsBuyNowLoading(false);
    }
  }, [product, selectedVariant, productCount, hasVariants, router]);

  const handlePhoneVerified = (phoneNumber: string) => {
    console.log("Verified phone number:", phoneNumber);
    // Do something with the verified phone number
  };

  const handleAddToWishlist = useCallback(async () => {
    if (!currentUser) {
      toast.info("Please login to add items to your wishlist");
       <PhoneAuthModal
         isOpen={showPhoneAuth}
         onClose={() => setShowPhoneAuth(false)}
         onSuccess={handlePhoneVerified}
       />;
      return;
    }

    setIsWishlistLoading(true);
    try {
      const wishlistRef = doc(db, "wishlists", currentUser.uid);
      const docSnap = await getDoc(wishlistRef);

      const productData = {
        id: product.id,
        name: product.productName,
        price: selectedVariant?.price || product.productPrice,
        discountedPrice:
          selectedVariant?.discountedPrice || product.productDiscountedPrice,
        image: product.images[0],
        variant: selectedVariant
          ? {
              combination: selectedVariant.combination,
              sku: selectedVariant.sku,
            }
          : undefined,
        addedAt: new Date().toISOString(),
      };

      if (docSnap.exists()) {
        // Update existing wishlist
        const wishlistData = docSnap.data();
        const productIndex = wishlistData.products.findIndex(
          (item: { id: string }) => item.id === product.id
        );

        if (productIndex >= 0) {
          // Remove from wishlist if already exists
          const updatedProducts = wishlistData.products.filter(
            (item: { id: string }) => item.id !== product.id
          );
          await updateDoc(wishlistRef, {
            products: updatedProducts,
          });
          setIsInWishlist(false);
          toast.success("Removed from wishlist");
        } else {
          // Add to existing wishlist
          await updateDoc(wishlistRef, {
            products: [...wishlistData.products, productData],
          });
          setIsInWishlist(true);
          toast.success("Added to wishlist");
        }
      } else {
        // Create new wishlist
        await setDoc(wishlistRef, {
          userId: currentUser.uid,
          products: [productData],
          createdAt: new Date().toISOString(),
        });
        setIsInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  }, [currentUser, product, selectedVariant]);


    const handleShare = async () => {
    const productUrl = `${window.location.origin}/products/${product.id}`;
    const shareText = `Check out ${product.productName} on our store!`;

    try {
      if (navigator.share) {
        // Use native share API if available (mobile devices)
        await navigator.share({
          title: product.productName,
          text: shareText,
          url: productUrl,
        });
      } else {
        // Fallback to custom share modal
        setShowShareModal(true);
      }
    } catch (err) {
      // User cancelled the share
      console.log('Share cancelled:', err);
    }
  };







  return (
    <div className="w-full lg:w-[55%] px-4 lg:px-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
        {product.productName}
      </h1>

      <div className="flex items-center gap-4 mb-4">
        <p className="text-xl font-bold text-gray-900">
          ₹
          {(
            selectedVariant?.discountedPrice || product.productDiscountedPrice
          ).toFixed(2)}
        </p>
        {(selectedVariant?.price || product.productPrice) >
          (selectedVariant?.discountedPrice ||
            product.productDiscountedPrice) && (
          <p className="text-lg line-through text-gray-500">
            ₹{(selectedVariant?.price || product.productPrice).toFixed(2)}
          </p>
        )}
      </div>

      {hasVariants && product.variants && (
        <div className="space-y-6 mb-6">
          {product.variants.map((variant) => (
            <div key={variant.optionName} className="space-y-2">
              <h3 className="font-medium text-gray-900 capitalize">
                {variant.optionName}:{" "}
                <span className="text-gray-700">
                  {selectedOptions[variant.optionName] || "Select"}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {variant.optionValue.map((value) => {
                  const valueObj =
                    typeof value === "string" ? { name: value } : value;
                  return variant.optionName?.toLowerCase() === "color" ? (
                    <div
                      key={valueObj.name}
                      className="flex flex-col items-center"
                    >
                      <button
                        onClick={() =>
                          handleOptionClick(variant.optionName, valueObj.name)
                        }
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedOptions[variant.optionName] === valueObj.name
                            ? "border-[#1e6553] ring-1 ring-[#1e6553]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        aria-label={`Select color ${valueObj.name}`}
                      >
                        <div
                          style={{ backgroundColor: valueObj.hex || "#ccc" }}
                          className="w-7 h-7 rounded-full"
                        />
                      </button>
                      <span className="text-xs text-gray-500 mt-1">
                        {valueObj.name}
                      </span>
                    </div>
                  ) : (
                    <button
                      key={valueObj.name}
                      onClick={() =>
                        handleOptionClick(variant.optionName, valueObj.name)
                      }
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                        selectedOptions[variant.optionName] === valueObj.name
                          ? "bg-[#1e6553] text-white border-[#1e6553]"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {valueObj.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(selectedOptions).length > 0 && (
            <button
              onClick={handleClearOptions}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" /> Clear selection
            </button>
          )}
        </div>
      )}

      {selectedVariant && (
        <div className="mb-6">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedVariant.inventory > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {selectedVariant.inventory > 0 ? "In Stock" : "Out of Stock"}
            {selectedVariant.inventory > 0 && (
              <span className="ml-1">
                ({selectedVariant.inventory} available)
              </span>
            )}
          </div>

          {selectedVariant.inventory > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-900">Quantity:</span>
              <div className="flex items-center border border-gray-300 overflow-hidden h-12 justify-center w-fit mt-2">
                <button
                  onClick={decrease}
                  disabled={productCount <= 1}
                  className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-medium text-gray-900 flex items-center justify-center">
                  {productCount}
                </span>
                <button
                  onClick={increase}
                  disabled={
                    productCount + existingCartQty >= selectedVariant.inventory
                  }
                  className="w-12 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-full bg-white md:bg-transparent p-4 md:p-0 shadow-lg md:shadow-none fixed md:static bottom-0 left-0 right-0 z-10 md:border-none">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <button
            onClick={handleAddToCart}
            disabled={
              !selectedVariant ||
              productCount + existingCartQty > selectedVariant.inventory ||
              isLoading || isBuyNowLoading ||
              productCount === 0
            }
            className={`w-full h-12 font-medium flex items-center justify-center gap-2 transition-colors ${
              !selectedVariant ||
              productCount + existingCartQty > selectedVariant.inventory ||
              isLoading || isBuyNowLoading ||
              productCount === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Adding...</span>
              </>
            ) : (
              <span>Add to Cart</span>
            )}
            {existingCartQty > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {existingCartQty} in cart
              </span>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={
              !selectedVariant ||
              productCount + existingCartQty > selectedVariant.inventory ||
              isLoading || isBuyNowLoading ||
              productCount === 0
            }
            className={`w-full h-12 font-medium flex items-center justify-center gap-2 transition-colors ${
              !selectedVariant ||
              productCount + existingCartQty > selectedVariant.inventory ||
              isLoading || isBuyNowLoading ||
              productCount === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#1e6553] text-white hover:bg-[#1e6553]/90"
            }`}
          >
            {isBuyNowLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Buy Now</span>
            )}
          </button>
        </div>
      </div>

      <hr className="border-t border-gray-200 my-4" />

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-900">SKU:</span>{" "}
          {selectedVariant?.sku || product.skuId || "N/A"}
        </p>
  
      </div>

      {showShareModal && (
 <ShowShareModal product={product} setShowShareModal={setShowShareModal}/>
)}
    </div>
  );
};

export default ProductDetails;

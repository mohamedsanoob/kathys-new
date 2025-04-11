"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import Navbar from "../_components/Navbar";
import Checkout from "./_components/Checkout";
import { getCartProducts, getProductById } from "@/actions/actions";
import Image from "next/image";
import { X } from "lucide-react";

// Type definitions
interface VariantDetail {
  price: number;
  discountedPrice: number;
  inventory: number;
  combination: {
    name: string;
    value: string;
  }[];
  sku: string;
}

interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails: VariantDetail;
  currentInventory?: number;
  outOfStock?: boolean;
}

const CartPage = () => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart data
  const fetchCartAndProductDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartItems = await getCartProducts();
      const productsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const productDetails = await getProductById(item.id);
          
          if (!productDetails) return null;
          
          const variant = productDetails.variantDetails.find(
            (v) =>
              v.sku === item.variantDetails?.sku &&
              v.combination.every(
                (comb, index) =>
                  comb.value === item.variantDetails?.combination[index]?.value
              )
          );
          
          const currentInventory = variant?.inventory;
          return {
            ...productDetails,
            quantity: item.quantity,
            variantDetails: item.variantDetails,
            currentInventory,
            outOfStock: currentInventory !== undefined && item.quantity > currentInventory,
          };
        })
      );

      setCartProducts(productsWithDetails.filter(Boolean));
    } catch (error) {
      console.error("Failed to fetch cart and product details:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartAndProductDetails();
  }, [fetchCartAndProductDetails]);

  // Quantity handling functions
  const updateQuantity = useCallback((productId: string, variantSku: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId && product.variantDetails.sku === variantSku) {
          const outOfStock = 
            product.currentInventory !== undefined && 
            newQuantity > product.currentInventory;
          
          return { ...product, quantity: newQuantity, outOfStock };
        }
        return product;
      })
    );
  }, []);

  const handleIncrement = useCallback((product: CartProduct) => {
    if (
      product.currentInventory === undefined || 
      product.quantity < product.currentInventory
    ) {
      updateQuantity(
        product.id,
        product.variantDetails.sku,
        product.quantity + 1
      );
    }
  }, [updateQuantity]);

  const handleDecrement = useCallback((product: CartProduct) => {
    if (product.quantity > 1) {
      updateQuantity(
        product.id,
        product.variantDetails.sku,
        product.quantity - 1
      );
    }
  }, [updateQuantity]);

  // Calculate total (memoized)
  const total = useMemo(() => cartProducts.reduce((sum, product) => {
    const price = product.productDiscountedPrice || product.productPrice;
    return sum + (price * product.quantity);
  }, 0), [cartProducts]);

  // Format price with Indian locale
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Components for rendering cart items
  const CartItemMobile = ({ product }: { product: CartProduct }) => (
    <div className="border-b border-gray-200 py-4 flex flex-col">
      <div className="flex items-start gap-4">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.productName}
            width={80}
            height={80}
            className="w-16 h-20 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {product.productName}
            {" - "}
            {product.variantDetails.combination.map((attr) => attr.value).join(", ")}
          </p>
          {product.outOfStock && (
            <p className="text-red-500 text-xs mt-1">
              Out of Stock (Available: {product.currentInventory})
            </p>
          )}
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-medium">
              ₹ {formatPrice(product.productDiscountedPrice || product.productPrice)}
            </p>
            <button className="text-gray-500 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <QuantityControl 
          product={product} 
          onIncrement={handleIncrement} 
          onDecrement={handleDecrement}
          isMobile={true}
        />
        <p className="text-sm font-medium">
          ₹ {formatPrice((product.productDiscountedPrice || product.productPrice) * product.quantity)}
        </p>
      </div>
    </div>
  );

  const QuantityControl = ({ 
    product, 
    onIncrement, 
    onDecrement,
    isMobile = false
  }: { 
    product: CartProduct, 
    onIncrement: (product: CartProduct) => void, 
    onDecrement: (product: CartProduct) => void,
    isMobile?: boolean
  }) => {
    const buttonSize = isMobile ? "w-8 h-8" : "w-10 h-10";
    const textSize = isMobile ? "text-sm" : "text-[1rem]";
    
    return (
      <div className={`border border-gray-200 flex items-center gap-2 w-fit rounded-md ${isMobile ? 'text-sm' : 'text-lg'}`}>
        <button
          onClick={() => onDecrement(product)}
          disabled={product.quantity <= 1}
          className={`${buttonSize} cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400`}
        >
          −
        </button>
        <span className={`${textSize} w-max font-medium text-gray-800`}>
          {product.quantity}
        </span>
        <button
          onClick={() => onIncrement(product)}
          disabled={
            product.currentInventory !== undefined &&
            product.quantity >= product.currentInventory
          }
          className={`${buttonSize} cursor-pointer flex items-center justify-center font-bold text-gray-600 disabled:text-gray-400`}
        >
          +
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ position: "relative", height: "100vh" }}>
      <Navbar />
      <div 
        className="flex flex-col lg:flex-row gap-4 lg:gap-16 p-4 md:p-8 lg:p-[6.5%] flex-1" 
        style={{ overflowY: "scroll", marginTop: "50px" }}
      >
        {/* Cart Items - Mobile View */}
        <div className="lg:hidden w-full">
          {cartProducts.map((product, index) => (
            <CartItemMobile key={`${product.id}-${product.variantDetails.sku}-${index}`} product={product} />
          ))}
        </div>

        {/* Cart Items - Desktop View */}
        <div className="hidden lg:block w-full lg:w-[70%]">
          <table className="w-full">
            <thead>
              <tr className="text-center text-gray-400 font-medium border-b border-gray-300">
                <th className="py-2 w-120 text-[0.875rem] opacity-60">Product</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">Price</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">Quantity</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60">Subtotal</th>
                <th className="py-2 text-[0.875rem] text-left opacity-60"></th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.map((product, index) => (
                <tr key={`${product.id}-${product.variantDetails.sku}-${index}`} className="border-b border-gray-200 h-[100px]">
                  <td>
                    <div className="flex items-center gap-4 h-[100%]">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.productName}
                          width={80}
                          height={80}
                          className="w-10 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-[1rem]">
                          {product.productName}
                          {" - "}
                          {product.variantDetails.combination.map((attr) => attr.value).join(", ")}
                        </p>
                        {product.outOfStock && (
                          <p className="text-red-500 text-sm">
                            Out of Stock (Available: {product.currentInventory})
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-left">
                    <p className="text-[1rem]">
                      ₹ {formatPrice(product.productDiscountedPrice || product.productPrice)}
                    </p>
                  </td>
                  <td className="text-left">
                    <QuantityControl 
                      product={product} 
                      onIncrement={handleIncrement} 
                      onDecrement={handleDecrement}
                    />
                  </td>
                  <td className="text-[1rem] text-left">
                    ₹ {formatPrice((product.productDiscountedPrice || product.productPrice) * product.quantity)}
                  </td>
                  <td className="text-center">
                    <button className="text-gray-500 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Checkout Section */}
        <div className="w-full lg:w-[30%]">
          <Checkout total={total} />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
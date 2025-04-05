"use client";
import Image from "next/image";
import { X } from "lucide-react";
// import {
//   updateCartItemQuantity,
//   removeProductFromCart,
// } from "@/actions/actions"; // Assuming you have these actions

interface VariantDetail {
  combination: { name: string; value: string }[];
  inventory: number;
  sku: string;
  discountedPrice?: number;
  price: number;
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

interface CartItemsProps {
  products: (CartProduct & {
    currentInventory?: number;
    outOfStock?: boolean;
  })[];
  onQuantityChange: () => void; // Function to refresh cart data
}

const CartItems: React.FC<CartItemsProps> = ({
  products,
  //   onQuantityChange,
}) => {
  //   const handleQuantityChange = async (
  //     productId: string,
  //     variantSku: string,
  //     newQuantity: number
  //   ) => {
  //     if (newQuantity > 0) {
  //       await updateCartItemQuantity(productId, variantSku, newQuantity);
  //       onQuantityChange(); // Refresh cart data after update
  //     }
  //   };

  //   const handleRemoveItem = async (productId: string, variantSku: string) => {
  //     await removeProductFromCart(productId, variantSku);
  //     onQuantityChange(); // Refresh cart data after removal
  //   };

  return (
    <table className="w-full">
      <thead>
        <tr className="text-center text-gray-400 font-medium border-b border-gray-300">
          <th className="py-2">Product</th>
          <th className="py-2">Price</th>
          <th className="py-2">Quantity</th>
          <th className="py-2">Subtotal</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {products?.map((product, index) => (
          <tr key={index} className="py-4 border-b border-gray-200">
            <td className="flex items-center gap-4 py-2">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.productName}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <p className="font-semibold text-md">
                  {product.productName}
                  {" - "}
                  {product.variantDetails.combination
                    .map((attr) => `${attr.value}`)
                    .join(", ")}
                </p>
                {product.outOfStock && (
                  <p className="text-red-500 text-sm">
                    Out of Stock (Available: {product.currentInventory})
                  </p>
                )}
              </div>
            </td>
            <td className="py-2 text-center">
              <p className="text-lg">
                ₹{" "}
                {(
                  product.productDiscountedPrice || product?.productPrice
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </td>
            <td className="py-2 text-center">
              {/* <input
                type="number"
                min="1"
                max={product.currentInventory || product.quantity} // Limit to current inventory
                value={product.quantity}
                // onChange={(e) => {
                //   const newQty = parseInt(e.target.value);
                //   if (!isNaN(newQty) && newQty > 0) {
                //     handleQuantityChange(
                //       product.id,
                //       product.variantDetails.sku,
                //       newQty
                //     );
                //   }
                // }}
                className="w-20 text-center border border-gray-300 rounded"
                disabled={product.outOfStock}
              /> */}
              <div className=" border border-gray-200 text-lg flex items-center gap-4 w-fit rounded-md">
                {/* <button
                  onClick={decrease}
                  disabled={productCount <= 1}
                  className="w-10 h-10 cursor-pointer flex items-center justify-center font-bold text-gray-600"
                >
                  −
                </button>
                <span className="text-lg w-max font-medium text-gray-800">
                  {product?.quantity}
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
                </button> */}
              </div>
            </td>
            <td className="py-2 text-lg text-center">
              ₹{" "}
              {(
                (product.productDiscountedPrice || product.productPrice) *
                product.quantity
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
            <td className="py-2 text-center">
              <button
                // onClick={() =>
                //   handleRemoveItem(product.id, product.variantDetails.sku)
                // }
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CartItems;

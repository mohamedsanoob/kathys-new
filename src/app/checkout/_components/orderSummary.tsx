import { useEffect } from "react";

const OrderSummary = ({
  cartProducts,
  total,
  termsAgreed,
  termsError,
  handlePlaceOrder,
  isValid,
  currentUser,
  showAddressForm,
  paymentMode,
  selectedAddress,
  showPaymentMode,
  setPaymentModeError,
  paymentModeError
}: OrderSummaryProps) => {
  // Calculate delivery fee (₹150 for COD, otherwise 0)
  const deliveryFee =  paymentMode==="cof"?0: paymentMode === "cod" ? 150 : 75;
  const grandTotal = total + deliveryFee;



  useEffect(() => {
    if (paymentMode !== '') {
      setPaymentModeError(false);
    }
  }, [paymentMode]);

  return (
    <div className="w-full lg:w-1/3 h-max bg-white p-6 rounded-lg shadow-sm">
      <div className="w-full flex flex-col">
        <h6 className="font-medium text-lg mb-4">Your order</h6>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-start pb-2 text-sm font-medium">Product</th>
                <th className="text-end pb-2 text-sm font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="text-start py-3 text-sm">
                    {product.productName} -{" "}
                    {product.variantDetails.combination.map((c) => c.value).join(", ")} × {product.quantity}
                  </td>
                  <td className="text-end py-3 text-sm">
                    ₹{((product?.variantDetails?.discountedPrice || product?.variantDetails?.price) * product.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Subtotal</td>
                <td className="text-end py-3 text-sm">₹{total.toFixed(2)}</td>
              </tr>
              
            
                <tr className="border-b border-gray-200">
                  <td className="text-start py-3 text-sm font-medium">Delivery Fee</td>
                  <td className="text-end py-3 text-sm">₹{deliveryFee.toFixed(2)}</td>
                </tr>
     
              
              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Total</td>
                <td className="text-end py-3 text-lg font-semibold">₹{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-500">
            Your personal data will be used to process your order, support your experience 
            throughout this website, and for other purposes described in our privacy policy
          </p>
          
          {termsError && (
            <p className="text-red-500 text-xs">Please agree to the terms and conditions</p>
          )}
          
          {showPaymentMode && paymentModeError && (
            <p className="text-red-500 text-xs">Please select a payment method</p>
          )}
          
          <button
            onClick={handlePlaceOrder}
            disabled={
              currentUser 
                ? !selectedAddress || !termsAgreed || showAddressForm
                : !isValid || !termsAgreed 
            }
            className={`hidden md:block w-full py-3 rounded-md text-white font-semibold ${
              (currentUser ? selectedAddress && termsAgreed && !showAddressForm && (!showPaymentMode || paymentMode) 
                : isValid && termsAgreed && (!showPaymentMode || paymentMode))
                ? "bg-[#1e6553] hover:bg-[#1e6553]" 
                : "bg-gray-400 cursor-not-allowed"
            } transition-colors`}
          >
            {showPaymentMode 
              ? paymentMode 
                ? `Pay ₹${grandTotal.toFixed(2)}` // Updated to show grand total
                : "Select Payment Method"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
import { CartProduct } from "@/types/checkout";

interface OrderSummaryProps {
  cartProducts: CartProduct[];
  total: number;
  termsAgreed: boolean;
  setTermsAgreed: (value: boolean) => void;
   setTermsError : (value: boolean) => void;
  termsError: boolean;
  handlePlaceOrder: () => void;
  isValid: boolean;
  currentUser: any;
  selectedAddress: string | null | undefined;
}

const OrderSummary = ({
  cartProducts,
  total,
  termsAgreed,
  setTermsAgreed,
  termsError,
  handlePlaceOrder,
  setTermsError,
  isValid,
  currentUser,
  selectedAddress
}: OrderSummaryProps) => {
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
                    ₹{((product.productDiscountedPrice || product.productPrice) * product.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Subtotal</td>
                <td className="text-end py-3 text-sm">₹{total.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="text-start py-3 text-sm font-medium">Total</td>
                <td className="text-end py-3 text-lg font-semibold">₹{total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <h6 className="font-semibold">UPI/Credit card/Debit Card/Net banking</h6>
            <h4 className="text-xl mt-1">Pay By Razorpay</h4>
          </div>
          
          <p className="text-sm text-gray-500">
            Your personal data will be used to process your order, support your experience 
            throughout this website, and for other purposes described in our privacy policy
          </p>

          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="termsAgreed"
              checked={termsAgreed}
              onChange={(e) => {
                setTermsAgreed(e.target.checked);
                if (e.target.checked) setTermsError(false);
              }}
              className="h-4 w-4 mt-1"
            />
            <label htmlFor="termsAgreed" className="text-sm">
              I have read and agree to the website{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                terms and conditions
              </a>
              *
            </label>
          </div>
          
          {termsError && <p className="text-red-500 text-xs">{termsError}</p>}
          
          <button
            onClick={handlePlaceOrder}
            disabled={
              currentUser 
                ? !selectedAddress || !termsAgreed 
                : !isValid || !termsAgreed
            }
            className={`w-full py-3 rounded-md text-white font-semibold ${
              (currentUser ? selectedAddress && termsAgreed : isValid && termsAgreed) 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-gray-400 cursor-not-allowed"
            } transition-colors`}
            style={{cursor:"pointer"}}
          >
            Place order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
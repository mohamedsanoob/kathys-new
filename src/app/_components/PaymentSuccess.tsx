"use client";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PaymentSuccessProps {
  orderId: string;
  amount: number;
  paymentMethod: string;
  onContinueShopping?: () => void;
}

export const PaymentSuccess = ({
  orderId,
  amount,
  paymentMethod,
  onContinueShopping,
}: PaymentSuccessProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center mt-7">
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your purchase. Your order has been confirmed.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-md border border-gray-200 mb-8">
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Order ID</span>
          <span className="font-medium">{orderId}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Amount Paid</span>
          <span className="font-medium">₹{amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method</span>
          <span className="font-medium capitalize">{paymentMethod}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        <Link
          href="/orders"
          className="px-6 py-3 bg-[#1e6553] text-white font-medium rounded-md hover:bg-[#1e6553]/90 transition-colors text-center"
        >
          View Order Details
        </Link>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 bg-white text-[#1e6553] font-medium rounded-md border border-[#1e6553] hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <p className="mt-8 text-gray-500">
        A confirmation email has been sent to your registered email address.
      </p>
    </div>
  );
};
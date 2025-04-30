"use client";
import { XCircle } from "lucide-react";
import Link from "next/link";

interface PaymentRejectedProps {
  errorMessage?: string;
  orderId?: string;
  onRetry?: () => void;
}

export const PaymentRejected = ({
  errorMessage = "Payment was not completed successfully.",
  orderId,
  onRetry,
}: PaymentRejectedProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center mt-7">
      <div className="bg-red-100 p-6 rounded-full mb-6">
        <XCircle className="h-16 w-16 text-red-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
      <p className="text-lg text-gray-600 mb-6 max-w-md">
        {errorMessage}
      </p>

      {orderId && (
        <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-md border border-gray-200 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID</span>
            <span className="font-medium">{orderId}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-[#1e6553] text-white font-medium rounded-md hover:bg-[#1e6553]/90 transition-colors"
          >
            Try Again
          </button>
        )}
        <Link
          href="/cart"
          className="px-6 py-3 bg-white text-[#1e6553] font-medium rounded-md border border-[#1e6553] hover:bg-gray-50 transition-colors text-center"
        >
          Back to Cart
        </Link>
      </div>

      <p className="mt-8 text-gray-500">
        Need help? <Link href="/contact" className="text-[#1e6553] hover:underline">Contact support</Link>
      </p>
    </div>
  );
};
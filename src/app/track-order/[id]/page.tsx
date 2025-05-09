import { getOrderById } from "@/actions/order";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Page = async ({ params }: { params: { id: string } }) => {
  const res = await getOrderById(params.id);

  if (!res) {
    return (
      <div className="max-w-[732px] mx-auto p-6 text-center">
        Order not found
      </div>
    );
  }

  // Format dates
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate totals
  const itemsTotal = res.items_total / 100; // Assuming prices are in paisa
  const deliveryFee = res.delivery / 100;
  const grandTotal = (itemsTotal + deliveryFee).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md mt-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/"
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2" />
          Back to Orders
        </Link>
      </div>

      {/* Order header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            Thank you for your purchase
          </p>
        </div>
        <div className="">
          <p className="text-sm font-medium text-gray-900">Order #{res.id}</p>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(res.createdAt)}
          </p>
        </div>
      </div>

      {/* Rest of your existing code... */}
      {/* Order status */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              res.status === "shipped"
                ? "bg-green-100 text-green-800" // Green for final shipped status
                : res.status === "accepted"
                ? "bg-blue-100 text-blue-800" // Blue for accepted
                : res.status === "pending"
                ? "bg-yellow-100 text-yellow-800" // Yellow for pending
                : "bg-gray-100 text-gray-800" // Gray for created
            }`}
          >
            {res.status === "shipped"
              ? "Shipped"
              : res.status === "accepted"
              ? "Accepted"
              : res.status === "pending"
              ? "Processing"
              : "Order Created"}
          </span>
        </div>

        <div className="mb-6">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                res.status === "shipped"
                  ? "bg-green-500 w-full"
                  : res.status === "accepted"
                  ? "bg-blue-500 w-2/3"
                  : res.status === "pending"
                  ? "bg-yellow-500 w-1/3"
                  : "bg-gray-500 w-0"
              }`}
            ></div>
          </div>

          {/* Status indicators */}
          <div className="flex justify-between text-xs text-gray-600 px-1">
            <div
              className={`flex flex-col items-center ${
                res.status === "created" ? "text-black font-medium" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  res.status === "created"
                    ? "bg-gray-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                1
              </div>
              Created
            </div>
            <div
              className={`flex flex-col items-center ${
                res.status === "pending" ? "text-black font-medium" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  res.status === "pending" ||
                  res.status === "accepted" ||
                  res.status === "shipped"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                2
              </div>
              Pending
            </div>
            <div
              className={`flex flex-col items-center ${
                res.status === "accepted" ? "text-black font-medium" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  res.status === "accepted" || res.status === "shipped"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                3
              </div>
              Accepted
            </div>
            <div
              className={`flex flex-col items-center ${
                res.status === "shipped" ? "text-black font-medium" : ""
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                  res.status === "shipped"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                ✓
              </div>
              Shipped
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="mb-8">
        {res.trackingInfo?.courier && (
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>Courier Name : {res.trackingInfo?.courier}</h3>
              <h4>Tracking ID : {res.trackingInfo?.trackingId}</h4>
            </div>
            <Link
              href={"https://www.dtdc.in/trace.asp"}
              className="text-sm font-medium bg-green-700 text-white rounded-md px-4 py-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Track Order
            </Link>
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {res.quantity_each.map((item) => (
            <div
              key={item.product_id}
              className="flex flex-row items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-[6rem] h-[6rem] flex-shrink-0 relative">
                <Image
                  src={item.images[0]}
                  alt={item.product_name}
                  fill
                  className="object-contain rounded-md border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {item.product_name}
                </h3>
                {item.variant_details && (
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    {Object.entries(item.variant_details).map(
                      ([key, value]) => (
                        <p key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </p>
                      )
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-gray-600">Qty: {item.quantity}</span>
                  <div className="text-right">
                    {item.discounted_price && (
                      <span className="text-gray-500 line-through mr-2">
                        ₹{(item.product_price / 100).toFixed(2)}
                      </span>
                    )}
                    <span className="font-medium text-gray-900">
                      ₹{(item.discounted_price / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="mb-8 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Items Total</span>
            <span className="text-gray-900">
              ₹{(res.items_total / 100).toFixed(2)}
            </span>
          </div>
          {res.coupon_discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Coupon Discount</span>
              <span className="text-red-600">
                -₹{(res.coupon_discount / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="text-gray-900">
              ₹{(res.delivery / 100).toFixed(2)}
            </span>
          </div>
          {res.tax_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">
                ₹{(res.tax_amount / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200 mt-3">
            <p className="text-sm">
              <span className="text-gray-600 font-medium">Payment Method:</span>{" "}
              <span className="text-gray-900">
                {res.payment_mode === "COD"
                  ? "Cash on Delivery"
                  : res.payment_mode}
              </span>
            </p>
            <p className="text-sm mt-1">
              <span className="text-gray-600 font-medium">Payment Status:</span>{" "}
              <span
                className={`${
                  res.status === "paid"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {res.status.charAt(0).toUpperCase() +
                  res.status.slice(1)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Customer details */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
            <p className="text-gray-900">{res.customer_details.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-gray-900">{res.customer_details.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
            <p className="text-gray-900">
              {res.customer_details.mobile_number}
            </p>
          </div>
          <div className="sm:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
            <p className="text-gray-900">{res.customer_details.address}</p>
            <p className="text-gray-900">
              {res.customer_details.locality_area}, {res.customer_details.city},{" "}
              {res.customer_details.state} - {res.customer_details.pincode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
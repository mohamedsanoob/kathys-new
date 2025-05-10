"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/actions/actions";
import { X, Filter, ArrowRight, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";
import Link from "next/link";

interface OrderType {
  id: string;
  order_id: string;
  customer_details: {
    name: string;
    mobile_number: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  orderDetails: {
    amount: number;
    orderStatus: string;
    currency: string;
  };
  status: string;
  quantity_each: Array<{
    product_name: string;
    quantity: number;
    discounted_price: number;
    variant_details: Record<string, string>;
  }>;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  items_total: number;
  payment_mode: string;
}

// Updated status options as requested
const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "created", label: "Created" },
  { value: "rejected", label: "Rejected" },
  { value: "accepted", label: "Accepted" },
  { value: "shipped", label: "Shipped" },
];

const AllOrders = () => {
  const { currentUser } = useAuth();
  const [userOrders, setUserOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const fetchOrders = async (uid: string | undefined) => {
    if (!uid) return;
    const orders = await getUserOrders(uid);
    if (orders.length > 0) {
      setUserOrders(orders);
      setFilteredOrders(orders);
    } else {
      console.log("No orders found for this user");
      setUserOrders([]);
      setFilteredOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders(currentUser?.uid);
  }, [currentUser?.uid]);

  useEffect(() => {
    applyFilters();
  }, [selectedStatus, userOrders]);

  const applyFilters = () => {
    let result = [...userOrders];

    // Only apply status filter (as requested)
    if (selectedStatus !== "all") {
      result = result.filter(
        (order) => order.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFilteredOrders(result);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setFilterOpen(false);
  };

  const convertTimestampToDate = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  };

  // Function to get status color classes
  const getStatusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full mb-5 md:px-0">
      {/* Header with filter */}
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-3">
        <p className="text-lg font-medium">Your Orders</p>
        <button
          onClick={() => setFilterOpen(true)}
          className="md:hidden flex items-center gap-2 rounded-full py-1.5 px-4 cursor-pointer bg-gray-100 hover:bg-gray-200 shadow-sm"
        >
          <Filter size={16} />
          <span className="text-sm font-medium">FILTER</span>
        </button>
      </div>

      {/* Status chips for larger screens */}
      <div className="hidden md:flex overflow-x-auto gap-2 pb-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedStatus(option.value)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedStatus === option.value
                ? "bg-green-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Orders list or empty state */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-1">
            {userOrders.length === 0
              ? "You haven't placed any orders yet"
              : "No matching orders found"}
          </h3>
          <p className="text-sm text-gray-400 text-center px-4">
            {userOrders.length === 0
              ? "Start shopping to see your orders here"
              : "Try selecting a different status filter"}
          </p>
          {userOrders.length === 0 && (
            <Link
              href="/categories"
              className="mt-4 px-6 py-2 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-800 transition-colors shadow-sm"
            >
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/track-order/${order.id}`}
              className="rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 bg-gray-50"
            >
              <div className="p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8)}...
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium">
                    ₹{order.items_total.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Order Date</span>
                  <span className="text-gray-600">
                    {order.createdAt
                      ? convertTimestampToDate(
                          order.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50">
                <div className="text-sm text-green-700 font-medium flex items-center justify-between">
                  <span>Track Order</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Filter Dialog */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fullWidth={isMobile}
        fullScreen={isMobile}
        PaperProps={{
          style: {
            borderRadius: isMobile ? 0 : 8,
            margin: isMobile ? 0 : 24,
            maxWidth: isMobile ? "100%" : 500,
          },
        }}
      >
        <DialogContent>
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2">
            <h3 className="text-lg font-semibold">Filter by Status</h3>
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setFilterOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer ${
                  selectedStatus === option.value
                    ? "bg-green-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                {selectedStatus === option.value && (
                  <div className="w-4 h-4 rounded-full bg-green-700"></div>
                )}
              </div>
            ))}
          </div>

          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full py-3 bg-green-700 text-white rounded-lg font-medium"
              >
                Apply Filter
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;

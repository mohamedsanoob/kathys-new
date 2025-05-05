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

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "created", label: "Created" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const AllOrders = () => {
  const { currentUser } = useAuth();
  const [userOrders, setUserOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

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
  }, [filters, userOrders]);

  const applyFilters = () => {
    let result = [...userOrders];

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(
        (order) => order.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Amount range filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      result = result.filter((order) => order.items_total >= min);
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      result = result.filter((order) => order.items_total <= max);
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter((order) => {
        const orderDate = convertTimestampToDate(order.createdAt);
        return orderDate >= startDate;
      });
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include entire end day
      result = result.filter((order) => {
        const orderDate = convertTimestampToDate(order.createdAt);
        return orderDate <= endDate;
      });
    }

    setFilteredOrders(result);
  };


  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  const convertTimestampToDate = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <p className="text-lg font-medium">Showing all Orders</p>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 border border-gray-200 rounded-md py-1 px-4 cursor-pointer hover:bg-gray-50"
        >
          <Filter size={16} />
          FILTER
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-1">
            {userOrders.length === 0
              ? "You haven't placed any orders yet"
              : "No matching orders found"}
          </h3>
          <p className="text-sm text-gray-400">
            {userOrders.length === 0
              ? "Start shopping to see your orders here"
              : "Try adjusting your filters"}
          </p>
          {userOrders.length === 0 && (
            <Link
              href="/products"
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors"
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
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8)}...
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "shipped"
                        ? "bg-green-100 text-green-800"
                        : order.status === "delivered"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
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

              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                <div className="text-sm text-primary-600 font-medium flex items-center justify-between">
                  <span>Track Order</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <DialogContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filter Orders</h3>
            <X
              className="cursor-pointer"
              onClick={() => setFilterOpen(false)}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

      

            <div className="flex justify-end gap-2 pt-4">
           
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

   
    </div>
  );
};

export default AllOrders;

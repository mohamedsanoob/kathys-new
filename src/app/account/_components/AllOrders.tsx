"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/actions/actions";
import { X, Filter } from "lucide-react";
import { Dialog, DialogContent } from "@mui/material";

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
      result = result.filter(order => order.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Amount range filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      result = result.filter(order => order.items_total >= min);
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      result = result.filter(order => order.items_total <= max);
    }

    // Date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(order => {
        const orderDate = convertTimestampToDate(order.createdAt);
        return orderDate >= startDate;
      });
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Include entire end day
      result = result.filter(order => {
        const orderDate = convertTimestampToDate(order.createdAt);
        return orderDate <= endDate;
      });
    }

    setFilteredOrders(result);
  };

  const handleOrderClick = (order: OrderType) => {
    setSelectedOrder(order);
    setOrderOpen(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
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

  const convertTimestampToDate = (timestamp: { seconds: number; nanoseconds: number }) => {
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
        <div className="text-center text-gray-500 mt-10">
          {userOrders.length === 0 ? "No Orders Found" : "No orders match your filters"}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 w-full">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 flex flex-col gap-1 rounded-md p-4 w-full sm:w-[calc(50%-1rem)] cursor-pointer hover:shadow-md transition"
              onClick={() => handleOrderClick(order)}
            >
              <p className="text-md font-semibold">Order #{order.order_id}</p>
              <p className="text-sm text-gray-600">Total: ₹{order.items_total}</p>
              <p className="text-sm text-gray-600 capitalize">Status: {order.status}</p>
              <p className="text-xs text-gray-400">
                {order.createdAt ? convertTimestampToDate(order.createdAt).toLocaleString() : "Date unknown"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
        <DialogContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filter Orders</h3>
            <X className="cursor-pointer" onClick={() => setFilterOpen(false)} />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (₹)</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Minimum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (₹)</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Maximum"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={orderOpen} fullWidth onClose={() => setOrderOpen(false)}>
        <DialogContent>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Order Details</h3>
                <X className="cursor-pointer" onClick={() => setOrderOpen(false)} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <p><strong>Order ID:</strong> {selectedOrder.order_id}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedOrder.items_total}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.payment_mode}</p>
                  <p><strong>Order Date:</strong> {convertTimestampToDate(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer_details.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_details.mobile_number}</p>
                  <p><strong>Address:</strong> {selectedOrder.customer_details.address}</p>
                  <p><strong>City:</strong> {selectedOrder.customer_details.city}</p>
                  <p><strong>Pincode:</strong> {selectedOrder.customer_details.pincode}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="border rounded-md divide-y">
                  {selectedOrder.quantity_each.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        {Object.entries(item.variant_details).map(([key, value]) => (
                          <p key={key} className="text-sm text-gray-600">
                            {key}: {value}
                          </p>
                        ))}
                      </div>
                      <div className="text-right">
                        <p>₹{item.discounted_price} × {item.quantity}</p>
                        <p className="font-medium">₹{item.discounted_price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;
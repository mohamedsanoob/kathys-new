"use client";
import { useState } from "react";
import Image from "next/image";

type CartItem = {
  id: string;
  name: string;
  image: string;
  unitPrice: number;
  dateAdded: string;
  stockStatus: "In Stock" | "Out of Stock" | "Low Stock";
};

const WhishlistItems = () => {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Wireless Headphones Pro X",
      image:
        "https://dukaan.b-cdn.net/700x700/webp/media/65ac352c-b15e-4d1e-a8f2-c5bc3f0e04fb.jpeg",
      unitPrice: 99.99,
      dateAdded: "2023-05-15",
      stockStatus: "In Stock",
    },
    {
      id: "2",
      name: "Bluetooth Speaker 360",
      image:
        "https://dukaan.b-cdn.net/700x700/webp/media/65ac352c-b15e-4d1e-a8f2-c5bc3f0e04fb.jpeg",
      unitPrice: 59.95,
      dateAdded: "2023-05-10",
      stockStatus: "Low Stock",
    },
    {
      id: "3",
      name: "Smart Watch Series 5",
      image:
        "https://dukaan.b-cdn.net/700x700/webp/media/65ac352c-b15e-4d1e-a8f2-c5bc3f0e04fb.jpeg",
      unitPrice: 199.99,
      dateAdded: "2023-05-05",
      stockStatus: "Out of Stock",
    },
  ]);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleAllItems = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  const getStockStatusClass = (status: CartItem["stockStatus"]) => {
    switch (status) {
      case "In Stock":
        return "text-green-600";
      case "Out of Stock":
        return "text-red-600";
      case "Low Stock":
        return "text-yellow-600";
      default:
        return "";
    }
  };

  return (
    <div className="overflow-x-auto p-4 pb-20 md:pb-0">
      {/* Desktop Table (visible on md screens and up) */}
      <h2 className="text-2xl pb-4">Default wishlist</h2>
      <table className="hidden md:table min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <input
                type="checkbox"
                checked={
                  selectedItems.length === items.length && items.length > 0
                }
                onChange={toggleAllItems}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {/* Empty header for remove button column */}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Image
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Unit Price
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date Added
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Stock Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-xl font-bold"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {item.name}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex-shrink-0 h-10 w-10">
                  <Image
                    className="h-10 w-10  object-contain"
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                  />
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                ${item.unitPrice.toFixed(2)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.dateAdded).toLocaleDateString()}
              </td>
              <td
                className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${getStockStatusClass(
                  item.stockStatus
                )}`}
              >
                {item.stockStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards (visible on sm screens and down) */}
      <div className="md:hidden space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <input
              type="checkbox"
              checked={
                selectedItems.length === items.length && items.length > 0
              }
              onChange={toggleAllItems}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            <span className="text-sm text-gray-500">Select all items</span>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            <button className="bg-red-500 text-white p-2 rounded-xs">Add all to cart</button>
            <button className="bg-red-500 text-white p-2 rounded-xs">Add selected to cart</button>
          </div>
        </div>

        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                />
                <div className="flex-shrink-0 h-16 w-16">
                  <Image
                    className="h-16 w-16 object-contain"
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                  />
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 text-xl font-bold"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>

              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Price</p>
                  <p>${item.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Added</p>
                  <p>{new Date(item.dateAdded).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p
                    className={`font-medium ${getStockStatusClass(
                      item.stockStatus
                    )}`}
                  >
                    {item.stockStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhishlistItems;

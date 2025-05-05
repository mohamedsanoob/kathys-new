import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

interface CustomerDetails {
  name: string;
  email: string;
  mobile_number: string;
  address: string;
  locality_area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface VariantDetails {
  [key: string]: string; // Dynamic variant properties like Size, Color etc.
}

interface OrderItem {
  product_id: string;
  product_name: string;
  product_description: string;
  product_price: number;
  discounted_price: number;
  product_sku: string;
  quantity: number;
  images: string[];
  variant_details: VariantDetails;
}

interface TrackingInfo {
  shippedAt: Timestamp;
  trackingId: string;
  courier: string;
}

interface CodDetails {
  verification_required: boolean;
  verified: boolean;
  verification_date: Timestamp | null;
}

interface Order {
  id: string;
  orderDetails: {
    orderStatus: string;
    currency: string;
    amount: number;
  };
  status: string;
  inventory_updated: boolean;
  payment_status: string;
  payment_mode: string;
  items_total: number;
  delivery: number;
  tax_amount: number;
  coupon_discount: number;
  quantity_each: OrderItem[];
  customer_details: CustomerDetails;
  trackingInfo: TrackingInfo;
  cod_details: CodDetails;
  cartId: string;
  channel: string;
  additional_info: string;
  shippedBy: string;
  acceptedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  acceptedAt: Timestamp;
  timestamp: Timestamp;
}

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "orders"), where("id", "==", id))
    );

    if (querySnapshot.empty) return null; // order not found

    const doc = querySnapshot.docs[0];
    const orderData = doc.data() as Order; // Type assertion

    console.log(orderData, "order");

    return { ...orderData }; // Return the order with the document ID
  } catch (error) {
    console.error("Error fetching order:", error);
    return null; // Handle the error gracefully
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const categoriesQuery = query(
      collection(db, "orders") // Optional: sort by name
    );

    const querySnapshot = await getDocs(categoriesQuery);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

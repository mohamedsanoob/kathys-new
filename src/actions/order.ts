import { auth, db } from "@/firebase/config";
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
  [key: string]: string;
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

export interface Order {
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
  coupon_code?: string;
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
  userId?: string | null;
}

const normalizePhone = (value?: string | null) =>
  (value || "").replace(/\D/g, "").slice(-10);

/** True when the signed-in user owns this order (uid or phone). */
export const isOrderOwnedByCurrentUser = (order: Order | null): boolean => {
  if (!order) return false;
  const user = auth.currentUser;
  if (!user) return false;
  if (order.userId && order.userId === user.uid) return true;
  const orderPhone = normalizePhone(order.customer_details?.mobile_number);
  const userPhone = normalizePhone(user.phoneNumber);
  return Boolean(orderPhone && userPhone && orderPhone === userPhone);
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "orders"), where("id", "==", id))
    );

    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    return { ...(docSnap.data() as Order), id: docSnap.id };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

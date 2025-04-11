export interface VariantDetail {
  price: number;
  discountedPrice: number;
  inventory: number;
  combination: {
    name: string;
    value: string;
  }[];
  sku: string;
}

export interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails: VariantDetail;
}

export interface FormData {
  id?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  country: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  pinCode: string;
  mobileNumber: string;
  email: string;
  notes?: string;
  user_id?: string;
  is_default?: boolean;
  created_at?: any;
}

export interface RazorpayOptions {
  key: string;
  amount: string;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface OrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };
  error?: string;
  details?: any;
}

export interface PaymentSuccessResponse {
  msg: string;
}
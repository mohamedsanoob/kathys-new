"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getCartProducts,
  getBuyNowCartProducts,
  variantDetailsRecordFromCombination,
} from "@/actions/actions";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { auth, db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { computeDeliveryFee, isKeralaPincode } from "@/lib/deliveryFee";
import { useCartCoupon } from "@/hooks/useCartCoupon";
import { clearAppliedCoupon } from "@/lib/appliedCouponStorage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  FormData,
  CartProduct,
  // Removed Razorpay types
} from "@/types/checkout";
import OrderSummary from "./_components/orderSummary";
import BillingDetails from "./_components/BillingDetails";
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PaymentSuccess } from "../_components/PaymentSuccess";
import { PaymentRejected } from "../_components/PaymentRejected";
import PhoneAuthModal from "../_components/PhoneAuthModal";
import { readCampaignAttribution } from "../_components/CampaignAttribution";

// --- Define new type for PhonePe Order Response ---
interface PhonePeOrderResponse {
  success: boolean;
  paymentUrl: string;
  merchantOrderId: string;
  firestoreId: string;
}

// --- Remove Razorpay from window global type ---
declare global {
  interface Window {
    // Razorpay: ... (removed)
    recaptchaVerifier: any;
  }
}

const BASE_URL = "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api";
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const PENDING_PHONEPE_ORDER_KEY = "pendingPhonePeOrderId";

const normalizeIndianPhone = (value: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return last10 ? `+91${last10}` : "";
};

const PaymentLoader = () => (
  <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-opacity-30 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center w-[90%]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1e6553] mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Redirecting to Payment
      </h2>
      <p className="text-gray-600">
        Please wait, you are being redirected to our secure payment page...
      </p>
    </div>
  </div>
);

const CheckoutPageContent = () => {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";
  const { currentUser, loading: authLoading } = useAuth();
  const [cartProductsWithDetails, setCartProductsWithDetails] = useState<
    CartProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<FormData[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<
    string | null | undefined
  >(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isKerala, setIsKerala] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [paymentMode, setPaymentMode] = useState<"online" | "cod" | "cof" | "">(
    ""
  );
  const [showPaymentMode, setShowPaymentMode] = useState(false);
  const [paymentModeError, setPaymentModeError] = useState(false);

  // This state now controls the view
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed" | "no-items"
  >("pending");

  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    amount: number;
    paymentMethod: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onChange",
  });

  // --- NEW: Effect to handle payment status from URL ---
  useEffect(() => {
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const message = searchParams.get("message");
    const amount = searchParams.get("amount");

    if (status === "success" && orderId && amount) {
      setPaymentStatus("success");
      setOrderDetails({
        id: orderId,
        amount: Number(amount),
        paymentMethod: "PhonePe",
      });
      // Clear the cart *only* on success
      window.dispatchEvent(new Event("cart-remove-all"));
      localStorage.removeItem("guestCartId");
      clearAppliedCoupon();
      sessionStorage.removeItem(PENDING_PHONEPE_ORDER_KEY);
    } else if (status === "failed") {
      setPaymentStatus("failed");
      setPaymentError(message || "Your payment failed. Please try again.");
      setOrderDetails({
        id: orderId || "N/A",
        amount: Number(amount) || 0,
        paymentMethod: "PhonePe",
      });
      sessionStorage.removeItem(PENDING_PHONEPE_ORDER_KEY);
    }
  }, [searchParams]);

  // Restock immediately when the user returns via browser back (no PhonePe redirect)
  useEffect(() => {
    const releaseAbandonedOrder = async () => {
      const status = searchParams.get("status");
      if (status === "success") return;

      const pendingOrderId = sessionStorage.getItem(PENDING_PHONEPE_ORDER_KEY);
      if (!pendingOrderId) return;

      try {
        await axios.post(`${BASE_URL}/payment/release-order`, {
          merchantOrderId: pendingOrderId,
        });
      } catch (err) {
        console.error("Failed to release abandoned order:", err);
      } finally {
        sessionStorage.removeItem(PENDING_PHONEPE_ORDER_KEY);
      }
    };

    releaseAbandonedOrder();
    window.addEventListener("pageshow", releaseAbandonedOrder);
    return () => window.removeEventListener("pageshow", releaseAbandonedOrder);
  }, [searchParams]);

  // Effect to fetch cart details (also after login — guest vs user cart)
  useEffect(() => {
    if (authLoading) return;
    const fetchCartDetails = async () => {
      setIsLoading(true);
      try {
        const cartItems = isBuyNow
          ? await getBuyNowCartProducts()
          : await getCartProducts();
        setCartProductsWithDetails(cartItems.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch checkout cart details", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartDetails();
  }, [isBuyNow, authLoading, currentUser?.uid]);

  const fetchUserAddresses = useCallback(async (uid?: string) => {
    const userUid = auth.currentUser?.uid || uid;
    if (!userUid) {
      setSavedAddresses([]);
      setSelectedAddress(null);
      return;
    }
    try {
      const snapshot = await getDocs(
        collection(db, `users/${userUid}/addresses`)
      );
      const addresses = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FormData[];

      setSavedAddresses(addresses);
      const defaultAddress = addresses.find((addr) => addr.is_default);
      setSelectedAddress(
        defaultAddress ? defaultAddress.id : addresses[0]?.id || null
      );
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, []);

  // Load saved addresses when auth settles / uid changes
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser?.uid) {
      setSavedAddresses([]);
      setSelectedAddress(null);
      return;
    }
    let cancelled = false;
    (async () => {
      await fetchUserAddresses(currentUser.uid);
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, authLoading, fetchUserAddresses]);

  // Effect to watch pincode for delivery fee
  useEffect(() => {
    if (currentUser?.uid) {
      const address = savedAddresses.find(
        (addr) => addr.id === selectedAddress
      );
      setIsKerala(isKeralaPincode(address?.pinCode || ""));
    } else {
      setIsKerala(isKeralaPincode(watch("pinCode")));
    }
  }, [watch("pinCode"), currentUser, selectedAddress, savedAddresses]);

  const saveNewAddress = async (
    data: Omit<FormData, "id" | "created_at" | "user_id" | "is_default">
  ) => {
    try {
      if (!currentUser?.uid) return;
      const addressId = uuidv4();
      const newAddress: FormData = {
        ...data,
        id: addressId,
        user_id: currentUser.uid,
        is_default: savedAddresses.length === 0,
        created_at: serverTimestamp(),
      };

      const addressRef = doc(
        db,
        `users/${currentUser.uid}/addresses`,
        addressId
      );
      await setDoc(addressRef, newAddress);

      setSavedAddresses([...savedAddresses, newAddress]);
      setSelectedAddress(addressId);
      setShowAddressForm(false);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address. Please try again.");
    }
  };

  const total = cartProductsWithDetails.reduce((sum, product) => {
    const price =
      product?.variantDetails?.discountedPrice ||
      product?.variantDetails?.price ||
      product?.productDiscountedPrice ||
      product?.productPrice;
    return sum + price * product.quantity;
  }, 0);

  const cartCouponItems = (cartProductsWithDetails ?? []).map((p) => ({
    id: p.id,
    productPrice: p.productPrice,
    productDiscountedPrice:
      p.variantDetails?.discountedPrice ||
      p.variantDetails?.price ||
      p.productDiscountedPrice ||
      p.productPrice,
    quantity: p.quantity,
    categories: p.categories || [],
    variantDetails: p.variantDetails
      ? {
          price: p.variantDetails.price,
          discountedPrice:
            p.variantDetails.discountedPrice || p.variantDetails.price,
          sku: p.variantDetails.sku || "",
        }
      : undefined,
  }));

  const {
    couponInput,
    setCouponInput,
    appliedCoupon,
    couponStatus,
    couponMessage,
    handleApplyCoupon,
    handleRemoveCoupon,
    applyCouponByCode,
    couponDiscount,
    eligibleLineCount,
  } = useCartCoupon(cartCouponItems, !isLoading, currentUser?.uid);

  const deliveryFee = computeDeliveryFee({
    paymentMode,
    isKerala,
    eligibleLineCount,
    couponApplied: !!appliedCoupon,
  });
  const grandTotal = Math.max(0, total + deliveryFee - couponDiscount);

  const validateCheckout = () => {
    if (!termsAgreed) {
      setTermsError(true);
      return false;
    }
    if (currentUser) {
      if (!selectedAddress) {
        toast.error("Please select an address or add a new one");
        return false;
      }
    } else {
      if (!isValid) return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (paymentMode === "") {
      setShowPaymentMode(true);
      window.scrollTo(0, 0);
      setPaymentModeError(true);
      return;
    } else {
      setPaymentModeError(false);
    }
    if (!validateCheckout()) return;

    try {
      let orderData;
      if (currentUser) {
        const address = savedAddresses.find(
          (addr) => addr.id === selectedAddress
        );
        if (!address) throw new Error("Selected address not found");
        orderData = address;
      } else {
        orderData = getValues();
      }
      await onSubmit(orderData);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  // --- REFACTORED onSubmit ---
  const onSubmit = async (data: FormData) => {
    if (cartProductsWithDetails?.length === 0) {
      toast.error("No items in cart");
      setPaymentStatus("no-items");
      setPaymentError(
        "No items in cart. Please add items to your cart before proceeding."
      );
      return;
    }
    setIsProcessingPayment(true);

    try {
      const orderObject = {
        cartId: localStorage.getItem("guestCartId") || `cart_${Date.now()}`,
        payment_mode:
          paymentMode === "cof"
            ? "Collect from store"
            : paymentMode === "cod"
              ? "COD"
              : "PhonePe",
        items_total: grandTotal,
        delivery: deliveryFee,
        additional_info: data.notes || "",
        channel: "Web",
        orderStatus: "created",
        tax_amount: 0,
        quantity_each: cartProductsWithDetails.map((product) => ({
          images: product?.images,
          product_id: product.id,
          product_name: product.productName,
          product_price:
            product.variantDetails?.price ||
            product.productPrice,
          discounted_price:
            product.variantDetails?.discountedPrice ||
            product.variantDetails?.price ||
            product.productDiscountedPrice ||
            product.productPrice,
          quantity: product.quantity,
          product_sku: product.variantDetails?.sku,
          variant_details: variantDetailsRecordFromCombination(
            product.variantDetails?.combination
          ),
          product_description: "",
        })),
        customer_details: {
          name: `${data.firstName} ${data.lastName}`,
          name_lower: `${data.firstName} ${data.lastName}`.toLowerCase(),
          address:
            data.streetAddress1 +
            (data.streetAddress2 ? `, ${data.streetAddress2}` : ""),
          locality_area: data.city,
          landmark: "",
          city: data.city,
          state: data.state,
          pincode: data.pinCode,
          mobile_number: `+91${data.mobileNumber}`,
          email: data.email,
        },
        couponCode: appliedCoupon?.code || "",
        coupon_code: appliedCoupon?.code || "",
        coupon_discount: couponDiscount,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0,
        },
        orderDetails: {
          amount: grandTotal,
          currency: "INR",
        },
        marketing_attribution: readCampaignAttribution(),
      };

      // Ensure guest cart has phone metadata for abandoned-cart WhatsApp recovery.
      if (!currentUser) {
        const guestCartId = localStorage.getItem("guestCartId");
        const normalizedPhone = normalizeIndianPhone(data.mobileNumber || "");
        if (guestCartId && normalizedPhone) {
          const guestCartRef = doc(db, "guest-carts", guestCartId);
          await updateDoc(guestCartRef, {
            phone: normalizedPhone,
            mobileNumber: normalizedPhone,
            customerName: `${data.firstName} ${data.lastName}`.trim(),
            customer_details: {
              mobile_number: normalizedPhone,
              name: `${data.firstName} ${data.lastName}`.trim(),
              email: data.email || "",
            },
            updatedAt: serverTimestamp(),
          }).catch(async () => {
            await setDoc(
              guestCartRef,
              {
                phone: normalizedPhone,
                mobileNumber: normalizedPhone,
                customerName: `${data.firstName} ${data.lastName}`.trim(),
                customer_details: {
                  mobile_number: normalizedPhone,
                  name: `${data.firstName} ${data.lastName}`.trim(),
                  email: data.email || "",
                },
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
          });
        }
      }

      // --- COD logic ---
      if (paymentMode === "cod") {
        try {
          const response = await axios.post(`${BASE_URL}/payment/cod`, { // Assuming you have a /cod route
            orderData: orderObject,
            authenticatedId: currentUser ? currentUser?.uid : undefined,
          });

          setOrderDetails({
            id: response.data.orderId,
            amount: grandTotal,
            paymentMethod: "cash on delivery",
          });

          window.dispatchEvent(new Event("cart-remove-all"));
          localStorage.removeItem("guestCartId");
          clearAppliedCoupon();
          setIsProcessingPayment(false);
          setPaymentStatus("success");
          return;
        } catch (error: any) {
          console.error("COD order error:", error);
          setPaymentStatus("failed");
          setPaymentError(
            error.response?.data?.error || "Failed to place COD order. Please try again."
          );
          setIsProcessingPayment(false);
          return;
        }
      }

      // --- PHONEPE LOGIC ---
      const orderResponse = await axios.post<PhonePeOrderResponse>(
        `${BASE_URL}/payment/phonepe-orders`,
        {
          amount: grandTotal, // Send amount in Rupees
          orderData: orderObject,
          authenticatedId: currentUser ? currentUser?.uid : undefined,
        }
      );

      if (!orderResponse.data?.paymentUrl) {
        throw new Error("Failed to create payment link. Please try again.");
      }

      setOrderDetails({
        id: orderResponse.data.merchantOrderId,
        amount: grandTotal,
        paymentMethod: "PhonePe",
      });

      sessionStorage.setItem(
        PENDING_PHONEPE_ORDER_KEY,
        orderResponse.data.merchantOrderId
      );

      // Redirect user to PhonePe
      window.location.href = orderResponse.data.paymentUrl;

    } catch (error: any) {
      console.error("Checkout error:", error);
      setPaymentStatus("failed");
      setPaymentError(
        error.response?.data?.error ||
        error.message ||
        "Checkout failed. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  const handleOrderButtonClick = () => {
    if (showPaymentMode && paymentMode === "") {
      setPaymentModeError(true);
      return;
    }
    if (!termsAgreed) {
      setTermsError(true);
      return;
    }
    handlePlaceOrder();
  };

  const handlePhoneVerified = async (_phoneNumber: string, uid: string) => {
    setShowLogin(false);
    setShowAddressForm(false);
    // Token + addresses right away — don't wait for AuthContext / page refresh.
    try {
      await auth.currentUser?.getIdToken();
    } catch {
      /* ignore */
    }
    await fetchUserAddresses(uid || auth.currentUser?.uid);
  };

  // --- RENDER LOGIC ---
  // This now works because the new useEffect sets paymentStatus
  if (paymentStatus === "success" && orderDetails) {
    return (
      <PaymentSuccess
        orderId={orderDetails.id}
        amount={orderDetails.amount}
        paymentMethod={orderDetails.paymentMethod}
        onContinueShopping={() => (window.location.href = "/")}
        paymentMode={paymentMode || "online"}
      />
    );
  }

  if (paymentStatus === "failed") {
    return (
      <PaymentRejected
        errorMessage={paymentError || undefined}
        orderId={orderDetails?.id}
        onRetry={() => {
          // Send user back to a clean checkout page
          window.location.href = "/checkout";
        }}
      />
    );
  }

  if (paymentStatus === "no-items") {
    return (
      <PaymentRejected
        errorMessage={paymentError || undefined}
        orderId={orderDetails?.id}
        onRetry={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  // --- Default checkout form render ---
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[100vh]">
          <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
        </div>
      }
    >
      <div className="flex flex-col  bg-gray-50" style={{ height: "100%" }}>
        {isProcessingPayment && <PaymentLoader />}

        <div className="bg-white border-b border-gray-200 py-4 px-4 flex items-center">
          <Link href={`${showPaymentMode ? "#" : "/cart"}`}>
            <button
              style={{ cursor: "pointer" }}
              onClick={() => {
                setShowPaymentMode(false);
                setPaymentMode("");
              }}
              className="mr-4 flex items-center gap-1"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="ml-2 text-lg font-semibold">
                {showPaymentMode
                  ? "Choose Payment method"
                  : currentUser
                    ? "Choose address"
                    : "Add address"}
              </span>
            </button>
          </Link>
        </div>

        <div
          className="flex flex-col lg:flex-row lg:gap-8 gap-6 w-full px-4 md:px-8 lg:px-[6%] lg:pb-0 pb-6 pt-6"
          style={{ overflowY: "scroll" }}
        >
          <BillingDetails
            currentUser={currentUser}
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            savedAddresses={savedAddresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            showAddressForm={showAddressForm}
            setShowAddressForm={setShowAddressForm}
            register={register}
            errors={errors}
            isValid={isValid}
            saveNewAddress={saveNewAddress}
            handleSubmit={handleSubmit}
            getValues={getValues}
            setPaymentMode={setPaymentMode}
            paymentMode={paymentMode}
            showPaymentMode={showPaymentMode}
          />

          <OrderSummary
            cartProducts={cartProductsWithDetails}
            total={total}
            termsAgreed={termsAgreed}
            setTermsAgreed={setTermsAgreed}
            termsError={termsError}
            setTermsError={setTermsError}
            handlePlaceOrder={handleOrderButtonClick}
            isValid={isValid}
            currentUser={currentUser}
            selectedAddress={selectedAddress}
            paymentMode={paymentMode}
            showPaymentMode={showPaymentMode}
            setPaymentModeError={setPaymentModeError}
            paymentModeError={paymentModeError}
            showAddressForm={showAddressForm}
            isKerala={isKerala}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            appliedCoupon={appliedCoupon}
            couponStatus={couponStatus}
            couponMessage={couponMessage}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onSelectCoupon={applyCouponByCode}
          />
        </div>

        <PhoneAuthModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSuccess={handlePhoneVerified}
        />
        <div className=" bg-white border-t border-gray-200 py-3 px-4 md:hidden">
          <div className="container mx-auto flex md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left w-50">
              <p className="font-semibold">
                Total: ₹
                {Number(grandTotal).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <button
              onClick={handleOrderButtonClick}
              disabled={
                (currentUser
                  ? !selectedAddress || !termsAgreed || showAddressForm
                  : !isValid || !termsAgreed) || isProcessingPayment
              }
              className={`w-full py-3 rounded-md text-white font-semibold ${(
                currentUser
                  ? selectedAddress &&
                  termsAgreed &&
                  !showAddressForm &&
                  (!showPaymentMode || paymentMode)
                  : isValid &&
                  termsAgreed &&
                  (!showPaymentMode || paymentMode)
              )
                ? "bg-[#1e6553] hover:bg-[#1e6553]"
                : "bg-gray-400 cursor-not-allowed"
                } transition-colors`}
            >
              {isProcessingPayment
                ? "Processing..."
                : showPaymentMode
                  ? paymentMode
                    ? `Pay ₹${grandTotal.toFixed(2)}`
                    : "Select Payment Method"
                  : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

const CheckoutPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CheckoutPageContent />
  </Suspense>
);

export default CheckoutPage;

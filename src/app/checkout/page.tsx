"use client";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getCartProducts } from "@/actions/actions";
import axios from "axios";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  FormData,
  CartProduct,
  RazorpayResponse,
  OrderResponse,
  PaymentSuccessResponse,
  RazorpayOptions,
} from "@/types/checkout";
import OrderSummary from "./_components/orderSummary";
import BillingDetails from "./_components/BillingDetails";
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PaymentSuccess } from "../_components/PaymentSuccess";
import { PaymentRejected } from "../_components/PaymentRejected";
import PhoneAuthModal from "../_components/PhoneAuthModal";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
    recaptchaVerifier: any;
  }
}

const PaymentLoader = () => (
  <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-opacity-30 backdrop-blur-sm">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center w-[90%]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1e6553] mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Processing Payment
      </h2>
      <p className="text-gray-600">
        Please wait while we process your payment...
      </p>
    </div>
  </div>
);

const CheckoutPage = () => {
  const { currentUser } = useAuth();
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
  const [termsError, setTermsError] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [paymentMode, setPaymentMode] = useState<"online" | "cod" | "">("");
  const [showPaymentMode, setShowPaymentMode] = useState(false);
  const [paymentModeError, setPaymentModeError] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
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
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onChange",
  });

  useEffect(() => {
    const fetchCartDetails = async () => {
      setIsLoading(true);
      try {
        const cartItems = await getCartProducts();
        setCartProductsWithDetails(cartItems.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch checkout cart details", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartDetails();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserAddresses();
    }
  }, [currentUser]);

  const fetchUserAddresses = async () => {
    try {
      if (!currentUser?.uid) return;

      const addressesRef = collection(db, `users/${currentUser.uid}/addresses`);
      const snapshot = await getDocs(addressesRef);
      const addresses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FormData[];

      setSavedAddresses(addresses);
      const defaultAddress = addresses.find((addr) => addr.is_default);
      setSelectedAddress(
        defaultAddress ? defaultAddress.id : addresses[0]?.id || null
      );
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

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
    const price = product.productDiscountedPrice || product.productPrice;
    return sum + price * product.quantity;
  }, 0);

  const deliveryFee = paymentMode === "cod" ? 150 : 75;
  const grandTotal = total + deliveryFee;

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

  const onSubmit = async (data: FormData) => {
    setIsProcessingPayment(true);

    try {
      const orderObject = {
        cartId: localStorage.getItem("guestCartId") || `cart_${Date.now()}`,
        payment_mode: paymentMode === "cod" ? "COD" : "Razorpay",
        items_total: grandTotal,
        delivery: paymentMode === "cod" ? 150 : 75,
        additional_info: data.notes || "",
        channel: "Web",
        orderStatus: "created",
        tax_amount: 0,
        quantity_each: cartProductsWithDetails.map((product) => ({
          images: product?.images,
          product_id: product.id,
          product_name: product.productName,
          product_price: product.productPrice,
          discounted_price:
            product.productDiscountedPrice || product.productPrice,
          quantity: product.quantity,
          product_sku: product.variantDetails?.sku,
          variant_details:
            product.variantDetails?.combination?.reduce((acc, curr) => {
              acc[curr.name] = curr.value;
              return acc;
            }, {} as Record<string, string>) || {},
          product_description: "",
        })),
        customer_details: {
          name: `${data.firstName} ${data.lastName}`,
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
        coupon_discount: 0,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0,
        },
        orderDetails: {
          amount: grandTotal,
          currency: "INR",
        },
      };

      if (paymentMode === "cod") {
        try {
          const response = await axios.post(
            "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api/payment/cod",
            {
              orderData: orderObject,
              authenticatedId: currentUser ? currentUser?.uid : undefined,
            }
          );

     

          setOrderDetails({
            id: response.data.orderId,
            amount: grandTotal,
            paymentMethod: "cash on delivery",
          });

          window.dispatchEvent(new Event("cart-remove-all"));
          localStorage.removeItem("guestCartId");
          setIsProcessingPayment(false);
          setPaymentStatus("success");
          return;
        } catch (error: any) {
          console.error("COD order error:", error);
          setPaymentStatus("failed");
          setPaymentError(
            error.response?.data?.error ||
              "Failed to place COD order. Please try again."
          );
          setIsProcessingPayment(false);
          return;
        }
      }

      const razorpayLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!razorpayLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }



      const orderResponse = await axios.post<OrderResponse>(
        "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api/payment/orders",
        {
          amount: grandTotal,
          currency: "INR",
          orderData: orderObject,
          authenticatedId: currentUser ? currentUser?.uid : undefined,
        }
      );

      if (!orderResponse.data?.order) {
        throw new Error("Failed to create payment order");
      }

      const { id: order_id, currency } = orderResponse.data.order;

      setOrderDetails({
        id: order_id,
        amount: grandTotal,
        paymentMethod: "razorpay",
      });

      const paymentOptions: RazorpayOptions = {
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_N6VzhsIMdUpe3s",
        amount: grandTotal.toString(),
        currency,
        name: "Kathy's Clothing Store",
        description: "Order Payment",
        order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            window.dispatchEvent(new Event("cart-remove-all"));
            setIsProcessingPayment(true);
            const verificationResponse =
              await axios.post<PaymentSuccessResponse>(
                "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api/payment/success",
                {
                  orderCreationId: order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  orderData: orderObject,
                  authenticatedId: currentUser ? currentUser?.uid : undefined,
                }
              );

            setOrderDetails({
              id: verificationResponse.data.orderId,
              amount: grandTotal,
              paymentMethod: "razorpay",
            });
            setPaymentStatus("success");
            localStorage.removeItem("guestCartId");
          } catch (error) {
            console.error("Payment verification failed:", error);
            setPaymentStatus("failed");
            setPaymentError(
              "Payment verification failed. Please contact support."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.mobileNumber,
        },
        notes: {
          address: orderObject.customer_details.address,
          orderId: order_id,
        },
        theme: {
          color: "#1e6b5d",
        },
        modal: {
          ondismiss: async () => {
            try {
              setIsProcessingPayment(true);
              await axios.post(
                "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api/payment/cancel",
                {
                  orderId: order_id,
                  authenticatedId: currentUser ? currentUser?.uid : undefined,
                  reason: "User closed payment window",
                }
              );
              setPaymentStatus("failed");
              setPaymentError("Payment was cancelled. Please try again.");
              setIsProcessingPayment(false);
            } catch (cancelError) {
              setIsProcessingPayment(false);
              setPaymentStatus("failed");
              setPaymentError(
                "Payment was cancelled but there was an error updating your order."
              );
            }
          },
        },
      };

      const paymentObject = new window.Razorpay(paymentOptions);
      paymentObject.open();
      setIsProcessingPayment(false);
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

  const handlePhoneVerified = (phoneNumber: string) => {
    console.log("Verified phone number:", phoneNumber);
  };

  if (paymentStatus === "success" && orderDetails) {
    return (
      <PaymentSuccess
        orderId={orderDetails.id}
        amount={orderDetails.amount}
        paymentMethod={orderDetails.paymentMethod}
        onContinueShopping={() => (window.location.href = "/")}
        paymentMode={paymentMode}
      />
    );
  }

  if (paymentStatus === "failed") {
    return (
      <PaymentRejected
        errorMessage={paymentError || undefined}
        orderId={orderDetails?.id}
        onRetry={() => {
          setPaymentStatus("pending");
          setPaymentError(null);
        }}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[100vh]">
          <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
        </div>
      }
    >
      <div
        className="flex flex-col  bg-gray-50"
        style={{ height: "100%" }}
      >
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
  Total: ₹{Number(grandTotal).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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
              className={`w-full py-3 rounded-md text-white font-semibold ${
                (
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

export default CheckoutPage;

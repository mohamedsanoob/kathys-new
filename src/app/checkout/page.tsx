"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getCartProducts, getProductById } from "@/actions/actions";
import Navbar from "@/app/_components/Navbar";
import axios from "axios";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { FormData, CartProduct, RazorpayResponse, OrderResponse, PaymentSuccessResponse, RazorpayOptions } from "@/types/checkout";
import OrderSummary from "./_components/orderSummary";
import BillingDetails from "./_components/BillingDetails";
import PhoneAuthModal from "./_components/PhoneAuthModel";
import { toast } from "react-toastify";


declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
    recaptchaVerifier: any;
  }
}

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const [cartProductsWithDetails, setCartProductsWithDetails] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<FormData[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null | undefined>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

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
      const addresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FormData[];

      setSavedAddresses(addresses);
      const defaultAddress  = addresses.find(addr => addr.is_default);
      setSelectedAddress(defaultAddress ? defaultAddress.id : addresses[0]?.id || null);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const saveNewAddress = async (data: Omit<FormData, 'id' | 'created_at' | 'user_id' | 'is_default'>) => {
    try {
      if (!currentUser?.uid) return;

      const addressId = uuidv4();
      const newAddress: FormData = {
        ...data,
        id: addressId,
        user_id: currentUser.uid,
        is_default: savedAddresses.length === 0,
        created_at: serverTimestamp()
      };

      const addressRef = doc(db, `users/${currentUser.uid}/addresses`, addressId);
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

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePhoneAuth = async () => {
    try {
      setIsSendingOTP(true);
      const formattedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible', callback: () => {} },
      );

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setIsOTPSent(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("OTP Error:", error);
      toast.error(`Failed to send OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setIsVerifying(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const generateUserId = () => {
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          return Array.from({ length: 5 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        };

        const user_id = generateUserId();

        await setDoc(userDocRef, {
          id: user.uid,
          user_id,
          phone: user.phoneNumber || `+91${phoneNumber}`,
          preferences: {
            language: "en",
            marketingOptIn: true,
            currency: "INR"
          },
          account_status: "active",
          email: "",
          created_at: serverTimestamp()
        });
      }

      toast.success("Phone number verified successfully!");
      setShowLogin(false);
      setValue("mobileNumber", phoneNumber);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
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
    if (!validateCheckout()) return;

    try {
      let orderData;

      if (currentUser) {
        const address = savedAddresses.find(addr => addr.id === selectedAddress);
        if (!address) throw new Error("Selected address not found");
        orderData = address;
      } else {
        orderData = getValues();
      }

      await onSubmit(orderData);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error( "Checkout failed. Please try again.");
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const orderObject = {
        cartId: localStorage.getItem("guestCartId") || `cart_${Date.now()}`,
        payment_mode: "Razorpay",
        items_total: total,
        additional_info: data.notes || "",
        channel: "Web",
        delivery: 0,
        orderStatus: "created",
        tax_amount: 0,
        quantity_each: cartProductsWithDetails.map(product => ({
          product_id: product.id,
          product_name: product.productName,
          product_price: product.productPrice,
          discounted_price: product.productDiscountedPrice || product.productPrice,
          quantity: product.quantity,
          product_sku: product.variantDetails.sku,
          variant_details: product.variantDetails.combination.reduce((acc, curr) => {
            acc[curr.name] = curr.value;
            return acc;
          }, {} as Record<string, string>),
          product_description: ""
        })),
        customer_details: {
          name: `${data.firstName} ${data.lastName}`,
          address: data.streetAddress1 + (data.streetAddress2 ? `, ${data.streetAddress2}` : ''),
          locality_area: data.city,
          landmark: "",
          city: data.city,
          state: data.state,
          pincode: data.pinCode,
          mobile_number: `+91${data.mobileNumber}`,
          email: data.email
        },
        coupon_discount: 0,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        },
        orderDetails: {
          amount: total,
          currency: "INR"
        }
      };

      const razorpayLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!razorpayLoaded) throw new Error("Razorpay SDK failed to load");

      const orderResponse = await axios.post<OrderResponse>("http://localhost:4000/payment/orders", {
        amount: total,
        currency: "INR",
        orderData: orderObject
      });

      if (!orderResponse.data?.order) throw new Error("Failed to create payment order");

      const { id: order_id, currency } = orderResponse.data.order;

      const paymentOptions: RazorpayOptions = {
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_N6VzhsIMdUpe3s",
        amount: (total * 100).toString(),
        currency,
        name: "Your Store Name",
        description: "Order Payment",
        image: "/logo.png",
        order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            const verificationResponse = await axios.post<PaymentSuccessResponse>(
              "http://localhost:4000/payment/success",
              {
                orderCreationId: order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                orderData: orderObject
              }
            );
            toast.success(verificationResponse.data.msg || "Payment successful!");
            localStorage.removeItem("guestCartId");
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.mobileNumber,
        },
        notes: {
          address: orderObject.customer_details.address,
          orderId: order_id
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: async () => {
            try {
              await axios.post("http://localhost:4000/payment/cancel", {
                orderId: order_id,
                reason: "User closed payment window"
              });
              toast.warn("Payment cancelled. Your order has been marked as cancelled.");
            } catch (cancelError) {
              console.error("Order cancellation error:", cancelError);
              toast.error("Payment was cancelled but there was an error updating your order.");
            }
          }
        }
      };

      const paymentObject = new window.Razorpay(paymentOptions);
      paymentObject.open();

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.error || error.message || "Checkout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ position: "relative", height: "100vh" }}>
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-8 w-full px-4 md:px-8 lg:px-[6.5%] pb-15 lg:pb-0 overflow-y-auto lg:overflow-y-visible lg:pt-[7%] pt-[20%]" style={{ height: "100vh" }}>
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
        />

        <OrderSummary
          cartProducts={cartProductsWithDetails}
          total={total}
          termsAgreed={termsAgreed}
          setTermsAgreed={setTermsAgreed}
          termsError={termsError}
          setTermsError={setTermsError}
          handlePlaceOrder={handlePlaceOrder}
          isValid={isValid}
          currentUser={currentUser}
          selectedAddress={selectedAddress}
        />
      </div>

      <PhoneAuthModal
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        isOTPSent={isOTPSent}
        setIsOTPSent={setIsOTPSent}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        otp={otp}
        setOtp={setOtp}
        handlePhoneAuth={handlePhoneAuth}
        verifyOTP={verifyOTP}
        isSendingOTP={isSendingOTP}
        isVerifying={isVerifying}
      />

      <div id="recaptcha-container" className="hidden"></div>
 
    </div>
  );
};

export default CheckoutPage;

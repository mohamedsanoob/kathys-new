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


interface VariantDetail {
  price: number;
  discountedPrice: number;
  inventory: number;
  combination: {
    name: string;
    value: string;
  }[];
  sku: string;
}

interface CartProduct {
  id: string;
  images: string[];
  productName: string;
  productPrice: number;
  productDiscountedPrice?: number;
  quantity: number;
  variantDetails: VariantDetail;
}

interface FormData {
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
  
}

interface RazorpayOptions {
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

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface OrderResponse {
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

interface PaymentSuccessResponse {
  msg: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const CheckoutPage = () => {
      const { currentUser } = useAuth()
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
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [termsError, setTermsError] = useState(""); 
  const [termsAgreed, setTermsAgreed] = useState(false);




    const validateCheckout = () => {
    if (!termsAgreed) {
      setTermsError("You must agree to the terms and conditions");
      return false;
    }

    if (currentUser) {
      if (!selectedAddress) {
        alert("Please select an address or add a new one");
        return false;
      }
    } else {
      // For guest checkout, we need to validate the form
      if (!isValid) {
        // This will automatically show form errors
        return false;
      }
    }

    return true;
  };

    const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onChange",

  });



  const handlePlaceOrder = async () => {
    if (!validateCheckout()) return;

    try {
      let orderData;
      
      if (currentUser) {
        // Use selected address for logged-in user
        const address = savedAddresses.find(addr => addr.id === selectedAddress);
        if (!address) throw new Error("Selected address not found");
        
        orderData = {
          ...address,
          // Add other necessary fields
        };
      } else {
        // For guest checkout, use form data
        orderData = getValues();
      }

      // Proceed with payment
      await onSubmit(orderData);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Checkout failed. Please try again.");
    }
  };

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
      // Set default address if available
      const defaultAddress = addresses.find(addr => addr.is_default);
      setSelectedAddress(defaultAddress ? defaultAddress.id : addresses[0]?.id || null);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const saveNewAddress = async (data: Omit<FormData, 'id' | 'created_at' | 'user_id' | 'address_id' | 'is_default'>) => {
    try {
      if (!currentUser?.uid) return;
      
      const addressId = uuidv4();
      const newAddress: FormData = {
        ...data,
        id: addressId,
        user_id: currentUser.uid,
        is_default: savedAddresses.length === 0, // Set as default if first address
        created_at: serverTimestamp()
      };

      const addressRef = doc(db, `users/${currentUser.uid}/addresses`, addressId);
      await setDoc(addressRef, newAddress);
      
      setSavedAddresses([...savedAddresses, newAddress]);
      setSelectedAddress(addressId);
      setShowAddressForm(false);
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    }
  };
  

  console.log(currentUser,"===========>User")

  useEffect(() => {
    const fetchCartDetails = async () => {
      setIsLoading(true);
      try {
        const cartItems = await getCartProducts();
        const detailedItems = await Promise.all(
          cartItems.map(async (item: any) => {
            const product = await getProductById(item.id);
            if (product) {
              return {
                ...product,
                quantity: item.quantity,
                variantDetails: item.variantDetails,
              };
            }
            return null;
          })
        );
        setCartProductsWithDetails(detailedItems.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch checkout cart details", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartDetails();
  }, []);

  const total = cartProductsWithDetails.reduce((sum, product) => {
    const price = product.productDiscountedPrice || product.productPrice;
    return sum + price * product.quantity;
  }, 0);

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
const handlePhoneAuth = async () => {
  try {
    setIsSendingOTP(true);
    const formattedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;
    
    // Clear previous recaptcha
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    // Initialize recaptcha
    window.recaptchaVerifier = new RecaptchaVerifier(
         auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {}
      },
     
    );


    console.log(   window.recaptchaVerifier,"---hhh")

    const confirmation = await signInWithPhoneNumber(
      auth,
      formattedPhone,
      window.recaptchaVerifier
    );

    setConfirmationResult(confirmation);
    setIsOTPSent(true);
    alert("OTP sent successfully!");
  } catch (error) {
    console.error("OTP Error:", error);
    alert(`Failed to send OTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Reset on error
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
    
    // Check if user document exists
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Generate a random 5-character lowercase user_id
      const generateUserId = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const user_id = generateUserId();

      // Create new user document
      await setDoc(userDocRef, {
        id: user.uid, // Original Firebase UID
        user_id: user_id, // 5-character lowercase ID
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
      
      console.log("New user document created with user_id:", user_id);
    }

    alert("Phone number verified successfully!");
    setShowLogin(false);
    setValue("mobileNumber", phoneNumber);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    alert("Invalid OTP. Please try again.");
  } finally {
    setIsVerifying(false);
  }
};

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    
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
      if (!razorpayLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const orderResponse = await axios.post<OrderResponse>("http://localhost:4000/payment/orders", {
        amount: total,
        currency: "INR",
        orderData: orderObject
      });

      if (!orderResponse.data?.order) {
        throw new Error("Failed to create payment order");
      }

      const { id: order_id, currency } = orderResponse.data.order;

      const paymentOptions: RazorpayOptions = {
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_N6VzhsIMdUpe3s",
        amount: (total * 100).toString(),
        currency: currency,
        name: "Your Store Name",
        description: "Order Payment",
        image: "/logo.png",
        order_id: order_id,
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
            alert(verificationResponse.data.msg || "Payment successful!");
            localStorage.removeItem("guestCartId");
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
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
              const cancelResponse = await axios.post(
                "http://localhost:4000/payment/cancel",
                {
                  orderId: order_id,
                  reason: "User closed payment window"
                }
              );
              
              if (cancelResponse.data.success) {
                alert("Payment cancelled. Your order has been marked as cancelled.");
              } else {
                alert("Payment was cancelled but we couldn't update your order status.");
              }
            } catch (cancelError) {
              console.error("Order cancellation error:", cancelError);
              alert("Payment was cancelled but there was an error updating your order.");
            }
          }
        }
      };

      const paymentObject = new window.Razorpay(paymentOptions);
      paymentObject.open();

    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.error || error.message || "Checkout failed. Please try again.");
    }
  };

  return (
    <div>
        <div id="recaptcha-container" style={{display:"none"}}></div>
      <Navbar />
      <div className="flex gap-10 w-[85%] mx-auto my-20">
        <div className="w-[65%]">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
 <h5 className="font-semibold text-lg">Billing details</h5>
 {!currentUser?.uid &&  <div  onClick={() => setShowLogin(true) } style={{cursor:"pointer"}}>Already a user? sign In</div>}
 
            </div>

   {currentUser ? (
            <div className="mt-5">
              {!showAddressForm ? (
                <>
                  <div className="mb-4">
                    <h6 className="font-medium mb-2">Saved Addresses</h6>
                    {savedAddresses.length === 0 ? (
                      <p>No saved addresses found.</p>
                    ) : (
                      <div className="space-y-3">
                        {savedAddresses.map((address) => (
                          <div 
                            key={address.id}
                            className={`p-4 border rounded cursor-pointer ${selectedAddress === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                            onClick={() => setSelectedAddress(address.id)}
                          >
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{address.firstName} {address.lastName}</p>
                                <p>{address.streetAddress1}{address.streetAddress2 && `, ${address.streetAddress2}`}</p>
                                <p>{address.city}, {address.state} - {address.pinCode}</p>
                                <p>Phone: {address.mobileNumber}</p>
                                <p>Email: {address.email}</p>
                              </div>
                              {selectedAddress === address.id && (
                                <span className="text-blue-500">✓ Selected</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    + Add New Address
                  </button>
                </>
              ) : (
                <div className="mt-5">
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    ← Back to Saved Addresses
                  </button>
                  <AddressForm 
                    register={register}
                    errors={errors}
                    onSubmit={handleSubmit(saveNewAddress)}
                  />
                </div>
              )}
            </div>
          ) : (
            
         
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5 w-full mt-5">
            <div className="w-full">
              <h6 className="text-black text-sm">First name *</h6>
              <input
                className={`w-full h-10 border ${errors.firstName ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("firstName", { required: "First name is required" })}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Last name *</h6>
              <input
                className={`w-full h-10 border ${errors.lastName ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Company name (Optional)</h6>
              <input
                className="w-full h-10 border border-gray-300 mt-1.25 px-3.75 py-2"
                {...register("companyName")}
              />
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Country / Region *</h6>
              <input
                className={`w-full h-10 border ${errors.country ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("country", { required: "Country is required" })}
              />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Street address *</h6>
              <input
                className={`w-full h-10 border ${errors.streetAddress1 ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                placeholder="House number and street name"
                {...register("streetAddress1", { required: "Street address is required" })}
              />
              {errors.streetAddress1 && <p className="text-red-500 text-xs mt-1">{errors.streetAddress1.message}</p>}
              <input
                className="w-full h-10 border border-gray-300 mt-5 px-3.75 py-2"
                placeholder="Apartment, suite, unit, etc. (Optional)"
                {...register("streetAddress2")}
              />
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Town / City *</h6>
              <input
                className={`w-full h-10 border ${errors.city ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("city", { required: "City is required" })}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">State *</h6>
              <input
                className={`w-full h-10 border ${errors.state ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("state", { required: "State is required" })}
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">PIN Code *</h6>
              <input
                className={`w-full h-10 border ${errors.pinCode ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("pinCode", {
                  required: "PIN Code is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "PIN Code must be 6 digits",
                  },
                })}
              />
              {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Mobile Number *</h6>
              <div className={`flex items-center w-full border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"} mt-1.25 pl-3.75 bg-white`}>
                <span className="font-medium text-gray-600 mr-2">+91</span>
                <input
                  className="flex-1 border-none outline-none h-10 py-2 px-0 pl-3.75 text-inherit"
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                />
              </div>
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Email *</h6>
              <input
                className={`w-full h-10 border ${errors.email ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Optional notes(optional)</h6>
              <textarea
                className="w-full border border-gray-300 mt-1.25 px-3.75 py-2 min-h-[100px] resize-y font-inherit text-inherit"
                placeholder="Notes about your order, e.g. special notes for delivery"
                {...register("notes")}
              />
            </div>
          </form>  )}
        </div>
        <div className="w-[35%] h-max p-5 flex flex-col gap-5 shadow-[5px_5px_0_#f8f8f8] border border-gray-200">
          <div className="w-full flex flex-col p-5">
            <h6 className="font-medium text-lg mb-4.5">Your order</h6>
            <table>
              <thead className="border-b border-gray-300 h-10">
                <tr className="w-full pb-5">
                  <th className="text-start text-sm">Product</th>
                  <th className="text-end text-sm">Subtotal</th>
                </tr>
              </thead>
            </table>
            <table className="border-separate border-spacing-y-2.5">
              <tbody>
                {cartProductsWithDetails.map((product, index) => (
                  <tr key={index}>
                    <td className="text-start w-[50%] text-sm">
                      {product.productName} -{" "}
                      {product.variantDetails.combination.map((c) => c.value).join(", ")} × {product.quantity}
                    </td>
                    <td className="text-end text-base">
                      ₹{" "}
                      {(
                        (product.productDiscountedPrice || product.productPrice) * product.quantity
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                <tr className="h-12">
                  <td className="text-start w-[50%] text-sm font-semibold border-t border-b border-gray-300 py-2">
                    Subtotal
                  </td>
                  <td className="text-end text-base border-t border-b border-gray-300 py-2">
                    ₹ {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="text-start w-[50%] text-sm font-semibold border-b border-gray-300 py-2">
                    Total
                  </td>
                  <td className="text-end text-xl font-semibold border-b border-gray-300 py-2">
                    ₹ {total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
            <h6 className="font-semibold text-center mt-2.5">UPI/Credit card/Debit Card/Net banking</h6>
            <h4 className="text-center text-xl mt-2.5">Pay By Razorpay</h4>
            <h6 className="mt-5 text-sm text-gray-500">Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy</h6>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="termsAgreed"
                checked={termsAgreed}
                onChange={(e) => {
                  setTermsAgreed(e.target.checked);
                  if (e.target.checked) setTermsError("");
                }}
                className="h-4 w-4"
              />
              <label htmlFor="termsAgreed" className="text-sm">
                I have read and agree to the website{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  terms and conditions
                </a>
                *
              </label>
            </div>
           {termsError && <p className="text-red-500 text-xs mt-1">{termsError}</p>}
            <button
              type="submit"
             onClick={handlePlaceOrder}
              className={`h-12 ${isValid && termsAgreed ? "bg-red-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white font-semibold mt-4.5`}
        disabled={
                currentUser 
                  ? !selectedAddress || !termsAgreed 
                  : !isValid || !termsAgreed
              }
            >
              Place order
            </button>
       
          </div>
        </div>
      </div>

      {/* OTP Login Modal */}
      {showLogin && (
<div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"   style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Login with OTP</h3>
            
            {!isOTPSent ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div id="recaptcha-container"></div>
                <button
                  onClick={handlePhoneAuth}
                  disabled={isSendingOTP}
                  className={`w-full ${isSendingOTP ? 'bg-gray-400' : 'bg-blue-600'} text-white py-2 rounded hover:bg-blue-700`}
                >
                  {isSendingOTP ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
                <button
                  onClick={verifyOTP}
                  disabled={isVerifying}
                  className={`w-full ${isVerifying ? 'bg-gray-400' : 'bg-blue-600'} text-white py-2 rounded hover:bg-blue-700`}
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}
            
            <button
              onClick={() => {
                setShowLogin(false);
                setIsOTPSent(false);
                setPhoneNumber("");
                setOtp("");
              }}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AddressForm = ({ register, errors, onSubmit }: {
  register: any,
  errors: any,
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5 w-full">
      <div className="w-full">
        <h6 className="text-black text-sm">First name *</h6>
        <input
          className={`w-full h-10 border ${errors.firstName ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
          {...register("firstName", { required: "First name is required" })}
        />
        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
      </div>
    <div className="w-full">
              <h6 className="text-black text-sm">Last name *</h6>
              <input
                className={`w-full h-10 border ${errors.lastName ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Company name (Optional)</h6>
              <input
                className="w-full h-10 border border-gray-300 mt-1.25 px-3.75 py-2"
                {...register("companyName")}
              />
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Country / Region *</h6>
              <input
                className={`w-full h-10 border ${errors.country ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("country", { required: "Country is required" })}
              />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Street address *</h6>
              <input
                className={`w-full h-10 border ${errors.streetAddress1 ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                placeholder="House number and street name"
                {...register("streetAddress1", { required: "Street address is required" })}
              />
              {errors.streetAddress1 && <p className="text-red-500 text-xs mt-1">{errors.streetAddress1.message}</p>}
              <input
                className="w-full h-10 border border-gray-300 mt-5 px-3.75 py-2"
                placeholder="Apartment, suite, unit, etc. (Optional)"
                {...register("streetAddress2")}
              />
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Town / City *</h6>
              <input
                className={`w-full h-10 border ${errors.city ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("city", { required: "City is required" })}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">State *</h6>
              <input
                className={`w-full h-10 border ${errors.state ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("state", { required: "State is required" })}
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">PIN Code *</h6>
              <input
                className={`w-full h-10 border ${errors.pinCode ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("pinCode", {
                  required: "PIN Code is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "PIN Code must be 6 digits",
                  },
                })}
              />
              {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Mobile Number *</h6>
              <div className={`flex items-center w-full border ${errors.mobileNumber ? "border-red-500" : "border-gray-300"} mt-1.25 pl-3.75 bg-white`}>
                <span className="font-medium text-gray-600 mr-2">+91</span>
                <input
                  className="flex-1 border-none outline-none h-10 py-2 px-0 pl-3.75 text-inherit"
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                />
              </div>
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Email *</h6>
              <input
                className={`w-full h-10 border ${errors.email ? "border-red-500" : "border-gray-300"} mt-1.25 px-3.75 py-2`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="w-full">
              <h6 className="text-black text-sm">Optional notes(optional)</h6>
              <textarea
                className="w-full border border-gray-300 mt-1.25 px-3.75 py-2 min-h-[100px] resize-y font-inherit text-inherit"
                placeholder="Notes about your order, e.g. special notes for delivery"
                {...register("notes")}
              />
            </div>
      
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Address
      </button>
    </form>
  );
};

export default CheckoutPage;
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OtpInput from "react-otp-input";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import axios from "axios";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneNumber: string) => void;
}

const generateUserId = () =>
  Array.from({ length: 5 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
      Math.floor(Math.random() * 36)
    )
  ).join("");

const PhoneAuthModal = ({
  isOpen,
  onClose,
  onSuccess,
}: PhoneAuthModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://asia-south1-resmenu-c1b90.cloudfunctions.net/api";

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOTPSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [isOTPSent, timer]);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isOTPSent) {
      setupRecaptcha();
    }
  }, [isOpen]);

  const setupRecaptcha = () => {
    console.log(auth, "-jbkjb");
    if (!recaptchaContainerRef.current) {
      toast.error("reCAPTCHA container not found. Please try again.");
      return;
    }
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        {
          size: "invisible",
          callback: () => {},
          "expired-callback": () => {
            toast.warn("reCAPTCHA expired. Please try again.");
          },
        }
      );
    }
  };

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    try {
      setIsSendingOTP(true);
      const formattedPhone = `+91${phoneNumber}`;
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error("reCAPTCHA verification failed. Please try again.");
      }
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      setConfirmationResult(result);
      setIsOTPSent(true);
      setTimer(60);
      setCanResend(false);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(`Failed to send OTP: ${error.message}`);
      cleanup();
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult) return;

    try {
      setIsVerifying(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const user_id = generateUserId();

        await setDoc(userDocRef, {
          id: user.uid,
          user_id,
          phone: user.phoneNumber,
          preferences: {
            language: "en",
            marketingOptIn: false,
            currency: "INR",
          },
          account_status: "active",
          email: "",
          created_at: serverTimestamp(),
        });
      }

      try {
        const idToken = await user.getIdToken();
        const phone = user.phoneNumber || "";
        const digits = phone.replace(/\D/g, "");
        const last10 = digits.slice(-10);
        await axios.post(
          `${baseUrl}/orders/migrate-orders`,
          {
            phoneNumber: phone,
            phoneLast10: last10,
            uid: user.uid,
          },
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
      } catch (migrateErr) {
        console.warn("Order migration skipped/failed:", migrateErr);
      }

      toast.success("Phone number verified successfully!");
      onSuccess(user.phoneNumber!);
      handleClose();
    } catch (error: unknown) {
      console.error("OTP Verification Error:", error);
      let errorMessage = "Invalid OTP. Please try again.";
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-verification-code") {
          errorMessage = "Invalid OTP. Please enter the correct code.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage = "Too many attempts. Please try again later.";
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    setOtp("");
    setTimer(60);
    setCanResend(false);
    handleSendOTP();
    toast.info("OTP resent successfully");
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const cleanup = () => {
    setPhoneNumber("");
    setOtp("");
    setIsOTPSent(false);
    setConfirmationResult(null);
    setTimer(60);
    setCanResend(false);

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = "";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center mt-2">
              Login with OTP
            </h3>

            {!isOTPSent ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="flex-1 block px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none"
                      placeholder="Enter your phone number"
                      aria-label="Phone number"
                    />
                  </div>
                </div>

                <div ref={recaptchaContainerRef} id="recaptcha-container" />

                <button
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || phoneNumber.length !== 10}
                  className={`w-full flex justify-center items-center ${
                    isSendingOTP || phoneNumber.length !== 10
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  } text-white py-2 rounded transition-all`}
                >
                  {isSendingOTP ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                  ) : null}
                  {isSendingOTP ? "Sending..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Enter OTP
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    inputType="number"
                    renderInput={(props, index) => (
                      <input
                        {...props}
                        className="!w-full h-12 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black outline-none transition-all mx-1"
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    )}
                    containerStyle="flex justify-between"
                  />
                </div>

                <div className="flex justify-between items-center mb-4">
                  {canResend ? (
                    <button
                      onClick={handleResendOTP}
                      disabled={isSendingOTP}
                      className={`bg-green-800 hover:bg-green-900 text-sm font-medium ${
                        isSendingOTP ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      Resend OTP in {timer}s
                    </span>
                  )}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className={`w-full flex justify-center items-center ${
                    isVerifying || otp.length !== 6
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-800 hover:bg-green-900"
                  } text-white py-2 rounded transition-all`}
                >
                  {isVerifying ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                  ) : null}
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhoneAuthModal;

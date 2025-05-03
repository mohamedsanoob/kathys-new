"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OtpInput from "react-otp-input";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneNumber: string) => void;
}

const PhoneAuthModal = ({ isOpen, onClose, onSuccess }: PhoneAuthModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOTPSent && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        recaptchaContainerRef.current!,
        {
          size: "invisible",
          callback: (response: any) => {
            // Automatically invoked if invisible CAPTCHA is solved
          },
          "expired-callback": () => {
            toast.warn("reCAPTCHA expired. Please refresh or try again.");
          },
        },
        auth
      );
    }
  };

  const handleSendOTP = async () => {
    try {
      setIsSendingOTP(true);
      const formattedPhone = `+91${phoneNumber}`;

      setupRecaptcha();

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

     
      setConfirmationResult(result);
      setIsOTPSent(true);
      setTimer(60);
      setCanResend(false);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(`Failed to send OTP: ${error.message}`);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
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
        const generateUserId = () =>
          Array.from({ length: 5 }, () =>
            "abcdefghijklmnopqrstuvwxyz0123456789".charAt(
              Math.floor(Math.random() * 36)
            )
          ).join("");

        const user_id = generateUserId();

        await setDoc(userDocRef, {
          id: user.uid,
          user_id,
          phone: user.phoneNumber,
          preferences: {
            language: "en",
            marketingOptIn: true,
            currency: "INR",
          },
          account_status: "active",
          email: "",
          created_at: serverTimestamp(),
        });
      }

      toast.success("Phone number verified successfully!");
      onSuccess(user.phoneNumber!);
      handleClose();
    } catch (error) {
      console.error("OTP Verification Error:", error);
      toast.error("Invalid OTP. Please try again.");
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-xl relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center mt-2">Login with OTP</h3>

            {!isOTPSent ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="flex-1 block px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div ref={recaptchaContainerRef} id="recaptcha-container" />

                <button
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || phoneNumber.length !== 10}
                  className={`w-full ${isSendingOTP || phoneNumber.length !== 10 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white py-2 rounded transition-all`}
                >
                  {isSendingOTP ? "Sending..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Enter OTP</label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    inputType="number"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="!w-full h-12 border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-black outline-none transition-all mx-1"
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
                      className={`text-red-600 hover:text-red-800 text-sm font-medium ${isSendingOTP ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">Resend OTP in {timer}s</span>
                  )}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className={`w-full ${isVerifying || otp.length !== 6 ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white py-2 rounded transition-all`}
                >
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

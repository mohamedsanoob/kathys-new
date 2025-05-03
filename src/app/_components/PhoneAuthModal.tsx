"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OtpInput from "react-otp-input";
import { toast } from "react-toastify";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
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
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOTPSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOTPSent, timer]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          toast.warn("Recaptcha expired. Please try again.");
        },
      });
    }
  };

  const handleSendOTP = async () => {
    try {
      const formattedPhone = `+91${phoneNumber}`;
      setIsSendingOTP(true);
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setIsOTPSent(true);
      setTimer(60);
      setCanResend(false);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(`Failed to send OTP: ${error.message}`);
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = null;
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!confirmationResult) return;
      setIsVerifying(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        const user_id = Math.random().toString(36).substr(2, 5);
        await setDoc(userDocRef, {
          id: user.uid,
          user_id,
          phone: user.phoneNumber,
          email: "",
          preferences: {
            language: "en",
            currency: "INR",
            marketingOptIn: true,
          },
          account_status: "active",
          created_at: serverTimestamp(),
        });
      }

      toast.success("Phone number verified!");
      onSuccess(user.phoneNumber || phoneNumber);
      handleClose();
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = () => {
    setOtp("");
    handleSendOTP();
  };

  const handleClose = () => {
    setPhoneNumber("");
    setOtp("");
    setIsOTPSent(false);
    setConfirmationResult(null);
    window.recaptchaVerifier?.clear();
    window.recaptchaVerifier = null;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative"
          >
            <button
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-xl font-semibold text-center mb-4">Login with OTP</h2>

            {!isOTPSent ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md text-gray-600">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full border px-3 py-2 rounded-r-md outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div id="recaptcha-container" />
                <button
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || phoneNumber.length !== 10}
                  className={`w-full py-2 rounded text-white transition ${
                    isSendingOTP || phoneNumber.length !== 10
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
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
                    containerStyle="flex justify-between"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="w-10 h-12 text-center border rounded outline-none focus:ring-2 focus:ring-red-500"
                      />
                    )}
                  />
                </div>
                <div className="flex justify-between items-center mb-4">
                  {canResend ? (
                    <button
                      onClick={handleResendOTP}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">Resend OTP in {timer}s</span>
                  )}
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className={`w-full py-2 rounded text-white transition ${
                    isVerifying || otp.length !== 6
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
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

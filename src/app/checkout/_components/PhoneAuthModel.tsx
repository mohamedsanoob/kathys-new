import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OtpInput from "react-otp-input";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface PhoneAuthModalProps {
  showLogin: boolean;
  setShowLogin: (value: boolean) => void;
  isOTPSent: boolean;
  setIsOTPSent: (value: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  handlePhoneAuth: () => void;
  verifyOTP: () => void;
  isSendingOTP: boolean;
  isVerifying: boolean;
}

const PhoneAuthModal = ({
  showLogin,
  setShowLogin,
  isOTPSent,
  setIsOTPSent,
  phoneNumber,
  setPhoneNumber,
  otp,
  setOtp,
  handlePhoneAuth,
  verifyOTP,
  isSendingOTP,
  isVerifying
}: PhoneAuthModalProps) => {
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

const handleResendOTP = () => {
  setTimer(60);
  setCanResend(false);
  setOtp("");

  handlePhoneAuth();
  toast.info("OTP resent successfully", {
    position: "top-center",
    autoClose: 2000,
  });
};
  return (
    <AnimatePresence>
      {showLogin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-xl relative"
          >
            <button
            style={{cursor:"pointer"}}
              onClick={() => {
                setShowLogin(false);
                setIsOTPSent(false);
                setPhoneNumber("");
                setOtp("");
              }}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center mt-2">
              Login with OTP
            </h3>
            
            {!isOTPSent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
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
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-2 focus:ring-black-500 focus:border-black-500 outline-none transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div id="recaptcha-container"></div>
                <button
                style={{cursor:"pointer"}}
                  onClick={handlePhoneAuth}
                  disabled={isSendingOTP || phoneNumber.length !== 10}
                  className={`w-full ${
                    isSendingOTP || phoneNumber.length !== 10 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white py-2 rounded transition-all duration-200`}
                >
                  {isSendingOTP ? 'Sending...' : 'Send OTP'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Enter OTP
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    inputType="number"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="!w-full h-12 border border-gray-300 rounded focus:ring-2 focus:ring-black-500 focus:border-black-500 outline-none transition-all mx-1"
                        style={{
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none',
                          appearance: 'none'
                        }}
                      />
                    )}
                    containerStyle="flex justify-between"
                  />
                </div>

                <div className="flex justify-between items-center mb-4">
                  {canResend ? (
                    <button
                    style={{cursor:"pointer"}}
                      onClick={handleResendOTP}
                      disabled={isSendingOTP}
                      className={`text-red-600 hover:text-red-800 text-sm font-medium ${
                        isSendingOTP ? 'opacity-50 cursor-not-allowed' : ''
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
                   style={{cursor:"pointer"}}
                  onClick={verifyOTP}
                  disabled={isVerifying || otp.length !== 6}
                  className={`w-full ${
                    isVerifying || otp.length !== 6
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white py-2 rounded transition-all duration-200`}
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhoneAuthModal;
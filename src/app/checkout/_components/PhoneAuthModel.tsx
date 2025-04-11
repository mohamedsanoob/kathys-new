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
  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
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
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <div id="recaptcha-container"></div>
            <button
              onClick={handlePhoneAuth}
              disabled={isSendingOTP || phoneNumber.length !== 10}
              className={`w-full ${
                isSendingOTP || phoneNumber.length !== 10 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2 rounded transition-colors`}
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <button
              onClick={verifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className={`w-full ${
                isVerifying || otp.length !== 6
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-2 rounded transition-colors`}
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
          className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PhoneAuthModal;
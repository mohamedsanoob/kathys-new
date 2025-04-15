interface PaymentModeProps {
  onPaymentModeChange: (mode: 'online' | 'cod') => void;
  currentMode: 'online' | 'cod';
}

const PaymentModeSelector = ({ onPaymentModeChange, currentMode }: PaymentModeProps) => {
  return (
    <div className="mb-6 border rounded-md overflow-hidden">
      <h2 className="text-lg font-semibold mb-2 px-4 pt-4">Choose payment mode</h2>
      
      <div 
        className={`flex items-center p-4 cursor-pointer border-l-4 ${
          currentMode === 'online' ? 'border-red-600 bg-gray-50' : 'border-transparent'
        }`}
        onClick={() => onPaymentModeChange('online')}
      >
        <div className="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Online payment</h3>
          <p className="text-sm text-gray-500">Use credit/debit card, net-banking, UPI, wallets to complete the payment.</p>
        </div>
        <div className="ml-2">
          <div className={`w-5 h-5 rounded-full border ${currentMode === 'online' ? 'border-red-600' : 'border-gray-300'} flex items-center justify-center`}>
            {currentMode === 'online' && <div className="w-3 h-3 rounded-full bg-red-600"></div>}
          </div>
        </div>
      </div>
      
      <div 
        className={`flex items-center p-4 cursor-pointer border-l-4 ${
          currentMode === 'cod' ? 'border-red-600 bg-gray-50' : 'border-transparent'
        }`}
        onClick={() => onPaymentModeChange('cod')}
      >
        <div className="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Cash on delivery</h3>
          <p className="text-sm text-gray-500">Pay when your order is delivered.</p>
        </div>
        <div className="ml-2">
          <div className={`w-5 h-5 rounded-full border ${currentMode === 'cod' ? 'border-red-600' : 'border-gray-300'} flex items-center justify-center`}>
            {currentMode === 'cod' && <div className="w-3 h-3 rounded-full bg-red-600"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModeSelector;
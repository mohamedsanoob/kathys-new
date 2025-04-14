import { FormData } from "@/types/checkout";
import SavedAddresses from "./SavedAddresses";
import AddressForm from "./AddressForm";
import GuestCheckoutForm from "./GuestCheckoutForm";
import PaymentModeSelector from "./PaymentModeSelector";
import { useState } from "react";

interface BillingDetailsProps {
  currentUser: any;
  showLogin: boolean;
  setShowLogin: (value: boolean) => void;
  savedAddresses: FormData[];
  selectedAddress: string | null | undefined;
  setSelectedAddress: (value: string | null) => void;
  showAddressForm: boolean;
  setShowAddressForm: (value: boolean) => void;
  register: any;
  errors: any;
  isValid: boolean;
  saveNewAddress: (data: any) => Promise<void>;
  handleSubmit: any;
  getValues: any;
  paymentMode?: 'online' | 'cod';
  setPaymentMode?: (mode: 'online' | 'cod') => void;
  showPaymentMode: boolean; // new prop
}

const BillingDetails = ({
  currentUser,
  showLogin,
  setShowLogin,
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  showAddressForm,
  setShowAddressForm,
  register,
  errors,
  isValid,
  saveNewAddress,
  handleSubmit,
  getValues,
  paymentMode = 'online',
  setPaymentMode = () => {},
  showPaymentMode // use this to control payment section
}: BillingDetailsProps) => {
  const addressStepCompleted = currentUser 
    ? !!selectedAddress && !showAddressForm
    : isValid;

  return (
    <div 
      className="w-full lg:w-2/3  lg:pb-[5.45%] lg:overflow-y-scroll"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
        {(!addressStepCompleted && !showPaymentMode)  &&    <div className="flex justify-between items-center">
     
        {!currentUser?.uid &&  (
          <button 
            style={{ cursor: "pointer" }}
            onClick={() => setShowLogin(true)} 
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Already a user? Sign In
          </button>
        )}
      </div>}


        {(!addressStepCompleted || !showPaymentMode ) && (
        <>
          {currentUser ? (
            <div className="lg:mt-5 mt-0">
              {!showAddressForm ? (
                <SavedAddresses
                  savedAddresses={savedAddresses}
                  selectedAddress={selectedAddress}
                  setSelectedAddress={setSelectedAddress}
                  setShowAddressForm={setShowAddressForm}
                />
              ) : (
                <div className="lg:mt-5 mt-0">
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    style={{ cursor: "pointer" }}
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
            <GuestCheckoutForm 
              register={register}
              errors={errors}
              handleSubmit={handleSubmit}
              isValid={isValid}
              getValues={getValues}
            />
          )}
        </>
      )}

      {/* Show PaymentMode only if address step is completed AND user clicked Continue */}
      {addressStepCompleted && showPaymentMode && (
        <div className="lg:mt-8 mt-0">
          <h5 className="font-semibold text-lg mb-4">Payment Options</h5>
          <PaymentModeSelector 
            onPaymentModeChange={setPaymentMode}
            currentMode={paymentMode}
          />
        </div>
      )}
    </div>
  );
};

export default BillingDetails;

import { FormData } from "@/types/checkout";
import SavedAddresses from "./SavedAddresses";
import AddressForm from "./AddressForm";
import GuestCheckoutForm from "./GuestCheckoutForm";

interface BillingDetailsProps {
  currentUser: any;
  showLogin: boolean;
  setShowLogin: (value: boolean) => void;
  savedAddresses: FormData[];
  selectedAddress: string | null;
  setSelectedAddress: (value: string | null) => void;
  showAddressForm: boolean;
  setShowAddressForm: (value: boolean) => void;
  register: any;
  errors: any;
  isValid: boolean;
  saveNewAddress: (data: any) => Promise<void>;
  handleSubmit: any;
  getValues: any;
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
  getValues
}: BillingDetailsProps) => {
  return (
<div 
  className="w-full lg:w-2/3 lg:p-6 pb-[6%] lg:overflow-y-scroll"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    paddingBottom:"5.45%"
  }}
>
      <div className="flex justify-between items-center">
        <h5 className="font-semibold text-lg">Billing details</h5>
        {!currentUser?.uid && (
          <button 
            onClick={() => setShowLogin(true)} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Already a user? Sign In
          </button>
        )}
      </div>

      {currentUser ? (
        <div className="mt-5">
          {!showAddressForm ? (
            <SavedAddresses
              savedAddresses={savedAddresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              setShowAddressForm={setShowAddressForm}
            />
          ) : (
            <div className="mt-5">
              <button
                onClick={() => setShowAddressForm(false)}
                className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                style={{cursor:"pointer"}}
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
 
    </div>
  );
};

export default BillingDetails;
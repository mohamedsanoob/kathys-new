import { FormData } from "@/types/checkout";
import { Check } from "lucide-react";

interface SavedAddressesProps {
  savedAddresses: FormData[];
  selectedAddress: string | null;
  setSelectedAddress: (value: string | null) => void;
  setShowAddressForm: (value: boolean) => void;
}

const SavedAddresses = ({
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  setShowAddressForm
}: SavedAddressesProps) => {
  return (
    <div className="space-y-4">
      <h6 className="font-medium mb-2">Saved Addresses</h6>

      {savedAddresses.length === 0 ? (
        <p className="text-sm text-gray-500">No saved addresses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedAddresses.map((address) => (
            <div 
              key={address.id}
              onClick={() => setSelectedAddress(address.id!)}
              className={`p-4 border rounded cursor-pointer transition-shadow ${
                selectedAddress === address.id 
                  ? 'shadow-md border-gray-200'
                  : 'border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{address.firstName} {address.lastName}</p>
                  <p className="text-sm">{address.streetAddress1}{address.streetAddress2 && `, ${address.streetAddress2}`}</p>
                  <p className="text-sm">{address.city}, {address.state} - {address.pinCode}</p>
                  <p className="text-sm">Phone: {address.mobileNumber}</p>
                  {address.email && <p className="text-sm">Email: {address.email}</p>}
                </div>
                {selectedAddress === address.id && (
                  <Check className="text-green-600 w-5 h-5" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAddressForm(true)}
        className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
        style={{ cursor: "pointer" }}
      >
        + Add New Address
      </button>
    </div>
  );
};

export default SavedAddresses;

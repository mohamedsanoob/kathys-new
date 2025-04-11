import { FormData } from "@/types/checkout";

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
        <div className="space-y-3">
          {savedAddresses.map((address) => (
            <div 
              key={address.id}
              onClick={() => setSelectedAddress(address.id!)}
              className={`p-4 border rounded cursor-pointer transition-colors ${
                selectedAddress === address.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
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
                  <span className="text-blue-500 text-sm">✓ Selected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setShowAddressForm(true)}
        className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
        style={{cursor:"pointer"}}
      >
        + Add New Address
      </button>
    </div>
  );
};

export default SavedAddresses;
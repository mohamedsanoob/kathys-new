interface GuestCheckoutFormProps {
  register: any;
  errors: any;
  handleSubmit: any;
  isValid: boolean;
  getValues: any;
}

const GuestCheckoutForm = ({
  register,
  errors,
  handleSubmit,
}: GuestCheckoutFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First name *</label>
          <input
            className={`w-full h-10 border ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            } px-3 rounded`}
            {...register("firstName", { required: "First name is required" })}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Last name *</label>
          <input
            className={`w-full h-10 border ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            } px-3 rounded`}
            {...register("lastName", { required: "Last name is required" })}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Company name (Optional)</label>
        <input
          className="w-full h-10 border border-gray-300 px-3 rounded"
          {...register("companyName")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Country / Region *</label>
        <input
          className={`w-full h-10 border ${
            errors.country ? "border-red-500" : "border-gray-300"
          } px-3 rounded`}
          {...register("country", { required: "Country is required" })}
        />
        {errors.country && (
          <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Street address *</label>
        <input
          className={`w-full h-10 border ${
            errors.streetAddress1 ? "border-red-500" : "border-gray-300"
          } px-3 rounded mb-2`}
          placeholder="House number and street name"
          {...register("streetAddress1", { required: "Street address is required" })}
        />
        <input
          className="w-full h-10 border border-gray-300 px-3 rounded"
          placeholder="Apartment, suite, unit, etc. (Optional)"
          {...register("streetAddress2")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Town / City *</label>
          <input
            className={`w-full h-10 border ${
              errors.city ? "border-red-500" : "border-gray-300"
            } px-3 rounded`}
            {...register("city", { required: "City is required" })}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <input
            className={`w-full h-10 border ${
              errors.state ? "border-red-500" : "border-gray-300"
            } px-3 rounded`}
            {...register("state", { required: "State is required" })}
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">PIN Code *</label>
        <input
          className={`w-full h-10 border ${
            errors.pinCode ? "border-red-500" : "border-gray-300"
          } px-3 rounded`}
          {...register("pinCode", {
            required: "PIN Code is required",
            pattern: {
              value: /^[0-9]{6}$/,
              message: "PIN Code must be 6 digits",
            },
          })}
        />
        {errors.pinCode && (
          <p className="text-red-500 text-xs mt-1">{errors.pinCode.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mobile Number *</label>
        <div className={`flex items-center w-full border ${
          errors.mobileNumber ? "border-red-500" : "border-gray-300"
        } rounded overflow-hidden`}>
          <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 h-10">
            +91
          </span>
          <input
            className="flex-1 h-10 px-3 outline-none"
            {...register("mobileNumber", {
              required: "Mobile number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Mobile number must be 10 digits",
              },
            })}
          />
        </div>
        {errors.mobileNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          className={`w-full h-10 border ${
            errors.email ? "border-red-500" : "border-gray-300"
          } px-3 rounded`}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Optional notes (optional)</label>
        <textarea
          className="w-full border border-gray-300 px-3 py-2 rounded min-h-[100px]"
          placeholder="Notes about your order, e.g. special notes for delivery"
          {...register("notes")}
        />
      </div>
    </form>
  );
};

export default GuestCheckoutForm;
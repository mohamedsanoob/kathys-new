"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  TextField,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { getUserAddresses, updateUserAddress } from "@/actions/actions";
import { deleteUserAddressById } from "@/actions/address";

interface FormData {
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

interface AddressType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  state: string;
  pinCode: string;
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  state: yup.string().required("State is required"),
});

const commonTextFieldStyles = {
  "& .MuiInputBase-root": {
    height: "3rem",
    fontSize: "14px",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000",
  },
  "& .MuiFormHelperText-root": {},
};

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const Addresses = () => {
  const { currentUser } = useAuth();
  const [userAddresses, setUserAddresses] = useState<AddressType[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
    },
  });

  const fetchAddresses = async (uid: string | undefined) => {
    if (!uid) return;
    const addresses = await getUserAddresses(uid);
    if (addresses.length > 0) {
      setUserAddresses(addresses);
    } else {
      console.log("No addresses found for this user");
    }
  };

  useEffect(() => {
    fetchAddresses(currentUser?.uid);
  }, [currentUser?.uid]);

  const onSubmit = async (data: FormData) => {
    if (!currentUser?.uid || !editingAddress?.id) {
      console.error("User ID or Address ID missing");
      return;
    }

    const updatedData = {
      firstName: data.name.split(" ")[0] || "",
      lastName: data.name.split(" ")[1] || "",
      mobileNumber: data.mobile,
      email: data.email,
      streetAddress1: data.address.split(" ")[0] || "",
      streetAddress2: data.address.split(" ").slice(1).join(" ") || "",
      city: data.city,
      state: data.state,
      pinCode: data.pincode,
    };

    const success = await updateUserAddress(
      currentUser.uid,
      editingAddress.id,
      updatedData
    );

    if (success) {
      console.log("Address updated!");
      setEditOpen(false);
      fetchAddresses(currentUser.uid);
    } else {
      console.error("Failed to update address");
    }
  };

  const handleEdit = (address: AddressType) => {
    setEditingAddress(address);
    reset({
      name: `${address.firstName} ${address.lastName}`,
      mobile: address.mobileNumber,
      email: address.email,
      address: `${address.streetAddress1} ${address.streetAddress2}`,
      city: address.city,
      pincode: address.pinCode,
      state: address.state,
    });
    setEditOpen(true);
  };

  const handleDelete = (address: AddressType) => {
    if (address.id && currentUser?.uid) {
      deleteUserAddressById(currentUser?.uid, address.id);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 w-full">
      {userAddresses.map((address) => (
        <div
          key={address.id}
          className="border border-gray-200 flex flex-col gap-1 rounded-md p-4 w-full sm:w-[calc(50%-1rem)]"
        >
          <p className="text-lg font-medium">{`${address.firstName} ${address.lastName}`}</p>
          <p className="text-sm text-gray-500">Email: {address.email}</p>
          <p className="text-sm text-gray-500">{`${address.streetAddress1} ${address.streetAddress2}`}</p>
          <p className="text-sm text-gray-500">
            {address.city} <span>{address.pinCode}</span>
          </p>
          <div className="flex gap-4 mt-2">
            <p
              onClick={() => handleEdit(address)}
              className="font-medium cursor-pointer"
            >
              Edit
            </p>
            <p
              className="font-medium cursor-pointer text-red-500"
              onClick={() => handleDelete(address)}
            >
              Delete
            </p>
          </div>
        </div>
      ))}
      <Dialog open={editOpen} fullWidth>
        <DialogContent>
          <div className="flex justify-between">
            <p className="text-xl font-semibold">Edit Address</p>
            <X className="cursor-pointer" onClick={() => setEditOpen(false)} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Name</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Mobile Number</label>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Mobile Number"
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message}
                      fullWidth
                      sx={commonTextFieldStyles}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Email</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      fullWidth
                      sx={commonTextFieldStyles}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Address</label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Address"
                    multiline
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">City</label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="City"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      fullWidth
                      sx={commonTextFieldStyles}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">Pincode</label>
                <Controller
                  name="pincode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="Pincode"
                      error={!!errors.pincode}
                      helperText={errors.pincode?.message}
                      fullWidth
                      sx={commonTextFieldStyles}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">State</label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      placeholder="Select State"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      fullWidth
                      sx={commonTextFieldStyles}
                      SelectProps={{
                        IconComponent: ChevronDown,
                      }}
                    >
                      {states.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: "0.5rem",
                  fontFamily: "Poppins",
                  background: "black",
                  width: { xs: "100%", sm: "40%" },
                  padding: "0.5rem 0",
                }}
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Addresses;

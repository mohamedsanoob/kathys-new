"use client";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Dialog, DialogContent, MenuItem, TextField } from "@mui/material";

const addresses = [
  {
    id: 1,
    name: "John Doe",
    address: "123 Main St, Anytown, USA",
    email: "john.doe@example.com",
    city: "Anytown",
    pincode: "123456",
  },
  {
    id: 2,
    name: "Jane Doe",
    address: "456 Main St, Anytown, USA",
    email: "jane.doe@example.com",
    city: "Anytown",
    pincode: "123456",
  },
  {
    id: 3,
    name: "John Smith",
    address: "789 Main St, Anytown, USA",
    email: "john.smith@example.com",
    city: "Anytown",
    pincode: "123456",
  },
];

interface FormData {
  name: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
}

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"), // Added mobile validation
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("city is required"),
  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits")
    .required("Pincode is required"),
  state: yup.string().required("State is required"), // Added state validation
});

const commonTextFieldStyles = {
  "& .MuiInputBase-root": {
    height: "3rem",
    fontFamily: "Poppins",
    fontSize: "14px",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#000",
  },
  "& .MuiFormHelperText-root": {
    fontFamily: "Poppins",
  },
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
  const [editOpen, setEditOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      mobile: "", // Added mobile default value
      email: "",
      address: "",
      city: "",
      pincode: "",
      state: "", // Added state default value
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    setEditOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-4 w-full">
      {addresses.map(({ id, name, email, address, city, pincode }) => (
        <div
          key={id}
          className="border border-gray-200 flex flex-col gap-1 rounded-md p-4 w-[calc(50%_-_1rem)]"
        >
          <p className="text-lg font-medium">{name}</p>
          <p className="text-sm text-gray-500">Email: {email}</p>
          <p className="text-sm text-gray-500">{address}</p>
          <p className="text-sm text-gray-500">
            {city} <span>{pincode}</span>
          </p>
          <div className="flex gap-4 mt-2">
            <p
              onClick={() => setEditOpen(true)}
              className="font-medium cursor-pointer"
            >
              Edit
            </p>
            <p className="font-medium cursor-pointer text-red-500">Delete</p>
          </div>
        </div>
      ))}
      <Dialog open={editOpen} fullWidth>
        <DialogContent>
          <div className="flex justify-between">
            <p className="text-xl font-semi-bold">Edit Address</p>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
                        IconComponent: ChevronDown, // Correctly set the dropdown icon here
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
            <div className="flex justify-center mt- pt-4">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: "0.5rem",
                  fontFamily: "Poppins",
                  background: "black",
                  width: "40%",
                  padding: "0.5rem 0",
                }}
              >
                Upddate
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Addresses;

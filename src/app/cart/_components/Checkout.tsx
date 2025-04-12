import React from "react";
import Link from 'next/link';

interface CheckoutProps {
  total: number;
  disabled: boolean;
}

const Checkout = ({ total, disabled }: CheckoutProps) => {
  return (
    <div className="p-4 md:p-6 lg:p-[20px_30px] flex flex-col w-full lg:w-[100%] gap-4 md:gap-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] lg:shadow-[5px_5px_0_#f8f8f8] border border-[#dee0ea] h-auto sticky top-4 mb-2.5">
      <div className="border-b border-[#dee0ea] pb-2.5">
        <h5 className="text-base font-medium lg:font-normal">Cart Totals</h5>
      </div>
      
      <div className="flex justify-between w-full border-b border-[#dee0ea] py-3 md:py-[15px_0_10px_0]">
        <h6 className="text-sm font-medium lg:font-normal">Subtotal</h6>
        <h6 className="text-sm font-medium lg:font-normal">
          ₹{" "}
          {total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h6>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <h6 className="text-base font-medium lg:font-normal">Total</h6>
        <h6 className="font-semibold text-lg md:text-xl">
          ₹{" "}
          {total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h6>
      </div>
      
      {disabled && (
        <p className="text-red-500 text-sm mt-2">
          Please remove out-of-stock items or adjust quantities to proceed
        </p>
      )}
      
      <Link href={disabled ? "#" : "/checkout"} style={{width:"100%"}}>
        <button 
          className={`h-12 w-full ${
            disabled ? "bg-gray-400 cursor-not-allowed" : "bg-[#ee403d] hover:bg-[#d93835]"
          } text-white font-semibold rounded-md mt-4 transition-colors duration-200`}
          disabled={disabled}
          style={{cursor:"pointer"}}
        >
          Proceed to checkout
        </button>
      </Link>
    </div>
  );
};

export default Checkout;
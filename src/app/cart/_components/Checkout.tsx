import React from "react";

interface CheckoutProps {
  total: number;
}

const Checkout = ({ total }: CheckoutProps) => {
  return (
    <div className="p-[20px_30px] flex flex-col w-[30%] gap-5 shadow-[5px_5px_0_#f8f8f8] border border-[#dee0ea] h-[250px]">
      <div className="border-b border-[#dee0ea] py-2.5">
        <h5 className="text-base font-normal">Cart totals</h5>
      </div>
      <div className="flex justify-between w-full border-b border-[#dee0ea] py-[15px_0_10px_0]">
        <h6 className="text-sm font-normal">Subtotal</h6>
        <h6 className="text-sm font-normal">
          ₹ {total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h6>
      </div>
      <div className="flex justify-between">
        <h6 className="text-sm font-normal">Total</h6>
        <h6 className="font-semibold text-xl">
          ₹ {total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h6>
      </div>
      <button className="h-12 bg-[#ee403d] text-white cursor-pointer font-semibold">
        Proceed to checkout
      </button>
    </div>
  );
};

export default Checkout;
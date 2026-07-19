import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DiscountOfferTagProps {
  children: ReactNode;
  className?: string;
}

const DiscountOfferTag = ({ children, className }: DiscountOfferTagProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded px-2 py-0.5 text-[10px] md:text-xs font-semibold uppercase tracking-wide bg-[#1e6553] text-white",
      className
    )}
  >
    {children}
  </span>
);

export default DiscountOfferTag;

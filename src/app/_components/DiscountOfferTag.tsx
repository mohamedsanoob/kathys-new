import { cn } from "@/lib/utils";

interface DiscountOfferTagProps {
  children: React.ReactNode;
  className?: string;
}

const DiscountOfferTag = ({ children, className }: DiscountOfferTagProps) => (
  <span
    className={cn(
      "discount-offer-tag inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] md:text-xs uppercase tracking-wide",
      className
    )}
  >
    {children}
  </span>
);

export default DiscountOfferTag;

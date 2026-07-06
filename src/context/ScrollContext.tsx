"use client";

import { createContext, useContext, useRef, ReactNode } from "react";

interface ScrollContextType {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <ScrollContext.Provider value={{ scrollContainerRef }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContainer = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScrollContainer must be used within ScrollProvider");
  }
  return context;
};

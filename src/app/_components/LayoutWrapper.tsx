"use client";
import { useCallback, useEffect, useState, ReactNode } from "react";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [layoutNode, setLayoutNode] = useState<HTMLDivElement | null>(null);

  const layoutRefCallback = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setLayoutNode(node);
    }
  }, []);

  useEffect(() => {
    if (layoutNode) {
      const observer = new MutationObserver((mutations) => {
        const styleChanged = mutations.some(
          (mutation) => mutation.attributeName === "style"
        );
        if (styleChanged) {
          layoutNode.style.height = "";
        }
      });

      observer.observe(layoutNode, {
        attributes: true,
        attributeFilter: ["style"],
      });

      return () => observer.disconnect();
    }
  }, [layoutNode]);

  return (
    <div ref={layoutRefCallback} className="flex flex-col h-full">
      {children}
    </div>
  );
}

// ./app/layout.tsx
"use client";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./_components/Navbar";
import Main from "./Main";
import FooterNav from "./_components/FooterNav";
import { WhatsApp } from "./_components/whatsapp-icon";
import { CategoryProvider} from "@/context/CategoryContext";
import AdSense from "./_components/AdSense";

// 1. Import useRef and useEffect from React
import { useRef, useEffect, useState, useCallback } from 'react';

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

 // 2. Use useState to hold the actual DOM node
  const [layoutNode, setLayoutNode] = useState<HTMLDivElement | null>(null);

  // 3. Create the callback ref function.
  // This function will be called by React when the div is mounted.
  const layoutRefCallback = useCallback((node: HTMLDivElement) => {
    // When the node is available, we set it in our state.
    if (node !== null) {
      console.log('Callback ref attached to node:', node);
      setLayoutNode(node);
    }
  }, []); // Empty dependency array ensures the function is stable

  // 4. This useEffect now depends on 'layoutNode'.
  // It will only run when layoutNode is successfully set.
  useEffect(() => {
    // We proceed only if the layoutNode exists.
    if (layoutNode) {
      console.log('useEffect is running with the node:', layoutNode);
      const observer = new MutationObserver((mutations) => {
        const styleChanged = mutations.some(mutation => mutation.attributeName === 'style');
        if (styleChanged) {
          layoutNode.style.height = '';
        }
      });

      observer.observe(layoutNode, {
        attributes: true,
        attributeFilter: ['style'],
      });

      return () => observer.disconnect();
    }
  }, [layoutNode]); // The key change is here!
    
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <AdSense pId="ca-pub-8258677943197720" />
      </head>
      <body className={`${jost.className} antialiased flex flex-col h-full`}>
        <AuthProvider>
          <CategoryProvider>
            {/* 4. Attach the ref to the div you want to observe */}
            <div ref={layoutRefCallback} className="flex flex-col h-full">
              <Navbar />
              <Main children={children} />
              <FooterNav />
            </div>
          
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </CategoryProvider>
        </AuthProvider>
        <WhatsApp/>
      </body>
    </html>
  );
}
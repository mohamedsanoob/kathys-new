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
import { Suspense } from "react";
import { Cat, Loader2 } from "lucide-react";
import { WhatsApp } from "./_components/whatsapp-icon";
import { CategoryProvider} from "@/context/CategoryContext";
import AdSense from "./_components/AdSense";




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
    
  return (
    <html lang="en" className="h-full">
      <head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
        <AdSense pId="ca-pub-8258677943197720" />
      </head>
      <body className={`${jost.className} antialiased flex flex-col h-full`}>
        <AuthProvider>
          <CategoryProvider>
     
<div className="flex flex-col !h-full">
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

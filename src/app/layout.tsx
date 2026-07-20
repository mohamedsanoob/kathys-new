// ./app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Jost } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ScrollProvider } from "@/context/ScrollContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./_components/Navbar";
import Main from "./Main";
import FooterNav from "./_components/FooterNav";
import { WhatsApp } from "./_components/whatsapp-icon";
import AdSense from "./_components/AdSense";
import LayoutWrapper from "./_components/LayoutWrapper";
import RouteLoader from "./_components/RouteLoader";

export const metadata: Metadata = {
  title: "Kathy's - Shop the Latest Collections",
  description: "Discover premium fashion collections at Kathy's",
};

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
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <AdSense pId="ca-pub-8258677943197720" />
      </head>
      <body
        className={`${jost.className} antialiased flex flex-col h-full min-h-0 overflow-hidden`}
      >
        <Suspense fallback={null}>
          <RouteLoader />
        </Suspense>
        <AuthProvider>
          <ScrollProvider>
            <LayoutWrapper>
              <Navbar />
              <Main children={children} />
              <FooterNav />
            </LayoutWrapper>
          
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
          </ScrollProvider>
        </AuthProvider>
        <WhatsApp/>
      </body>
    </html>
  );
}
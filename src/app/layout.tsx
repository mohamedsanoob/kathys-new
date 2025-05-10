import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./_components/Navbar";
import FooterNav from "./_components/FooterNav";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Kathys Clothing Store",
  description: "Your one-stop shopping destination",
  icons: {
    icon: "/kathys-logo.webp", // Remove the ../../public prefix - Next.js automatically looks in public folder
    shortcut: "/kathys-logo.webp",
    apple: "/kathys-logo.webp",
  },
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
    <html lang="en" className="h-full">
      <body className={`${jost.className} antialiased flex flex-col h-full`}>
        <AuthProvider>
          <div className="flex flex-col h-full">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
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
        </AuthProvider>
      </body>
    </html>
  );
}

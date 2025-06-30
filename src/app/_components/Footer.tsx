import {
  CreditCard,
  Facebook,
  Headset,
  Instagram,
  Truck,
  Youtube,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300">
      {/* Top Features Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Fast Delivery */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-900 p-4 rounded-full mb-4">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Fast Delivery
            </h3>
            <p>Nationwide delivery within 3-5 business days</p>
          </div>

          {/* Payment Options */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-900 p-4 rounded-full mb-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Secure Payments
            </h3>
            <p>100% secure payment via Razorpay</p>
          </div>

          {/* Customer Support */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-900 p-4 rounded-full mb-4">
              <Headset className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              24/7 Support
            </h3>
            <p>Dedicated customer support</p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/account"
                  className="hover:text-white transition-colors"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Alappuzha Branch */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Alappuzha Branch</h3>
            <address className="not-italic mb-4">
              Kathy's Clothing Store<br />
              Kiran complex<br />
              Vazhichery, Near premier supermarket<br />
              Alappuzha
            </address>
            <Link 
              href="https://maps.app.goo.gl/rY8hqpswuh7i3u6cA?g_st=ic" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-400 hover:text-white transition-colors"
            >
              View on Google Maps
            </Link>
          </div>

          {/* Kochi Branch */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Kochi Branch</h3>
            <address className="not-italic mb-4">
              Kathy's Clothing Store<br />
              Thirunilath Building<br />
              Geethanjali Junction<br />
              Vyttila - Palarivattom Bypass stretch
            </address>
            <p className="mb-2">
              <span className="font-medium">Contact:</span> 7736491677 / 9074912348
            </p>
            <Link 
              href="https://maps.app.goo.gl/Yh3jGaKwR92BF4EB8?g_st=icd" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-400 hover:text-white transition-colors"
            >
              View on Google Maps
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Media */}
            <div className="flex gap-4">
              <Link
                href="https://www.facebook.com/kathysclothingstore/"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5 hover:text-white transition-colors" />
              </Link>

              <Link
                href="https://www.instagram.com/kathysclothingstore?igsh=MXNja2k0dmQ5Zm9t&utm_source=qr"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5 hover:text-white transition-colors" />
              </Link>
              <Link
                href="https://youtube.com/@kathysclothingstore?si=5clxLQ75zch_hdnu"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-5 w-5 hover:text-white transition-colors" />
              </Link>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Kathys Clothing Store. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
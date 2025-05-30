import Link from "next/link";
import Head from "next/head";

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>Terms and Conditions | Kathy&apos;s Clothing Store</title>
        <meta
          name="description"
          content="Read our terms and conditions for online shopping at Kathy's Clothing Store"
        />
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Terms and Conditions
        </h1>
        <p className="text-gray-600 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. Introduction
          </h2>
          <p className="mb-4">
            Welcome to Kathy&apos;s Clothing Store (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These
            Terms and Conditions govern your use of our website and services. By
            accessing or using our website, you agree to comply with these
            terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            2. Orders and Payments
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              All orders are subject to availability and confirmation of the
              order price.
            </li>
            <li>
              We accept payments through Razorpay. By completing a transaction,
              you confirm that the payment method is yours or you have
              authorization to use it.
            </li>
            <li>
              Prices are shown in Indian Rupees (INR) and include GST where
              applicable.
            </li>
            <li>
              We reserve the right to refuse or cancel any order for any reason,
              including limitations on quantities available for purchase.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            3. Shipping and Delivery
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              We aim to dispatch all orders within 1-2 business days of order
              confirmation.
            </li>
            <li>
              Delivery times are estimates and not guaranteed. We are not
              responsible for delays caused by third-party shipping providers.
            </li>
            <li>
              Risk of loss and title for items pass to you upon delivery to the
              carrier.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. Returns and Refunds
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Please refer to our{" "}
              <Link
                href="/refund-policy"
                className="text-blue-600 hover:underline"
              >
                Refund Policy
              </Link>{" "}
              for details on returns and refunds.
            </li>
            <li>
              Items must be returned in their original condition with all tags
              attached.
            </li>
            <li>
              Refunds will be processed through the original payment method via
              Razorpay.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            5. Intellectual Property
          </h2>
          <p className="mb-4">
            All content on this website, including images, text, logos, and
            designs, are the property of Kathy&apos;s Clothing Store and are
            protected by copyright laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            6. Privacy
          </h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our{" "}
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            to understand how we collect, use, and protect your personal
            information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            7. Limitation of Liability
          </h2>
          <p className="mb-4">
            Kathy&apos;s Clothing Store shall not be liable for any indirect,
            incidental, or consequential damages arising from the use of our
            website or products.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            8. Governing Law
          </h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with
            the laws of India. Any disputes shall be subject to the exclusive
            jurisdiction of the courts in Alappuzha, Kerala.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            9. Changes to Terms
          </h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. Changes will
            be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            10. Contact Us
          </h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:customercare@kathysonline.in"
              className="text-blue-600 hover:underline"
            >
              customercare@kathysonline.in
            </a>
            <br />
            Phone: +91 9876543210
            <br />
            Address: Alappuzha, Kerala, India - 560001
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;

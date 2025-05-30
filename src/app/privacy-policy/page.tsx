import Link from "next/link";
import Head from "next/head";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>Privacy Policy | Kathy's Clothing Store</title>
        <meta
          name="description"
          content="Learn how Kathy's Clothing Store collects, uses, and protects your personal information"
        />
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
        <p className="mb-4">
          At Kathy's Clothing Store ("we," "us," or "our"), we are committed to
          protecting your privacy. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you visit our
          website or make a purchase from us.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. Information We Collect
          </h2>
          <p className="mb-2 font-medium">
            We may collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone
              number, shipping/billing address, payment information
            </li>
            <li>
              <strong>Order Information:</strong> Products purchased, order
              value, transaction details
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type,
              operating system
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, time spent on site,
              referring website
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>To process and fulfill your orders</li>
            <li>To communicate with you about your orders and account</li>
            <li>To provide customer support</li>
            <li>To improve our website and services</li>
            <li>To prevent fraud and ensure security</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            3. Payment Processing
          </h2>
          <p className="mb-4">
            We use Razorpay for payment processing. When you make a purchase:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Your payment information is processed directly by Razorpay and is
              not stored on our servers
            </li>
            <li>
              Razorpay may collect your payment card details, billing address,
              and other information necessary to process your payment
            </li>
            <li>
              Razorpay's privacy policy applies to their collection and use of
              your information (
              <a
                href="https://razorpay.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                view Razorpay Privacy Policy
              </a>
              )
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. Data Sharing and Disclosure
          </h2>
          <p className="mb-2">We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Payment processors (Razorpay) to complete transactions</li>
            <li>Shipping carriers to deliver your orders</li>
            <li>
              Service providers who assist with website operations, marketing,
              or analytics
            </li>
            <li>
              Legal authorities when required by law or to protect our rights
            </li>
          </ul>
          <p>
            We do not sell your personal information to third parties for
            marketing purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            5. Data Retention
          </h2>
          <p className="mb-4">
            We retain your personal information only as long as necessary to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Provide you with services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p>
            Order information is typically retained for at least 5 years for tax
            and accounting purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            6. Your Rights
          </h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal data</li>
            <li>Object to certain processing activities</li>
            <li>Withdraw consent where applicable</li>
          </ul>
          <p>
            To exercise these rights, please contact us at{" "}
            <a
              href="mailto:customercare@kathysonline.in"
              className="text-blue-600 hover:underline"
            >
              customercare@kathysonline.in
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            7. Security Measures
          </h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal
            information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>SSL encryption for data transmission</li>
            <li>Secure servers with restricted access</li>
            <li>Regular security assessments</li>
          </ul>
          <p>
            However, no internet transmission is 100% secure. We cannot
            guarantee absolute security of your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            8. Cookies and Tracking
          </h2>
          <p className="mb-4">
            Our website uses cookies and similar technologies to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Remember your preferences</li>
            <li>Analyze website traffic</li>
            <li>Improve user experience</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling
            cookies may affect website functionality.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            9. Children's Privacy
          </h2>
          <p className="mb-4">
            Our website is not intended for children under 13. We do not
            knowingly collect personal information from children under 13. If we
            become aware of such collection, we will take steps to delete the
            information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            10. Changes to This Policy
          </h2>
          <p className="mb-4">
            We may update this Privacy Policy periodically. We will notify you
            of significant changes by posting the new policy on our website with
            an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            11. Contact Us
          </h2>
          <p className="mb-4">
            If you have questions about this Privacy Policy or our data
            practices:
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

export default PrivacyPolicy;
